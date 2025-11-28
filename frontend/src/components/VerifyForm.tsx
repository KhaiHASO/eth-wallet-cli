import { FormEvent, useMemo, useState } from 'react';
import { walletApi, type VerifyResponse } from '../api/client';
import Field from './Field';
import { useToast } from './Toast';
import {
  checksumAddress,
  composeSignature,
  isHex,
  parseSignature,
  shortenHex,
} from '../utils/eth';

type Mode = 'combined' | 'components';

const allowedV = new Set([0, 1, 27, 28]);

const VerifyForm = () => {
  const { addToast } = useToast();
  const [mode, setMode] = useState<Mode>('combined');
  const [usePersonal, setUsePersonal] = useState(true);
  const [message, setMessage] = useState('Transfer 5 ETH');
  const [signatureHex, setSignatureHex] = useState('');
  const [r, setR] = useState('');
  const [s, setS] = useState('');
  const [v, setV] = useState('27');
  const [addressExpected, setAddressExpected] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [submittedSignature, setSubmittedSignature] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const parsedSignature = useMemo(() => {
    if (!submittedSignature) return null;
    try {
      return parseSignature(submittedSignature);
    } catch {
      return null;
    }
  }, [submittedSignature]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!message.trim()) {
      nextErrors.message = 'Thông điệp không được bỏ trống';
    }
    if (mode === 'combined') {
      if (!isHex(signatureHex.trim(), 65)) {
        nextErrors.signatureHex = 'Chữ ký gộp phải là hex 65 byte (0x + 130 ký tự)';
      }
    } else {
      if (!isHex(r.trim(), 32)) {
        nextErrors.r = 'r phải là hex 32 byte';
      }
      if (!isHex(s.trim(), 32)) {
        nextErrors.s = 's phải là hex 32 byte';
      }
      const numericV = v.trim().startsWith('0x') ? parseInt(v.trim(), 16) : parseInt(v.trim(), 10);
      if (!allowedV.has(numericV)) {
        nextErrors.v = 'v phải là 0,1,27 hoặc 28';
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildSignature = () => {
    if (mode === 'combined') {
      return signatureHex.trim();
    }
    const numericV = v.trim().startsWith('0x') ? parseInt(v.trim(), 16) : parseInt(v.trim(), 10);
    return composeSignature(r.trim(), s.trim(), numericV);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setResult(null);
    try {
      const composedSignature = buildSignature();
      setSubmittedSignature(composedSignature);
      const payload = {
        message,
        signature: composedSignature,
        personal: usePersonal,
        address: addressExpected ? checksumAddress(addressExpected) : undefined,
        public_key: publicKey || undefined,
      };
      const response = await walletApi.verify(payload);
      setResult(response);
      addToast(response.valid ? 'Chữ ký hợp lệ' : 'Chữ ký không hợp lệ', response.valid ? 'success' : 'error');
    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      addToast(`${label} đã được sao chép`, 'success');
    } catch {
      addToast('Không thể sao chép giá trị này', 'error');
    }
  };

  return (
    <section className="card">
      <header className="card-head">
        <div>
          <h2>Verify Signature</h2>
          <p>Kiểm tra chữ ký bằng cách nhập r/s/v hoặc chữ ký gộp.</p>
        </div>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <Field label="Message" htmlFor="verify-message" error={errors.message}>
          <textarea
            id="verify-message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Field>

        <div className="mode-toggle">
          <button
            type="button"
            className={mode === 'combined' ? 'active' : ''}
            onClick={() => setMode('combined')}
          >
            Signature Hex
          </button>
          <button
            type="button"
            className={mode === 'components' ? 'active' : ''}
            onClick={() => setMode('components')}
          >
            v / r / s
          </button>
        </div>

        {mode === 'combined' ? (
          <Field
            label="Signature (0x{r}{s}{v})"
            htmlFor="signature-hex"
            error={errors.signatureHex}
          >
            <textarea
              id="signature-hex"
              rows={2}
              placeholder="0x..."
              value={signatureHex}
              onChange={(e) => setSignatureHex(e.target.value)}
            />
          </Field>
        ) : (
          <div className="grid-two">
            <Field label="r" htmlFor="sig-r" error={errors.r}>
              <input id="sig-r" value={r} onChange={(e) => setR(e.target.value)} placeholder="0x..." />
            </Field>
            <Field label="s" htmlFor="sig-s" error={errors.s}>
              <input id="sig-s" value={s} onChange={(e) => setS(e.target.value)} placeholder="0x..." />
            </Field>
            <Field label="v" htmlFor="sig-v" error={errors.v}>
              <input
                id="sig-v"
                value={v}
                onChange={(e) => setV(e.target.value)}
                placeholder="27"
              />
            </Field>
          </div>
        )}

        <Field label="Expected Address (optional)" htmlFor="expected-address">
          <input
            id="expected-address"
            value={addressExpected}
            onChange={(e) => setAddressExpected(e.target.value)}
            placeholder="0x..."
          />
        </Field>

        <Field label="Public Key (optional)" htmlFor="expected-public-key">
          <textarea
            id="expected-public-key"
            rows={2}
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            placeholder="0x04..."
          />
        </Field>

        <div className="form-row">
          <label>
            <input
              type="checkbox"
              checked={usePersonal}
              onChange={(e) => setUsePersonal(e.target.checked)}
            />
            Use Ethereum Signed Message (EIP-191)
          </label>
        </div>

        <div className="actions-row">
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Đang kiểm tra…' : 'Verify Signature'}
          </button>
        </div>
      </form>

      {result && (
        <div className={`verify-result ${result.valid ? 'valid' : 'invalid'}`}>
          <div className="status-pill">
            {result.valid ? '✓ Signature is VALID' : '✗ Signature is INVALID'}
          </div>
          <div className="result-grid">
            <div className="result-item">
              <span>Recovered address</span>
              <code title={result.address ?? 'N/A'}>{result.address ?? '—'}</code>
              {result.address && (
                <button onClick={() => handleCopy(result.address, 'Recovered address')}>Copy</button>
              )}
            </div>
            {result.message_hash && (
              <div className="result-item">
                <span>Message Hash</span>
                <code title={result.message_hash}>{result.message_hash}</code>
                <button onClick={() => handleCopy(result.message_hash!, 'Message hash')}>
                  Copy
                </button>
              </div>
            )}
            {result.match_expected != null && (
              <div className="result-item">
                <span>Matches expected address</span>
                <strong className={result.match_expected ? 'match-yes' : 'match-no'}>
                  {result.match_expected ? 'Khớp' : 'Không khớp'}
                </strong>
              </div>
            )}
          </div>
        </div>
      )}

      {parsedSignature && (
        <div className="result-grid compact">
          <div className="result-item">
            <span>r</span>
            <code title={parsedSignature.r}>{shortenHex(parsedSignature.r, 6)}</code>
            <button onClick={() => handleCopy(parsedSignature.r, 'r value')}>Copy</button>
          </div>
          <div className="result-item">
            <span>s</span>
            <code title={parsedSignature.s}>{shortenHex(parsedSignature.s, 6)}</code>
            <button onClick={() => handleCopy(parsedSignature.s, 's value')}>Copy</button>
          </div>
          <div className="result-item">
            <span>v</span>
            <code>{parsedSignature.v}</code>
            <button onClick={() => handleCopy(String(parsedSignature.v), 'v value')}>
              Copy
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default VerifyForm;

