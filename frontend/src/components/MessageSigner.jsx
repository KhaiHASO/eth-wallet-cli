import React, { useState } from 'react'
import axios from 'axios'

function MessageSigner() {
  const [message, setMessage] = useState('Chuyển 5 ETH')
  const [privateKey, setPrivateKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const signMessage = async () => {
    if (!message.trim()) {
      setError('Vui lòng nhập thông điệp')
      return
    }
    if (!privateKey.trim()) {
      setError('Vui lòng nhập khóa riêng')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await axios.post('http://localhost:8000/api/wallet/sign', {
        message: message.trim(),
        private_key: privateKey.trim()
      })
      setResult(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Ký thông điệp thất bại')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Đã sao chép vào clipboard!')
  }

  return (
    <div className="card">
      <h2>Ký thông điệp</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Ký thông điệp bằng khóa riêng của bạn để chứng minh quyền sở hữu.
      </p>

      <div className="form-group">
        <label htmlFor="message">Thông điệp</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập thông điệp cần ký (ví dụ: Chuyển 5 ETH)"
        />
      </div>

      <div className="form-group">
        <label htmlFor="privateKey">Khóa riêng</label>
        <input
          id="privateKey"
          type="password"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          placeholder="Nhập khóa riêng của bạn (0x...)"
        />
      </div>

      <button className="button" onClick={signMessage} disabled={loading}>
        {loading ? 'Đang ký...' : 'Ký thông điệp'}
      </button>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {result && (
        <div className="result">
          <h3>Kết quả chữ ký</h3>
          
          <div className="result-item">
            <label>
              Thông điệp
              <button className="copy-button" onClick={() => copyToClipboard(result.message)}>
                Sao chép
              </button>
            </label>
            <code>{result.message}</code>
          </div>

          <div className="result-item">
            <label>
              Địa chỉ
              <button className="copy-button" onClick={() => copyToClipboard(result.address)}>
                Sao chép
              </button>
            </label>
            <code>{result.address}</code>
          </div>

          <div className="result-item">
            <label>
              Chữ ký
              <button className="copy-button" onClick={() => copyToClipboard(result.signature)}>
                Sao chép
              </button>
            </label>
            <code>{result.signature}</code>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageSigner

