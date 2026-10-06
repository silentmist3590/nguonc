# Kế hoạch triển khai — Phim Việt

## Phạm vi

Tiếp tục ứng dụng Expo Router / React Native đã xây, dùng API `phim.nguonc.com`, tương thích Android 7 (API 24) và giữ nguyên identity app. Bổ sung tài khoản cá nhân qua **Manus OAuth mặc định**, đồng bộ lịch sử xem theo tài khoản, chuyển đổi Dark/Light Mode, tối ưu giao diện và cấu hình APK cho điện thoại cùng Android TV/Google TV/Android Box. Theo lựa chọn của người dùng, Coolita OS được hỗ trợ bằng một Web App TV riêng; APK Android không cài trực tiếp lên Coolita. Tích hợp chính thức vào launcher/store Coolita chưa được xác minh và không được xem là đã phát hành.

Lịch sử chỉ có phim, tập, server và thời điểm mở gần nhất; nguồn embed không cung cấp timestamp phát. Không dựng phần trăm giả hoặc lưu URL player. Guest history được giữ cục bộ; chỉ gộp lên tài khoản sau thao tác xác nhận rõ ràng trong màn Tài khoản. Mọi truy vấn/ghi lịch sử từ server bắt buộc có session hợp lệ và lấy owner từ `ctx.user`, không nhận `userId` từ client.

## Thiết kế

- **Design Movement:** cinematic editorial noir — cảm giác rạp phim đêm, pha poster điện ảnh biên tập hiện đại.
- **Core Principles:** hình ảnh phim dẫn dắt; thao tác một tay; tương phản và chữ dễ đọc; metadata gọn, không cạnh tranh với nút xem.
- **Color Philosophy:** Dark giữ nền mực xanh đen `#090B12`, hổ phách `#F2B95F` và đỏ mận tiết chế. Light dùng giấy ngà ấm, mực than và cùng sắc hổ phách làm dấu hiệu thương hiệu; đổi palette đồng bộ toàn màn, không chỉ đổi nền.
- **Layout Paradigm:** feed editorial dọc trên điện thoại với hero phim và hàng poster cuộn ngang; trên TV dùng bố cục 16:9 ngang, cỡ chữ lớn, hàng phim điều hướng bằng D-pad và tab điều hướng dễ focus.
- **Signature Elements:** dấu play trong khung vé; huy hiệu “ĐANG XEM” viền hổ phách; poster bo vừa phải với viền sáng mảnh khi được chọn.
- **Interaction Philosophy:** một chạm mở chi tiết/phát trên mobile; D-pad điều hướng/focus có vòng viền vàng rõ trên TV; trạng thái đồng bộ minh bạch; guest history chỉ được gộp sau thao tác rõ ràng; đổi theme giữ ngữ cảnh màn hình.
- **Animation:** chuyển trạng thái ngắn 140–190 ms, easing nhẹ; trên TV ưu tiên phản hồi focus tức thời; skeleton khi tải; tránh chuyển động nền liên tục hoặc hiệu ứng nặng trên Android 7/TV cấu hình thấp.
- **Typography System:** sans-serif hệ thống (Roboto trên Android) cho giao diện; serif hệ thống chỉ dùng tiết chế cho tiêu đề phim. Không tải font ngoài.
- **Brand Essence:** nơi người xem tìm nhanh phim và quay lại đúng tập trên thiết bị của mình; **tập trung, ấm áp, riêng tư**.
- **Brand Voice:** gần gũi, ngắn gọn, giàu sắc thái điện ảnh. Ví dụ: “Tối nay, xem gì?”; “Lịch sử của bạn, đồng bộ theo tài khoản.”
- **Wordmark & Logo:** vé xem phim tối giản kết hợp nút play và tia sáng nhỏ.
- **Signature Brand Color:** vàng hổ phách `#F2B95F`.

## Kiến trúc và cấu trúc project

Giữ starter Expo Router / React Native / TypeScript / NativeWind, Express/tRPC, Drizzle/MySQL và Manus OAuth. Để chạy TV theo hướng dẫn Expo SDK 57, dùng alias React Native sang `react-native-tvos@0.86.3-0` (bản stable đã khóa trong lockfile) và plugin TV chính thức; cùng source vẫn có build phone và build Android TV riêng. Migrations chỉ thêm bảng/lược đồ lịch sử, không xóa hoặc viết lại user data. API phim tiếp tục qua server proxy; player chỉ chấp nhận HTTPS URL khớp tập/server do endpoint chi tiết trả về.

- `app/(tabs)/account.tsx`: trạng thái đăng nhập Manus, đồng bộ hiện trạng, xác nhận gộp lịch sử guest, và đăng xuất.
- `app/(tabs)/continue.tsx`: hợp nhất lịch sử local của scope hiện tại với bản sao server của user đã xác thực.
- `app/(tabs)/index.tsx`, `search.tsx`, `movie/[slug].tsx`, `watch/[slug].tsx`: giữ hành vi xem phim, lấy palette hiện hành và ghi lịch sử vào scope phù hợp.
- `app/oauth/callback.tsx`, `constants/oauth.ts`, `server/_core/oauth.ts`: giữ OAuth Manus; state chứa redirect URI + nonce một lần, xác thực nonce ở web callback bằng cookie ngắn hạn hoặc trên native bằng SecureStore; chuyển tiếp session token qua kênh hiện có.
- `server/_core/cookies.ts`, `server/_core/sdk.ts`: dùng đúng cookie phiên ứng dụng `webdev_app_session` để tương thích Preview auto-login; public HTTPS dùng `SameSite=None; Secure` dù request nội bộ qua proxy, HTTP local dùng `SameSite=Lax`; không đặt `Domain` và không đụng cookie nền tảng `app_session_id`; xác thực HS256/expiry và khớp `appId`.
- `drizzle/schema.ts`, `server/db.ts`: bảng `watch_history` có foreign key đến user, unique identity theo user/phim/tập/server, chỉ lưu metadata tối thiểu.
- `server/history.ts` và `server/routers.ts`: procedures `list`, `sync`, `remove` dùng `protectedProcedure`; `sync` nhận một hoặc nhiều bản ghi và owner luôn lấy từ session hiện hành.
- `lib/watch-progress.ts`: AsyncStorage tách `guest` và từng account; migrate khóa local cũ vào guest; gộp/xóa guest chỉ sau khi người dùng xác nhận và sync thành công.
- `lib/theme-provider.tsx`, `constants/movie-theme.ts`, `components/screen-container.tsx`, các screen/card/player và `app/(tabs)/_layout.tsx`: lưu lựa chọn light/dark cục bộ và áp palette nhất quán.
- `components/tv-focusable.tsx`, `components/tv-focusable.web.tsx` và screen/cards: cung cấp focus ring rõ, kích thước 10-foot và điều hướng remote D-pad cho Android TV lẫn browser Web App của Coolita.
- `app.config.ts`: giữ slug/scheme/package, Android API 24 và ABI `armeabi-v7a`/`arm64-v8a`; cho phép UI điều khiển light/dark.
- `plugins/with-tv-banner.ts` và `assets/images/android-tv-banner.png`: thêm banner launcher Android TV xhdpi; Expo TV plugin khai báo Leanback/không bắt buộc touchscreen trong profile TV.
- `eas.json`: profile phone `preview` và profile Android TV `preview_tv` độc lập, không kế thừa cấu hình phone; cả hai khai báo tường minh `distribution: "internal"`, Android `buildType: "apk"` và `EXPO_PUBLIC_API_BASE_URL` ổn định. Profile TV có `channel: "preview-tv"` và `EXPO_TV=1` để tạo APK landscape/Leanback riêng. Việc tách profile đã hoàn tất và được push lên canonical `main` tại commit `2175b07`; bước tiếp theo là build theo profile trong luồng EAS đã xác thực, không chạy EAS/Gradle release build trong Sandbox.
- `package.json` script `build:coolita-web`: xuất web tĩnh ngang với `EXPO_TV=1`; đây là Web App/URL riêng, không phải APK và chưa phải gói launcher/store Coolita.
- `Dockerfile`: image production chỉ chạy Express/tRPC API, bind `PORT` (mặc định 3000), health endpoint `/api/health`; không build hoặc serve giao diện Expo.

## Nền tảng và dữ liệu

Manus OAuth là phương thức đăng nhập mặc định; không tạo username/password riêng hoặc user giả. Web dùng cookie phiên ứng dụng, native giữ bearer token trong SecureStore. Lịch sử guest và account không trộn ngầm; các thao tác xóa/đồng bộ chỉ tác động scope đang hiển thị. Backend không chấp nhận `userId` từ payload. Không có playback timestamp từ nhà cung cấp nên đồng bộ phim/tập/thời điểm mở gần nhất mà thôi.

Backend API-only đã deploy thành công từ checkpoint `203d25d` tại `https://phimviet-qkvwoqr7.manus.space`; GET `/api/health` trả HTTP 200. Không publish giao diện Expo; auto-publish vẫn tắt. EAS project `Phim Việt` (slug `phimviet`, project ID `33223683-8e23-46d9-8c8e-997f87f2f08a`) đã được liên kết trong `app.config.ts` dưới `extra.eas.projectId`; stable API URL đã được thêm vào hai profile tại checkpoint `884c86a`. Profile TV standalone được push lên canonical `main` ở commit `2175b07`; cần xác minh Version History ghi nhận commit này trước build. Trang Expo Builds đã được kiểm tra nhưng chưa có build job hoặc luồng tạo build chọn `preview_tv`; Dashboard Build APK trước đó thất bại chung hai lần mà không có log. Build kế tiếp: chạy `eas build --platform android --profile preview_tv` trong môi trường EAS đã xác thực ngoài Sandbox; build phone riêng bằng `--profile preview`. Chưa có APK mới. Coolita tiếp tục là Web App/export riêng và chưa được thử trên TV vật lý.

## Tài liệu tham chiếu nền tảng

- [Expo — Build Expo apps for TV](https://docs.expo.dev/guides/building-for-tv/) (truy cập 2026-10-03): Expo SDK 56+ dùng alias `react-native` sang nhánh `react-native-tvos` khớp RN; plugin `@react-native-tvos/config-tv` bật cho profile TV bằng `EXPO_TV=1`; EAS profiles có thể tách phone và TV. Lockfile hiện resolve alias stable tới `0.86.3-0`.
- [Expo — Configure EAS Build with eas.json](https://docs.expo.dev/build/eas-json/) (truy cập 2026-10-06): tên profile tùy chỉnh được phép và chọn bằng `--profile`; `env` được dùng khi evaluate `app.config`; `extends` là tùy chọn để chia sẻ cấu hình; APK Android khai báo qua `android.buildType: "apk"`.
- [Android Developers — Create and run a TV app](https://developer.android.com/training/tv/get-started/create): TV launcher cần `LEANBACK_LAUNCHER`, feature `android.software.leanback` với `required=false` cho app phone+TV, touchscreen `required=false`, banner TV xhdpi 320×180 và điều hướng remote D-pad.
- [Nguồn C API — danh sách mới](https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1), [tìm kiếm](https://phim.nguonc.com/api/films/search?keyword=...&page=1), [chi tiết](https://phim.nguonc.com/api/film/{slug}): endpoint cấu trúc JSON đã được kiểm tra trực tiếp; response chi tiết trả link embed, không trả timestamp phát.
- [Coolita OS — Official](https://www.coolita.com/) (truy cập 2026-10-03): tự mô tả là Web OS chạy trên Linux; trang đã xem không công bố quy trình SDK/store.
- [Coolita Web App guide copy](https://www.scribd.com/document/816863928/WebApp-for-Coolita-TV-2023-11-23) (tài liệu bên thứ ba tải lên Scribd, 2023; thông tin phiên bản có thể cũ): mô tả web app HTML5 chạy từ remote URL, thao tác phím mũi tên/OK và luồng kiểm thử/duyệt của Coolita; dùng làm chỉ dẫn provisional, không phải xác nhận đăng ký store hiện hành.
