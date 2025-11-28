# Quick Start Guide

## Prerequisites Check

Make sure you have:
- ✅ Conda installed
- ✅ Node.js 18+ installed
- ✅ Git installed

## Step-by-Step Setup

### 1. Create Conda Environment

```bash
conda env create -f environment.yml
conda activate walletlab
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 3. Start Backend (Terminal 1)

**Windows:**
```bash
start_backend.bat
```

**Linux/Mac:**
```bash
chmod +x start_backend.sh
./start_backend.sh
```

**Or manually:**
```bash
conda activate walletlab
cd backend
python app.py
```

The backend will start at `http://localhost:8000`

### 4. Start Frontend (Terminal 2)

**Windows:**
```bash
start_frontend.bat
```

**Linux/Mac:**
```bash
chmod +x start_frontend.sh
./start_frontend.sh
```

**Or manually:**
```bash
cd frontend
npm run dev
```

The frontend will start at `http://localhost:3000`

### 5. Use the Application

1. Open your browser and go to `http://localhost:3000`
2. Use the web interface to:
   - Generate wallets
   - Sign messages
   - Verify signatures

### 6. Use CLI Tool (Optional)

```bash
conda activate walletlab

# Generate wallet
python cli/wallet_cli.py generate

# Sign message
python cli/wallet_cli.py sign "Transfer 5 ETH"
```

## Testing the API

Visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI).

## Troubleshooting

### Backend won't start
- Make sure conda environment is activated: `conda activate walletlab`
- Check if port 8000 is available
- Verify dependencies: `pip list | grep -E "fastapi|eth-keys"`

### Frontend won't start
- Make sure Node.js is installed: `node --version`
- Install dependencies: `cd frontend && npm install`
- Check if port 3000 is available

### CORS errors
- Make sure backend is running on port 8000
- Make sure frontend is running on port 3000
- Check browser console for specific error messages

