# Ma Sói - Board Game

Ứng dụng chia vai Ma Sói trực tuyến, tối ưu cho mobile. Trưởng phòng điều hành game và ghi chú từng ván.

## Tính năng

- Trưởng phòng tạo phòng với mã 6 ký tự
- Tham gia bằng mã phòng hoặc quét QR
- 20 loại nhân vật, chọn số lượng tùy ý (có thể trùng)
- Chia vai ngẫu nhiên cho người chơi (trừ trưởng phòng)
- Bảng ghi chú theo ván cho trưởng phòng
- Real-time qua Socket.IO

## Cài đặt

```bash
cd ma-soi
npm install
npm run dev
```

Mở http://localhost:3000 trên điện thoại (cùng mạng WiFi).

## Cách chơi

1. Trưởng nhóm tạo phòng → chia sẻ mã hoặc QR
2. Mọi người quét QR / nhập mã để vào
3. Trưởng phòng cấu hình số lượng nhân vật và nhấn **Bắt đầu chơi**
4. Mỗi người chơi xem vai trò riêng trên điện thoại
5. Trưởng phòng ghi chú kết quả từng ván, nhấn **Thêm ván** khi sang ván mới

## Tech Stack

- Next.js 15 + TypeScript
- Tailwind CSS 4
- Socket.IO
- html5-qrcode + qrcode.react
