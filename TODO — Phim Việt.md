# TODO — Phim Việt

## Hoàn thành — App xem phim dùng API Nguồn C
- Tạo app xem phim bằng Expo/React Native/TypeScript.
- Dùng API `phim.nguonc.com` để lấy danh sách, tìm kiếm, dữ liệu chi tiết và tập phim khi API cung cấp.
- Chỉ mở liên kết player HTTPS khớp với phim/tập/server do endpoint chi tiết API trả về; không nhận host từ route hoặc dữ liệu AsyncStorage. Nếu thiếu API base thì báo cấu hình, nếu API/player lỗi thì có trạng thái và nút thử lại; không giả lập dữ liệu thật.

## Hoàn thành — Tìm kiếm phim
- Có chức năng tìm kiếm phim theo yêu cầu người dùng.
- Hiển thị kết quả và trạng thái không có kết quả/lỗi tải rõ ràng.

## Hoàn thành — Hiển thị phim đang xem dở
- Hiển thị danh sách phim/tập người dùng vừa mở.
- Lưu phim, tập và thời điểm mở gần nhất trên thiết bị (không lưu URL player); khi mở lại, tải chi tiết API và phát đúng tập nếu endpoint còn cung cấp.
- API hiện trả liên kết nhúng nhưng không cung cấp vị trí phát; không hiển thị timestamp hoặc phần trăm tiến độ giả.

## Hoàn thành — Android 7
- Ứng dụng hỗ trợ Android 7 (API 24); giữ cấu hình `minSdkVersion: 24` và ABI `armeabi-v7a` của starter.

## Đang thực hiện — Đăng nhập tài khoản cá nhân
- Dùng Manus OAuth mặc định của starter khi người dùng chọn đăng nhập; không tạo hệ thống username/password riêng và không hiển thị user giả.
- Người dùng thấy trạng thái đã đăng xuất/đang xử lý/thành công/lỗi, có thể đăng nhập và đăng xuất; token native được giữ trong SecureStore.
- OAuth callback ràng buộc state/nonce một lần, xác nhận redirect về callback cố định, và session web HTTPS dùng cookie tương thích Preview.

## Đang thực hiện — Đồng bộ lịch sử xem theo tài khoản
- Mỗi bản ghi lưu phim, tập, server và thời điểm mở gần nhất; không lưu URL player hoặc timestamp vị trí phát.
- Bản ghi server gắn với user đang xác thực; `userId` lấy từ session server, không nhận từ client; người dùng khác không thể đọc, thêm, xóa hoặc cập nhật lịch sử của nhau.
- Lịch sử guest và lịch sử của từng tài khoản được tách riêng trên thiết bị. Chỉ gộp lịch sử guest vào tài khoản sau thao tác xác nhận rõ ràng; xóa guest chỉ sau khi đồng bộ thành công.
- Khi user đã đăng nhập, lần mở tập mới được ghi cục bộ theo account và đồng bộ server; khi mất kết nối hoặc `auth.me` lỗi mạng, bản local vẫn thuộc account đã lưu an toàn, không rơi nhầm vào guest, và có thể đồng bộ lại.
- Màn Đang xem hiển thị dữ liệu của tài khoản hiện tại cộng lịch sử local phù hợp; logout hoặc đổi tài khoản không lộ lịch sử scope khác.

## Đang thực hiện — Giao diện light/dark
- Có thao tác chuyển Dark/Light Mode dễ tìm; lựa chọn được lưu trên thiết bị và phục hồi khi mở lại app.
- Palette được áp dụng nhất quán cho màn Khám phá, Tìm kiếm, Đang xem, Tài khoản, Chi tiết, Player, tab bar, status bar và trạng thái loading/lỗi/rỗng.
- Giữ identity điện ảnh Phim Việt, tương phản chữ/nút rõ trên cả nền tối lẫn nền sáng và bố cục phù hợp thiết bị nhỏ, thao tác một tay.

## Đang thực hiện — Tối ưu hóa giao diện
- Rà soát phân cấp tiêu đề, khoảng cách, vùng chạm, trạng thái tải/lỗi/rỗng, khả năng đọc và bố cục dọc trên các screen chính.
- Giữ tương tác nhẹ cho thiết bị Android 7/API 24; không thêm hiệu ứng nền hoặc dependency nặng không cần thiết.

## Đang thực hiện — Android TV/Google TV/Android Box (APK)
- Dùng nhánh React Native TV tương thích Expo SDK 57 và plugin TV chính thức; vẫn giữ profile Android phone riêng từ cùng source.
- Profile TV bật `EXPO_TV=1`, khai báo Leanback launcher, touchscreen không bắt buộc, banner launcher và bố cục ngang phù hợp TV.
- Điều hướng D-pad hoạt động với trạng thái focus nhìn thấy rõ cho tab, poster phim, nút chính, danh sách tập và thao tác tài khoản.

## Đang thực hiện — Coolita OS (Web App riêng)
- Hỗ trợ Coolita bằng Web App ngang chạy trên browser của TV; APK Android không được xem là tương thích/cài trực tiếp lên Coolita OS.
- Remote điều hướng bằng các phím mũi tên tới thành phần tương tác có focus rõ; Enter/OK kích hoạt mục đang focus.
- Có thể export static Web App với `EXPO_TV=1`; backend API HTTPS ổn định hiện sẵn sàng tại `https://phimviet-qkvwoqr7.manus.space`; chưa publish giao diện web.
- Đã kiểm tra điều hướng mũi tên và Enter trong public Preview; chưa thử trên TV Coolita vật lý nên vẫn cần QA thiết bị thực tế.
- Không tuyên bố app đã nằm trong Coolita launcher/store nếu chưa có luồng đối tác, QA và duyệt chính thức.

## Hoàn tất — Tách profile APK Android TV
- `preview_tv` trong `eas.json` là profile độc lập, không kế thừa cấu hình phone; khai báo rõ `distribution: internal`, `channel: preview-tv`, Android `buildType: "apk"`, `EXPO_TV=1` và `EXPO_PUBLIC_API_BASE_URL=https://phimviet-qkvwoqr7.manus.space`.
- `preview` phone vẫn là APK nội bộ với cùng API URL. Expo config đã xác minh phone portrait, TV landscape, Android package, API URL và EAS project ID đúng; TypeScript, lint và 31 unit tests đều đạt.
- Thay đổi đã được push lên canonical `main` tại commit `2175b07`. Trước khi build, xác minh Version History ghi nhận commit này cùng `extra.eas.projectId`; các mốc trước đó: API `203d25d`, API URL `884c86a`, EAS project ID `79cac4c`.

## Đang chờ — Build APK phone và Android TV
- Dashboard **Build APK** trước đây trả thông báo chung “The build failed. Please try again.” hai lần, không có log. Trang Expo Builds đang trống, không có build job và phiên kiểm tra không thấy luồng tạo build trực tiếp cho named profile `preview_tv`; chưa tạo APK mới.
- Bước tiếp theo: từ môi trường EAS đã xác thực ngoài Sandbox, chạy `eas build --platform android --profile preview_tv` để build Android TV; chạy riêng `eas build --platform android --profile preview` cho phone. Chỉ dùng Dashboard nếu luồng đó cho phép chọn đúng named profile.
- Không chạy EAS/Gradle release build trong Sandbox. Chỉ đánh dấu build hoàn tất và cung cấp APK sau khi cả hai build thành công và có artifact tải được.
