
import React, { useState, useEffect } from 'react';
import { Terminal } from './components/Terminal';
import { MetricCard, PipelineChart, ResourceMonitor, AgentStatus, WiringOverlay } from './components/DashboardWidgets';
import { SettingsModal } from './components/SettingsModal';
import { Message, Metric, LogEntry, DriveFile, OrchestratorState, Commit, IntegrationConfig } from './types';
import { MOCK_LOGS, MOCK_FILES, MOCK_COMMITS, CONNECTED_REPO_COMMITS, MOUNTED_DRIVE_FILES } from './constants';
import { initializeGemini, sendMessageToOrchestrator, sendToolResponse } from './services/geminiService';
import { Shield, Bell, Settings, Play, RefreshCw, AlertTriangle, CloudLightning } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [orchestratorState, setOrchestratorState] = useState<OrchestratorState>(OrchestratorState.IDLE);
  const [files, setFiles] = useState<DriveFile[]>(MOCK_FILES);
  const [commits, setCommits] = useState<Commit[]>(MOCK_COMMITS);
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
  const [progress, setProgress] = useState(0); // For wiring/execution visualization
  const [currentWiringLog, setCurrentWiringLog] = useState("Initializing..."); // For Overlay
  
  // Configuration State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [config, setConfig] = useState<IntegrationConfig>({
      githubRepo: '',
      githubBranch: 'main',
      drivePath: '/My Drive/SPARTAN-AI-WORKFORCE/',
      driveConnected: false,
      repoConnected: false,
      railwayToken: '',
      driveFolderId: '',
      serviceAccountBase64: ''
  });

  const [metrics, setMetrics] = useState<Metric[]>([
    { label: 'Pipeline Value', value: '$650,000', change: 12, trend: 'up' },
    { label: 'Active Prospects', value: 42, change: 5, trend: 'up' },
    { label: 'Storage Used', value: '0.4 TB', change: 0, trend: 'neutral', unit: '/ 10 TB' },
    { label: 'Server Load', value: '12%', change: -2, trend: 'down', unit: 'CPU' },
  ]);

  // Initialization
  useEffect(() => {
    const init = async () => {
      const isReady = initializeGemini();
      if (isReady) {
         setOrchestratorState(OrchestratorState.ANALYZING);
         try {
           const result = await sendMessageToOrchestrator("Initialize Spartan Orchestrator. Report status and awaiting commands.");
           setMessages([{
             id: 'init',
             role: 'model',
             text: result.text || "Spartan Core Online.",
             timestamp: new Date()
           }]);
         } catch (e) {
           console.error("Failed initial contact");
         } finally {
           setOrchestratorState(OrchestratorState.IDLE);
         }
      } else {
        setMessages([{
          id: 'error-key',
          role: 'system',
          text: '⚠️ CRITICAL: API_KEY missing. Orchestrator functionality limited. Please check your environment configuration.',
          timestamp: new Date(),
          isError: true
        }]);
      }
    };
    init();
  }, []);

  // --- The Brain: Handle Messages & Function Calls ---
  const handleSendMessage = async (input: string) => {
    const lowerInput = input.toLowerCase();
    
    // 1. Add User Message
    const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        text: input,
        timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    // --- INTERCEPT: SMOKE TEST SIMULATION ---
    if (lowerInput.includes("smoke test") || lowerInput.includes("validate pipeline") || lowerInput.includes("deploy infra")) {
        setOrchestratorState(OrchestratorState.EXECUTING);
        
        // Initial Ack
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: "Initiating Deployment Smoke Test Protocol...",
            timestamp: new Date()
        }]);

        // Verify Secrets
        if (!config.railwayToken || !config.driveFolderId) {
             setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'system',
                    text: '❌ FAILED: Missing CI/CD Secrets. Please configure RAILWAY_TOKEN and GDRIVE_FOLDER_ID in Settings.',
                    timestamp: new Date(),
                    isError: true
                }]);
                setOrchestratorState(OrchestratorState.IDLE);
             }, 1000);
             return;
        }

        // Simulation Loop
        const steps = [
            { pct: 10, log: 'git checkout main', msg: 'Checking out source...' },
            { pct: 30, log: 'pnpm install', msg: 'Installing dependencies...' },
            { pct: 50, log: 'pnpm build', msg: 'Building artifacts...' },
            { pct: 70, log: 'railway up', msg: 'Pushing to Railway Edge...' },
            { pct: 90, log: 'healthcheck /health', msg: 'Verifying endpoints...' },
            { pct: 100, log: 'SUCCESS', msg: 'Pipeline Healthy.' },
        ];

        for (const step of steps) {
            setProgress(step.pct);
            await new Promise(r => setTimeout(r, 800)); // Delay per step
            
            // Log entry
            setLogs(prev => [{
                id: Date.now().toString(),
                timestamp: new Date().toLocaleTimeString(),
                level: step.pct === 100 ? 'SUCCESS' : 'INFO',
                source: 'CI/CD',
                message: step.log
            }, ...prev]);

            // Optional: visual feedback in terminal
            if (step.pct === 100) {
                 setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: "✅ Smoke Test Passed.\n• Build: Success\n• Deploy: Active\n• Health: 200 OK\n\nReady for production traffic.",
                    timestamp: new Date()
                }]);
            }
        }

        setOrchestratorState(OrchestratorState.IDLE);
        return;
    }

    setOrchestratorState(OrchestratorState.ANALYZING);

    try {
        // 2. Send to Gemini
        let result = await sendMessageToOrchestrator(input);
        
        // 3. Check for Tool Calls (The "Agent" functionality)
        const candidates = result.candidates;
        if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
             for (const part of candidates[0].content.parts) {
                 if (part.functionCall) {
                     const fc = part.functionCall;
                     
                     // Visualize "Wiring" state
                     setOrchestratorState(OrchestratorState.WIRING);
                     setProgress(0);
                     setCurrentWiringLog(`Processing request: ${fc.name}`);
                     
                     // Add a system message showing the action
                     setMessages(prev => [...prev, {
                         id: Date.now().toString(),
                         role: 'function',
                         text: `⚡ Executing Protocol: ${fc.name}...`,
                         timestamp: new Date()
                     }]);

                     let toolResult = {};

                     // Execute Logic based on tool name
                     if (fc.name === 'connect_repository') {
                         const args = fc.args as any;
                         
                         // Simulate the wiring delay with progress
                         for (let i = 0; i <= 100; i += 5) {
                            setProgress(i);
                            await new Promise(r => setTimeout(r, 150)); // Simulated work
                            
                            // Live Log updates for Overlay
                            if (i === 10) setCurrentWiringLog(`Resolving host: ${args.url}...`);
                            if (i === 30) setCurrentWiringLog('Handshake successful. Verifying keys...');
                            if (i === 60) setCurrentWiringLog('Fetching remote objects (delta compression)...');
                            if (i === 90) setCurrentWiringLog('Finalizing webhook configuration...');
                            
                            if (i === 20) setLogs(prev => [{ id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), level: 'INFO', source: 'GIT', message: `Resolving host: ${args.url}...` }, ...prev]);
                            if (i === 50) setLogs(prev => [{ id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), level: 'INFO', source: 'GIT', message: 'Handshake successful. Verified keys.' }, ...prev]);
                         }
                         
                         // Update App State
                         setConfig(prev => ({
                             ...prev,
                             githubRepo: args.url,
                             githubBranch: args.branch || 'main',
                             repoConnected: true
                         }));
                         
                         // INJECT MOCK DATA
                         setCommits(CONNECTED_REPO_COMMITS);
                         
                         toolResult = { status: 'success', message: `Repository ${args.url} linked successfully. Webhook established.` };
                         
                         // Log Success
                         setLogs(prev => [{
                             id: Date.now().toString(),
                             timestamp: new Date().toLocaleTimeString(),
                             level: 'SUCCESS',
                             source: 'AGENT',
                             message: `Linked Repo: ${args.url}`
                         }, ...prev.slice(0, 4)]);
                     } 
                     else if (fc.name === 'mount_drive') {
                         const args = fc.args as any;
                         
                         for (let i = 0; i <= 100; i += 5) {
                            setProgress(i);
                            await new Promise(r => setTimeout(r, 150));
                            
                            if (i === 10) setCurrentWiringLog(`Resolving storage path: ${args.path}...`);
                            if (i === 40) setCurrentWiringLog('Mounting volume (Type: High-IO)...');
                            if (i === 70) setCurrentWiringLog('Indexing 4,203 files...');
                            if (i === 95) setCurrentWiringLog('Sync complete.');

                            if (i === 20) setLogs(prev => [{ id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), level: 'INFO', source: 'DRIVE', message: `Mounting volume: ${args.path}` }, ...prev]);
                            if (i === 60) setLogs(prev => [{ id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), level: 'INFO', source: 'DRIVE', message: 'Indexing 4,203 files...' }, ...prev]);
                         }

                         setConfig(prev => ({
                             ...prev,
                             drivePath: args.path,
                             driveConnected: true
                         }));
                         
                         // INJECT MOCK DATA & UPDATE METRICS
                         setFiles(prev => [...prev, ...MOUNTED_DRIVE_FILES]);
                         setMetrics(prev => prev.map(m => 
                             m.label === 'Storage Used' ? { ...m, value: '7.1 TB', trend: 'up', change: 100 } : m
                         ));
                         
                         toolResult = { status: 'success', message: `Volume ${args.path} mounted. Capacity: 7TB. IOPS: High.` };
                         
                         setLogs(prev => [{ id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), level: 'SUCCESS', source: 'AGENT', message: `Mounted Volume: 7TB` }, ...prev]);
                     }

                     // 4. Send Tool Output back to Model
                     const followUp = await sendToolResponse(
                         'unused-in-sdk', 
                         fc.name,
                         toolResult
                     );
                     
                     setProgress(100);
                     // 5. Final Model Response
                     setMessages(prev => [...prev, {
                         id: (Date.now() + 1).toString(),
                         role: 'model',
                         text: followUp.text || "Action complete.",
                         timestamp: new Date()
                     }]);
                     
                     setOrchestratorState(OrchestratorState.IDLE);
                     return; 
                 }
             }
        }

        // Standard Text Response if no tool called
        setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: result.text || "Command executed.",
            timestamp: new Date()
        }]);

    } catch (err) {
        console.error(err);
        setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'system',
            text: '❌ Connection Error.',
            timestamp: new Date(),
            isError: true
        }]);
    } finally {
        setOrchestratorState(OrchestratorState.IDLE);
    }
  };

  const triggerSimulatedEvent = () => {
    const eventMsg = "System Alert: detected change in DATA/prospect_pipeline.csv. 3 new entries found.";
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', text: eventMsg, timestamp: new Date() }]);
    
    // Update file list visually
    const newFiles = [...files];
    if(newFiles.length > 0) {
        newFiles[0] = { ...newFiles[0], lastModified: 'Just now', status: 'changed' };
        setFiles(newFiles);
    }

    // Trigger AI response (Pass to handler)
    handleSendMessage(eventMsg);
  };

  return (
    <div className="min-h-screen bg-spartan-950 text-gray-200 font-sans flex flex-col">
      <WiringOverlay 
         isVisible={orchestratorState === OrchestratorState.WIRING}
         progress={progress}
         log={currentWiringLog}
      />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        config={config}
        setConfig={setConfig}
      />

      {/* Top Bar */}
      <header className="h-16 border-b border-spartan-800 bg-spartan-950/90 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-spartan-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Shield className="text-spartan-950" size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-white">SPARTAN<span className="text-spartan-500">.AI</span></h1>
            <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Workforce Orchestrator</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={triggerSimulatedEvent} className="hidden sm:flex px-3 py-1.5 border border-spartan-accent/50 text-spartan-accent text-xs font-mono rounded hover:bg-spartan-accent/10 items-center gap-2 transition-all">
            <AlertTriangle size={14} /> SIMULATE EVENT
          </button>
          <div className="w-px h-6 bg-spartan-800 mx-2 hidden sm:block"></div>
          <button className="text-gray-400 hover:text-white transition-colors relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-spartan-500 rounded-full animate-ping"></span>
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className={`text-gray-400 hover:text-white transition-colors ${!config.repoConnected ? 'animate-pulse text-spartan-accent' : ''}`}
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area - Responsive Scroll Fix */}
      {/* Mobile: h-auto allows page to grow, overflow-y-auto enables scrolling. pb-24 adds room for potential bottom nav or just aesthetics. */}
      {/* Desktop: h-screen minus header (calc) with hidden overflow on body, but scrolling internal panels. */}
      <main className="flex-1 p-4 lg:p-6 grid grid-cols-12 gap-6 h-auto min-h-screen lg:h-[calc(100vh-64px)] overflow-y-auto lg:overflow-hidden pb-24 lg:pb-0">
        
        {/* Left Column: Dashboard & Controls */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 lg:overflow-y-auto lg:pr-2 lg:pb-20 custom-scrollbar">
          
          <AgentStatus state={orchestratorState} progress={progress} />

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((m, i) => <MetricCard key={i} metric={m} />)}
          </div>

          {/* Charts */}
          <PipelineChart />

          {/* Resources (Files + Git) */}
          <ResourceMonitor 
             files={files} 
             commits={commits} 
             isRepoConnected={config.repoConnected}
          />

          {/* Manual Triggers - Desktop Only mostly or stacked */}
          <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={() => handleSendMessage("Run system diagnostics.")}
                className="p-3 bg-spartan-900 border border-spartan-800 rounded hover:border-spartan-500 hover:bg-spartan-800 transition-all text-left group"
            >
                <div className="flex items-center justify-between mb-1">
                    <RefreshCw size={18} className="text-spartan-500 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="text-[10px] text-gray-500 font-mono">IDLE</span>
                </div>
                <div className="text-sm font-semibold">System Check</div>
            </button>
            <button 
                onClick={() => handleSendMessage("Run deployment smoke test protocol.")}
                className="p-3 bg-spartan-900 border border-spartan-800 rounded hover:border-spartan-accent hover:bg-spartan-800 transition-all text-left group"
            >
                <div className="flex items-center justify-between mb-1">
                    <CloudLightning size={18} className="text-spartan-accent" />
                    <span className="text-[10px] text-gray-500 font-mono">REQ. SECRETS</span>
                </div>
                <div className="text-sm font-semibold">Deploy Infra</div>
            </button>
          </div>
        </div>

        {/* Right Column: Terminal & Orchestrator */}
        <div className="col-span-12 lg:col-span-8 flex flex-col h-[600px] lg:h-full pb-4">
          <Terminal 
            messages={messages} 
            orchestratorState={orchestratorState}
            onSendMessage={handleSendMessage}
            progress={progress}
          />
          
          {/* Mini Logs Footer */}
          <div className="mt-4 h-32 bg-black/50 border border-spartan-800/50 rounded p-2 overflow-hidden font-mono text-[10px] text-gray-500 hidden lg:block">
             <div className="flex justify-between border-b border-gray-800 pb-1 mb-1 px-2">
                <span>SYSTEM LOGS</span>
                <span>/var/log/spartan-orch.log</span>
             </div>
             <div className="space-y-1 px-2">
                 {logs.map((log) => (
                     <div key={log.id} className="flex gap-4">
                         <span className="text-gray-600">[{log.timestamp}]</span>
                         <span className={
                             log.level === 'SUCCESS' ? 'text-spartan-500' :
                             log.level === 'WARN' ? 'text-spartan-accent' :
                             log.level === 'INFO' ? 'text-blue-400' : 
                             log.level === 'ERROR' ? 'text-spartan-danger' : 'text-gray-400'
                         }>{log.level}</span>
                         <span className="text-gray-400">[{log.source}]</span>
                         <span className="text-gray-300">{log.message}</span>
                     </div>
                 ))}
             </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;
