# Nhíp Bạc – Admin và booking production

## Chạy thử

Đây là website tĩnh, có thể mở bằng máy chủ tĩnh bất kỳ trong thư mục dự án, ví dụ `python -m http.server 8000`, sau đó mở `http://localhost:8000/index.html`. Trang quản trị ở [`admin.html`](admin.html).

Khi chạy file tĩnh local, Admin có fallback dành riêng cho kiểm tra giao diện. Production luôn xác thực qua `/api/admin/auth` và không dùng fallback này.

## Đã triển khai

- Dashboard thống kê từ dữ liệu thật; quản lý dịch vụ, giá, trạng thái hiển thị và thứ tự.
- CRUD đánh giá với trạng thái bản nháp, chờ duyệt, đã xuất bản và đã ẩn; website chỉ hiển thị đánh giá đã xuất bản.
- Form liên hệ lưu booking vào Supabase ở production; khi chạy local không có API, form dùng localStorage fallback.
- `services.html`, `pricing.html`, `reviews.html` và `contact.html` dùng chung `assets/js/storage.js`; nội dung quản trị được giữ sau khi tải lại.
- Nội dung nhập của người dùng được render dạng text và có xác nhận trước khi xóa.
- Dịch vụ và đánh giá production được quản lý qua Supabase; chỉ đánh giá đã xuất bản mới xuất hiện public.

## LocalStorage và giới hạn

Các kho local chính là `nhipbac.services.v1`, `nhipbac.reviews.v1`, `nhipbac.bookings.v1`; phiên đăng nhập dùng `sessionStorage` với key `nhipbac.admin.session.v1`. Booking production không reset bằng DevTools mà được lưu trong bảng `public.bookings` của Supabase.

## Database trên Vercel

Booking production dùng Supabase thông qua các Vercel Functions:

- `POST /api/bookings`: nhận booking từ form công khai.
- `POST /api/admin/auth`: đăng nhập Admin và cấp phiên tạm thời.
- `GET/PATCH/DELETE /api/admin/bookings`: đọc và xử lý booking trong Admin.
- `GET/POST/PATCH/DELETE /api/admin/services`: quản lý dịch vụ và giá.
- `GET/POST/PATCH/DELETE /api/admin/reviews`: quản lý đánh giá.

Thiết lập các biến môi trường trên Vercel, không commit vào GitHub:

```env
SUPABASE_URL=...
SUPABASE_SECRET_KEY=...
APP_ORIGIN=https://ten-mien-cua-ban.vercel.app
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=scrypt$<salt_hex>$<hash_hex>
ADMIN_SESSION_SECRET=<chuoi-ngau-nhien-dai>
```

Tạo hash scrypt mới bằng Node, không ghi mật khẩu hoặc hash vào mã nguồn:

```bash
node scripts/hash-password.js
```

Dán kết quả vào `ADMIN_PASSWORD_HASH` trên Vercel. Định dạng SHA-256 cũ vẫn được chấp nhận tạm thời để chuyển đổi, nhưng API sẽ cảnh báo trong log. Secret Supabase chỉ được dùng trong API server-side.

Đăng nhập sai quá 5 lần trong 15 phút từ cùng một IP sẽ nhận HTTP 429. Nhật ký giới hạn đăng nhập nằm trong bảng `public.admin_login_attempts` và được dọn bản ghi cũ khi có lần thử mới.

Nếu API Vercel chưa được cấu hình hoặc đang chạy file tĩnh local, dữ liệu fallback chỉ tồn tại trong localStorage của đúng trình duyệt/origin. Khi production đã có đủ biến môi trường, booking được lưu tập trung trong Supabase và có thể xem từ Admin trên thiết bị khác.
