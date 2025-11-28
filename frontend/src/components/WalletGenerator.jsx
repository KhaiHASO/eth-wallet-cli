import React, { useState } from 'react'
import axios from 'axios'

function WalletGenerator() {
  const [loading, setLoading] = useState(false)
  const [wallet, setWallet] = useState(null)
  const [error, setError] = useState(null)

  const generateWallet = async () => {
    setLoading(true)
    setError(null)
    setWallet(null)

    try {
      const response = await axios.post('http://localhost:8000/api/wallet/generate')
      setWallet(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Tạo ví thất bại')
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
      <h2>Tạo ví mới</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Sinh khóa riêng, khóa công khai và địa chỉ cho ví Ethereum mới.
      </p>

      <button className="button" onClick={generateWallet} disabled={loading}>
        {loading ? 'Đang tạo...' : 'Tạo ví'}
      </button>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {wallet && (
        <div className="result">
          <h3>Thông tin ví mới</h3>
          
          <div className="result-item">
            <label>
              Khóa riêng
              <button className="copy-button" onClick={() => copyToClipboard(wallet.private_key)}>
                Sao chép
              </button>
            </label>
            <code>{wallet.private_key}</code>
          </div>

          <div className="result-item">
            <label>
              Khóa công khai
              <button className="copy-button" onClick={() => copyToClipboard(wallet.public_key)}>
                Sao chép
              </button>
            </label>
            <code>{wallet.public_key}</code>
          </div>

          <div className="result-item">
            <label>
              Địa chỉ
              <button className="copy-button" onClick={() => copyToClipboard(wallet.address)}>
                Sao chép
              </button>
            </label>
            <code>{wallet.address}</code>
          </div>

          <div className="warning-box">
            <strong>⚠️ Cảnh báo bảo mật</strong>
            Hãy giữ khóa riêng an toàn và không chia sẻ cho bất kỳ ai!
            Bất cứ ai có khóa riêng đều có thể kiểm soát ví của bạn.
          </div>
        </div>
      )}
    </div>
  )
}

export default WalletGenerator

