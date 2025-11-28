# Ứng Dụng Ví Ethereum

Ứng dụng ví Ethereum full-stack (FastAPI + React + CLI) giúp sinh khóa, ký thông điệp và xác thực chữ ký theo chuẩn ECDSA/secp256k1. Dự án phục vụ bài lab Blockchain & Applications.

## Tính năng

- ✅ **Sinh khóa**: tạo khóa riêng/công khai hợp lệ, xuất địa chỉ checksum  
- ✅ **Ký thông điệp**: ký JSON/text theo chuẩn “Ethereum Signed Message”  
- ✅ **Xác thực chữ ký**: kiểm tra bằng địa chỉ hoặc khóa công khai  
- ✅ **CLI**: `wallet generate`, `wallet sign`, `wallet verify`  
- ✅ **REST API**: FastAPI, có CORS và Swagger UI  
- ✅ **Frontend React**: giao diện tab, hỗ trợ sao chép khóa/chữ ký  
- ✅ **Kiểm thử**: script `test_wallet.py` xác thực toàn bộ flow  

## Cấu trúc

```
eth-wallet-cli/
├── backend/
│   ├── app.py            # FastAPI + endpoint
│   ├── wallet_core.py    # Lõi sinh khóa/ký/xác thực
│   └── requirements.txt
├── cli/
│   └── wallet_cli.py     # Công cụ dòng lệnh
├── frontend/
│   ├── src/              # React components
│   ├── package.json
│   └── vite.config.js
├── environment.yml       # Môi trường conda
├── QUICKSTART.md         # Hướng dẫn nhanh
├── PROJECT_STRUCTURE.md  # Mô tả kiến trúc
└── README.md
```

## Chuẩn bị

- Conda + Python 3.10  
- Node.js 18+ (npm)  
- Git

## Cài đặt

```bash
git clone <repo>
cd eth-wallet-cli

# Backend
conda env create -f environment.yml
conda activate walletlab

# Frontend
cd frontend
npm install
cd ..
```

## Chạy ứng dụng

### Backend
```bash
conda activate walletlab
cd backend
python app.py
# hoặc: uvicorn app:app --reload --host 0.0.0.0 --port 8000
```
- API: `http://localhost:8000`  
- Swagger: `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm run dev
```
- UI: `http://localhost:3000`

### CLI
```bash
conda activate walletlab
python cli/wallet_cli.py generate
python cli/wallet_cli.py sign "Chuyển 5 ETH"
python cli/wallet_cli.py verify --message "Chuyển 5 ETH" --signature 0x... --address 0x...
```

## API chính

| Endpoint | Mô tả |
| --- | --- |
| `POST /api/wallet/generate` | Sinh khóa + địa chỉ |
| `POST /api/wallet/sign` | Ký thông điệp (`{"message","private_key"}`) |
| `POST /api/wallet/verify` | Xác thực chữ ký (kèm `address` hoặc `public_key`) |
| `GET /api/wallet/address/{private_key}` | Đổi khóa riêng sang địa chỉ |

## Chi tiết kỹ thuật

- Đường cong secp256k1, chữ ký ECDSA  
- Hàm băm Keccak-256, địa chỉ lấy 20 byte cuối -> checksum  
- Thông điệp ký theo chuẩn `\x19Ethereum Signed Message:\n{len}{message}`  
- Dùng thư viện `eth-keys`, `eth-utils`, `FastAPI`, `React`, `Axios`

## Bảo mật

- Không chia sẻ khóa riêng; file JSON sinh ra chỉ để demo  
- Không nên dùng ví này cho tài sản thật  
- Khuyến khích lưu khóa riêng trong phần mềm/hardware wallet an toàn

## Tác giả

- **Phan Hoàng Khải**  
- **Lê Minh Nhật**

Liên hệ hỗ trợ: phan.khai@example.com, minh.nhat@example.com

## Giấy phép & tham khảo

- Dùng cho mục đích học tập trong môn Blockchain & Applications  
- Tài liệu: Ethereum Yellow Paper, EIP-191, BIP32, BIP39

