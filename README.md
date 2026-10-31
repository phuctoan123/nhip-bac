# Nhíp Bạc – Admin và booking production

## Chạy thử

Đây là website tĩnh, có thể mở bằng máy chủ tĩnh bất kỳ trong thư mục dự án, ví dụ `python -m http.server 8000`, sau đó mở `http://localhost:8000/index.html`. Trang quản trị ở [`admin.html`](admin.html).

Tài khoản demo: `admin` / `ChangeMe123!`. Đây chỉ là lớp kiểm soát giao diện phía trình duyệt, không phải cơ chế xác thực production. Có thể đổi username hoặc `passwordHash` trong `assets/js/admin.js` (hash SHA-256 của mật khẩu mới).

## Đã triển khai

- Dashboard thống kê từ dữ liệu thật; quản lý dịch vụ, giá, trạng thái hiển thị và thứ tự.
- CRUD đánh giá với trạng thái bản nháp, chờ duyệt, đã xuất bản và đã ẩn; website chỉ hiển thị đánh giá đã xuất bản.
- Form liên hệ lưu booking vào Supabase ở production; khi chạy local không có API, form dùng localStorage fallback.
- `services.html`, `pricing.html`, `reviews.html` và `contact.html` dùng chung `assets/js/storage.js`; nội dung quản trị được giữ sau khi tải lại.
- Nội dung nhập của người dùng được render dạng text và có xác nhận trước khi xóa.

## LocalStorage và giới hạn

Các kho local chính là `nhipbac.services.v1`, `nhipbac.reviews.v1`, `nhipbac.bookings.v1`; phiên đăng nhập dùng `sessionStorage` với key `nhipbac.admin.session.v1`. Booking production không reset bằng DevTools mà được lưu trong bảng `public.bookings` của Supabase.

## Database trên Vercel

Booking production dùng Supabase thông qua các Vercel Functions:

- `POST /api/bookings`: nhận booking từ form công khai.
- `POST /api/admin/auth`: đăng nhập Admin và cấp phiên tạm thời.
- `GET/PATCH/DELETE /api/admin/bookings`: đọc và xử lý booking trong Admin.

Thiết lập các biến môi trường trên Vercel, không commit vào GitHub:

```env
SUPABASE_URL=...
SUPABASE_SECRET_KEY=...
APP_ORIGIN=https://ten-mien-cua-ban.vercel.app
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=9a4aabf0e5cf71cae2cea646613ce7e2a5919fa758e56819704be25a3a2c1f0b
ADMIN_SESSION_SECRET=<chuoi-ngau-nhien-dai>
```

`ADMIN_PASSWORD_HASH` phía trên tương ứng với mật khẩu demo `ChangeMe123!`. Nên đổi mật khẩu và tạo hash mới trước khi public website. Secret Supabase chỉ được dùng trong API server-side.

Nếu API Vercel chưa được cấu hình hoặc đang chạy file tĩnh local, dữ liệu fallback chỉ tồn tại trong localStorage của đúng trình duyệt/origin. Khi production đã có đủ biến môi trường, booking được lưu tập trung trong Supabase và có thể xem từ Admin trên thiết bị khác.
