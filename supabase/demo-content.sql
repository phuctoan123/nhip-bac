-- Dữ liệu thử nghiệm cho services.html và reviews.html.
-- Chỉ chạy khi cần kiểm tra giao diện. Các review có tiền tố [Demo] và không phải review khách hàng thật.

insert into public.services (
  id, name_vi, name_en, description_vi, description_en, category, image,
  price, unit, price_note, visible, sort_order
)
values
  (
    'svc-grey-hair',
    'Nhổ tóc bạc thủ công',
    'Grey Hair Plucking',
    'Nhổ từng sợi tóc bạc bằng tay, nhẹ nhàng và tỉ mỉ, phù hợp cho thời gian thư giãn riêng tư.',
    'Gentle and precise manual grey hair plucking for a calm private session.',
    'Nhổ tóc bạc',
    'assets/nhip-bac-images/poster-lam-viec.jpg',
    2000,
    'phút',
    'Tính phí minh bạch theo thời gian',
    true,
    1
  ),
  (
    'svc-scalp-relax',
    'Thư giãn và chăm sóc da đầu',
    'Scalp Relaxation',
    'Một khoảng nghỉ nhẹ nhàng kết hợp chăm sóc da đầu, giúp bạn cảm thấy thư thái hơn sau ngày bận rộn.',
    'A gentle scalp-care session designed to help you unwind after a busy day.',
    'Thư giãn',
    'assets/nhip-bac-images/poster-lam-viec.jpg',
    2000,
    'phút',
    'Tính phí minh bạch theo thời gian',
    true,
    2
  )
on conflict (id) do update set
  name_vi = excluded.name_vi,
  name_en = excluded.name_en,
  description_vi = excluded.description_vi,
  description_en = excluded.description_en,
  category = excluded.category,
  image = excluded.image,
  price = excluded.price,
  unit = excluded.unit,
  price_note = excluded.price_note,
  visible = excluded.visible,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.reviews (id, name, content, rating, language, review_date, status)
values
  ('demo-review-01', '[Demo] Ngọc Hà', 'Không gian yên tĩnh, thao tác nhẹ tay và rất tỉ mỉ. Mình thấy thư giãn hơn sau buổi hẹn.', 5, 'vi', current_date, 'published'),
  ('demo-review-02', '[Demo] Phương Linh', 'Đặt lịch thuận tiện, giá tính theo phút rõ ràng. Trải nghiệm nhẹ nhàng và chỉn chu.', 5, 'vi', current_date - 1, 'published'),
  ('demo-review-03', '[Demo] Minh Quân', 'The service was gentle and comfortable. The team explained the process clearly.', 5, 'en', current_date - 2, 'published')
on conflict (id) do update set
  name = excluded.name,
  content = excluded.content,
  rating = excluded.rating,
  language = excluded.language,
  review_date = excluded.review_date,
  status = excluded.status,
  updated_at = now();
