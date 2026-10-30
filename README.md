# Chùa An Lạc — first playable prototype

A fictional, stylized Southern Vietnamese Buddhist temple, made with Three.js, TypeScript and Vite. All models are procedural geometry, with the worship hall decorated to match the supplied reference image. This is a local single-player prototype; no multiplayer server is included.

## Open the game (Mac)

Double-click **Start Temple.command** in this folder. Keep the Terminal window open while playing. It starts the local server and opens your browser. If macOS prevents launching the file, open Terminal and run:

```sh
cd "/Users/khiem/Downloads/ChatGPT/Vietnamese-Temple-3D"
PATH="$PWD/.runtime/bin:$PATH" npm run dev -- --open
```

A project-local official Node.js 22 runtime is included in `.runtime` for this Mac (Apple Silicon). It is ignored by Git. On another machine, install Node.js 22.12+ and run `npm install`, then `npm run dev`. The game URL is printed in Terminal, normally http://127.0.0.1:5173. Do not double-click index.html: it needs the server. Press Control+C in Terminal to stop the server.

## Controls

- WASD: camera-relative walking
- Hold the left mouse button and drag: orbit camera
- Mouse wheel: zoom
- E: interact with the nearest altar, mat, statue garden, Bodhi tree or bell
- 1: join palms and hold
- 2: kneel in prayer and hold
- 3: one full prostration, finishing in kneeling prayer
- 4: seated meditation and hold
- 5: standing bow, returning to standing
- 6: three prostrations, finishing in kneeling prayer
- R: return to standing and restore walking
- On-screen action buttons also work
- Return to courtyard button: recover your starting position

Movement is locked during worship and while returning to standing. Actions can replace one another with a blended transition. Bowing requires clear space in front of the visitor. Walls, columns, statues, the pond and larger courtyard objects block walking. The camera shortens its orbit against scenery. Character bounds are lifted to the ground or mat surface during poses to prevent floor penetration.

## A first visit

1. Click Enter the temple; the current version starts inside the main hall. Press H to return here, or click the courtyard button to explore outdoors.
2. Try 1, 2, 3, 4, 5 and 6 in the open courtyard. Press R between them. Hold W during prayer to confirm walking is locked.
3. Walk toward the main hall; go around the central incense burner.
4. Walk through the open front between the wooden columns. Approach a mat and press E to sit. Press R to stand.
5. Approach the altar to kneel, or visit Quan Âm beside the lotus pond.
6. Visit the pavilion on the right and press E near the bell to hear it.
7. Drag the camera around to find the Tam Quan gate behind you.

## Developer commands

```sh
npm run dev
npm test
npm run build
npm run preview
```

`npm test` runs five regression suites covering worship actions and movement locks, practice state, rituals, navigation/seating clearance, and camera obstruction. Production output is in `dist/` after building.

## Architecture and next milestone

`src/animation.ts` contains a renderer-independent procedural pose controller. A single action state prevents competing animations. `snapshot()` exposes action, elapsed time and repetition count, ready to be extended into network messages alongside position and yaw. A multiplayer implementation will still need an authoritative server, shared clock, action validation, interpolation, room limits and avatar identities.

`src/main.ts` builds the scene, articulated visitor, interaction zones, collision and camera. `src/style.css` implements the controls overlay. Geometry is deliberately stylized: statues, lotus flowers and architecture are simplified interpretations rather than historical reproductions. Contact uses bounds clearance rather than full-body inverse kinematics, so pose fidelity and close-object clearance remain prototype-level. The optional Google font falls back to local system fonts when offline; game models and code run locally.

## Bản 02 — không gian chùa & chuỗi hạt

Nhân vật mặc áo cà sa màu đất, có các mảng vải và chuỗi hạt trên cổ tay. Chánh điện có tượng Phật Tổ mới trên đài sen, bàn thờ chạm trang trí, bình hoa và lư hương riêng. Sân có thêm tượng Bồ Tát đội mão, cầm tích trượng. Kiến trúc bổ sung cửa song gỗ, xà trần, vòng trang trí cột và lan can. Đây vẫn là mô hình thủ tục cách điệu, chưa phải đồ họa quang thực.

Hai bàn đọc kinh ở hai bên chánh điện. Đến gần đệm sau bàn, nhấn E để ngồi đọc; R để đứng dậy. Bảng đọc hiển thị các câu niệm Phật thông dụng, không phải toàn văn một bộ kinh. Nhấn T hoặc nút “Lần một hạt” để đếm thủ công. Mỗi vòng 108 hạt, hiển thị số vòng và tổng số hạt. Tiến độ tự lưu trên trình duyệt tại cùng địa chỉ máy chủ. Nút Đặt lại xóa số đếm.

## Bản 03 — trang trí theo ảnh mẫu

Chánh điện dùng sàn ván, trần và vách gỗ sẫm. Tượng Phật vàng được phóng lớn, một tay giơ lên, phía sau có hào quang và phông mandala hoa sen vẽ bằng canvas. Đệm ngồi xám xếp thành hàng, có Phật tử trang trí ngồi thiền ở hai bên; đây là nhân vật cảnh, không phải người chơi online. Nhân vật chính đầu tròn, áo xám nhạt và vạt vàng giống phong cách ảnh tham khảo. Nhấn H hoặc “Vào chánh điện” để đến lối giữa điện. Các đệm trống gần lối giữa vẫn có thể ngồi bằng E. Các bàn đọc kinh, bộ đếm và sân chùa được giữ lại. Phông nền được dựng lại theo phong cách ảnh, không sao chép giao diện TikTok hay dùng ảnh chụp làm cảnh tĩnh.

## Bản 04 — chỗ trống và thời khóa tương tác

Đã bỏ toàn bộ Phật tử trang trí và va chạm của họ. Cả 18 đệm ngồi trong điện đều trống, cộng hai đệm tại bàn sách. Multiplayer chưa được bật ở bản này.

T: mở chuỗi hạt 3D, chạm hoặc kéo xuống để lần từng hạt, cũng có thể bấm Space/T. Chuỗi có 108 hạt; tự lưu số hạt và số vòng. Có chế độ theo nhịp, tối đa một hạt mỗi 0,9 giây.

M: mở mõ, nhấn Space/M hoặc bấm vào mô hình để gõ. Mõ có thanh gõ chuyển động và âm tổng hợp bằng Web Audio; có nhịp tự động 30–120 tiếng/phút, dừng khi đóng bảng, đổi mục hoặc mất focus. Mõ trong điện ở cạnh bàn thờ cũng tương tác bằng E.

K: mở sách tụng niệm 10 trang. Nút trước/sau hoặc phím mũi tên lật trang, có chuyển động và lưu trang. Đây là sổ thực hành gồm các câu niệm Phật truyền thống và lời hướng dẫn tự biên soạn, không phải toàn văn một bộ kinh. E tại bàn sách cũng mở sách và đưa nhân vật vào đệm sau bàn.

Esc hoặc R: đóng thời khóa và đứng dậy. Khi mở thời khóa, nhân vật ngồi yên, không đi lại. Tiến độ lưu cục bộ trong trình duyệt, chưa đồng bộ lên máy chủ.

## Ban 05 - cong duc, xin xam, huong va cung sao

Nhan N hoac nut Nghi le & cong duc de mo bang. Den gan cac vat the va nhan E cung mo dung hoat dong. Thung cong duc o ben phai truoc chanh dien (x=7.7,z=-6), ban xin xam ben trai (x=-7.7,z=-6), ban cung sao ngoai san phia dong (x=13,z=-11). Cac dem ngoi van trong.

Cong duc dung phieu tien mo phong cac menh gia VND tu 100 den 500.000 dong; khong thanh toan that va khong co vi/ngan hang. Tong so tien mo phong va so lan duoc luu cuc bo. Xin xam lac ong va rut ngau nhien mot trong 32 the loi nhac tu bien soan, khong phai du doan tuong lai. Huong co lua chuyen dong va duoc them vao lu huong 3D sau moi lan dang. Ban cung sao co hoa, trai cay, bai vi Cau An va chin den trang tri duoc thap lan luot; khong tinh sao han. Cac nghiep vu hoan tat sau hoat anh, chi cho phep mot tac vu dang chay; trang thai luu tai trinh duyet hien tai.

## Milestone 1 stability checkpoint

See [MILESTONE_1_AUDIT.md](MILESTONE_1_AUDIT.md) for fixes, production-browser verification, and remaining manual checks. The local tag `milestone-1-stable` identifies the audited version. No multiplayer or remote deployment is included.
