# 👥 Hướng dẫn Share & Làm việc Nhóm

## 🎯 Cách hoạt động

Ứng dụng cho phép **1 owner tạo spreadsheet** và **share với team** để cùng quản lý chi phí.

---

## 📋 Quy trình Share (3 bước đơn giản)

### **Bước 1: Owner tạo Spreadsheet**

1. **Truy cập app**: https://truongpt1093.github.io/go-travel/
2. **Đăng nhập** với Google Account
3. **Tạo spreadsheet mới** hoặc chọn có sẵn
4. **Thêm thành viên** và **chi phí** ban đầu

### **Bước 2: Owner Share với Team**

#### A. Share App Link

1. Vào tab **"Cài đặt"** (Settings)
2. Tìm section **"Chia sẻ với Team"** (màu xanh)
3. Click nút **"Copy Link"**
4. Gửi link cho team members qua:
   - Email
   - Slack/Discord
   - WhatsApp/Telegram
   - Bất kỳ app chat nào

Link sẽ có dạng:
```
https://truongpt1093.github.io/go-travel/?sheet=SPREADSHEET_ID
```

#### B. Share Google Sheets (Quan trọng!)

Để team có thể **CHỈNH SỬA** được data:

1. **Mở Google Sheets**:
   - Click link "Google Sheets" trong Settings
   - Hoặc truy cập: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit

2. **Click nút "Share"** (góc trên bên phải)

3. **Chọn 1 trong 2 cách:**

   **Cách A: Share với email cụ thể** (An toàn hơn)
   - Nhập email của team members
   - Chọn quyền: **Editor** (có thể chỉnh sửa)
   - Click **Send**

   **Cách B: Share public** (Dễ hơn)
   - Click **"Change to anyone with the link"**
   - Chọn: **Editor**
   - Click **Done**

### **Bước 3: Team Members Join**

1. **Click vào link** mà owner gửi
2. **Đăng nhập** với Google Account của mình
3. **App tự động kết nối** vào spreadsheet của owner
4. Bắt đầu thêm/sửa chi phí!

---

## ✅ Checklist cho Owner

- [ ] Tạo spreadsheet và thêm data ban đầu
- [ ] Copy share link từ Settings
- [ ] Share Google Sheets với team (Editor permission)
- [ ] Gửi link cho team members
- [ ] Test: Yêu cầu 1 member thử truy cập và thêm chi phí

---

## ✅ Checklist cho Team Members

- [ ] Nhận link từ owner
- [ ] Click vào link
- [ ] Đăng nhập với Google Account
- [ ] Nhập OAuth Client ID (chỉ lần đầu)
- [ ] App tự động load spreadsheet của owner
- [ ] Bắt đầu sử dụng!

---

## 🔐 Quyền hạn & Bảo mật

### **Owner (Người tạo spreadsheet)**
✅ Tạo và quản lý spreadsheet
✅ Share với team
✅ Có thể thu hồi quyền truy cập
✅ Xem lịch sử thay đổi (Version history trong Google Sheets)

### **Team Members (Được share)**
✅ Xem tất cả data
✅ Thêm/sửa/xóa members
✅ Thêm/sửa/xóa expenses
✅ Xem thống kê
⚠️ Không thể xóa spreadsheet (chỉ owner có quyền)

### **Bảo mật**
- ✅ OAuth được quản lý bởi Google (an toàn)
- ✅ Mỗi user đăng nhập với account riêng
- ✅ Data lưu trên Google Sheets (có backup tự động)
- ✅ Owner có thể thu hồi quyền bất kỳ lúc nào

---

## 💡 Use Cases

### **Case 1: Du lịch nhóm bạn**
```
👤 Owner: Người tổ chức
👥 Members: Bạn bè đi cùng
📊 Mục đích: Track chi phí, tính toán chia tiền
```

### **Case 2: Ký túc xá/Phòng trọ**
```
👤 Owner: Trưởng phòng
👥 Members: Bạn cùng phòng
📊 Mục đích: Chia tiền điện nước, ăn uống chung
```

### **Case 3: Team Building công ty**
```
👤 Owner: HR hoặc Team Lead
👥 Members: Nhân viên trong team
📊 Mục đích: Quản lý budget, báo cáo chi phí
```

### **Case 4: Dự án nhóm**
```
👤 Owner: Project Manager
👥 Members: Team members
📊 Mục đích: Track chi phí dự án, settlement
```

---

## 🎯 Workflow điển hình

```
DAY 1 - Setup
┌─────────────────────────────────────────────┐
│ 1. Owner tạo spreadsheet                    │
│ 2. Owner share link + Google Sheets         │
│ 3. Team members join                        │
│ 4. Owner thêm danh sách members             │
└─────────────────────────────────────────────┘

DURING TRIP - Daily tracking
┌─────────────────────────────────────────────┐
│ 1. Ai chi tiền → Mở app → Thêm expense      │
│ 2. Fill: Tên, số tiền, người chia           │
│ 3. Data sync real-time → Mọi người thấy    │
│ 4. Check dashboard để xem tổng chi phí     │
└─────────────────────────────────────────────┘

AFTER TRIP - Settlement
┌─────────────────────────────────────────────┐
│ 1. Vào tab "Thanh toán"                    │
│ 2. Xem ai nợ ai bao nhiêu                  │
│ 3. Follow gợi ý thanh toán                 │
│ 4. Done! 🎉                                │
└─────────────────────────────────────────────┘
```

---

## ❓ FAQ

### **Q: Team member có cần tạo OAuth Client ID không?**
A: Có, mỗi user cần nhập OAuth Client ID của riêng mình lần đầu tiên. Hoặc owner có thể share 1 Client ID chung cho cả team.

### **Q: Nếu 2 người cùng sửa 1 expense thì sao?**
A: Google Sheets sẽ tự động resolve conflicts. Last write wins.

### **Q: Có giới hạn số lượng members không?**
A: Không giới hạn! Nhưng để UX tốt, nên dùng cho nhóm 3-20 người.

### **Q: Có thể làm việc offline không?**
A: Chưa. Cần internet để sync với Google Sheets. Feature offline sẽ có trong tương lai.

### **Q: Làm sao biết ai thêm expense nào?**
A: Xem trong Google Sheets: File → Version history → See version history

### **Q: Có thể thu hồi quyền truy cập không?**
A: Có! Owner vào Google Sheets → Share → Remove email hoặc change permission.

### **Q: Data có bị mất không?**
A: Không! Data lưu trên Google Sheets với backup tự động của Google.

### **Q: Có thể export data không?**
A: Có! Vào Google Sheets → File → Download as (CSV, Excel, PDF...)

---

## 🚨 Troubleshooting

### **Member không thấy data của owner**

**Nguyên nhân**: Chưa được share Google Sheets
**Giải pháp**:
1. Owner check lại sharing settings trong Google Sheets
2. Đảm bảo permission là "Editor", không phải "Viewer"
3. Member thử refresh app

### **Member không load được spreadsheet**

**Nguyên nhân**: Link không có spreadsheet ID hoặc bị sai
**Giải pháp**:
1. Owner copy lại share link từ Settings
2. Đảm bảo link có format: `?sheet=SPREADSHEET_ID`
3. Member clear localStorage và click link lại

### **"Access Denied" khi mở app**

**Nguyên nhân**: Chưa đăng nhập hoặc không có quyền truy cập
**Giải pháp**:
1. Đăng nhập với Google Account
2. Yêu cầu owner share Google Sheets với email của bạn
3. Thử lại

---

## 💪 Best Practices

### ✅ DO
- Share link ngay khi tạo spreadsheet
- Thêm description rõ ràng cho mỗi expense
- Check tab Thanh toán thường xuyên
- Backup spreadsheet ID (save link share)
- Dùng categories để dễ filter

### ❌ DON'T
- Xóa spreadsheet khi đang có người dùng
- Share spreadsheet với "Anyone can edit" nếu không cần thiết
- Quên nhập description cho expense
- Delete members đang có balance chưa thanh toán

---

## 📞 Support

Có vấn đề? Hãy:
1. Đọc lại hướng dẫn này
2. Check FAQ bên trên
3. Xem DEPLOYMENT.md để hiểu thêm về cấu hình
4. Open issue trên GitHub

---

**Happy collaborating! 🎉**

_Generated by Travel Expense Manager - Built with ❤️_
