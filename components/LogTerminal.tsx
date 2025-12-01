import React, { useEffect, useRef } from 'react';
import { AgentLog } from '../types';
import { Terminal } from 'lucide-react';

interface LogTerminalProps {
  logs: AgentLog[];
}

const LogTerminal: React.FC<LogTerminalProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex flex-col h-64 shadow-inner">
      <div className="bg-slate-900 p-2 border-b border-slate-800 flex items-center gap-2">
        <Terminal size={16} className="text-slate-400" />
        <span className="text-xs font-mono text-slate-400">Agent System Logs</span>
      </div>
      <div className="p-4 overflow-y-auto font-mono text-sm space-y-2 flex-1">
        {logs.length === 0 && (
          <div className="text-slate-600 italic">Waiting for system init...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2">
            <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span className={`font-bold uppercase text-xs w-24 ${
              log.type === 'error' ? 'text-red-500' :
              log.type === 'success' ? 'text-green-500' :
              'text-blue-400'
            }`}>
              {log.role}
            </span>
            <span className="text-slate-300">{log.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default LogTerminal;