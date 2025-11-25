
import React, { useState, useEffect, useRef } from 'react';
import { Metric, DriveFile, Commit, OrchestratorState } from '../types';
import { TrendingUp, TrendingDown, Minus, HardDrive, FileText, Activity, GitBranch, GitCommit, CheckCircle, Clock, Zap, Cpu, Terminal, ShieldCheck, Lock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- Metric Card ---
export const MetricCard: React.FC<{ metric: Metric }> = ({ metric }) => {
  return (
    <div className="bg-spartan-900 border border-spartan-800 p-4 rounded-lg flex flex-col justify-between hover:border-spartan-500/50 transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">{metric.label}</span>
        {metric.trend === 'up' && <TrendingUp size={16} className="text-spartan-400" />}
        {metric.trend === 'down' && <TrendingDown size={16} className="text-spartan-danger" />}
        {metric.trend === 'neutral' && <Minus size={16} className="text-gray-500" />}
      </div>
      <div className="flex items-baseline space-x-1">
        <span className="text-2xl font-bold font-mono text-white group-hover:text-spartan-400 transition-colors">
          {metric.value}
        </span>
        {metric.unit && <span className="text-xs text-gray-500">{metric.unit}</span>}
      </div>
      <div className={`text-xs mt-2 ${metric.change >= 0 ? 'text-spartan-500' : 'text-spartan-danger'}`}>
        {metric.change > 0 ? '+' : ''}{metric.change}% vs last week
      </div>
    </div>
  );
};

// --- Pipeline Chart ---
const data = [
  { name: 'Mon', prospects: 4, value: 2400 },
  { name: 'Tue', prospects: 3, value: 1398 },
  { name: 'Wed', prospects: 9, value: 9800 },
  { name: 'Thu', prospects: 6, value: 3908 },
  { name: 'Fri', prospects: 5, value: 4800 },
  { name: 'Sat', prospects: 2, value: 3800 },
  { name: 'Sun', prospects: 1, value: 4300 },
  { name: 'Sun', prospects: 1, value: 4300 },
];

export const PipelineChart: React.FC = () => {
  return (
    <div className="bg-spartan-900 border border-spartan-800 p-4 rounded-lg flex flex-col h-64">
      <h3 className="text-xs font-mono uppercase text-gray-400 mb-4 flex items-center gap-2">
        <Activity size={14} /> Pipeline Activity
      </h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
              itemStyle={{ color: '#34d399' }}
              cursor={{fill: '#1e293b'}}
            />
            <Bar dataKey="value" fill="#34d399" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 2 ? '#f59e0b' : '#34d399'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- Agent Status Widget ---
export const AgentStatus: React.FC<{ state: OrchestratorState; progress: number }> = ({ state, progress }) => {
  const isWiring = state === OrchestratorState.WIRING;
  const isThinking = state === OrchestratorState.ANALYZING;
  const isExecuting = state === OrchestratorState.EXECUTING;
  const isStress = state === OrchestratorState.STRESS_TEST;

  const showProgress = isWiring || isExecuting || isStress;

  // Visual Styles based on State
  let ringColor = 'border-spartan-500';
  let shadow = 'shadow-[0_0_10px_rgba(16,185,129,0.2)]';
  let iconColor = 'text-spartan-500';
  let statusColor = 'text-spartan-500';
  let statusText = state === OrchestratorState.IDLE ? 'ONLINE' : state;

  if (isWiring) {
    ringColor = 'border-blue-500';
    shadow = 'shadow-[0_0_15px_rgba(59,130,246,0.5)]';
    iconColor = 'text-blue-400';
    statusColor = 'text-blue-400 animate-pulse';
  } else if (isThinking) {
    ringColor = 'border-spartan-accent';
    shadow = 'shadow-[0_0_15px_rgba(245,158,11,0.3)]';
    iconColor = 'text-spartan-accent';
    statusColor = 'text-spartan-accent';
  } else if (isStress) {
    ringColor = 'border-orange-500';
    shadow = 'shadow-[0_0_20px_rgba(249,115,22,0.6)]';
    iconColor = 'text-orange-500';
    statusColor = 'text-orange-500 animate-pulse';
    statusText = 'HIGH LOAD EVENT';
  }

  return (
    <div className="bg-spartan-900 border border-spartan-800 p-4 rounded-lg flex flex-col justify-center relative overflow-hidden min-h-[100px] transition-all duration-300">
      {/* Background Pulse Effect */}
      <div className={`absolute inset-0 bg-spartan-500/5 ${isWiring ? 'animate-pulse' : 'hidden'}`}></div>
      <div className={`absolute inset-0 bg-orange-500/10 ${isStress ? 'animate-pulse' : 'hidden'}`}></div>
      
      <div className="flex items-center justify-between z-10 w-full">
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${ringColor} ${shadow}`}>
                {isStress ? (
                    <AlertTriangle size={24} className={`transition-colors duration-300 ${iconColor} animate-bounce`} />
                ) : (
                    <Cpu size={24} className={`transition-colors duration-300 ${iconColor}`} />
                )}
            </div>
            <div>
            <h3 className="text-sm font-bold text-white tracking-wide">SPARTAN AGENT</h3>
            <p className="text-[10px] text-gray-400 font-mono uppercase flex items-center gap-2">
                STATUS: 
                <span className={`font-bold ${statusColor}`}>
                {statusText}
                </span>
            </p>
            </div>
        </div>

        <div className="z-10">
            {isWiring && <Zap size={20} className="text-blue-400 animate-bounce" />}
            {isStress && <Activity size={20} className="text-orange-500 animate-spin" />}
        </div>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="mt-4 w-full z-10 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                <span>
                    {isWiring ? 'WIRING INFRASTRUCTURE...' : 
                     isStress ? 'PROCESSING BATCH JOBS...' : 'EXECUTING WORKFLOW...'}
                </span>
                <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-spartan-950 rounded-full overflow-hidden border border-spartan-800">
                <div 
                    className={`h-full transition-all duration-100 ease-out ${
                        isWiring ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 
                        isStress ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-spartan-500'
                    }`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
      )}
    </div>
  );
};

// --- Resource Monitor (Tabs for Drive/Repo) ---
interface ResourceMonitorProps {
  files: DriveFile[];
  commits: Commit[];
  isRepoConnected: boolean;
}

export const ResourceMonitor: React.FC<ResourceMonitorProps> = ({ files, commits, isRepoConnected }) => {
  const [activeTab, setActiveTab] = useState<'drive' | 'repo'>('drive');

  return (
    <div className="bg-spartan-900 border border-spartan-800 rounded-lg overflow-hidden flex flex-col h-64 transition-all duration-500">
      <div className="flex border-b border-spartan-800 bg-spartan-950">
        <button 
          onClick={() => setActiveTab('drive')}
          className={`flex-1 p-3 text-xs font-mono uppercase flex items-center justify-center gap-2 transition-colors ${activeTab === 'drive' ? 'text-spartan-400 bg-spartan-900' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <HardDrive size={14} /> Drive Watch
        </button>
        <div className="w-px bg-spartan-800"></div>
        <button 
          onClick={() => setActiveTab('repo')}
          className={`flex-1 p-3 text-xs font-mono uppercase flex items-center justify-center gap-2 transition-colors ${activeTab === 'repo' ? 'text-spartan-400 bg-spartan-900' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <GitBranch size={14} /> Repo Monitor
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {activeTab === 'drive' ? (
          <div className="space-y-1">
             <div className="flex justify-between items-center px-2 py-1 mb-2">
                <span className="text-[10px] text-gray-500">VOLUME: SPARTAN-WORKFORCE</span>
                <span className="text-[10px] text-spartan-500 animate-pulse">● SYNC ACTIVE</span>
             </div>
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 hover:bg-spartan-800/50 rounded group cursor-pointer transition-colors border border-transparent hover:border-spartan-800">
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-gray-500 group-hover:text-spartan-400" />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-200 font-mono">{file.name}</span>
                    <span className="text-[10px] text-gray-600">{file.path}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] ${
                    file.status === 'changed' ? 'text-spartan-accent' : 'text-spartan-500'
                  }`}>
                    {file.status === 'changed' ? 'MODIFIED' : 'SYNCED'}
                  </span>
                  <span className="text-[9px] text-gray-600">{file.lastModified}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {!isRepoConnected ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
                <GitBranch size={24} className="opacity-50" />
                <span className="text-xs">No Repository Linked</span>
                <span className="text-[10px] text-gray-600">Tip: Ask Agent to "Connect Repo"</span>
              </div>
            ) : (
              <>
               <div className="flex justify-between items-center px-2 py-1 mb-2">
                <span className="text-[10px] text-gray-500">BRANCH: MAIN</span>
                <span className="text-[10px] text-spartan-500">● CONNECTED</span>
               </div>
               {commits.map((commit, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 hover:bg-spartan-800/50 rounded group cursor-pointer transition-colors border border-transparent hover:border-spartan-800">
                    <div className="flex items-center gap-3">
                      <GitCommit size={16} className="text-spartan-accent group-hover:text-spartan-400" />
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-200 font-mono">{commit.message}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500">{commit.hash}</span>
                            <span className="text-[10px] text-gray-600">• {commit.author}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                       {commit.status === 'deployed' ? (
                           <span className="flex items-center gap-1 text-[10px] text-spartan-500"><CheckCircle size={10}/> DEPLOYED</span>
                       ) : (
                           <span className="flex items-center gap-1 text-[10px] text-spartan-accent"><Clock size={10}/> PENDING</span>
                       )}
                      <span className="text-[9px] text-gray-600">{commit.timestamp}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Wiring Overlay ---
interface WiringOverlayProps {
    isVisible: boolean;
    progress: number;
    log: string; // The latest log line to show
}

export const WiringOverlay: React.FC<WiringOverlayProps> = ({ isVisible, progress, log }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center flex-col p-8 transition-opacity duration-300 animate-in fade-in">
             <div className="w-full max-w-lg space-y-8">
                 {/* Icon / Header */}
                 <div className="flex flex-col items-center space-y-4">
                     <div className="relative">
                         <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
                         <Cpu size={64} className="text-blue-400 relative z-10 animate-bounce" />
                     </div>
                     <div className="text-center">
                         <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Agent Active</h2>
                         <p className="text-blue-400 font-mono text-sm animate-pulse">ESTABLISHING SECURE UPLINK...</p>
                     </div>
                 </div>

                 {/* Progress Bar */}
                 <div className="space-y-2">
                     <div className="flex justify-between text-xs font-mono text-gray-400">
                         <span>PROGRESS</span>
                         <span>{Math.round(progress)}%</span>
                     </div>
                     <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                         <div 
                             className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] transition-all duration-100 ease-out"
                             style={{ width: `${progress}%` }}
                         />
                     </div>
                 </div>

                 {/* Terminal Log Stream */}
                 <div className="bg-black border border-gray-800 rounded p-4 font-mono text-xs text-gray-300 h-32 overflow-hidden relative shadow-2xl">
                     <div className="absolute top-2 right-2 flex space-x-1">
                         <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                         <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                         <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                     </div>
                     <div className="space-y-1 opacity-80">
                         <div className="text-gray-500">{'>'} system_check --force</div>
                         <div className="text-gray-500">{'>'} mount_volume --path /vol_1</div>
                         <div className="text-blue-400">{'>'} {log}</div>
                         <div className="animate-pulse">_</div>
                     </div>
                 </div>
                 
                 <div className="text-center">
                    <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                        SECURE CONNECTION // ENCRYPTED // SPARTAN_PROTOCOL_V4
                    </span>
                 </div>
             </div>
        </div>
    )
}
