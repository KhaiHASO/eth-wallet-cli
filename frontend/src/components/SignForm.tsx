import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { walletApi, type SignResponse } from '../api/client';
import Field from './Field';
import { useToast } from './Toast';
import {
  canonicalJson,
  composeSignature,
  loadRememberState,
  loadStoredSecrets,
  rememberSecrets,
  shortenHex,
  STORAGE_KEYS,
} from '../utils/eth';

const SignForm = () => {
  const { addToast } = useToast();
  const stored = loadStoredSecrets();

  const [message, setMessage] = useState('{"action":"transfer","amount":"5 ETH"}');
  const [privateKey, setPrivateKey] = useState(stored.privateKey);
  const [usePersonal, setUsePersonal] = useState(true);
  const [remember, setRemember] = useState(loadRememberState());
  const [loading, setLoading] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);
  const [result, setResult] = useState<SignResponse | null>(null);
  const [errors, setErrors] = useState<{ message?: string; privateKey?: string }>({});

  const signatureCompact = useMemo(() => {
    if (!result) return '';
    try {
      return composeSignature(result.r, result.s, result.v);
    } catch {
      return result.signature;
    }
  }, [result]);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const content = await file.text();
      const parsed = JSON.parse(content);
      if (parsed.privateKey || parsed.private_key) {
        setPrivateKey(parsed.privateKey || parsed.private_key);
      }
      if (parsed.message) {
        setMessage(JSON.stringify(parsed.message));
      }
      addToast('Đã tải khóa từ file JSON', 'success');
    } catch (error) {
      addToast('Không đọc được file JSON', 'error');
      console.error(error);
    } finally {
      event.target.value = '';
    }
  };

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (!message.trim()) {
      nextErrors.message = 'Thông điệp không được để trống';
    }
    if (!privateKey.trim()) {
      nextErrors.privateKey = 'Cần cung cấp khóa riêng';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setResult(null);
    try {
      const payload = await walletApi.sign({
        message,
        private_key: privateKey.trim(),
        personal: usePersonal,
      });
      setResult(payload);
      addToast('Đã ký thông điệp', 'success');
      if (remember) {
        rememberSecrets(privateKey.trim(), payload.address, true);
      }
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

  const handleRememberChange = (checked: boolean) => {
    setRemember(checked);
    localStorage.setItem(STORAGE_KEYS.remember, String(checked));
    if (!checked) {
      rememberSecrets('', '', false);
    } else if (result) {
      rememberSecrets(privateKey.trim(), result.address, true);
    }
  };

  return (
    <section className="card">
      <header className="card-head">
        <div>
          <h2>Sign Message</h2>
          <p>Ký thông điệp JSON hoặc văn bản, hỗ trợ EIP-191.</p>
        </div>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <Field
          label="Message"
          htmlFor="sign-message"
          action={
            <button type="button" onClick={() => setMessage(canonicalJson(message))}>
              Canonical JSON
            </button>
          }
          error={errors.message}
        >
          <textarea
            id="sign-message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Field>

        <Field
          label="Private Key"
          htmlFor="sign-privateKey"
          action={
            <div className="field-actions">
              <button type="button" onClick={() => setShowPrivate((prev) => !prev)}>
                {showPrivate ? 'Ẩn' : 'Hiện'}
              </button>
              <label className="file-input">
                Import JSON
                <input type="file" accept="application/json" onChange={handleFile} />
              </label>
            </div>
          }
          error={errors.privateKey}
        >
          <input
            id="sign-privateKey"
            type={showPrivate ? 'text' : 'password'}
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="0x..."
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

        <div className="remember-box">
          <label>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => handleRememberChange(e.target.checked)}
            />
            Remember private key locally
          </label>
          <small>⚠️ Chỉ bật trên thiết bị an toàn của bạn.</small>
        </div>

        <div className="actions-row">
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Đang ký…' : 'Sign Message'}
          </button>
        </div>
      </form>

      {result && (
        <div className="result-grid">
          <div className="result-item">
            <span>Hash</span>
            <code title={result.message_hash}>{result.message_hash}</code>
            <button onClick={() => handleCopy(result.message_hash, 'Hash')}>Copy</button>
          </div>
          <div className="result-item">
            <span>Address</span>
            <code title={result.address}>{result.address}</code>
            <button onClick={() => handleCopy(result.address, 'Address')}>Copy</button>
          </div>
          <div className="result-item grid-two">
            <div>
              <span>r</span>
              <code title={result.r}>{shortenHex(result.r, 6)}</code>
              <button onClick={() => handleCopy(result.r, 'r value')}>Copy</button>
            </div>
            <div>
              <span>s</span>
              <code title={result.s}>{shortenHex(result.s, 6)}</code>
              <button onClick={() => handleCopy(result.s, 's value')}>Copy</button>
            </div>
          </div>
          <div className="result-item">
            <span>v</span>
            <code>{result.v}</code>
            <button onClick={() => handleCopy(String(result.v), 'v value')}>Copy</button>
          </div>
          <div className="result-item">
            <span>Signature (gộp)</span>
            <code title={signatureCompact}>{shortenHex(signatureCompact, 10)}</code>
            <button onClick={() => handleCopy(signatureCompact, 'Signature')}>
              Copy
            </button>
          </div>
        </div>
      )}

      {result && !result.is_low_s && (
        <div className="warning-box">
          <strong>Chữ ký không low-s</strong>
          Ký tự s {'>'} n/2. Theo EIP-2 bạn nên tạo lại chữ ký để tránh bị từ chối.
        </div>
      )}
    </section>
  );
};

export default SignForm;

