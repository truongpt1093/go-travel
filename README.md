# Travel Expense Manager 🌍💰

Ứng dụng web quản lý chi phí du lịch nhóm với Google Sheets làm database. Single-page application được xây dựng với React, Tailwind CSS, và tích hợp đầy đủ với Google Sheets API v4.

## ✨ Tính năng chính

### 🔐 Xác thực & Kết nối
- OAuth 2.0 authentication với Google
- Kết nối với Google Sheets API
- Tạo mới hoặc sử dụng spreadsheet có sẵn
- Auto-refresh data mỗi 30 giây

### 👥 Quản lý thành viên
- Thêm/sửa/xóa thành viên
- Chọn màu đại diện cho mỗi thành viên
- Validation không cho phép trùng tên
- Sync real-time với Google Sheets

### 💵 Quản lý chi phí
- Thêm khoản chi với đầy đủ thông tin:
  - Tên khoản chi
  - Số tiền
  - Người chi trả
  - Người được hưởng (multi-select)
  - Ngày chi
  - Danh mục (Ăn uống, Di chuyển, Lưu trú, Vui chơi, Khác)
  - Ghi chú
- Lọc theo người chi trả, danh mục, thời gian
- Tìm kiếm trong expenses
- Sửa/xóa khoản chi với optimistic UI updates

### 💰 Tính toán thanh toán
- Tự động tính số tiền mỗi người nợ/được nợ
- Ma trận "Ai nợ ai bao nhiêu"
- Thuật toán tối ưu hóa số giao dịch thanh toán (greedy algorithm)
- Gợi ý thanh toán cụ thể

### 📊 Biểu đồ & Thống kê
- **Pie Chart**: Chi phí theo danh mục
- **Bar Chart**: Chi phí theo từng người
- **Line Chart**: Chi phí theo thời gian
- Cards thống kê:
  - Tổng chi phí
  - Chi phí trung bình/người
  - Số giao dịch

### 🎨 Giao diện
- Dark mode toggle
- Responsive design (mobile, tablet, desktop)
- Toast notifications
- Loading states
- Beautiful gradient cards
- Smooth transitions

## 🚀 Cài đặt & Chạy

### Prerequisites

- Node.js >= 16
- npm hoặc yarn
- Google Account
- Google Cloud Project với Sheets API enabled

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd go-travel
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Setup Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com)
2. Tạo project mới hoặc chọn project có sẵn
3. Vào **APIs & Services** → **Enable APIs and Services**
4. Tìm và enable **Google Sheets API**
5. Vào **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
6. Chọn **Web application** làm Application type
7. Thêm **Authorized JavaScript origins**:
   - `http://localhost:5173` (cho development)
   - Domain của bạn (cho production)
8. Copy **Client ID** để sử dụng trong app

### Bước 4: Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

### Bước 5: Sử dụng ứng dụng

1. Nhập **OAuth 2.0 Client ID** vào form
2. Click **Kết nối với Google Sheets**
3. Đăng nhập với Google Account
4. Chọn **Tạo spreadsheet mới** hoặc **Sử dụng spreadsheet có sẵn**
5. Bắt đầu thêm thành viên và chi phí!

## 📱 Cấu trúc Google Sheets

Ứng dụng tự động tạo 1 spreadsheet với 3 sheets:

### Sheet 1: Members (Thành viên)
| ID | Name | Color | CreatedAt |
|----|------|-------|-----------|
| uuid | Tên | #hex | ISO timestamp |

### Sheet 2: Expenses (Chi phí)
| ID | Title | Amount | PaidBy | SharedWith | Date | Category | Note | CreatedAt |
|----|-------|--------|--------|------------|------|----------|------|-----------|
| uuid | Tên khoản chi | Số tiền | ID người trả | Comma-separated IDs | dd/MM/yyyy | Category | Ghi chú | ISO timestamp |

### Sheet 3: Settings (Cài đặt)
| Key | Value |
|-----|-------|
| currency | VND |
| tripName | My Trip |
| startDate | dd/MM/yyyy |

## 🛠️ Công nghệ sử dụng

- **Frontend Framework**: React 18 với Hooks
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: lucide-react
- **Charts**: recharts
- **State Management**: React Context API
- **Database**: Google Sheets API v4
- **Authentication**: Google OAuth 2.0 (Google Identity Services)

## 📦 Dependencies chính

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "lucide-react": "latest",
  "recharts": "latest",
  "tailwindcss": "latest"
}
```

## 🏗️ Cấu trúc code

```
src/
├── App.jsx                 # Main application file (2000+ lines)
│   ├── Google Sheets API   # Class để tương tác với Sheets API
│   ├── Components          # Tất cả React components
│   │   ├── SetupScreen
│   │   ├── SpreadsheetSelector
│   │   ├── MembersTab
│   │   ├── ExpensesTab
│   │   ├── SettlementTab
│   │   ├── DashboardTab
│   │   └── SettingsTab
│   ├── Context             # App context cho state management
│   ├── Utilities           # Helper functions
│   └── Algorithms          # Settlement calculation algorithm
├── index.css               # Tailwind directives
└── main.jsx                # Entry point
```

## 🔒 Security & Privacy

- OAuth Client ID được lưu trong localStorage (user tự quản lý)
- Không hardcode credentials
- Token auto refresh
- Scope tối thiểu (chỉ Google Sheets)
- Validate input trước khi ghi vào Sheets

## 🌟 Features nổi bật

### Optimistic UI Updates
- UI cập nhật ngay lập tức khi user thao tác
- Rollback nếu API call thất bại

### Real-time Sync
- Auto-refresh data mỗi 30 giây
- Manual refresh button
- Last synced time indicator

### Settlement Algorithm
- Thuật toán greedy để tối ưu hóa số giao dịch thanh toán
- Tính toán chính xác balance cho từng thành viên
- Gợi ý thanh toán thông minh

### Responsive Design
- Mobile-first approach
- Breakpoints:
  - Mobile: <640px
  - Tablet: 640-1024px
  - Desktop: >1024px

## 🎯 Use Cases

- Quản lý chi phí du lịch nhóm bạn
- Chia bill trong ký túc xá
- Quản lý chi phí team building
- Tracking expenses cho dự án nhóm
- Bất kỳ tình huống nào cần chia tiền công bằng

## 🐛 Troubleshooting

### Lỗi kết nối Google Sheets
- Kiểm tra Client ID có đúng không
- Kiểm tra Authorized JavaScript origins đã thêm đúng domain
- Thử clear localStorage và đăng nhập lại

### Lỗi không load được data
- Kiểm tra spreadsheet ID
- Kiểm tra permissions của spreadsheet
- Kiểm tra API quota limits

### Lỗi dark mode không hoạt động
- Clear localStorage
- Refresh page

## 🌐 Deploy lên Production

### GitHub Pages (Miễn phí)

Ứng dụng đã được cấu hình sẵn để deploy lên GitHub Pages:

**Live URL**: https://truongpt1093.github.io/go-travel/

#### Cách deploy:

1. **Enable GitHub Pages**:
   - Vào Settings → Pages
   - Source: chọn "GitHub Actions"

2. **Push code lên main branch**:
   ```bash
   git push origin main
   ```

3. **Đợi GitHub Actions build & deploy** (~2-3 phút)

4. **Cập nhật Google OAuth**:
   - Thêm `https://truongpt1093.github.io` vào Authorized JavaScript origins

📖 Xem chi tiết trong [DEPLOYMENT.md](./DEPLOYMENT.md)

### Các nền tảng khác

- **Vercel**: Import từ GitHub → Auto deploy
- **Netlify**: Drag & drop folder `dist` sau khi build
- **Cloudflare Pages**: Connect GitHub repo

## 📝 Roadmap

- [ ] Export data as CSV/JSON
- [ ] Import bulk expenses
- [ ] Currency converter
- [ ] Multiple trips support
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Offline mode với service workers

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👏 Acknowledgments

- Google Sheets API
- React team
- Tailwind CSS team
- lucide-react icons
- recharts library

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Được xây dựng với ❤️ bằng React, Tailwind CSS và Google Sheets API**
