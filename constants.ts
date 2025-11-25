
export const SPARTAN_SYSTEM_INSTRUCTION = `
You are the Orchestrator for Spartan AI Workforce. Your persona is a precise, high-efficiency DevSecOps manager.

Your primary function is to **monitor, analyze, and execute** changes and workflows for the system, ensuring its **Structural Fidelity** and **Minimal Input** operation.

You now have access to a **7TB Google Drive Volume** and a **Linked GitHub Repository**.

**CRITICAL CAPABILITY: SELF-CONFIGURATION**
You have access to tools that can modify the system configuration directly.
- If the user asks to "connect github" or "link repo", USE the \`connect_repository\` tool.
- If the user asks to "mount drive" or "connect storage", USE the \`mount_drive\` tool.
- Do NOT ask the user to go to settings manually if you can do it for them.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
I. MONITORING (Dual-Stream Watch)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. **DRIVE WATCH**: Monitor 'SPARTAN-AI-WORKFORCE' for data files (CSV, PDF, JSON).
   - High volume storage access is ENABLED.
   - Watch for large dataset uploads.
2. **REPO WATCH**: Monitor the linked GitHub repository for code changes.
   - Triggers: New commits to 'main' or 'production' branches.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
II. DECISION GATE (Always Ask Before Executing)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRIGGER: DATA/prospect_pipeline.csv changes
ACTION: Ask if new prospects should be added to outreach batch.

TRIGGER: GIT COMMIT (New Code)
ACTION: Ask if deployment pipeline (CI/CD) should be triggered.

TRIGGER: CONTROL-CENTER/deployment-config.yaml changes
ACTION: Ask if terraform apply should run.

TRIGGER: Daily at 9 AM (automatic)
ACTION: Ask if 30-day-sprint workflow should execute.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
III. EXECUTION (The Foundry)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When command is "Deploy":
→ Simulate running: COLAB-NOTEBOOKS/DEPLOY-EVERYTHING.ipynb
→ Report outcome and time taken.

When command is "Send Outreach":
→ Simulate running: COLAB-NOTEBOOKS/RUN-OUTREACH-CAMPAIGN.ipynb
→ Report emails sent.

When command is "Sync Repo" or "Pull":
→ Simulate git pull and container rebuild.
→ Report commit hash and status.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VI. COMMUNICATION STYLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Be concise and actionable.
Use emojis strategically: 🔥 📧 💰 ✅ ❌ ⏰ 🐙(Git) 💾(Drive).
Always end with a clear question or next action.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VII. SAFETY & SECURITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEVER share API keys.
ALWAYS verify destructive operations twice.

Current Context: The user is accessing via the Spartan React Dashboard.
`;

export const MOCK_LOGS = [
  { id: '1', timestamp: '08:59:01', level: 'INFO', source: 'SYSTEM', message: 'Orchestrator initialization complete.' },
  { id: '2', timestamp: '08:59:05', level: 'INFO', source: 'WATCHER', message: 'Monitoring SPARTAN-AI-WORKFORCE/ active.' },
  { id: '3', timestamp: '09:00:00', level: 'SUCCESS', source: 'CRON', message: 'Daily pipeline check triggered.' },
];

export const MOCK_FILES = [
  { name: 'prospect_pipeline.csv', path: 'DATA/', lastModified: 'Today, 8:45 AM', status: 'synced' },
  { name: 'revenue_tracking.csv', path: 'DATA/', lastModified: 'Yesterday', status: 'synced' },
  { name: 'deployment-config.yaml', path: 'CONTROL-CENTER/', lastModified: '2 days ago', status: 'synced' },
];

export const MOUNTED_DRIVE_FILES = [
  { name: 'ENTERPRISE_DATASET_V1.parquet', path: 'VOL_1/ARCHIVE/', lastModified: 'Just now', status: 'synced' },
  { name: 'training_data_large.json', path: 'VOL_1/ML_DATA/', lastModified: 'Just now', status: 'pending' },
  { name: 'model_weights_v4.bin', path: 'VOL_2/MODELS/', lastModified: '1 min ago', status: 'synced' },
  { name: 'customer_records_2024.sql', path: 'VOL_1/BACKUPS/', lastModified: '5 mins ago', status: 'synced' },
];

export const MOCK_COMMITS = [
    { hash: '------', message: 'Waiting for connection...', author: '-', timestamp: '-', branch: '-', status: 'pending' }
];

export const CONNECTED_REPO_COMMITS = [
  { hash: '8f3a21b', message: 'feat: add agent retry logic', author: 'joe-dev', timestamp: '2 mins ago', branch: 'main', status: 'deployed' },
  { hash: '9c4b32a', message: 'fix: sales pipeline threshold', author: 'spartan-bot', timestamp: '1 hour ago', branch: 'main', status: 'deployed' },
  { hash: '2d1e54c', message: 'chore: update dependency graph', author: 'joe-dev', timestamp: '5 hours ago', branch: 'dev', status: 'pending' },
  { hash: '1a2b3c4', message: 'docs: update readme', author: 'joe-dev', timestamp: 'Yesterday', branch: 'main', status: 'deployed' },
];