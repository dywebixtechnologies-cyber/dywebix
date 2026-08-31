-- Schema for dywebixtech: accounts, profiles and the inquiry inbox.
-- Run in the Supabase dashboard: SQL Editor -> New query -> Run.
-- Safe to re-run; every statement is idempotent.

-- ---------------------------------------------------------------------------
-- profiles
--
-- auth.users is managed by Supabase and cannot hold app columns, so each
-- account gets a matching row here for the display name and the admin flag.
-- is_admin is checked server-side by the policies below, which is what lets us
-- stop shipping an admin password in the client bundle.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  email      text not null,
  name       text not null default '',
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A signed-in user may read their own profile. Reading it is how the app
-- learns whether they are an admin.
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Name is editable by its owner; is_admin deliberately is not granted here,
-- so nobody can promote themselves.
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins may read every profile (the inbox shows a user count).
drop policy if exists "admins read all profiles" on public.profiles;
create policy "admins read all profiles"
  on public.profiles for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Create the profile automatically whenever Supabase creates an account,
-- covering both email/password signup and the Google OAuth flow.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- inquiries
-- ---------------------------------------------------------------------------
create table if not exists public.inquiries (
  -- Human-facing token (PROJ-1, ...) shown to the client as a receipt.
  id            text primary key,
  name          text        not null,
  email         text        not null,
  company       text,
  project_type  text        not null,
  budget        text        not null,
  timeline      text        not null,
  details       text        not null,
  -- Named created_at rather than "timestamp", which is a Postgres type name.
  created_at    timestamptz not null default now(),
  read          boolean     not null default false,
  accepted      boolean     not null default false,
  accepted_at   timestamptz,
  finished      boolean     not null default false,
  finished_at   timestamptz,
  rate          text,
  owner_email   text
);

-- Ties a brief to the account that submitted it, so policies can be written
-- against a verified identity rather than a claimed email address.
alter table public.inquiries
  add column if not exists owner_id uuid references auth.users on delete set null;

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_owner_id_idx on public.inquiries (owner_id);

alter table public.inquiries enable row level security;

-- Drop the permissive policies from the pre-auth version.
drop policy if exists "inquiries are readable by anyone" on public.inquiries;
drop policy if exists "anyone may submit an inquiry" on public.inquiries;
drop policy if exists "anyone may update an inquiry" on public.inquiries;
drop policy if exists "anyone may delete an inquiry" on public.inquiries;

-- Helper so the admin test is written once.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin);
$$;

-- A signed-in user may submit a brief, but only in their own name.
drop policy if exists "submit own inquiry" on public.inquiries;
create policy "submit own inquiry"
  on public.inquiries for insert to authenticated
  with check (owner_id = auth.uid());

-- Authors see their own briefs; admins see all of them.
drop policy if exists "read own or admin reads all" on public.inquiries;
create policy "read own or admin reads all"
  on public.inquiries for select to authenticated
  using (owner_id = auth.uid() or public.is_admin());

-- Only admins change status, rate or read state.
drop policy if exists "admins update inquiries" on public.inquiries;
create policy "admins update inquiries"
  on public.inquiries for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins delete inquiries" on public.inquiries;
create policy "admins delete inquiries"
  on public.inquiries for delete to authenticated
  using (public.is_admin());
