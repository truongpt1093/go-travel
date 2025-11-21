# 🚀 Hướng dẫn Deploy lên GitHub Pages

## 📋 Yêu cầu trước khi deploy

- [x] Code đã được push lên GitHub repository
- [ ] Đã cấu hình Google OAuth 2.0 Client ID
- [ ] Đã enable GitHub Pages trong repository settings

---

## 🔧 Bước 1: Enable GitHub Pages

1. Vào repository trên GitHub: `https://github.com/truongpt1093/go-travel`
2. Click **Settings** (góc trên bên phải)
3. Scroll xuống mục **Pages** (menu bên trái)
4. Tại **Source**, chọn:
   - Source: **GitHub Actions**
5. Save

## 🚀 Bước 2: Deploy (Tự động)

Sau khi push code lên branch `main`, GitHub Actions sẽ tự động:

1. Build ứng dụng
2. Deploy lên GitHub Pages
3. Ứng dụng sẽ có sẵn tại: **https://truongpt1093.github.io/go-travel/**

### Manual Deploy (Tùy chọn)

Nếu muốn deploy thủ công:

```bash
# Build ứng dụng
npm run build

# Deploy với gh-pages (cài đặt nếu chưa có)
npm install -D gh-pages
npx gh-pages -d dist
```

---

## 🔑 Bước 3: Cấu hình Google OAuth cho GitHub Pages

**QUAN TRỌNG**: Sau khi deploy, bạn cần cập nhật Google Cloud Console:

1. Truy cập [Google Cloud Console](https://console.cloud.google.com)
2. Chọn project của bạn
3. Vào **APIs & Services** → **Credentials**
4. Click vào OAuth 2.0 Client ID của bạn
5. Tại **Authorized JavaScript origins**, thêm:
   ```
   https://truongpt1093.github.io
   ```
6. Tại **Authorized redirect URIs** (nếu cần), thêm:
   ```
   https://truongpt1093.github.io/go-travel/
   ```
7. Click **Save**

⚠️ **Lưu ý**: Thay `truongpt1093` bằng username GitHub của bạn nếu khác.

---

## 📱 Bước 4: Sử dụng ứng dụng

1. Truy cập: **https://truongpt1093.github.io/go-travel/**
2. Nhập **OAuth 2.0 Client ID** (đã cấu hình ở Bước 3)
3. Click **Kết nối với Google Sheets**
4. Đăng nhập và bắt đầu sử dụng!

---

## 🔄 Cập nhật ứng dụng

Mỗi lần bạn push code mới lên branch `main`, GitHub Actions sẽ tự động:
- Build lại ứng dụng
- Deploy phiên bản mới
- Thời gian deploy: ~2-3 phút

### Kiểm tra quá trình deploy:

1. Vào repository trên GitHub
2. Click tab **Actions**
3. Xem workflow "Deploy to GitHub Pages"

---

## 🎯 URLs quan trọng

| Môi trường | URL | Mục đích |
|------------|-----|----------|
| **Production** | https://truongpt1093.github.io/go-travel/ | Ứng dụng live |
| **Development** | http://localhost:5173/ | Test local |
| **Repository** | https://github.com/truongpt1093/go-travel | Source code |

---

## 🐛 Troubleshooting

### Lỗi: 404 Page Not Found
- **Nguyên nhân**: GitHub Pages chưa được enable hoặc deploy chưa xong
- **Giải pháp**:
  1. Kiểm tra Settings → Pages đã enable chưa
  2. Đợi 2-3 phút để GitHub Actions hoàn thành
  3. Kiểm tra tab Actions xem có lỗi không

### Lỗi: OAuth redirect URI mismatch
- **Nguyên nhân**: Chưa cấu hình đúng Authorized JavaScript origins
- **Giải pháp**:
  1. Vào Google Cloud Console
  2. Thêm `https://truongpt1093.github.io` vào Authorized origins
  3. Clear browser cache và thử lại

### Lỗi: Assets không load (CSS, JS)
- **Nguyên nhân**: Base path trong vite.config.js không đúng
- **Giải pháp**:
  1. Kiểm tra `vite.config.js` có `base: '/go-travel/'`
  2. Build lại: `npm run build`
  3. Commit và push

### Lỗi: GitHub Actions failed
- **Giải pháp**:
  1. Click vào workflow failed
  2. Xem log chi tiết
  3. Thường là lỗi dependencies → chạy `npm install` local và commit package-lock.json

---

## 🔐 Security Notes

- **Client ID**: Lưu trong localStorage của browser (an toàn)
- **Access Token**: Chỉ tồn tại trong session, auto refresh
- **Data**: Tất cả lưu trên Google Sheets của user, không lưu trên server
- **HTTPS**: GitHub Pages tự động bật HTTPS

---

## 📊 Monitoring

### Kiểm tra status:
- **GitHub Pages Status**: https://www.githubstatus.com/
- **Deployment History**: Repository → Actions

### Analytics (Optional):
Thêm Google Analytics vào `index.html` nếu muốn track usage:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

---

## 🎉 Done!

Ứng dụng của bạn đã live tại: **https://truongpt1093.github.io/go-travel/**

Chia sẻ link này cho team members để cùng sử dụng! 🌍💰

---

## 💡 Nâng cao

### Custom Domain (Optional)

Nếu muốn dùng domain riêng (ví dụ: `travel.yourdomain.com`):

1. Mua domain
2. Cấu hình DNS:
   ```
   Type: CNAME
   Name: travel
   Value: truongpt1093.github.io
   ```
3. Vào Settings → Pages → Custom domain
4. Nhập domain và verify
5. Cập nhật Google OAuth với domain mới

### Environment Variables

GitHub Pages không hỗ trợ environment variables. Mọi config đều client-side:
- OAuth Client ID: User tự nhập
- Spreadsheet ID: Lưu trong localStorage

---

**Chúc bạn deploy thành công! 🚀**
