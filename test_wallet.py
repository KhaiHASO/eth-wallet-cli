#!/usr/bin/env python3
"""
Script kiểm thử đơn giản cho ví
"""
import sys
from pathlib import Path

# Thêm backend vào path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from wallet_core import WalletCore


def test_wallet():
    """Kiểm tra các thao tác cơ bản của ví"""
    print("Đang kiểm thử lõi ví Ethereum...")
    print("=" * 60)
    
    wallet = WalletCore()
    
    # Kiểm thử 1: Sinh cặp khóa
    print("\n1. Kiểm tra sinh khóa...")
    private_key, public_key, address = wallet.generate_keypair()
    print(f"   ✓ Private Key: {private_key[:20]}...")
    print(f"   ✓ Public Key:  {public_key[:20]}...")
    print(f"   ✓ Address:     {address}")
    
    # Kiểm thử 2: Dẫn xuất địa chỉ từ khóa riêng
    print("\n2. Kiểm tra dẫn xuất địa chỉ...")
    derived_address = wallet.private_key_to_address(private_key)
    assert derived_address == address, "Dẫn xuất địa chỉ thất bại!"
    print(f"   ✓ Địa chỉ dẫn xuất: {derived_address}")
    print(f"   ✓ Trùng khớp: {derived_address == address}")
    
    # Kiểm thử 3: Ký thông điệp
    print("\n3. Kiểm tra ký thông điệp...")
    message = "Chuyển 5 ETH"
    sign_result = wallet.sign_message(message, private_key)
    signature = sign_result["signature"]
    signer_address = sign_result["address"]
    print(f"   ✓ Thông điệp: {message}")
    print(f"   ✓ Hash: {sign_result['message_hash']}")
    print(f"   ✓ v/r/s: {sign_result['v']} / {sign_result['r'][:18]}... / {sign_result['s'][:18]}...")
    print(f"   ✓ Địa chỉ ký: {signer_address}")
    assert signer_address == address, "Sai lệch địa chỉ ký!"
    
    # Kiểm thử 4: Xác thực qua địa chỉ
    print("\n4. Kiểm tra xác thực chữ ký (dùng địa chỉ)...")
    is_valid, recovered_address, message_hash = wallet.verify_signature(message, signature)
    print(f"   ✓ Kết quả: {is_valid}")
    print(f"   ✓ Địa chỉ khôi phục: {recovered_address}")
    print(f"   ✓ Hash: {message_hash}")
    assert is_valid and recovered_address.lower() == address.lower(), "Xác thực chữ ký thất bại!"
    
    # Kiểm thử 5: Xác thực bằng khóa công khai
    print("\n5. Kiểm tra xác thực (dùng khóa công khai)...")
    is_valid, recovered_address, message_hash = wallet.verify_signature_with_public_key(
        message, signature, public_key
    )
    print(f"   ✓ Kết quả: {is_valid}")
    print(f"   ✓ Địa chỉ khôi phục: {recovered_address}")
    assert is_valid, "Xác thực bằng khóa công khai thất bại!"
    assert recovered_address.lower() == address.lower(), "Địa chỉ khôi phục không khớp!"
    
    # Kiểm thử 6: Phát hiện chữ ký giả
    print("\n6. Kiểm tra phát hiện chữ ký sai...")
    fake_signature = "0x" + "00" * 65
    is_valid, _, _ = wallet.verify_signature(message, fake_signature)
    print(f"   ✓ Đã phát hiện chữ ký sai: {not is_valid}")
    assert not is_valid, "Lẽ ra phải phát hiện chữ ký sai!"
    
    print("\n" + "=" * 60)
    print("✓ Tất cả kiểm thử đã vượt qua!")
    print("=" * 60)


if __name__ == "__main__":
    try:
        test_wallet()
    except Exception as e:
        print(f"\n✗ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

