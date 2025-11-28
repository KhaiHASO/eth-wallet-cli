import './Tabs.css';
import type { ReactNode } from 'react';

export type TabKey = 'generate' | 'sign' | 'verify';

interface Tab {
  id: TabKey;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  tabs: Tab[];
}

export const Tabs = ({ active, onChange, tabs }: TabsProps) => (
  <nav className="tabs">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        onClick={() => onChange(tab.id)}
        className={active === tab.id ? 'active' : ''}
      >
        {tab.icon}
        {tab.label}
      </button>
    ))}
  </nav>
);

export default Tabs;

