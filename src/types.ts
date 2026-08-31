/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'ecommerce' | 'saas' | 'editorial' | 'creative';
  tags: string[];
  image: string;
  liveUrl: string;
  stats: { label: string; value: string }[];
  details: string[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  features: string[];
  duration: string;
  badge?: string;
  icon: string; // Name of Lucide icon
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  company?: string;
  projectType: string;
  budget: string;
  timeline: string;
  details: string;
  timestamp: string;
  read: boolean;
  accepted?: boolean;
  acceptedAt?: string;   // ISO timestamp when the admin accepted the project
  finished?: boolean;    // Admin marks the project complete — only then it counts toward revenue
  finishedAt?: string;   // ISO timestamp when the project was finished
  rate?: string;         // Rate the admin sets for this project (e.g. "₹2,50,000")
  ownerEmail?: string;   // Email of the logged-in user who submitted this idea
  ownerId?: string;      // Supabase auth user id — what the RLS policies match on
}
