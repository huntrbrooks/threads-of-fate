-- Run this in Supabase SQL editor
create table if not exists public.readings (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  timestamp_iso timestamptz not null,
  input jsonb not null,
  output jsonb not null,
  seed text not null,
  reflection text,
  reminder_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_readings_user_created on public.readings (user_id, created_at desc);

alter table public.readings enable row level security;

create policy "read own readings" on public.readings for select using (auth.uid() = user_id);
create policy "insert own readings" on public.readings for insert with check (auth.uid() = user_id);
create policy "update own readings" on public.readings for update using (auth.uid() = user_id);
create policy "delete own readings" on public.readings for delete using (auth.uid() = user_id);

-- Push tokens & scheduled reminders (allow anon inserts for v1)
create table if not exists public.push_tokens (
  token text primary key,
  device_id text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.push_tokens enable row level security;
create policy "insert tokens anon" on public.push_tokens for insert with check (true);
create policy "select tokens admin only" on public.push_tokens for select using (false);
create policy "update own token" on public.push_tokens for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.scheduled_reminders (
  id uuid primary key default gen_random_uuid(),
  token text not null references public.push_tokens(token) on delete cascade,
  due_at timestamptz not null,
  headline text,
  body text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.scheduled_reminders enable row level security;
create index if not exists idx_sched_due on public.scheduled_reminders (due_at asc) where sent_at is null;
create policy "insert reminders anon" on public.scheduled_reminders for insert with check (true);
create policy "select reminders admin only" on public.scheduled_reminders for select using (false);
