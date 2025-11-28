#!/usr/bin/env python3
"""
Công cụ CLI Ví Ethereum
Giao diện dòng lệnh cho các thao tác ví
"""
import sys
import argparse
import json
from pathlib import Path

# Thêm thư mục cha vào path để import wallet_core
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from wallet_core import WalletCore


def generate_wallet():
    """Tạo ví mới"""
    wallet = WalletCore()
    private_key, public_key, address = wallet.generate_keypair()
    
    print("\n" + "="*60)
    print("ĐÃ TẠO VÍ MỚI")
    print("="*60)
    print(f"Khóa riêng:  {private_key}")
    print(f"Khóa công:   {public_key}")
    print(f"Địa chỉ:     {address}")
    print("="*60)
    print("\n⚠️  CẢNH BÁO: Hãy bảo mật khóa riêng và không chia sẻ!")
    print("="*60 + "\n")
    
    # Tùy chọn lưu ra file
    save = input("Lưu ví ra file? (y/n): ").strip().lower()
    if save == 'y':
        filename = input("Tên file (mặc định: wallet.json): ").strip() or "wallet.json"
        wallet_data = {
            "private_key": private_key,
            "public_key": public_key,
            "address": address
        }
        with open(filename, 'w') as f:
            json.dump(wallet_data, f, indent=2)
        print(f"Đã lưu ví vào {filename}\n")


def sign_message(message: str, private_key: str = None):
    """Ký thông điệp"""
    wallet = WalletCore()
    
    # Nếu chưa nhập khóa riêng, thử đọc từ file
    if not private_key:
        wallet_file = input("Nhập đường dẫn file ví (Enter để nhập thủ công): ").strip()
        if wallet_file:
            try:
                with open(wallet_file, 'r') as f:
                    wallet_data = json.load(f)
                    private_key = wallet_data.get('private_key')
            except Exception as e:
                print(f"Lỗi đọc file ví: {e}")
                private_key = input("Nhập khóa riêng: ").strip()
        else:
            private_key = input("Nhập khóa riêng: ").strip()
    
    try:
        signature, address = wallet.sign_message(message, private_key)
        
        print("\n" + "="*60)
        print("ĐÃ KÝ THÔNG ĐIỆP")
        print("="*60)
        print(f"Thông điệp: {message}")
        print(f"Địa chỉ:    {address}")
        print(f"Chữ ký:     {signature}")
        print("="*60 + "\n")
        
        # Tùy chọn lưu chữ ký
        save = input("Lưu chữ ký ra file? (y/n): ").strip().lower()
        if save == 'y':
            filename = input("Tên file (mặc định: signature.json): ").strip() or "signature.json"
            signature_data = {
                "message": message,
                "signature": signature,
                "address": address
            }
            with open(filename, 'w') as f:
                json.dump(signature_data, f, indent=2)
            print(f"Đã lưu chữ ký vào {filename}\n")
    except Exception as e:
        print(f"Lỗi khi ký thông điệp: {e}\n")
        sys.exit(1)


def verify_signature(message: str, signature: str, address: str = None, public_key: str = None):
    """Xác thực chữ ký"""
    wallet = WalletCore()
    
    if address:
        is_valid = wallet.verify_signature_with_address(message, signature, address)
        print("\n" + "="*60)
        print("KIỂM TRA CHỮ KÝ")
        print("="*60)
        print(f"Thông điệp: {message}")
        print(f"Địa chỉ:    {address}")
        print(f"Chữ ký:     {signature}")
        print(f"Kết quả: {'✓ HỢP LỆ' if is_valid else '✗ KHÔNG HỢP LỆ'}")
        print("="*60 + "\n")
    elif public_key:
        is_valid, recovered_address = wallet.verify_signature_with_public_key(message, signature, public_key)
        print("\n" + "="*60)
        print("KIỂM TRA CHỮ KÝ")
        print("="*60)
        print(f"Thông điệp:        {message}")
        print(f"Khóa công khai:    {public_key}")
        print(f"Chữ ký:            {signature}")
        print(f"Địa chỉ khôi phục: {recovered_address}")
        print(f"Kết quả: {'✓ HỢP LỆ' if is_valid else '✗ KHÔNG HỢP LỆ'}")
        print("="*60 + "\n")
    else:
        print("Lỗi: Cần cung cấp address hoặc public_key\n")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Công cụ CLI Ví Ethereum",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ví dụ:
  wallet generate
  wallet sign "Chuyển 5 ETH"
  wallet sign "Chuyển 5 ETH" --private-key 0x...
  wallet verify --message "Chuyển 5 ETH" --signature 0x... --address 0x...
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Lệnh cần thực thi')
    
    # Generate command
    subparsers.add_parser('generate', help='Tạo ví mới')
    
    # Sign command
    sign_parser = subparsers.add_parser('sign', help='Ký thông điệp')
    sign_parser.add_argument('message', help='Thông điệp cần ký')
    sign_parser.add_argument('--private-key', help='Khóa riêng (tùy chọn, sẽ hỏi nếu không cung cấp)')
    
    # Verify command
    verify_parser = subparsers.add_parser('verify', help='Xác thực chữ ký')
    verify_parser.add_argument('--message', required=True, help='Thông điệp gốc')
    verify_parser.add_argument('--signature', required=True, help='Chữ ký cần kiểm tra')
    verify_parser.add_argument('--address', help='Địa chỉ kỳ vọng')
    verify_parser.add_argument('--public-key', help='Khóa công khai')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    if args.command == 'generate':
        generate_wallet()
    elif args.command == 'sign':
        sign_message(args.message, args.private_key)
    elif args.command == 'verify':
        verify_signature(args.message, args.signature, args.address, args.public_key)


if __name__ == "__main__":
    main()

