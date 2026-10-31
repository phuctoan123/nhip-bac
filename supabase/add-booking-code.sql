-- Run once in Supabase SQL Editor before deploying the short booking code.
alter table public.bookings
  add column if not exists booking_code text;

with numbered_bookings as (
  select id,
    'NB-' || lpad(row_number() over (order by created_at, id)::text, 4, '0') as generated_code
  from public.bookings
  where booking_code is null
)
update public.bookings as bookings
set booking_code = numbered_bookings.generated_code
from numbered_bookings
where bookings.id = numbered_bookings.id;

create unique index if not exists bookings_booking_code_unique
  on public.bookings (booking_code)
  where booking_code is not null;
