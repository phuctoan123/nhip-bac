-- Giai đoạn 1: dữ liệu dịch vụ và đánh giá dùng chung cho public site/Admin.
-- Chạy một lần trong Supabase SQL Editor; các lệnh có thể chạy lại an toàn.

create table if not exists public.services (
  id text primary key,
  name_vi text not null,
  name_en text not null default '',
  description_vi text not null default '',
  description_en text not null default '',
  category text not null default '',
  image text not null default '',
  price integer not null default 0 check (price >= 0),
  unit text not null default 'phút',
  price_note text not null default '',
  visible boolean not null default true,
  sort_order integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id text primary key,
  name text not null,
  content text not null,
  rating smallint not null check (rating between 1 and 5),
  language text not null default 'vi' check (language in ('vi', 'en')),
  review_date date,
  status text not null default 'pending' check (status in ('draft', 'pending', 'published', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.services enable row level security;
alter table public.reviews enable row level security;

create index if not exists services_visible_sort_order_idx
  on public.services (visible, sort_order, id);

create index if not exists reviews_status_date_idx
  on public.reviews (status, review_date desc, created_at desc);

insert into public.services (
  id, name_vi, name_en, description_vi, description_en, category, image,
  price, unit, price_note, visible, sort_order
)
values
  (
    'svc-grey-hair',
    'Nhíp Bạc - Nhổ tóc bạc',
    'Grey Hair Plucking',
    'Dịch vụ nhổ tóc bạc thủ công, tập trung vào độ chính xác và cảm giác thoải mái.',
    'Manual grey hair plucking focused on precision and comfort.',
    'Chăm sóc tóc',
    'assets/nhip-bac-images/poster-lam-viec.jpg',
    2000,
    'phút',
    'Tính phí minh bạch theo thời gian',
    true,
    1
  ),
  (
    'svc-japan-support',
    'Hỗ trợ Visa & Du lịch Nhật Bản',
    'Japan Visa & Travel Support',
    'Tư vấn chuẩn bị hồ sơ và lịch trình cho khách hàng có kế hoạch du lịch Nhật Bản.',
    'Practical guidance for guests preparing documents and itineraries for travel to Japan.',
    'Tư vấn',
    'assets/nhip-bac-images/post-visa.jpg',
    0,
    'gói',
    'Liên hệ để được tư vấn',
    true,
    2
  )
on conflict (id) do nothing;
