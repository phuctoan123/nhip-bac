# Nhíp Bạc – Admin local demo

## Chạy thử

Đây là website tĩnh, có thể mở bằng máy chủ tĩnh bất kỳ trong thư mục dự án, ví dụ `python -m http.server 8000`, sau đó mở `http://localhost:8000/index.html`. Trang quản trị ở [`admin.html`](admin.html).

Tài khoản demo: `admin` / `ChangeMe123!`. Đây chỉ là lớp kiểm soát giao diện phía trình duyệt, không phải cơ chế xác thực production. Có thể đổi username hoặc `passwordHash` trong `assets/js/admin.js` (hash SHA-256 của mật khẩu mới).

## Đã triển khai

- Dashboard thống kê từ dữ liệu thật; quản lý dịch vụ, giá, trạng thái hiển thị và thứ tự.
- CRUD đánh giá với trạng thái bản nháp, chờ duyệt, đã xuất bản và đã ẩn; website chỉ hiển thị đánh giá đã xuất bản.
- Form liên hệ lưu booking với snapshot tên dịch vụ, trạng thái xử lý, ghi chú nội bộ và xuất CSV.
- `services.html`, `pricing.html`, `reviews.html` và `contact.html` dùng chung `assets/js/storage.js`; nội dung quản trị được giữ sau khi tải lại.
- Nội dung nhập của người dùng được render dạng text và có xác nhận trước khi xóa.

## LocalStorage và giới hạn

Các kho chính là `nhipbac.services.v1`, `nhipbac.reviews.v1`, `nhipbac.bookings.v1`; phiên đăng nhập dùng `sessionStorage` với key `nhipbac.admin.session.v1`. Có thể reset dữ liệu demo bằng cách xóa các key trên trong DevTools rồi tải lại trang.

Vì không có backend, dữ liệu chỉ tồn tại trong localStorage của đúng trình duyệt và origin hiện tại. Booking gửi từ thiết bị khác sẽ không tự động xuất hiện trên máy Admin. Khi triển khai thật cần thay repository trong `assets/js/storage.js` bằng API/backend.
