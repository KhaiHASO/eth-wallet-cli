# Project Structure

## Overview

This Ethereum wallet application is a full-stack implementation with:
- **Backend**: Python FastAPI REST API
- **Frontend**: React.js web interface
- **CLI**: Command-line tool for wallet operations

## Directory Structure

```
eth-wallet-cli/
│
├── backend/                    # Python FastAPI Backend
│   ├── __init__.py            # Package marker
│   ├── app.py                 # FastAPI application and routes
│   ├── wallet_core.py         # Core wallet functionality (key generation, signing, verification)
│   └── requirements.txt       # Python dependencies
│
├── cli/                       # Command-Line Interface
│   └── wallet_cli.py          # CLI tool for wallet operations
│
├── frontend/                  # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── api/client.ts      # Axios client + typed endpoints
│   │   ├── components/        # Tabs, forms, field, toast
│   │   ├── utils/eth.ts       # Eth helpers (checksum, signature, storage)
│   │   ├── App.tsx / App.css  # Main application component
│   │   ├── main.tsx           # React entry point
│   │   └── index.css          # Global styles
│   ├── index.html             # HTML template
│   ├── package.json           # Node.js dependencies
│   ├── tsconfig*.json         # TypeScript configuration
│   └── vite.config.ts         # Vite & Vitest configuration
│
├── frontend/tests/            # Vitest unit tests
│
├── environment.yml            # Conda environment specification
├── .gitignore                # Git ignore rules
├── README.md                 # Main documentation
├── QUICKSTART.md             # Quick start guide
├── PROJECT_STRUCTURE.md      # This file
├── test_wallet.py            # Test script for wallet functionality
├── start_backend.bat         # Windows script to start backend
├── start_backend.sh          # Unix script to start backend
├── start_frontend.bat        # Windows script to start frontend
└── start_frontend.sh         # Unix script to start frontend
```

## Component Details

### Backend (`backend/`)

#### `app.py`
- FastAPI application setup
- CORS middleware configuration
- REST API endpoints:
  - `POST /api/wallet/generate` - Generate new wallet
  - `POST /api/wallet/sign` - Sign a message
  - `POST /api/wallet/verify` - Verify a signature
  - `GET /api/wallet/address/{private_key}` - Get address from private key

#### `wallet_core.py`
- `WalletCore` class với các phương thức:
  - `generate_keypair()` - Sinh khóa riêng/công khai + địa chỉ checksum
  - `private_key_to_address()` - Dẫn xuất địa chỉ từ khóa riêng
  - `sign_message(message, private_key, use_personal)` - Trả chữ ký hex, hash, v/r/s, cờ low-s
  - `verify_signature()` - Khôi phục địa chỉ từ chữ ký, trả `valid`, `address`, `message_hash`
  - `verify_signature_with_public_key()` - Kiểm tra chữ ký đối với public key cụ thể
  - Helpers `_hash_message`, `_int_to_hex`, `_public_key_to_address`

### CLI (`cli/`)

#### `wallet_cli.py`
- Command-line interface (Python) cho các thao tác ví
- Lệnh:
  - `generate` – tạo ví mới, hỏi lưu JSON
  - `sign` – ký thông điệp, hỗ trợ `--raw` để bỏ EIP-191, in hash + r/s/v
  - `verify` – kiểm tra chữ ký (gộp hoặc r/s/v), `--raw` option, hỗ trợ đối chiếu địa chỉ/public key
- Có thể nhập khóa thủ công hoặc tải từ file JSON

### Frontend (`frontend/`)

#### Components & Features

- `Tabs.tsx`: điều hướng 3 tab Generate / Sign / Verify
- `GenerateForm.tsx`: sinh khóa, hiển thị checksum address + QR code, copy nhanh, lưu JSON demo, opt-in nhớ khóa trong localStorage
- `SignForm.tsx`: ký chuỗi hoặc JSON, toggle `personal_sign`, tải khóa từ file JSON, hiển thị hash + v/r/s + chữ ký gộp, cảnh báo non–low-s
- `VerifyForm.tsx`: hỗ trợ ký tự v/r/s hoặc chữ ký hex gộp, tự tách chữ ký, highlight kết quả đối chiếu địa chỉ kỳ vọng, hiển thị message hash
- `Field.tsx`: component input + label + action + helper/error nhỏ gọn
- `Toast.tsx`: ToastProvider + hook dùng để hiển thị toast success/error/info

#### Utilities & API

- `api/client.ts`: Axios instance đọc `VITE_API_BASE`, interceptor lỗi thân thiện, export `walletApi.generate/sign/verify`
- `utils/eth.ts`: canonical JSON (sắp xếp key), checksum EIP-55, parse/compose signature, helper lưu localStorage
- `tests/utils.eth.test.ts`: Vitest kiểm tra checksum + canonical JSON + parseSig

#### Styling
- Layout thẻ bo tròn, shadow mềm, responsive
- Toast nổi, mode toggle, QR wrapper, chip trạng thái verify
- Nút có trạng thái loading và validate form rõ ràng

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Uvicorn**: ASGI server
- **eth-keys**: Ethereum key operations
- **eth-utils**: Ethereum utility functions
- **Pydantic**: Data validation

### Frontend
- **React 18 + TypeScript**
- **Vite** (dev server) & **Vitest** (unit test)
- **Axios** + **js-sha3** + **qrcode.react**
- Thuần CSS (không dùng UI kit nặng)

### Development Tools
- **Conda** cho backend
- **npm** scripts (`dev`, `build`, `lint`, `typecheck`, `test`)
- **ESLint flat config** + **TypeScript strict**
- **Git**: Version control

## Data Flow

### Wallet Generation
1. User requests wallet generation (API/CLI/UI)
2. `WalletCore.generate_keypair()` generates random private key
3. Public key derived from private key using ECC
4. Address derived from public key using Keccak-256
5. Returns private key, public key, and address

### Message Signing
1. User provides message and private key
2. Message formatted with Ethereum standard prefix
3. Message hashed with Keccak-256
4. Hash signed with private key using ECDSA
5. Returns signature and signer address

### Signature Verification
1. User provides message, signature, and address/public key
2. Message formatted and hashed (same as signing)
3. Public key recovered from signature
4. Address derived from recovered public key
5. Signature verified and address compared
6. Returns verification result

## Security Considerations

- Private keys are never stored on the server
- All cryptographic operations use industry-standard libraries
- Ethereum standard message signing format prevents transaction replay
- Checksum addresses for error detection
- Secure random number generation for key generation

## Testing

- **Backend**
  ```bash
  conda activate walletlab
  python test_wallet.py
  ```
  Kiểm tra sinh khóa, ký, xác thực (EIP-191) và phát hiện chữ ký giả.

- **Frontend utils**
  ```bash
  cd frontend
  npm run lint
  npm run typecheck
  npm run test
  ```
  Đảm bảo helper `checksum`, `canonicalJson`, `parseSignature` hoạt động đúng và code TypeScript sạch lint.

