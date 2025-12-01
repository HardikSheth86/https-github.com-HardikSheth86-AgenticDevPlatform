import React from 'react';

interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { id: string; label: string }[];
}

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className="flex gap-2 border-b border-slate-800 mb-4">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === tab.id
              ? 'text-blue-400'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400" />
          )}
        </button>
      ))}
    </div>
  );
};

export default Tabs;