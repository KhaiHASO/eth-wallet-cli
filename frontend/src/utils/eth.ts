import { keccak256 } from 'js-sha3';

export const STORAGE_KEYS = {
  privateKey: 'ethWallet:lastPrivateKey',
  address: 'ethWallet:lastAddress',
  remember: 'ethWallet:rememberSecrets',
};

const SECP256K1_N = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
const HALF_CURVE_ORDER = SECP256K1_N / BigInt(2);

type CanonicalValue = string | number | boolean | null | CanonicalValue[] | { [key: string]: CanonicalValue };

const canonicalize = (value: unknown): CanonicalValue => {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalize(item));
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => [key, canonicalize(val)] as const);
    return entries.reduce<Record<string, CanonicalValue>>((acc, [key, val]) => {
      acc[key] = val;
      return acc;
    }, {});
  }
  return value as CanonicalValue;
};

export const canonicalJson = (input: string): string => {
  try {
    const parsed = JSON.parse(input);
    const canonical = canonicalize(parsed);
    return JSON.stringify(canonical, null, 2);
  } catch {
    return input.trim();
  }
};

export const normalizeHex = (value: string, options: { withPrefix?: boolean; padTo?: number } = {}): string => {
  if (!value) return '';
  const withoutPrefix = value.startsWith('0x') ? value.slice(2) : value;
  const padded =
    options.padTo && withoutPrefix.length < options.padTo
      ? withoutPrefix.padStart(options.padTo, '0')
      : withoutPrefix;
  return options.withPrefix === false ? padded : `0x${padded}`;
};

export const isHex = (value: string, expectedBytes?: number): boolean => {
  if (!value) return false;
  const hex = value.startsWith('0x') ? value.slice(2) : value;
  const regex = /^[0-9a-fA-F]+$/;
  if (!regex.test(hex)) return false;
  if (expectedBytes) {
    return hex.length === expectedBytes * 2;
  }
  return hex.length % 2 === 0;
};

export const checksumAddress = (address: string): string => {
  if (!address) return address;
  const hex = address.trim().toLowerCase().replace(/^0x/, '');
  if (hex.length !== 40) {
    return address.startsWith('0x') ? address : `0x${hex}`;
  }
  const hash = keccak256(hex);
  let checksum = '0x';
  for (let i = 0; i < hex.length; i += 1) {
    checksum += parseInt(hash[i], 16) > 7 ? hex[i].toUpperCase() : hex[i];
  }
  return checksum;
};

export const shortenHex = (value: string, chars = 4): string => {
  if (!value) return '';
  const hex = value.startsWith('0x') ? value : `0x${value}`;
  if (hex.length <= chars * 2 + 2) return hex;
  return `${hex.slice(0, chars + 2)}…${hex.slice(-chars)}`;
};

export interface ParsedSignature {
  r: string;
  s: string;
  v: number;
}

export const parseSignature = (signature: string): ParsedSignature => {
  const normalized = normalizeHex(signature, { withPrefix: false });
  if (normalized.length < 130) {
    throw new Error('Chữ ký không hợp lệ (thiếu dữ liệu)');
  }
  const r = `0x${normalized.slice(0, 64)}`;
  const s = `0x${normalized.slice(64, 128)}`;
  const vHex = normalized.slice(128, 130) || '1b';
  const v = parseInt(vHex, 16);
  return { r, s, v };
};

export const composeSignature = (r: string, s: string, v: number): string => {
  if (!isHex(r, 32) || !isHex(s, 32)) {
    throw new Error('r/s phải là hex 32 byte');
  }
  const normalizedR = normalizeHex(r, { withPrefix: false, padTo: 64 });
  const normalizedS = normalizeHex(s, { withPrefix: false, padTo: 64 });
  const normalizedV = v.toString(16).padStart(2, '0');
  return `0x${normalizedR}${normalizedS}${normalizedV}`;
};

export const isLowS = (sHex: string): boolean => {
  if (!isHex(sHex, 32)) return false;
  const value = BigInt(`0x${normalizeHex(sHex, { withPrefix: false })}`);
  return value <= HALF_CURVE_ORDER;
};

export const rememberSecrets = (privateKey: string, address: string, enabled: boolean): void => {
  localStorage.setItem(STORAGE_KEYS.remember, String(enabled));
  if (enabled) {
    localStorage.setItem(STORAGE_KEYS.privateKey, privateKey);
    localStorage.setItem(STORAGE_KEYS.address, address);
  } else {
    localStorage.removeItem(STORAGE_KEYS.privateKey);
    localStorage.removeItem(STORAGE_KEYS.address);
  }
};

export const loadRememberState = (): boolean =>
  localStorage.getItem(STORAGE_KEYS.remember) === 'true';

export const loadStoredSecrets = () => ({
  privateKey: localStorage.getItem(STORAGE_KEYS.privateKey) ?? '',
  address: localStorage.getItem(STORAGE_KEYS.address) ?? '',
});

