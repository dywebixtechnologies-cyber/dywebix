-- Schema for the dywebixtech inquiry inbox.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> Run.

create table if not exists public.inquiries (
  -- Human-facing token (PROJ-1, PROJ-2, ...) assigned by the contact form,
  -- kept as the primary key so the receipt shown to the client matches the row.
  id            text primary key,

  name          text        not null,
  email         text        not null,
  company       text,
  project_type  text        not null,
  budget        text        not null,
  timeline      text        not null,
  details       text        not null,

  -- Named created_at rather than "timestamp", which is a type name in Postgres
  -- and would need quoting everywhere.
  created_at    timestamptz not null default now(),

  read          boolean     not null default false,
  accepted      boolean     not null default false,
  accepted_at   timestamptz,
  finished      boolean     not null default false,
  finished_at   timestamptz,

  -- Free text, because rates are entered pre-formatted (e.g. "₹2,50,000").
  rate          text,

  -- Email of the signed-in user who submitted the brief.
  owner_email   text
);

-- The admin inbox sorts newest first; the dashboard filters by owner.
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_owner_email_idx on public.inquiries (lower(owner_email));

alter table public.inquiries enable row level security;

-- ---------------------------------------------------------------------------
-- Policies
--
-- These are deliberately permissive and are NOT a security boundary. This site
-- has no server-verified identity: the admin login is a client-side constant
-- and sign-in state lives in localStorage, so Postgres has no way to tell an
-- admin from a visitor. Treat everything in this table as public data.
--
-- Tighten these once auth moves to a real identity provider, by keying the
-- policies on auth.uid() / auth.jwt().
-- ---------------------------------------------------------------------------
drop policy if exists "inquiries are readable by anyone" on public.inquiries;
create policy "inquiries are readable by anyone"
  on public.inquiries for select using (true);

drop policy if exists "anyone may submit an inquiry" on public.inquiries;
create policy "anyone may submit an inquiry"
  on public.inquiries for insert with check (true);

drop policy if exists "anyone may update an inquiry" on public.inquiries;
create policy "anyone may update an inquiry"
  on public.inquiries for update using (true) with check (true);

drop policy if exists "anyone may delete an inquiry" on public.inquiries;
create policy "anyone may delete an inquiry"
  on public.inquiries for delete using (true);
