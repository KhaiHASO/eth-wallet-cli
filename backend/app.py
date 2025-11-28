"""
API Ví Ethereum
Cung cấp các REST API cho các thao tác với ví
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json

from wallet_core import WalletCore

app = FastAPI(title="API Ví Ethereum", version="1.0.0")

# Bật CORS cho frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

wallet_core = WalletCore()


class KeyPairResponse(BaseModel):
    private_key: str
    public_key: str
    address: str


class SignRequest(BaseModel):
    message: str
    private_key: str


class SignResponse(BaseModel):
    signature: str
    message: str
    address: str


class VerifyRequest(BaseModel):
    message: str
    signature: str
    public_key: Optional[str] = None
    address: Optional[str] = None


class VerifyResponse(BaseModel):
    valid: bool
    address: Optional[str] = None


@app.get("/")
def root():
    return {"message": "API Ví Ethereum", "version": "1.0.0"}


@app.post("/api/wallet/generate", response_model=KeyPairResponse)
def generate_wallet():
    """Tạo ví Ethereum mới (khóa riêng, khóa công khai, địa chỉ)"""
    try:
        private_key, public_key, address = wallet_core.generate_keypair()
        return KeyPairResponse(
            private_key=private_key,
            public_key=public_key,
            address=address
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/wallet/sign", response_model=SignResponse)
def sign_message(request: SignRequest):
    """Ký một thông điệp bằng khóa riêng"""
    try:
        signature, address = wallet_core.sign_message(request.message, request.private_key)
        return SignResponse(
            signature=signature,
            message=request.message,
            address=address
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/wallet/verify", response_model=VerifyResponse)
def verify_signature(request: VerifyRequest):
    """Xác thực chữ ký"""
    try:
        if request.public_key:
            valid, address = wallet_core.verify_signature_with_public_key(
                request.message, request.signature, request.public_key
            )
        elif request.address:
            valid = wallet_core.verify_signature_with_address(
                request.message, request.signature, request.address
            )
            address = request.address if valid else None
        else:
            raise HTTPException(
                status_code=400,
                detail="Cần cung cấp public_key hoặc address"
            )
        
        return VerifyResponse(valid=valid, address=address)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/wallet/address/{private_key}")
def get_address_from_private_key(private_key: str):
    """Lấy địa chỉ Ethereum từ khóa riêng"""
    try:
        address = wallet_core.private_key_to_address(private_key)
        return {"address": address}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

