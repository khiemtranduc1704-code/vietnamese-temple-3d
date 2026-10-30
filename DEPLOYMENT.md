# Đưa Chùa An Lạc 3D lên mạng — hướng dẫn cho người mới

**Trạng thái hiện tại:** đã chuẩn bị mã nguồn và cấu hình, chưa đăng GitHub, chưa tạo dịch vụ, chưa triển khai, chưa mua gì. Các bước có nút **Create Web Service / Deploy / Push** dưới đây là hướng dẫn để dùng khi bạn quyết định xuất bản sau này. Không cần thực hiện chúng ngay.

## 1. Bạn cần tài khoản nào?

| Tài khoản | Dùng để làm gì | Lựa chọn ban đầu |
| --- | --- | --- |
| [GitHub](https://github.com/signup) | Giữ mã nguồn trong kho riêng | Tài khoản cá nhân, repository Private |
| [Render](https://dashboard.render.com/) | Chạy máy chủ Colyseus liên tục khi có người chơi | Web Service, instance Free, một instance |
| [Vercel](https://vercel.com/signup) | Cung cấp trang game HTTPS cho bạn bè | Hobby cho dự án cá nhân phù hợp điều khoản |

Bạn bè **không cần tài khoản** ở ba nơi này; họ chỉ cần trình duyệt, tên hiển thị và link mời. Chưa cần tên miền riêng, cơ sở dữ liệu, Redis hay dịch vụ trả phí. Bạn tự đăng ký/đăng nhập và chấp nhận điều khoản nếu đồng ý. Nếu một màn hình yêu cầu trả tiền hoặc nâng cấp, dừng lại và kiểm tra, không chọn gói trả phí.

**Việc nên làm tiếp ngay:** mở ba trang trên và chuẩn bị tài khoản. Đọc hết hướng dẫn trước khi bấm nút xuất bản. Không chia sẻ mật khẩu hoặc token trong chat.

## 2. Phân biệt hai thư mục trên Mac

- Bản ổn định: `/Users/khiem/Downloads/ChatGPT/Vietnamese-Temple-3D`.
- Bản chuẩn bị online: `/Users/khiem/Downloads/ChatGPT/Vietnamese-Temple-3D-online`, nhánh `codex/online-deployment`.

Bản online là Git worktree riêng, dùng chung lịch sử Git với bản ổn định. Không xóa thư mục ổn định; không ghi đè hai thư mục lên nhau. Bản ổn định có tag `milestone-1-stable`. Bản online có checkpoint `milestone-3-deployment-prepared`.

Chạy thử bản online trên Mac: mở thư mục online, nhấp đúp **Start Online Preview.command**, rồi mở **http://127.0.0.1:5174/**. Giữ cửa sổ Terminal mở. Nếu báo cổng đã dùng, đóng cửa sổ preview cũ do bạn mở hoặc dùng preview đang chạy; không tắt tiến trình lạ. Bản ổn định ở cổng 5173 được giữ riêng. Đây vẫn chỉ là địa chỉ trên Mac, chưa gửi cho bạn bè qua Internet được.

## 3. Sau này: đưa đúng nhánh lên GitHub

Thực hiện phần này khi bạn đã quyết định tải mã nguồn lên tài khoản của mình.

1. GitHub → dấu **+** góc trên → **New repository**.
2. Tên gợi ý: `chua-an-lac-3d`. Chọn **Private**.
3. Để trống các lựa chọn tạo README, .gitignore và license vì dự án đã có file. Bấm **Create repository**.
4. Sao chép URL HTTPS kho của bạn, dạng `https://github.com/TEN-CUA-BAN/chua-an-lac-3d.git`.
5. Mở Terminal. Dán từng dòng sau, thay URL ví dụ bằng URL thật:

```sh
cd "/Users/khiem/Downloads/ChatGPT/Vietnamese-Temple-3D-online"
git status
git branch --show-current
git remote -v
```

Nhánh phải là `codex/online-deployment`. Nếu có thay đổi chưa commit hoặc remote đã tồn tại, kiểm tra trước; không dùng `reset --hard`, `clean`, `push --force` hay ghi đè remote.

Nếu chưa có remote `origin`, thêm URL kho riêng vừa tạo:

```sh
git remote add origin https://github.com/TEN-CUA-BAN/chua-an-lac-3d.git
git push -u origin codex/online-deployment
```

Lệnh push tải mã nguồn lên GitHub. **Chưa được chạy trong công việc chuẩn bị này.** Nếu GitHub yêu cầu đăng nhập, dùng luồng đăng nhập chính thức; không đưa token vào URL hoặc mã nguồn. Các file `.env.local`, `server/.env`, `.runtime`, `node_modules` đã được bỏ qua bởi Git. Ví dụ `.env.example` chứa cấu hình mẫu công khai, có thể commit.

Khi chọn repo trên Render/Vercel, cấp quyền đúng kho này và chọn nhánh **codex/online-deployment**, tránh chọn nhánh `main` đang giữ bản cũ.

## 4. Sau này: tạo backend trên Render

Đọc trước, chỉ bấm tạo dịch vụ khi muốn triển khai thật. Hướng dẫn thủ công này dùng cùng cấu hình với `render.yaml`; không cần tạo thêm Blueprint song song.

1. Render Dashboard → **New +** → **Web Service**.
2. Chọn Git Provider / kết nối GitHub → chọn kho riêng `chua-an-lac-3d`.
3. Điền các mục sau:

| Mục trên Render | Giá trị |
| --- | --- |
| Name | `chua-an-lac-multiplayer` hoặc tên còn trống |
| Branch | `codex/online-deployment` |
| Region | Singapore nếu còn hỗ trợ tài khoản/gói của bạn |
| Root Directory | **Để trống** — cần toàn bộ repo, không điền `server` |
| Language / Runtime | Node |
| Build Command | `npm ci --include=dev --prefix server && npm run build --prefix server` |
| Start Command | `npm start --prefix server` |
| Instance Type | **Free** |
| Health Check Path | `/health` |
| Auto-Deploy | Off |

Trong **Environment Variables**, thêm:

| Key | Value |
| --- | --- |
| `NODE_VERSION` | `22.21.1` |
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `MAX_ROOMS` | `10` |
| `ALLOWED_ORIGINS` | `https://placeholder.invalid` tạm thời |

Không đặt `PORT` cố định: chương trình đọc cổng Render cấp. Origin tạm thời không phải trang game; nó chặn khách chơi cho đến khi bạn có URL Vercel thật ở bước 6. Không dùng `*`.

4. Kiểm tra vẫn là **Free** và chỉ **1 instance**. Nút **Create Web Service** sẽ bắt đầu triển khai thật.
5. Khi trạng thái **Live**, ghi lại URL mà Render hiển thị, ví dụ `https://TEN-THAT.onrender.com`.
6. Mở `https://TEN-THAT.onrender.com/health`. Bạn phải thấy JSON có `"ok":true`, `"maxPlayers":20`.

Backend không chứa trang game. Gửi URL Render cho bạn bè sẽ không mở được chùa; frontend Vercel mới là trang game.

## 5. Sau này: tạo frontend trên Vercel

1. Vercel Dashboard → **Add New…** → **Project**.
2. Import đúng kho GitHub. Chọn nhánh `codex/online-deployment` (nếu cần, đặt nhánh mặc định của repo này trên GitHub trước khi import; đây là repo mới riêng của bạn).
3. Kiểm tra:

| Mục | Giá trị |
| --- | --- |
| Framework Preset | Vite |
| Root Directory | repo root / `./` |
| Build Command | `npm run build:online` |
| Output Directory | `dist` |
| Install Command | `npm ci` |
| Node.js Version | 22.x |

4. Trong **Environment Variables**, thêm `VITE_MULTIPLAYER_URL` cho **Production**. Giá trị là URL Render đổi tiền tố **https** thành **wss**, ví dụ:

```text
wss://TEN-THAT.onrender.com
```

Không thêm `/health`, không dùng `localhost`, không thêm khóa bí mật. Đây là địa chỉ công khai, sẽ nằm trong mã JavaScript tải về trình duyệt. Bản build online sẽ báo lỗi nếu thiếu biến này hoặc dùng giao thức không an toàn.

5. Nút **Deploy** sẽ xuất bản frontend thật. Khi xong, lấy URL production cố định, ví dụ `https://TEN-GAME.vercel.app`.
6. Vào Project **Settings → Git** (mục Production Branch / Branch Tracking) và kiểm tra nhánh production là `codex/online-deployment`. Các lần push tương lai có thể kích hoạt Vercel build; trong công việc hiện tại chưa có integration hoặc push nào được tạo.
7. Nếu sửa biến môi trường sau đó: **Settings → Environment Variables**, sửa/lưu; vào **Deployments → … → Redeploy**. Chỉ lưu biến không cập nhật JavaScript đã build. [Tài liệu Vercel](https://vercel.com/docs/environment-variables).

## 6. Nối hai nơi bằng đúng URL

1. Render → dịch vụ backend → **Environment** → sửa `ALLOWED_ORIGINS` thành đúng origin frontend, ví dụ `https://TEN-GAME.vercel.app`.
2. Không có dấu `/` cuối, đường dẫn, mã phòng hay wildcard. Nếu có nhiều origin, phân cách bằng dấu phẩy, từng origin HTTPS chính xác.
3. **Save, rebuild, and deploy** (hoặc Save rồi **Manual Deploy → Deploy latest commit**, tùy giao diện).
4. Chờ Render **Live**, thử lại phòng trên Vercel.

Trước khi bước này hoàn thành, frontend có thể hiển thị chùa nhưng vào phòng sẽ bị từ chối — đó là do origin tạm thời. Không gỡ kiểm tra origin để sửa lỗi. URL Preview mỗi lần khác nhau của Vercel sẽ không được phép nếu chưa thêm chính xác; dùng URL Production cố định để mời bạn bè.

Luồng mạng: trình duyệt tải game qua **HTTPS** từ Vercel → kết nối **WSS** tới Render → Colyseus giữ trạng thái phòng. Render xử lý TLS; không cần đưa chứng chỉ hay private key vào repo. [Render WebSockets](https://render.com/docs/websocket), [Vite trên Vercel](https://vercel.com/docs/frameworks/frontend/vite).

## 7. Tạo link gửi Zalo

1. Mở URL Vercel bằng Chrome trên máy tính. Bấm **Chơi cùng bạn bè**.
2. Nhập tên → **Tạo phòng riêng**.
3. Mở nút phòng ở góc màn hình → **Sao chép link mời**.
4. Gửi link đó qua Zalo. Link có đoạn `#room=...`, chính là mã phòng riêng.
5. Bạn bè mở link → **Chơi cùng bạn bè** → nhập tên → **Vào phòng**. Mã đã được điền sẵn.
6. Kiểm tra số người `2/20`, rồi thử đi lại, chắp tay, lễ Phật và trò chuyện.

**Gửi cùng link có mã phòng** để mọi người vào cùng chùa; nếu mỗi người tự bấm Tạo phòng, họ sẽ ở các phòng khác nhau. Ai có link/mã đều có thể vào, nên chỉ chia sẻ với nhóm bạn. Mã không phải hệ thống tài khoản hay mật khẩu. Phòng tối đa 20 người, kể cả chủ phòng. Mất mạng tạm thời có thể kết nối lại trong khoảng 20 giây; người mất mạng vẫn giữ chỗ trong thời gian đó.

Game hiện ưu tiên máy tính: WASD, kéo chuột và phím số. Điện thoại và trình duyệt bên trong Zalo chưa có điều khiển cảm ứng hoàn chỉnh. Người chơi không phải cài game, nhưng cần máy/trình duyệt hỗ trợ WebGL.

## 8. Kiểm thử trước khi mời đủ 10–20 người

- Mở URL Production bằng cửa sổ ẩn danh không đăng nhập Vercel: phải vào trang game được. Nếu bị yêu cầu đăng nhập nền tảng, kiểm tra cài đặt truy cập của deployment và chủ động chọn phạm vi phù hợp trước khi chia sẻ.
- Hai máy dùng hai mạng khác nhau vào cùng mã: thấy đúng tên, hướng đi, tư thế; thử cả 6 động tác và R.
- Hai người cùng chọn một đệm: chỉ một người được ngồi; đứng dậy/rời phòng thì người còn lại chọn được.
- Thử chuông, mõ, hương, bàn sao; kiểm tra âm thanh sau khi bấm vào trang. Sách, lật trang, chuỗi hạt và thống kê công đức là hoạt động cá nhân trong trình duyệt.
- Mở phòng khác: không thấy nhân vật/chat/hương của phòng trước.
- Tắt mạng ngắn rồi bật lại: thử nối lại, giữ chỗ; thử quá 20 giây và tạo/vào lại phòng.
- Khởi động lại Render: phòng cũ mất; tạo phòng mới và gửi link mới.
- Mời lần lượt 5, 10, rồi 20 người; theo dõi độ mượt, CPU/RAM/bandwidth trong dashboard. Thử máy yếu và nhiều góc camera. Kiểm tra trình duyệt thật và mạng Việt Nam trước khi coi là sẵn sàng cho buổi chơi.

Kiểm tra tự động trên Mac với 20 client xác nhận giao thức và sức chứa phòng; **không thay thế thử tải trên Render thật hoặc 20 máy vẽ 3D đồng thời**.

## 9. Giới hạn miễn phí và dữ liệu

Render Free phù hợp thử nghiệm: có thể ngủ sau 15 phút không có lưu lượng đến và khởi động lại mất khoảng một phút. Có giới hạn tài nguyên/giờ sử dụng; không bảo đảm vận hành production liên tục. [Tài liệu Render Free](https://render.com/docs/free).

Phòng, chỗ ngồi, tin nhắn và hương chung chỉ ở RAM của **một** máy chủ. Restart/redeploy/ngủ sẽ mất phòng. Chưa có database hoặc phục hồi phòng qua server mới. Không tăng số instance: nếu cần mở rộng sau này phải thêm kiến trúc dùng chung trước.

Chuỗi hạt, đếm mõ, trang sách và công đức cá nhân dùng bộ nhớ trình duyệt. Công đức/mệnh giá tiền chỉ là mô phỏng, không thu tiền thật. Chưa có đăng nhập xác minh danh tính, voice chat hay hệ thống quản trị. Người có mã phòng có thể vào; không đăng mã ở nơi công cộng.

## 10. Gặp lỗi thì xem gì?

| Hiện tượng | Kiểm tra |
| --- | --- |
| Không vào được `127.0.0.1` | Đó chỉ là Mac của bạn. Chạy launcher, dùng URL đúng cổng; bạn bè dùng Vercel |
| Render build báo thiếu file shared/navigation | Root Directory phải trống, Build Command đúng bảng |
| Vercel build báo thiếu URL | Thêm `VITE_MULTIPLAYER_URL` Production, bắt đầu bằng `wss://`, rồi Redeploy |
| Thấy game nhưng không vào phòng | Render Live? `/health`? WSS đúng tên dịch vụ? `ALLOWED_ORIGINS` đúng Vercel origin? |
| Vào bằng link Preview bị từ chối | Dùng URL Production đã cho phép |
| Mã phòng không tồn tại | Server restart hoặc phòng hết người; tạo phòng/link mới |
| Phòng đầy | Giới hạn 20, chờ người rời hoặc hết thời gian reconnect |
| Không nghe mõ/chuông | Bấm vào trang trước, bật âm thanh tab/hệ điều hành |

Đọc log ở Render **Logs** và Vercel **Deployments → Build Logs**. Không gửi mật khẩu/token hay nội dung `.env` nếu nhờ người khác hỗ trợ.
