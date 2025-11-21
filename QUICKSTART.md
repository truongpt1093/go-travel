# 🚀 Quick Start - Share với Team trong 5 phút

## 🎯 Mục tiêu

Sau 5 phút, bạn sẽ:
✅ Deploy app lên GitHub Pages
✅ Tạo spreadsheet
✅ Share với team members
✅ Cùng quản lý chi phí

---

## 📦 Bước 1: Deploy App (2 phút)

### Enable GitHub Pages

1. Vào: https://github.com/truongpt1093/go-travel/settings/pages
2. **Source**: Chọn **"GitHub Actions"**
3. **Save**
4. Đợi 2-3 phút → Check tab **Actions**

✅ **App live tại**: https://truongpt1093.github.io/go-travel/

---

## 🔑 Bước 2: Setup Google OAuth (2 phút)

### Tạo OAuth Client ID

1. Vào: https://console.cloud.google.com/apis/credentials
2. **Create Credentials** → **OAuth 2.0 Client ID**
3. **Application type**: Web application
4. **Authorized JavaScript origins**:
   ```
   https://truongpt1093.github.io
   ```
5. **Create** → Copy **Client ID**

---

## 🌟 Bước 3: Tạo Spreadsheet (1 phút)

1. Mở app: https://truongpt1093.github.io/go-travel/
2. Nhập **Client ID** → **Kết nối Google Sheets**
3. Đăng nhập Google
4. **Tạo spreadsheet mới**: "Du lịch Đà Lạt 2025"
5. Thêm members: Bạn, An, Bình, Cường
6. Thêm expense đầu tiên để test

---

## 👥 Bước 4: Share với Team (1 phút)

### A. Share App Link

1. Vào tab **"Cài đặt"** (Settings)
2. Tìm section **"Chia sẻ với Team"** (màu xanh)
3. Click **"Copy Link"**
4. Gửi link qua WhatsApp/Telegram/Email cho team

### B. Share Google Sheets

1. Click link **"Google Sheets"** trong Settings
2. Hoặc: https://docs.google.com/spreadsheets/d/SHEET_ID/edit
3. Click **"Share"** (góc trên phải)
4. **Chọn 1 trong 2:**

   **Cách 1: Share với email** (Khuyên dùng)
   ```
   Email: friend@gmail.com
   Permission: Editor
   → Send
   ```

   **Cách 2: Share public** (Nhanh hơn)
   ```
   "Anyone with the link" → Editor → Done
   ```

---

## ✅ Bước 5: Team Join & Test

### Team Members:

1. Click vào link mà owner gửi
2. Đăng nhập Google
3. Nhập OAuth Client ID (có thể dùng chung với owner)
4. **App tự động kết nối** vào spreadsheet của owner
5. Test: Thêm 1 expense mới

### Check:

- ✅ Owner refresh → Thấy expense của member
- ✅ Member refresh → Thấy expense của owner
- ✅ Real-time sync hoạt động!

---

## 🎉 DONE! Giờ có thể dùng

### Workflow hàng ngày:

```
Ai chi tiền → Mở app → Thêm expense
                ↓
        Data sync real-time
                ↓
        Mọi người thấy ngay
```

### Cuối chuyến:

```
Vào tab "Thanh toán"
        ↓
Xem ai nợ ai bao nhiêu
        ↓
Follow gợi ý thanh toán
        ↓
Done! 🎊
```

---

## 📊 Demo Flow

### Scenario: Du lịch Đà Lạt 4 người

**Members**: An (owner), Bình, Cường, Dũng

**Day 1**:
- An đặt khách sạn: 800k → Chia 4 người
- Bình mua vé tham quan: 300k → Chia 4 người
- Cường mua đồ ăn sáng: 200k → Chia 4 người

**Day 2**:
- An thuê xe: 500k → Chia 4 người
- Dũng mua đồ ăn trưa: 400k → Chia 4 người
- Bình mua cafe: 150k → Chia 4 người

**Cuối chuyến** → Tab "Thanh toán":
```
An: +250k (được nợ)
Bình: -50k (đang nợ)
Cường: -100k (đang nợ)
Dũng: -100k (đang nợ)

Gợi ý:
→ Bình chuyển An: 50k
→ Cường chuyển An: 100k
→ Dũng chuyển An: 100k
```

---

## 💡 Tips

### Owner:
- ✅ Share link ngay sau khi tạo spreadsheet
- ✅ Thêm sample expense để members biết cách dùng
- ✅ Check tab "Thanh toán" thường xuyên
- ✅ Backup spreadsheet ID (save link share)

### Members:
- ✅ Test thêm 1 expense ngay khi join
- ✅ Dùng categories để dễ filter
- ✅ Thêm note chi tiết cho mỗi expense
- ✅ Refresh thường xuyên để thấy data mới

---

## 🚨 Troubleshooting

### "Không thấy data của owner"
→ Owner chưa share Google Sheets, check lại Bước 4B

### "Access Denied"
→ Chưa được share Google Sheets với quyền Editor

### "Link không hoạt động"
→ Copy lại link từ Settings, đảm bảo có `?sheet=`

### "Không copy được link"
→ Click vào input → Ctrl+C (hoặc Cmd+C trên Mac)

---

## 📚 Tài liệu thêm

- **Chi tiết hơn**: [COLLABORATION.md](./COLLABORATION.md)
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Full docs**: [README.md](./README.md)

---

## 🎯 Checklist Hoàn Thành

Owner:
- [ ] App deployed lên GitHub Pages
- [ ] Tạo OAuth Client ID
- [ ] Tạo spreadsheet và thêm data
- [ ] Copy share link
- [ ] Share Google Sheets với Editor permission
- [ ] Gửi link cho team

Members:
- [ ] Nhận link từ owner
- [ ] Click link và đăng nhập
- [ ] App tự động load spreadsheet
- [ ] Test thêm expense
- [ ] Confirm owner thấy được

---

**Chúc bạn dùng vui vẻ! 🎉**

_Travel Expense Manager - Built with ❤️ by Claude_
