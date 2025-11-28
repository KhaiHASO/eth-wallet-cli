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
├── frontend/                  # React.js Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── WalletGenerator.jsx    # Wallet generation component
│   │   │   ├── MessageSigner.jsx      # Message signing component
│   │   │   └── SignatureVerifier.jsx  # Signature verification component
│   │   ├── App.jsx            # Main application component
│   │   ├── App.css            # Application styles
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Global styles
│   ├── index.html             # HTML template
│   ├── package.json           # Node.js dependencies
│   └── vite.config.js         # Vite configuration
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
- `WalletCore` class with methods:
  - `generate_keypair()` - Generate private/public key pair and address
  - `private_key_to_address()` - Derive address from private key
  - `sign_message()` - Sign a message with private key
  - `verify_signature_with_public_key()` - Verify signature using public key
  - `verify_signature_with_address()` - Verify signature by recovering address
  - `_public_key_to_address()` - Helper to convert public key to address

### CLI (`cli/`)

#### `wallet_cli.py`
- Command-line interface for wallet operations
- Commands:
  - `generate` - Generate a new wallet
  - `sign` - Sign a message
  - `verify` - Verify a signature
- Interactive prompts for missing parameters
- Optional file saving for wallets and signatures

### Frontend (`frontend/`)

#### Components

**WalletGenerator.jsx**
- UI for generating new wallets
- Displays private key, public key, and address
- Copy-to-clipboard functionality
- Security warnings

**MessageSigner.jsx**
- UI for signing messages
- Input fields for message and private key
- Displays signature and signer address
- Copy-to-clipboard functionality

**SignatureVerifier.jsx**
- UI for verifying signatures
- Supports verification with address or public key
- Displays verification result
- Shows recovered address when using public key

#### Styling
- Modern gradient design
- Responsive layout
- Card-based UI components
- Color-coded alerts (success, error, warning)

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Uvicorn**: ASGI server
- **eth-keys**: Ethereum key operations
- **eth-utils**: Ethereum utility functions
- **Pydantic**: Data validation

### Frontend
- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Axios**: HTTP client
- **CSS3**: Styling with modern features

### Development Tools
- **Conda**: Environment management
- **npm**: Package management
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

Run the test script to verify functionality:

```bash
conda activate walletlab
python test_wallet.py
```

This will test:
- Key generation
- Address derivation
- Message signing
- Signature verification (with address and public key)
- Invalid signature detection

