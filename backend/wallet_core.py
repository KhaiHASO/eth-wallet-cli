"""
Lõi chức năng ví Ethereum
Xử lý sinh khóa, ký và xác thực
"""
from typing import Optional, Tuple

from eth_keys import keys
from eth_keys.constants import SECPK1_N
from eth_utils import keccak, to_checksum_address
import secrets

HALF_CURVE_ORDER = SECPK1_N // 2


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
    
    def sign_message(self, message: str, private_key_hex: str, use_personal: bool = True):
        """
        Ký thông điệp bằng khóa riêng và trả về đầy đủ thông tin chữ ký.
        """
        if private_key_hex.startswith('0x'):
            private_key_hex = private_key_hex[2:]
        
        private_key_bytes = bytes.fromhex(private_key_hex)
        private_key = keys.PrivateKey(private_key_bytes)
        
        message_hash = self._hash_message(message, use_personal)
        signature = private_key.sign_msg_hash(message_hash)
        
        address = self.private_key_to_address(private_key_hex)
        signature_hex = signature.to_hex()
        r_hex = self._int_to_hex(signature.r)
        s_hex = self._int_to_hex(signature.s)
        
        return {
            "signature": signature_hex,
            "message_hash": f"0x{message_hash.hex()}",
            "address": address,
            "v": signature.v,
            "r": r_hex,
            "s": s_hex,
            "is_low_s": signature.s <= HALF_CURVE_ORDER
        }
    
    def verify_signature_with_public_key(
        self,
        message: str,
        signature_hex: str,
        public_key_hex: str,
        use_personal: bool = True,
    ) -> Tuple[bool, Optional[str], str]:
        """Xác thực chữ ký bằng khóa công khai đã cho"""
        if public_key_hex.startswith('0x'):
            public_key_hex = public_key_hex[2:]
        if signature_hex.startswith('0x'):
            signature_hex = signature_hex[2:]
        
        message_hash = self._hash_message(message, use_personal)
        
        try:
            public_key_bytes = bytes.fromhex(public_key_hex)
            public_key = keys.PublicKey(public_key_bytes)
            
            signature_bytes = bytes.fromhex(signature_hex)
            signature = keys.Signature(signature_bytes)
            
            is_valid = signature.verify_msg_hash(message_hash, public_key)
            recovered_address = self._public_key_to_address(public_key)
            return is_valid, recovered_address, f"0x{message_hash.hex()}"
        except Exception:
            return False, None, f"0x{message_hash.hex()}"
    
    def verify_signature(
        self,
        message: str,
        signature_hex: str,
        use_personal: bool = True,
    ) -> Tuple[bool, Optional[str], str]:
        """Xác thực chữ ký và khôi phục địa chỉ người ký"""
        normalized = signature_hex[2:] if signature_hex.startswith('0x') else signature_hex
        message_hash = self._hash_message(message, use_personal)
        
        try:
            signature_bytes = bytes.fromhex(normalized)
            signature = keys.Signature(signature_bytes)
            
            recovered_public_key = signature.recover_public_key_from_msg_hash(message_hash)
            recovered_address = self._public_key_to_address(recovered_public_key)
            
            is_valid = signature.verify_msg_hash(message_hash, recovered_public_key)
            return is_valid, recovered_address, f"0x{message_hash.hex()}"
        except Exception:
            return False, None, f"0x{message_hash.hex()}"
    
    def _public_key_to_address(self, public_key):
        """Hàm hỗ trợ chuyển khóa công khai thành địa chỉ"""
        public_key_bytes = public_key.to_bytes()
        if public_key_bytes[0] == 4:
            public_key_bytes = public_key_bytes[1:]
        
        hash_bytes = keccak(public_key_bytes)
        address_bytes = hash_bytes[-20:]
        address = to_checksum_address(address_bytes.hex())
        
        return address

    def _hash_message(self, message: str, use_personal: bool) -> bytes:
        """Băm thông điệp theo chuẩn EIP-191 nếu cần"""
        message_bytes = message.encode('utf-8')
        if use_personal:
            prefix = f"\x19Ethereum Signed Message:\n{len(message_bytes)}".encode('utf-8')
            payload = prefix + message_bytes
        else:
            payload = message_bytes
        return keccak(payload)

    def _int_to_hex(self, value: int, length: int = 32) -> str:
        """Chuyển số nguyên sang hex có padding"""
        hex_value = hex(value)[2:]
        padded = hex_value.rjust(length * 2, '0')
        return f"0x{padded}"

