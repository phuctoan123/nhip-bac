-- Chạy một lần trong Supabase SQL Editor.
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

insert into public.site_settings (key, value)
values ('contact_phone', '{"phone":"0934013486"}'::jsonb)
on conflict (key) do nothing;
