import React, { useState } from 'react'
import './App.css'
import WalletGenerator from './components/WalletGenerator'
import MessageSigner from './components/MessageSigner'
import SignatureVerifier from './components/SignatureVerifier'

function App() {
  const [activeTab, setActiveTab] = useState('generate')

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔐 Ví Ethereum</h1>
        <p>Sinh khóa, ký thông điệp và xác thực chữ ký</p>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'generate' ? 'active' : ''}
          onClick={() => setActiveTab('generate')}
        >
          Tạo ví
        </button>
        <button
          className={activeTab === 'sign' ? 'active' : ''}
          onClick={() => setActiveTab('sign')}
        >
          Ký thông điệp
        </button>
        <button
          className={activeTab === 'verify' ? 'active' : ''}
          onClick={() => setActiveTab('verify')}
        >
          Xác thực chữ ký
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'generate' && <WalletGenerator />}
        {activeTab === 'sign' && <MessageSigner />}
        {activeTab === 'verify' && <SignatureVerifier />}
      </main>

      <footer className="app-footer">
        <p>Phục vụ bài lab Blockchain & Ứng dụng</p>
      </footer>
    </div>
  )
}

export default App

