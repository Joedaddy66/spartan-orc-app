
import React, { useState } from 'react';
import { IntegrationConfig } from '../types';
import { X, Save, Github, HardDrive, Check, Loader2, Lock, Eye, EyeOff } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: IntegrationConfig;
  setConfig: (config: IntegrationConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, setConfig }) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'drive' | 'github' | 'secrets'>('github');
  const [showSecrets, setShowSecrets] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API validation delay
    setTimeout(() => {
        const newConfig = { ...localConfig };
        if (newConfig.githubRepo.length > 5) newConfig.repoConnected = true;
        if (newConfig.drivePath.length > 2) newConfig.driveConnected = true;
        
        setConfig(newConfig);
        setIsSaving(false);
        onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-spartan-950 border border-spartan-800 rounded-lg w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-spartan-800 bg-spartan-950">
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <SettingsIcon activeTab={activeTab} />
            SYSTEM CONFIG
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-spartan-900 border-b border-spartan-800">
           <TabButton 
             id="github" 
             icon={<Github size={16} />} 
             label="REPO" 
             active={activeTab === 'github'} 
             onClick={() => setActiveTab('github')} 
           />
           <TabButton 
             id="drive" 
             icon={<HardDrive size={16} />} 
             label="DRIVE" 
             active={activeTab === 'drive'} 
             onClick={() => setActiveTab('drive')} 
           />
           <TabButton 
             id="secrets" 
             icon={<Lock size={16} />} 
             label="SECRETS" 
             active={activeTab === 'secrets'} 
             onClick={() => setActiveTab('secrets')} 
           />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 bg-spartan-950 min-h-[300px]">
            {activeTab === 'github' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                    <InputField 
                        label="Repository URL"
                        value={localConfig.githubRepo}
                        onChange={(val) => setLocalConfig({...localConfig, githubRepo: val})}
                        placeholder="https://github.com/username/repo"
                    />
                    <InputField 
                        label="Branch"
                        value={localConfig.githubBranch}
                        onChange={(val) => setLocalConfig({...localConfig, githubBranch: val})}
                    />
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-400 uppercase">Personal Access Token</label>
                        <input 
                            type="password" 
                            placeholder="ghp_xxxxxxxxxxxx"
                            className="w-full bg-spartan-900 border border-spartan-800 rounded p-2 text-sm text-white focus:border-spartan-500 outline-none placeholder-gray-700"
                        />
                    </div>
                </div>
            )}

            {activeTab === 'drive' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                    <div className="p-3 bg-spartan-900/50 border border-spartan-800 rounded flex items-center gap-3">
                         <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded flex items-center justify-center">
                            <HardDrive size={20} />
                         </div>
                         <div>
                             <div className="text-sm font-bold">Google Drive Enterprise</div>
                             <div className="text-xs text-gray-500">Mount external volumes</div>
                         </div>
                    </div>

                    <InputField 
                        label="Mount Path"
                        value={localConfig.drivePath}
                        onChange={(val) => setLocalConfig({...localConfig, drivePath: val})}
                        placeholder="/My Drive/SPARTAN-WORKFORCE/"
                    />

                    <div className="flex items-center justify-between p-3 bg-spartan-800/30 rounded border border-spartan-800/50">
                        <span className="text-xs text-gray-400">Total Capacity</span>
                        <span className="text-sm font-mono text-white">7.0 TB (MAX)</span>
                    </div>
                </div>
            )}

            {activeTab === 'secrets' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                     <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">Encrypted Vault (AES-256)</p>
                        <button 
                            onClick={() => setShowSecrets(!showSecrets)}
                            className="text-gray-500 hover:text-spartan-500 transition-colors"
                        >
                            {showSecrets ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                     </div>
                     
                     <InputField 
                        label="RAILWAY_TOKEN"
                        value={localConfig.railwayToken}
                        onChange={(val) => setLocalConfig({...localConfig, railwayToken: val})}
                        type={showSecrets ? "text" : "password"}
                        placeholder="rw_live_..."
                        icon={<Lock size={12} />}
                     />
                     <InputField 
                        label="GDRIVE_FOLDER_ID"
                        value={localConfig.driveFolderId}
                        onChange={(val) => setLocalConfig({...localConfig, driveFolderId: val})}
                        type={showSecrets ? "text" : "password"}
                        placeholder="1ABC-xyz..."
                        icon={<Lock size={12} />}
                     />
                     <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-400 uppercase flex items-center gap-2">
                            <Lock size={12} /> GDRIVE_SA_BASE64
                        </label>
                        <textarea 
                            value={localConfig.serviceAccountBase64}
                            onChange={(e) => setLocalConfig({...localConfig, serviceAccountBase64: e.target.value})}
                            placeholder="eyJh... (Base64 JSON)"
                            className="w-full h-20 bg-spartan-900 border border-spartan-800 rounded p-2 text-xs font-mono text-white focus:border-spartan-500 outline-none resize-none placeholder-gray-700 custom-scrollbar"
                        />
                     </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-spartan-800 bg-spartan-900 flex justify-between items-center">
            <div className="text-[10px] text-gray-600 font-mono">
                {activeTab === 'secrets' ? '🔒 SECURE ENVIRONMENT' : 'READY TO SYNC'}
            </div>
            <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-spartan-500 hover:bg-spartan-400 text-spartan-950 font-bold py-2 px-4 rounded flex items-center gap-2 transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? 'UPDATING...' : 'SAVE CONFIG'}
            </button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const TabButton: React.FC<{ id: string, icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex-1 p-3 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
            active 
            ? 'bg-spartan-950 text-spartan-500 border-b-2 border-spartan-500' 
            : 'bg-spartan-900 text-gray-500 hover:text-gray-300 hover:bg-spartan-800'
        }`}
    >
        {icon} {label}
    </button>
);

const InputField: React.FC<{ 
    label: string, 
    value: string, 
    onChange: (val: string) => void, 
    placeholder?: string, 
    type?: string,
    icon?: React.ReactNode
}> = ({ label, value, onChange, placeholder, type = "text", icon }) => (
    <div className="space-y-2">
        <label className="text-xs font-mono text-gray-400 uppercase flex items-center gap-2">
            {icon} {label}
        </label>
        <input 
            type={type} 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-spartan-900 border border-spartan-800 rounded p-2 text-sm text-white focus:border-spartan-500 outline-none transition-colors placeholder-gray-700"
        />
    </div>
);

const SettingsIcon: React.FC<{ activeTab: string }> = ({ activeTab }) => {
    if (activeTab === 'drive') return <HardDrive size={18} className="text-blue-400" />;
    if (activeTab === 'secrets') return <Lock size={18} className="text-spartan-accent" />;
    return <Github size={18} className="text-spartan-500" />;
}
