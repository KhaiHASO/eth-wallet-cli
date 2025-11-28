import { describe, expect, it } from 'vitest';
import {
  canonicalJson,
  checksumAddress,
  composeSignature,
  parseSignature,
} from '../src/utils/eth';

describe('utils/eth', () => {
  it('creates checksum address (EIP-55)', () => {
    const input = '0x52908400098527886e0f7030069857d2e4169ee7';
    const expected = '0x52908400098527886E0F7030069857D2E4169EE7';
    expect(checksumAddress(input)).toBe(expected);
  });

  it('canonicalizes JSON with sorted keys', () => {
    const messy = '{"b":2,"a":{"z":1,"b":2},"c":[{"d":2,"c":1}]}';
    const canonical = canonicalJson(messy);
    expect(canonical).toContain('"a"');
    expect(canonical.indexOf('"a"')).toBeLessThan(canonical.indexOf('"b"'));
  });

  it('parses and composes signatures consistently', () => {
    const original =
      '0x3b8e94b6fd1ab6f75b16a3d5c0e3e5af8d4e6cb7781b78b810e16a3a8b6d351d' +
      '5f7f0f4a5ab1a1a4bb13a7f9d9c5ee11ad1ed7a30c6e3a6a7e3b5f2a4d1e1c1b';
    const parsed = parseSignature(original);
    const recomposed = composeSignature(parsed.r, parsed.s, parsed.v);
    expect(recomposed.toLowerCase()).toBe(original.toLowerCase());
  });
});

