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

from wallet_core import WalletCore  # type: ignore


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


def sign_message(message: str, private_key: str = None, personal: bool = True):
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
        result = wallet.sign_message(message, private_key, personal)
        
        print("\n" + "="*60)
        print("ĐÃ KÝ THÔNG ĐIỆP")
        print("="*60)
        print(f"Thông điệp: {message}")
        print(f"Địa chỉ:    {result['address']}")
        print(f"Hash:       {result['message_hash']}")
        print(f"r:          {result['r']}")
        print(f"s:          {result['s']} (low-s: {'✓' if result['is_low_s'] else '✗'})")
        print(f"v:          {result['v']}")
        print(f"Chữ ký:     {result['signature']}")
        print("="*60 + "\n")
        
        # Tùy chọn lưu chữ ký
        save = input("Lưu chữ ký ra file? (y/n): ").strip().lower()
        if save == 'y':
            filename = input("Tên file (mặc định: signature.json): ").strip() or "signature.json"
            signature_data = {
                "message": message,
                "signature": result["signature"],
                "address": result["address"]
            }
            with open(filename, 'w') as f:
                json.dump(signature_data, f, indent=2)
            print(f"Đã lưu chữ ký vào {filename}\n")
    except Exception as e:
        print(f"Lỗi khi ký thông điệp: {e}\n")
        sys.exit(1)


def verify_signature(message: str, signature: str, address: str = None, public_key: str = None, personal: bool = True):
    """Xác thực chữ ký"""
    wallet = WalletCore()
    
    if address:
        is_valid, recovered_address, message_hash = wallet.verify_signature(message, signature, personal)
        normalized_expected = address.lower() if address else None
        match_expected = recovered_address.lower() == normalized_expected if recovered_address and normalized_expected else False
        print("\n" + "="*60)
        print("KIỂM TRA CHỮ KÝ")
        print("="*60)
        print(f"Thông điệp: {message}")
        print(f"Địa chỉ kỳ vọng: {address}")
        print(f"Địa chỉ khôi phục: {recovered_address}")
        print(f"Hash: {message_hash}")
        print(f"Chữ ký:     {signature}")
        print(f"Kết quả: {'✓ HỢP LỆ' if is_valid and match_expected else '✗ KHÔNG HỢP LỆ'}")
        print("="*60 + "\n")
    elif public_key:
        is_valid, recovered_address, message_hash = wallet.verify_signature_with_public_key(message, signature, public_key, personal)
        print("\n" + "="*60)
        print("KIỂM TRA CHỮ KÝ")
        print("="*60)
        print(f"Thông điệp:        {message}")
        print(f"Khóa công khai:    {public_key}")
        print(f"Hash:              {message_hash}")
        print(f"Chữ ký:            {signature}")
        print(f"Địa chỉ khôi phục: {recovered_address}")
        print(f"Kết quả: {'✓ HỢP LỆ' if is_valid else '✗ KHÔNG HỢP LỆ'}")
        print("="*60 + "\n")
    else:
        is_valid, recovered_address, message_hash = wallet.verify_signature(message, signature, personal)
        print("\n" + "="*60)
        print("KIỂM TRA CHỮ KÝ")
        print("="*60)
        print(f"Thông điệp: {message}")
        print(f"Hash:       {message_hash}")
        print(f"Địa chỉ khôi phục: {recovered_address}")
        print(f"Chữ ký:     {signature}")
        print(f"Kết quả: {'✓ HỢP LỆ' if is_valid else '✗ KHÔNG HỢP LỆ'}")
        print("="*60 + "\n")


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
    sign_parser.add_argument('--raw', action='store_true', help='Ký dạng raw, không dùng Ethereum Signed Message (EIP-191)')
    
    # Verify command
    verify_parser = subparsers.add_parser('verify', help='Xác thực chữ ký')
    verify_parser.add_argument('--message', required=True, help='Thông điệp gốc')
    verify_parser.add_argument('--signature', required=True, help='Chữ ký cần kiểm tra')
    verify_parser.add_argument('--address', help='Địa chỉ kỳ vọng')
    verify_parser.add_argument('--public-key', help='Khóa công khai')
    verify_parser.add_argument('--raw', action='store_true', help='Xác thực dạng raw (không dùng tiền tố EIP-191)')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    if args.command == 'generate':
        generate_wallet()
    elif args.command == 'sign':
        use_personal = not args.raw
        sign_message(args.message, args.private_key, use_personal)
    elif args.command == 'verify':
        use_personal = not args.raw
        verify_signature(args.message, args.signature, args.address, args.public_key, use_personal)


if __name__ == "__main__":
    main()

