# Chùa An Lạc 3D — vận hành bản online

## Địa chỉ hiện tại

- Game: https://chua-an-lac-3d.vercel.app/
- Backend: https://chua-an-lac-multiplayer.onrender.com
- Kiểm tra backend: https://chua-an-lac-multiplayer.onrender.com/health
- Mã nguồn: https://github.com/khiemtranduc1704-code/vietnamese-temple-3d — nhánh `main`.
- Vercel: https://vercel.com/khiem13/chua-an-lac-3d — Hobby.
- Render: https://dashboard.render.com/web/srv-dbi6jhqfngtc73cer810 — Free, Singapore, 1 instance.

Tài khoản và dự án đã được tạo. Không cần tạo thêm dịch vụ hoặc mua tên miền để chơi. Vercel được triển khai bằng CLI; Render lấy mã từ GitHub. Việc push GitHub hiện không tự triển khai frontend; Render cũng đang tắt auto-deploy để tránh làm mất phòng khi cập nhật mã.

## Mời bạn bè qua Zalo

1. Mở link game trên máy tính, bấm **Chơi cùng bạn bè**.
2. Nhập tên → **Tạo phòng riêng**.
3. Bấm nút phòng ở phía trên → **Sao chép link mời** → gửi qua Zalo.
4. Bạn bè mở đúng link, nhập tên → **Vào phòng**. Mã phòng đã được điền sẵn.
5. Kiểm tra số người `2/20`, thử đi lại, chắp tay, quỳ lễ và trò chuyện.

Mọi người phải dùng cùng link có `#room=...`. Nếu mỗi người bấm Tạo phòng, họ sẽ ở các phòng khác nhau. Tối đa 20 người, kể cả người tạo phòng. Ai có mã đều có thể vào, nên chỉ gửi cho nhóm bạn.

Điều khiển: WASD để đi, kéo chuột để xoay camera; 1–6 lễ Phật; E tương tác/chọn chỗ; R đứng dậy; T chuỗi hạt; M mõ; K sách; N nghi lễ. Game hiện ưu tiên máy tính; chưa có bộ điều khiển cảm ứng đầy đủ cho điện thoại hoặc trình duyệt bên trong Zalo.

## Cấu hình đang dùng

| Nơi | Cấu hình |
| --- | --- |
| Vercel | Vite, Node 22.x, `npm ci`, build `npm run build:online`, output `dist` |
| Vercel Production env | `VITE_MULTIPLAYER_URL=wss://chua-an-lac-multiplayer.onrender.com` |
| Vercel truy cập | URL Production công khai, deployment Preview được bảo vệ |
| Render source | Nhánh `main`, Root Directory trống |
| Render build | `npm ci --include=dev --prefix server && npm run build --prefix server` |
| Render start | `npm start --prefix server` |
| Render health | `/health` |
| Render env | `NODE_VERSION=22.21.1`, `NODE_ENV=production`, `HOST=0.0.0.0`, `MAX_ROOMS=10` |
| Render origin | `ALLOWED_ORIGINS=https://chua-an-lac-3d.vercel.app` |
| Render port | Do nền tảng cấp qua `PORT` |

HTTPS/WSS được nền tảng xử lý; không cần lưu chứng chỉ/private key trong repo. Biến `VITE_` xuất hiện trong JavaScript công khai, nên chỉ chứa URL công khai. `.env` thật và `.runtime` bị Git và Vercel upload loại trừ; không commit token đăng nhập. `server/` không cần tải lên build frontend.

Chỉ origin Production nói trên được vào phòng. URL Preview Vercel có thể hiển thị game nhưng không được phép kết nối backend. Khi đổi tên miền, cập nhật cả frontend endpoint nếu cần và `ALLOWED_ORIGINS`, rồi triển khai lại.

## Cập nhật sau này

1. Sửa trong thư mục `Vietnamese-Temple-3D-online`, giữ bản ổn định ở thư mục riêng.
2. Chạy kiểm thử và build; commit rồi `git push origin HEAD:main`. Không force push.
3. Nếu sửa backend: Render → dịch vụ → **Manual Deploy → Deploy latest commit**, chờ Live. Phòng cũ sẽ mất khi server thay thế.
4. Nếu sửa frontend: từ thư mục đã link, chạy `vercel deploy --prod --scope khiem13`. Trên Mac hiện tại CLI nằm trong `.runtime/deploy-tools/node_modules/.bin/vercel`; thêm `.runtime/bin` vào PATH để dùng Node.
5. Vercel thay đổi Environment Variables chỉ có tác dụng sau build/deploy mới.
6. Kiểm tra `/health`, trang game không đăng nhập và hai người vào chung phòng trước khi mời cả nhóm.

Không bật gói Pro/Starter trả phí, Turbo build hay thêm instance nếu chưa quyết định chi phí. Backend đang dùng Free; Vercel đang dùng Hobby.

## Kiểm thử từ mã nguồn

```sh
npm ci
npm ci --prefix server
npm test
npm run test:online
VITE_MULTIPLAYER_URL=wss://chua-an-lac-multiplayer.onrender.com npm run build:online
```

Kiểm thử server đã triển khai (tạo phòng QA mới, 20 kết nối, sau đó rời phòng):

```sh
npm run server:build
TEST_BACKEND_URL=wss://chua-an-lac-multiplayer.onrender.com TEST_FRONTEND_ORIGIN=https://chua-an-lac-3d.vercel.app node server/test/deployed.mjs
```

Bài kiểm tra này dùng giao thức WebSocket thật nhưng không vẽ 20 trình duyệt 3D. Trước một buổi chơi đông người, thử thêm trên hai máy/hai mạng khác nhau, camera/âm thanh và tăng dần 5 → 10 → 20 người. Xem CPU/RAM/log ở dashboard Render khi thử.

## Giới hạn và xử lý lỗi

Render Free có thể ngủ sau 15 phút không có lưu lượng; khi mở lại có thể cần khoảng một phút để khởi động. Nếu lần đầu vào phòng thất bại, đợi rồi thử lại. [Render Free](https://render.com/docs/free).

Phòng, chat, chỗ ngồi và hiệu ứng chung nằm trong RAM của một backend. Restart/redeploy/ngủ sẽ mất phòng; tạo phòng và gửi mã mới. Mất mạng ngắn có cửa sổ nối lại khoảng 20 giây. Không tăng nhiều backend instance khi chưa bổ sung kiến trúc chia sẻ trạng thái.

Chuỗi hạt, trang sách, thống kê thực hành và công đức cá nhân lưu trong trình duyệt. Tiền chỉ là mô phỏng; không có thu tiền thật. Chưa có voice chat, tài khoản xác minh danh tính hoặc quản trị phòng.

- Trang không vào được: dùng URL Vercel, không gửi `127.0.0.1` cho bạn bè.
- Game hiện nhưng không vào phòng: kiểm tra Render Live, `/health`, đúng mã phòng, đúng URL Production và origin.
- Phòng không tồn tại: server có thể đã restart hoặc phòng đã hết người; tạo link mới.
- Phòng đầy: chờ người rời hoặc hết thời gian giữ chỗ khi mất mạng.
- Không có tiếng: bấm vào trang trước rồi kiểm tra âm lượng/tab mute.
- Cần hỗ trợ: gửi lỗi trong Render Logs hoặc Vercel Build Logs; không gửi token, mật khẩu hoặc nội dung `.env`.
