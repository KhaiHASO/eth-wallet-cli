"""
API Ví Ethereum
Cung cấp các REST API cho các thao tác với ví
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from eth_utils import to_checksum_address

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
    personal: bool = True


class SignResponse(BaseModel):
    signature: str
    message: str
    address: str
    message_hash: str
    v: int
    r: str
    s: str
    is_low_s: bool


class VerifyRequest(BaseModel):
    message: str
    signature: str
    public_key: Optional[str] = None
    address: Optional[str] = None
    personal: bool = True


class VerifyResponse(BaseModel):
    valid: bool
    address: Optional[str] = None
    message_hash: Optional[str] = None
    match_expected: Optional[bool] = None


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
        result = wallet_core.sign_message(request.message, request.private_key, request.personal)
        return SignResponse(
            signature=result["signature"],
            message=request.message,
            address=result["address"],
            message_hash=result["message_hash"],
            v=result["v"],
            r=result["r"],
            s=result["s"],
            is_low_s=result["is_low_s"],
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/wallet/verify", response_model=VerifyResponse)
def verify_signature(request: VerifyRequest):
    """Xác thực chữ ký"""
    try:
        personal = request.personal
        match_expected = None
        
        if request.public_key:
            valid, recovered_address, message_hash = wallet_core.verify_signature_with_public_key(
                request.message,
                request.signature,
                request.public_key,
                personal,
            )
        else:
            valid, recovered_address, message_hash = wallet_core.verify_signature(
                request.message,
                request.signature,
                personal,
            )
        
        if request.address:
            expected = request.address
            if not expected.startswith("0x"):
                expected = f"0x{expected}"
            try:
                expected_checksum = to_checksum_address(expected)
            except Exception:
                expected_checksum = expected
            if recovered_address:
                match_expected = recovered_address.lower() == expected_checksum.lower()
                if not match_expected:
                    valid = False
            else:
                match_expected = False
                valid = False
        
        return VerifyResponse(
            valid=valid,
            address=recovered_address,
            message_hash=message_hash,
            match_expected=match_expected,
        )
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

