"""
Lõi chức năng ví Ethereum
Xử lý sinh khóa, ký và xác thực
"""
from eth_keys import keys
from eth_utils import keccak, to_checksum_address
import secrets
import json


class WalletCore:
    """Các thao tác lõi cho ví Ethereum"""
    
    def generate_keypair(self):
        """
        Sinh một cặp khóa riêng/công khai cùng địa chỉ Ethereum
        
        Returns:
            tuple: (private_key_hex, public_key_hex, address)
        """
        # Sinh khóa riêng ngẫu nhiên 32 byte
        private_key_bytes = secrets.token_bytes(32)
        private_key = keys.PrivateKey(private_key_bytes)
        
        # Dẫn xuất khóa công khai từ khóa riêng
        public_key = private_key.public_key
        
        # Dẫn xuất địa chỉ từ khóa công khai
        # Địa chỉ Ethereum = 20 byte cuối của băm Keccak-256 khóa công khai
        public_key_bytes = public_key.to_bytes()
        # Bỏ byte tiền tố 0x04 (định dạng khóa công khai uncompressed)
        if public_key_bytes[0] == 4:
            public_key_bytes = public_key_bytes[1:]
        
        # Băm khóa công khai bằng Keccak-256
        hash_bytes = keccak(public_key_bytes)
        
        # Lấy 20 byte cuối (40 ký tự hex)
        address_bytes = hash_bytes[-20:]
        address = to_checksum_address(address_bytes.hex())
        
        return (
            private_key.to_hex(),
            public_key.to_hex(),
            address
        )
    
    def private_key_to_address(self, private_key_hex: str):
        """
        Dẫn xuất địa chỉ Ethereum từ khóa riêng
        
        Args:
            private_key_hex: Khóa riêng dạng hex (có/không có tiền tố 0x)
            
        Returns:
            str: Địa chỉ Ethereum dạng checksum
        """
        # Bỏ tiền tố 0x nếu có
        if private_key_hex.startswith('0x'):
            private_key_hex = private_key_hex[2:]
        
        private_key_bytes = bytes.fromhex(private_key_hex)
        private_key = keys.PrivateKey(private_key_bytes)
        public_key = private_key.public_key
        
        # Dẫn xuất địa chỉ
        public_key_bytes = public_key.to_bytes()
        if public_key_bytes[0] == 4:
            public_key_bytes = public_key_bytes[1:]
        
        hash_bytes = keccak(public_key_bytes)
        address_bytes = hash_bytes[-20:]
        address = to_checksum_address(address_bytes.hex())
        
        return address
    
    def sign_message(self, message: str, private_key_hex: str):
        """
        Ký thông điệp bằng khóa riêng
        
        Args:
            message: Thông điệp cần ký (JSON hoặc văn bản)
            private_key_hex: Khóa riêng dạng hex
            
        Returns:
            tuple: (signature_hex, address)
        """
        # Bỏ tiền tố 0x nếu có
        if private_key_hex.startswith('0x'):
            private_key_hex = private_key_hex[2:]
        
        private_key_bytes = bytes.fromhex(private_key_hex)
        private_key = keys.PrivateKey(private_key_bytes)
        
        # Định dạng chuẩn của Ethereum: "\x19Ethereum Signed Message:\n{length}{message}"
        # Tránh việc chữ ký bị dùng làm giao dịch Ethereum hợp lệ
        message_bytes = message.encode('utf-8')
        eth_message = f"\x19Ethereum Signed Message:\n{len(message_bytes)}{message}".encode('utf-8')
        
        # Băm thông điệp
        message_hash = keccak(eth_message)
        
        # Ký trên băm
        signature = private_key.sign_msg_hash(message_hash)
        
        # Lấy địa chỉ để phục vụ xác thực
        address = self.private_key_to_address(private_key_hex)
        
        # Trả chữ ký dạng hex (r, s, v)
        signature_hex = signature.to_hex()
        
        return signature_hex, address
    
    def verify_signature_with_public_key(self, message: str, signature_hex: str, public_key_hex: str):
        """
        Xác thực chữ ký bằng khóa công khai
        
        Args:
            message: Thông điệp gốc
            signature_hex: Chữ ký dạng hex
            public_key_hex: Khóa công khai dạng hex
            
        Returns:
            tuple: (is_valid, recovered_address)
        """
        # Bỏ tiền tố 0x nếu có
        if public_key_hex.startswith('0x'):
            public_key_hex = public_key_hex[2:]
        if signature_hex.startswith('0x'):
            signature_hex = signature_hex[2:]
        
        try:
            public_key_bytes = bytes.fromhex(public_key_hex)
            public_key = keys.PublicKey(public_key_bytes)
            
            # Tạo lại thông điệp theo chuẩn Ethereum
            message_bytes = message.encode('utf-8')
            eth_message = f"\x19Ethereum Signed Message:\n{len(message_bytes)}{message}".encode('utf-8')
            message_hash = keccak(eth_message)
            
            # Chuyển chữ ký từ hex thành đối tượng
            signature_bytes = bytes.fromhex(signature_hex)
            signature = keys.Signature(signature_bytes)
            
            # Kiểm tra chữ ký
            is_valid = signature.verify_msg_hash(message_hash, public_key)
            
            # Khôi phục địa chỉ từ chữ ký
            recovered_public_key = signature.recover_public_key_from_msg_hash(message_hash)
            recovered_address = self._public_key_to_address(recovered_public_key)
            
            return is_valid, recovered_address
        except Exception as e:
            return False, None
    
    def verify_signature_with_address(self, message: str, signature_hex: str, address: str):
        """
        Xác thực chữ ký thông qua địa chỉ khôi phục
        
        Args:
            message: Thông điệp gốc
            signature_hex: Chữ ký dạng hex
            address: Địa chỉ Ethereum mong đợi
            
        Returns:
            bool: True nếu chữ ký hợp lệ và địa chỉ trùng khớp
        """
        # Bỏ tiền tố 0x nếu có
        if signature_hex.startswith('0x'):
            signature_hex = signature_hex[2:]
        if address.startswith('0x'):
            address = address.lower()
        else:
            address = '0x' + address.lower()
        
        try:
            # Tạo lại thông điệp theo chuẩn Ethereum
            message_bytes = message.encode('utf-8')
            eth_message = f"\x19Ethereum Signed Message:\n{len(message_bytes)}{message}".encode('utf-8')
            message_hash = keccak(eth_message)
            
            # Chuyển chữ ký từ hex thành đối tượng
            signature_bytes = bytes.fromhex(signature_hex)
            signature = keys.Signature(signature_bytes)
            
            # Khôi phục khóa công khai từ chữ ký
            recovered_public_key = signature.recover_public_key_from_msg_hash(message_hash)
            recovered_address = self._public_key_to_address(recovered_public_key)
            
            # So sánh địa chỉ (không phân biệt hoa thường)
            return recovered_address.lower() == address.lower()
        except Exception as e:
            return False
    
    def _public_key_to_address(self, public_key):
        """Hàm hỗ trợ chuyển khóa công khai thành địa chỉ"""
        public_key_bytes = public_key.to_bytes()
        if public_key_bytes[0] == 4:
            public_key_bytes = public_key_bytes[1:]
        
        hash_bytes = keccak(public_key_bytes)
        address_bytes = hash_bytes[-20:]
        address = to_checksum_address(address_bytes.hex())
        
        return address

