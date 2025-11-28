import { useCallback, useMemo, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { walletApi, type GenerateResponse } from '../api/client';
import {
  checksumAddress,
  loadRememberState,
  loadStoredSecrets,
  rememberSecrets,
  STORAGE_KEYS,
} from '../utils/eth';
import Field from './Field';
import { useToast } from './Toast';

type WalletResult = GenerateResponse & { checksum: string };

const GenerateForm = () => {
  const { addToast } = useToast();
  const [wallet, setWallet] = useState<WalletResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [remember, setRemember] = useState(loadRememberState());

  const storedSecrets = useMemo(() => loadStoredSecrets(), [wallet]);

  const handleCopy = useCallback(
    async (value: string, label: string) => {
      try {
        await navigator.clipboard.writeText(value);
        addToast(`${label} đã được sao chép`, 'success');
      } catch {
        addToast('Không thể sao chép, vui lòng thử thủ công.', 'error');
      }
    },
    [addToast],
  );

  const handleGenerate = async () => {
    setLoading(true);
    setWallet(null);
    try {
      const response = await walletApi.generate();
      const checksum = checksumAddress(response.address);
      const result = { ...response, checksum };
      setWallet(result);
      addToast('Đã tạo ví mới', 'success');
      if (remember) {
        rememberSecrets(result.private_key, result.checksum, true);
      }
    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!wallet) return;
    const payload = {
      privateKey: wallet.private_key,
      publicKey: wallet.public_key,
      address: wallet.checksum,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wallet-${wallet.checksum.slice(2, 8)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Đã tải file JSON (demo – không dùng cho ví thật)', 'info');
  };

  const handleRememberToggle = (checked: boolean) => {
    setRemember(checked);
    localStorage.setItem(STORAGE_KEYS.remember, String(checked));
    if (!checked) {
      rememberSecrets('', '', false);
    } else if (wallet) {
      rememberSecrets(wallet.private_key, wallet.checksum, true);
    }
  };

  return (
    <section className="card">
      <header className="card-head">
        <div>
          <h2>Generate Wallet</h2>
          <p>Tạo khóa riêng/công khai và địa chỉ Ethereum (EIP-55).</p>
        </div>
        <button
          type="button"
          className="primary"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Đang tạo…' : 'Generate Wallet'}
        </button>
      </header>

      <div className="remember-box">
        <label>
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => handleRememberToggle(e.target.checked)}
          />
          Remember last private key in this browser
        </label>
        <small>⚠️ Chỉ dùng trên máy cá nhân. Không lưu khóa thật.</small>
      </div>

      {storedSecrets.address && (
        <div className="saved-chip">
          Địa chỉ đã lưu gần nhất: <code>{storedSecrets.address}</code>
        </div>
      )}

      {wallet && (
        <div className="result">
          <Field label="Private Key" action={
            <div className="field-actions">
              <button type="button" onClick={() => setShowPrivate((prev) => !prev)}>
                {showPrivate ? 'Ẩn' : 'Hiện'}
              </button>
              <button type="button" onClick={() => handleCopy(wallet.private_key, 'Private key')}>
                Copy
              </button>
            </div>
          }>
            <input
              type={showPrivate ? 'text' : 'password'}
              readOnly
              value={showPrivate ? wallet.private_key : '••••••••••••••'}
            />
          </Field>

          <Field
            label="Public Key (uncompressed)"
            action={
              <button type="button" onClick={() => handleCopy(wallet.public_key, 'Public key')}>
                Copy
              </button>
            }
          >
            <textarea readOnly value={wallet.public_key} rows={3} />
          </Field>

          <Field
            label="Checksum Address"
            action={
              <div className="field-actions">
                <button type="button" onClick={() => handleCopy(wallet.checksum, 'Address')}>
                  Copy
                </button>
                <button type="button" onClick={() => setShowQr((prev) => !prev)}>
                  {showQr ? 'Ẩn QR' : 'Hiện QR'}
                </button>
              </div>
            }
          >
            <input type="text" readOnly value={wallet.checksum} />
            {showQr && (
              <div className="qr-wrapper">
                <QRCodeCanvas value={wallet.checksum} size={160} includeMargin />
              </div>
            )}
          </Field>

          <div className="actions-row">
            <button type="button" className="secondary" onClick={handleSave}>
              Save JSON (demo)
            </button>
          </div>

          <div className="warning-box">
            <strong>Security Warning</strong>
            Đây chỉ là ví demo. Không dùng để giữ tài sản thật.
          </div>
        </div>
      )}
    </section>
  );
};

export default GenerateForm;

