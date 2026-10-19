-- Faceless Finesse: initial schema + RLS
-- Source: docs/plan/database-schema.md, docs/plan/backend.md §3
--
-- Identity: users log in with Whop. After verifying the Whop user token the
-- server mints a Supabase-compatible JWT whose `sub` is users.id, so
-- auth.uid() = users.id and every policy below is `owner_id = auth.uid()`.
-- The service role (webhooks, jobs) bypasses RLS and must filter by owner.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.plan_tier as enum ('trial', 'starter', 'pro', 'agency');
create type public.membership_status as enum ('trialing', 'active', 'past_due', 'canceled', 'expired');
create type public.niche_level as enum ('niche', 'sub', 'micro');
create type public.idea_source as enum ('ai', 'viral_link', 'trend');
create type public.idea_status as enum ('new', 'scripted', 'used', 'archived');
create type public.post_format as enum ('video', 'text', 'text_image', 'image');
create type public.post_status as enum ('draft', 'approved', 'scheduled', 'published', 'failed');
create type public.post_goal as enum ('trust', 'leads', 'sales');
create type public.social_platform as enum ('youtube', 'facebook', 'x', 'tiktok', 'instagram');
create type public.autopilot_mode as enum ('approve_first', 'auto_publish');
create type public.job_status as enum ('queued', 'running', 'succeeded', 'failed', 'dead');
create type public.render_kind as enum ('text_image', 'image', 'video', 'voiceover');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key default gen_random_uuid(),
  whop_user_id text not null unique,
  email text,
  name text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users (id) on delete cascade,
  whop_membership_id text not null unique,
  plan_id text not null,
  tier public.plan_tier not null,
  status public.membership_status not null,
  renews_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- True when the current user owns the workspace. SECURITY DEFINER so it can be
-- used inside other tables' policies without recursive RLS evaluation.
create or replace function public.owns_workspace(ws uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.workspaces w where w.id = ws and w.owner_id = auth.uid());
$$;

create table public.onboarding_profiles (
  workspace_id uuid primary key,
  owner_id uuid not null references public.users (id) on delete cascade,
  goals text[] not null default '{}',
  experience text,
  platforms public.social_platform[] not null default '{}',
  hours_per_week smallint check (hours_per_week between 0 and 168),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.niches (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  owner_id uuid not null references public.users (id) on delete cascade,
  parent_id uuid,
  name text not null,
  level public.niche_level not null,
  monthly_volume integer,
  competition numeric(5, 2),
  buyer_intent numeric(5, 2),
  ease_to_rank_score numeric(5, 2) check (ease_to_rank_score between 0 and 100),
  trend_score numeric(5, 2),
  selected boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.niche_keywords (
  id uuid primary key default gen_random_uuid(),
  niche_id uuid not null,
  owner_id uuid not null references public.users (id) on delete cascade,
  keyword text not null,
  volume integer,
  cpc numeric(10, 2),
  serp_difficulty numeric(5, 2),
  fetched_at timestamptz not null default now()
);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  owner_id uuid not null references public.users (id) on delete cascade,
  problem text,
  audience text,
  format text,
  outline jsonb not null default '[]',
  price_cents integer check (price_cents >= 0),
  sales_copy text,
  whop_product_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.brand_kits (
  workspace_id uuid primary key,
  owner_id uuid not null references public.users (id) on delete cascade,
  voice text,
  colors jsonb not null default '{}',
  fonts jsonb not null default '{}',
  logo_path text,
  updated_at timestamptz not null default now()
);

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  owner_id uuid not null references public.users (id) on delete cascade,
  niche_id uuid,
  title text not null,
  hook text,
  angle text,
  source public.idea_source not null default 'ai',
  status public.idea_status not null default 'new',
  created_at timestamptz not null default now()
);

create table public.scripts (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null,
  owner_id uuid not null references public.users (id) on delete cascade,
  hook text not null,
  body text not null,
  cta text,
  duration_sec smallint not null default 30 check (duration_sec between 5 and 180),
  version integer not null default 1,
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  owner_id uuid not null references public.users (id) on delete cascade,
  format public.post_format not null,
  caption text,
  script_id uuid,
  media_paths text[] not null default '{}',
  status public.post_status not null default 'draft',
  goal public.post_goal,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.calendar_entries (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null,
  owner_id uuid not null references public.users (id) on delete cascade,
  scheduled_at timestamptz not null,
  platform public.social_platform not null,
  created_at timestamptz not null default now()
);

create table public.monetization_plans (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  owner_id uuid not null references public.users (id) on delete cascade,
  steps jsonb not null default '[]',
  ctas jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table public.autopilot_settings (
  workspace_id uuid primary key,
  owner_id uuid not null references public.users (id) on delete cascade,
  run_time_local time not null default '07:00',
  timezone text not null default 'UTC',
  mode public.autopilot_mode not null default 'approve_first',
  formats public.post_format[] not null default '{text,text_image}',
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  owner_id uuid not null references public.users (id) on delete cascade,
  platform public.social_platform not null,
  external_id text not null,
  display_name text,
  -- AES-256-GCM ciphertext (TOKEN_ENCRYPTION_KEY). Never plaintext.
  access_token_enc text not null,
  refresh_token_enc text,
  expires_at timestamptz,
  scopes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, platform, external_id)
);

create table public.render_jobs (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null,
  owner_id uuid not null references public.users (id) on delete cascade,
  kind public.render_kind not null,
  status public.job_status not null default 'queued',
  output_path text,
  cost_micro bigint not null default 0,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.publish_jobs (
  id uuid primary key default gen_random_uuid(),
  -- Post and social account must belong to this same workspace (brand), so an
  -- Agency user can't publish one brand's post to another brand's account.
  workspace_id uuid not null,
  post_id uuid not null,
  owner_id uuid not null references public.users (id) on delete cascade,
  social_account_id uuid not null,
  status public.job_status not null default 'queued',
  external_post_id text,
  error text,
  attempts smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.usage_events (
  id bigint generated always as identity primary key,
  owner_id uuid not null references public.users (id) on delete cascade,
  provider text not null,
  kind text not null,
  units numeric not null default 0,
  cost_micro bigint not null default 0,
  created_at timestamptz not null default now()
);

create table public.usage_budgets (
  owner_id uuid not null references public.users (id) on delete cascade,
  period text not null check (period ~ '^\d{4}-\d{2}$'), -- YYYY-MM
  limit_micro bigint not null check (limit_micro >= 0),
  used_micro bigint not null default 0 check (used_micro >= 0),
  primary key (owner_id, period)
);

-- ---------------------------------------------------------------------------
-- Owner-consistent foreign keys
-- Every reference to a parent row carries owner_id too, so a row can only point
-- at a parent with the same owner (user A can't attach a script to user B's
-- idea or schedule user B's post). FK checks run regardless of RLS.
-- ---------------------------------------------------------------------------
alter table public.workspaces add constraint workspaces_id_owner_key unique (id, owner_id);
alter table public.niches add constraint niches_id_owner_key unique (id, owner_id);
alter table public.ideas add constraint ideas_id_owner_key unique (id, owner_id);
alter table public.scripts add constraint scripts_id_owner_key unique (id, owner_id);
alter table public.posts add constraint posts_id_owner_key unique (id, owner_id);
alter table public.social_accounts add constraint social_accounts_id_owner_key unique (id, owner_id);

do $$
declare t text;
begin
  foreach t in array array['onboarding_profiles','niches','offers','brand_kits','ideas','posts',
                           'monetization_plans','autopilot_settings','social_accounts']
  loop
    execute format('alter table public.%I add constraint %I foreign key (workspace_id, owner_id)
                    references public.workspaces (id, owner_id) on delete cascade', t, t || '_workspace_owner_fkey');
  end loop;
end $$;

alter table public.niches add constraint niches_parent_owner_fkey
  foreign key (parent_id, owner_id) references public.niches (id, owner_id) on delete cascade;
alter table public.niche_keywords add constraint niche_keywords_niche_owner_fkey
  foreign key (niche_id, owner_id) references public.niches (id, owner_id) on delete cascade;
-- Column-list SET NULL (PG15+) clears only the reference, never owner_id.
alter table public.ideas add constraint ideas_niche_owner_fkey
  foreign key (niche_id, owner_id) references public.niches (id, owner_id) on delete set null (niche_id);
alter table public.scripts add constraint scripts_idea_owner_fkey
  foreign key (idea_id, owner_id) references public.ideas (id, owner_id) on delete cascade;
alter table public.posts add constraint posts_script_owner_fkey
  foreign key (script_id, owner_id) references public.scripts (id, owner_id) on delete set null (script_id);
alter table public.calendar_entries add constraint calendar_entries_post_owner_fkey
  foreign key (post_id, owner_id) references public.posts (id, owner_id) on delete cascade;
alter table public.render_jobs add constraint render_jobs_post_owner_fkey
  foreign key (post_id, owner_id) references public.posts (id, owner_id) on delete cascade;
alter table public.posts add constraint posts_id_owner_workspace_key unique (id, owner_id, workspace_id);
alter table public.social_accounts add constraint social_accounts_id_owner_workspace_key unique (id, owner_id, workspace_id);
alter table public.publish_jobs add constraint publish_jobs_post_owner_workspace_fkey
  foreign key (post_id, owner_id, workspace_id) references public.posts (id, owner_id, workspace_id) on delete cascade;
alter table public.publish_jobs add constraint publish_jobs_social_account_owner_workspace_fkey
  foreign key (social_account_id, owner_id, workspace_id)
  references public.social_accounts (id, owner_id, workspace_id) on delete cascade;

-- ---------------------------------------------------------------------------
-- Indexes (database-schema.md)
-- ---------------------------------------------------------------------------
create index niches_workspace_ease_idx on public.niches (workspace_id, ease_to_rank_score desc);
create index niches_parent_idx on public.niches (parent_id);
create index niche_keywords_niche_idx on public.niche_keywords (niche_id);
create index posts_workspace_status_idx on public.posts (workspace_id, status);
create index calendar_entries_scheduled_idx on public.calendar_entries (scheduled_at);
create index publish_jobs_status_created_idx on public.publish_jobs (status, created_at);
create index render_jobs_status_idx on public.render_jobs (status);
create index usage_events_owner_created_idx on public.usage_events (owner_id, created_at);
create index social_accounts_workspace_platform_idx on public.social_accounts (workspace_id, platform);
-- owner_id on every table (RLS predicates) and FK columns used by cascades.
-- Composite (x_id, owner_id) FKs are covered by indexes leading with x_id.
do $$
declare t text;
begin
  foreach t in array array['memberships','workspaces','onboarding_profiles','niches','niche_keywords','offers',
                           'brand_kits','ideas','scripts','posts','calendar_entries','monetization_plans',
                           'autopilot_settings','social_accounts','render_jobs','publish_jobs']
  loop
    execute format('create index %I on public.%I (owner_id)', t || '_owner_idx', t);
  end loop;
end $$;
create index offers_workspace_idx on public.offers (workspace_id);
create index ideas_workspace_idx on public.ideas (workspace_id);
create index ideas_niche_idx on public.ideas (niche_id);
create index scripts_idea_idx on public.scripts (idea_id);
create index posts_script_idx on public.posts (script_id);
create index calendar_entries_post_idx on public.calendar_entries (post_id);
create index monetization_plans_workspace_idx on public.monetization_plans (workspace_id);
create index render_jobs_post_idx on public.render_jobs (post_id);
create index publish_jobs_post_idx on public.publish_jobs (post_id);
create index publish_jobs_social_account_idx on public.publish_jobs (social_account_id);

-- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array['users','memberships','workspaces','onboarding_profiles','offers','brand_kits',
                           'posts','autopilot_settings','social_accounts','render_jobs','publish_jobs']
  loop
    execute format('create trigger %I_set_updated_at before update on public.%I
                    for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
create policy users_select_self on public.users for select to authenticated using (id = auth.uid());
create policy users_update_self on public.users for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
-- Inserts happen server-side (service role) on first Whop visit.
-- The Whop identity mapping (whop_user_id) and Whop-sourced email are
-- server-only: users may edit profile fields, nothing else.
revoke insert, update, delete on public.users from anon, authenticated;
grant update (name, timezone) on public.users to authenticated;

-- Server-written tables: owners can read their rows; only the service role writes.
alter table public.memberships enable row level security;
create policy memberships_select_own on public.memberships for select to authenticated using (owner_id = auth.uid());

alter table public.usage_events enable row level security;
create policy usage_events_select_own on public.usage_events for select to authenticated using (owner_id = auth.uid());

alter table public.usage_budgets enable row level security;
create policy usage_budgets_select_own on public.usage_budgets for select to authenticated using (owner_id = auth.uid());

alter table public.render_jobs enable row level security;
create policy render_jobs_select_own on public.render_jobs for select to authenticated using (owner_id = auth.uid());

alter table public.publish_jobs enable row level security;
create policy publish_jobs_select_own on public.publish_jobs for select to authenticated using (owner_id = auth.uid());

-- Workspaces: full CRUD on own rows.
alter table public.workspaces enable row level security;
create policy workspaces_all_own on public.workspaces for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Workspace-scoped user tables: own rows, and writes must target a workspace you own.
do $$
declare t text;
begin
  foreach t in array array['onboarding_profiles','niches','offers','brand_kits','ideas','posts',
                           'monetization_plans','autopilot_settings','social_accounts']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for all to authenticated
                    using (owner_id = auth.uid())
                    with check (owner_id = auth.uid() and public.owns_workspace(workspace_id))',
                   t || '_all_own', t);
  end loop;
end $$;

-- Child tables without workspace_id: own rows only.
do $$
declare t text;
begin
  foreach t in array array['niche_keywords','scripts','calendar_entries']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for all to authenticated
                    using (owner_id = auth.uid()) with check (owner_id = auth.uid())',
                   t || '_all_own', t);
  end loop;
end $$;

-- Encrypted tokens are never readable with user credentials. A column-level
-- revoke does not override a table-level grant, so re-grant only safe columns.
revoke select on public.social_accounts from anon, authenticated;
grant select (id, workspace_id, owner_id, platform, external_id, display_name, expires_at, scopes,
              created_at, updated_at)
  on public.social_accounts to authenticated;

-- Realtime: job status updates (state-management.md).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.render_jobs, public.publish_jobs;
  end if;
end $$;
