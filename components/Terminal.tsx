
import React, { useEffect, useRef, useState } from 'react';
import { Message, OrchestratorState } from '../types';
import { Terminal as TerminalIcon, Cpu, Loader2, Send } from 'lucide-react';

interface TerminalProps {
  messages: Message[];
  orchestratorState: OrchestratorState;
  onSendMessage: (text: string) => void;
  progress?: number;
}

export const Terminal: React.FC<TerminalProps> = ({ 
  messages, 
  orchestratorState, 
  onSendMessage,
  progress = 0
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, orchestratorState, progress]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || orchestratorState === OrchestratorState.EXECUTING) return;
    
    onSendMessage(input);
    setInput('');
  };

  const isBusy = orchestratorState === OrchestratorState.ANALYZING || 
                 orchestratorState === OrchestratorState.EXECUTING || 
                 orchestratorState === OrchestratorState.WIRING;

  // Generate ASCII progress bar
  const getAsciiProgress = (val: number) => {
    const bars = 20;
    const filled = Math.round((val / 100) * bars);
    const empty = bars - filled;
    return `[${'█'.repeat(filled)}${'.'.repeat(empty)}] ${Math.round(val)}%`;
  };

  return (
    <div className="flex flex-col h-[60vh] lg:h-full bg-spartan-900 border border-spartan-800 rounded-lg overflow-hidden shadow-2xl">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-spartan-950 border-b border-spartan-800">
        <div className="flex items-center space-x-2 text-spartan-400">
          <TerminalIcon size={16} />
          <span className="text-xs font-mono font-bold tracking-wider">SPARTAN_CORE_V1.2</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`h-2 w-2 rounded-full ${orchestratorState === OrchestratorState.IDLE ? 'bg-spartan-500 animate-pulse' : 'bg-spartan-accent animate-pulse-slow'}`}></span>
          <span className="text-xs font-mono text-gray-400">{orchestratorState}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm custom-scrollbar">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] p-3 rounded-lg border ${
                msg.role === 'user' 
                  ? 'bg-spartan-800/50 border-spartan-500/30 text-emerald-50 rounded-br-none' 
                  : msg.role === 'function'
                    ? 'bg-blue-900/20 border-blue-500/30 text-blue-300 italic'
                    : msg.isError
                      ? 'bg-red-950/30 border-red-500/50 text-red-200'
                      : 'bg-spartan-950/80 border-spartan-800 text-spartan-400 rounded-bl-none shadow-inner'
              }`}
            >
              {msg.role === 'model' && (
                <div className="flex items-center space-x-2 mb-1 opacity-50 border-b border-spartan-800 pb-1">
                  <Cpu size={12} />
                  <span className="text-[10px] uppercase">Orchestrator</span>
                </div>
              )}
              {msg.role === 'function' && (
                <div className="flex items-center space-x-2 mb-1 opacity-50 border-b border-blue-800 pb-1">
                  <span className="text-[10px] uppercase">⚡ SYSTEM_TOOL_EXECUTION</span>
                </div>
              )}
              
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.text}
              </div>
              <div className="text-[10px] mt-2 opacity-30 text-right">
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isBusy && (
           <div className="flex justify-start">
             <div className="bg-spartan-950/80 border border-spartan-800 text-spartan-400 p-3 rounded-lg rounded-bl-none flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                   <Loader2 size={16} className={`animate-spin ${orchestratorState === OrchestratorState.WIRING ? 'text-blue-500' : 'text-spartan-500'}`} />
                   <span className={orchestratorState === OrchestratorState.WIRING ? 'text-blue-400 animate-pulse' : ''}>
                     {orchestratorState === OrchestratorState.WIRING ? 'Establishing secure uplink...' : 'Analyzing input parameters...'}
                   </span>
                </div>
                {(orchestratorState === OrchestratorState.WIRING || orchestratorState === OrchestratorState.EXECUTING) && (
                    <div className="text-[10px] font-mono text-gray-500 whitespace-pre">
                        {getAsciiProgress(progress)}
                    </div>
                )}
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-spartan-950 border-t border-spartan-800">
        <form onSubmit={handleSend} className="flex items-center space-x-3">
          <div className="text-spartan-500 font-mono text-lg">{'>'}</div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isBusy ? "Processing..." : "Enter command (e.g., 'Connect my github repo')..."}
            disabled={isBusy}
            className="flex-1 bg-transparent border-none outline-none text-gray-200 font-mono placeholder-gray-600 focus:ring-0"
            autoFocus
          />
          <button 
            type="button" 
            onClick={() => handleSend()}
            disabled={!input.trim() || isBusy}
            className={`p-2 rounded-md transition-colors ${
              !input.trim() || isBusy
                ? 'text-gray-700 cursor-not-allowed' 
                : 'text-spartan-500 hover:bg-spartan-900 hover:text-spartan-400'
            }`}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
