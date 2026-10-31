-- Run once in Supabase SQL Editor before deploying the short booking code.
alter table public.bookings
  add column if not exists booking_code text;

create unique index if not exists bookings_booking_code_unique
  on public.bookings (booking_code)
  where booking_code is not null;
