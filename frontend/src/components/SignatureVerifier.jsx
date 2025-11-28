import React, { useState } from 'react'
import axios from 'axios'

function SignatureVerifier() {
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState('')
  const [address, setAddress] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [verificationMethod, setVerificationMethod] = useState('address')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const verifySignature = async () => {
    if (!message.trim()) {
      setError('Vui lòng nhập thông điệp gốc')
      return
    }
    if (!signature.trim()) {
      setError('Vui lòng nhập chữ ký')
      return
    }
    if (verificationMethod === 'address' && !address.trim()) {
      setError('Vui lòng nhập địa chỉ')
      return
    }
    if (verificationMethod === 'publicKey' && !publicKey.trim()) {
      setError('Vui lòng nhập khóa công khai')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const payload = {
        message: message.trim(),
        signature: signature.trim()
      }

      if (verificationMethod === 'address') {
        payload.address = address.trim()
      } else {
        payload.public_key = publicKey.trim()
      }

      const response = await axios.post('http://localhost:8000/api/wallet/verify', payload)
      setResult(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Không thể xác thực chữ ký')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2>Xác thực chữ ký</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Kiểm tra chữ ký có được tạo bởi chủ sở hữu địa chỉ hoặc khóa công khai nào đó hay không.
      </p>

      <div className="form-group">
        <label htmlFor="verifyMessage">Thông điệp gốc</label>
        <textarea
          id="verifyMessage"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập thông điệp ban đầu đã được ký"
        />
      </div>

      <div className="form-group">
        <label htmlFor="signature">Chữ ký</label>
        <input
          id="signature"
          type="text"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Nhập chữ ký (0x...)"
        />
      </div>

      <div className="form-group">
        <label>Phương thức xác thực</label>
        <div style={{ display: 'flex', gap: '15px', marginTop: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="radio"
              value="address"
              checked={verificationMethod === 'address'}
              onChange={(e) => setVerificationMethod(e.target.value)}
              style={{ marginRight: '8px' }}
            />
            Dùng địa chỉ
          </label>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="radio"
              value="publicKey"
              checked={verificationMethod === 'publicKey'}
              onChange={(e) => setVerificationMethod(e.target.value)}
              style={{ marginRight: '8px' }}
            />
            Dùng khóa công khai
          </label>
        </div>
      </div>

      {verificationMethod === 'address' ? (
        <div className="form-group">
          <label htmlFor="address">Địa chỉ</label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Nhập địa chỉ kỳ vọng (0x...)"
          />
        </div>
      ) : (
        <div className="form-group">
          <label htmlFor="publicKey">Khóa công khai</label>
          <input
            id="publicKey"
            type="text"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            placeholder="Nhập khóa công khai (0x...)"
          />
        </div>
      )}

      <button className="button" onClick={verifySignature} disabled={loading}>
        {loading ? 'Đang kiểm tra...' : 'Xác thực chữ ký'}
      </button>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {result && (
        <div className="result">
          <h3>Kết quả xác thực</h3>
          
          <div className={`alert ${result.valid ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '15px' }}>
            <strong>{result.valid ? '✓ Chữ ký HỢP LỆ' : '✗ Chữ ký KHÔNG HỢP LỆ'}</strong>
          </div>

          {result.address && (
            <div className="result-item" style={{ marginTop: '15px' }}>
              <label>Địa chỉ khôi phục</label>
              <code>{result.address}</code>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SignatureVerifier

