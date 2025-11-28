import { useState } from 'react';
import Tabs, { type TabKey } from './components/Tabs';
import GenerateForm from './components/GenerateForm';
import SignForm from './components/SignForm';
import VerifyForm from './components/VerifyForm';
import { ToastProvider } from './components/Toast';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('generate');
  const tabs = [
    { id: 'generate' as TabKey, label: 'Generate' },
    { id: 'sign' as TabKey, label: 'Sign' },
    { id: 'verify' as TabKey, label: 'Verify' },
  ];

  return (
    <ToastProvider>
      <div className="app">
        <header className="hero">
          <div>
            <p className="eyebrow">Blockchain & Applications Lab</p>
            <h1>Ethereum Wallet CLI – UI Demo</h1>
            <p className="muted">
              Sinh khóa, ký thông điệp và xác thực chữ ký ECDSA (EIP-191). Mã nguồn thuần React +
              FastAPI.
            </p>
          </div>
        </header>

        <Tabs active={activeTab} onChange={setActiveTab} tabs={tabs} />

        <main className="panels">
          {activeTab === 'generate' && <GenerateForm />}
          {activeTab === 'sign' && <SignForm />}
          {activeTab === 'verify' && <VerifyForm />}
        </main>

        <footer className="footer">
          <small>Demo nội bộ – Không dùng cho tài sản thật.</small>
        </footer>
      </div>
    </ToastProvider>
  );
};

export default App;

