// B"H
// FILE: js/features/ai-manifestation/ui.js

import { SystemPrompt } from './prompt.js';

export const ManifestationUI = {
    getMainDialogHTML(folderName) {
        return `
            <div class="ai-manifest-container" style="color: white;">
                <!-- Instructions Area -->
                <div class="ai-instructions" style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid var(--color-border); line-height: 1.5; font-size: 0.95em;">
                    <p style="margin-top: 0;">1. <strong>Download</strong> the .md context file for <span style="color: var(--neon-cyan); font-weight: bold;">${folderName}</span> and <strong>upload</strong> it to any AI assistant (ChatGPT, Claude, etc.).</p>
                    <p>2. <strong>Copy</strong> the prompt below and either set it as a <strong>System Prompt</strong> for that AI or paste it at the <strong>beginning</strong> of your first message.</p>
                    <p>3. In your AI's UI, <strong>tell it what changes you want</strong>. It will provide an <span style="color: var(--neon-lime);">XML code block</span>.</p>
                    <p style="margin-bottom: 0;">4. <strong>Copy</strong> that XML block and <strong>paste</strong> it into Step 3 below.</p>
                </div>

                <div class="ai-tabs" style="display:flex; border-bottom:1px solid var(--color-border); margin-bottom:15px;">
                    <button class="ai-tab active" data-view="input" style="padding:8px 15px; background:none; border:none; color:var(--neon-cyan); cursor:pointer; font-weight:bold; border-bottom:2px solid var(--neon-cyan);">Input</button>
                    <button class="ai-tab" data-view="history" style="padding:8px 15px; background:none; border:none; color:white; cursor:pointer;">Session History</button>
                </div>

                <!-- INPUT VIEW -->
                <div id="ai-view-input">
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        
                        <!-- Step 1 -->
                        <div class="ai-step">
                            <label style="font-weight: bold; color: var(--neon-cyan); display: block; margin-bottom: 5px;">Step 1: Get Context</label>
                            <button id="download-context-btn" class="secondary-btn" style="width: 100%; justify-content: center; color: white;">
                                <svg class="svg-icon" style="margin-right:8px;"><use href="#icon-download"></use></svg>
                                Download .md for '${folderName}'
                            </button>
                        </div>

                        <!-- Step 2 -->
                        <div class="ai-step">
                            <label style="font-weight: bold; color: var(--neon-cyan); display: block; margin-bottom: 5px;">Step 2: Copy Instructions</label>
                            <div style="position: relative;">
                                <textarea id="ai-system-prompt" readonly style="width: 100%; height: 60px; font-size: 0.85em; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--color-border); resize: none; padding: 8px;">${SystemPrompt.replace(/</g, '&lt;')}</textarea>
                                <button id="copy-prompt-btn" class="primary-btn" style="position: absolute; top: 5px; right: 5px; padding: 2px 12px; font-size: 0.8em; min-height: 24px;">Copy</button>
                            </div>
                        </div>
                        
                        <!-- Step 3 -->
                        <div class="ai-step">
                            <label style="font-weight: bold; color: var(--neon-lime); display: block; margin-bottom: 5px;">Step 3: Paste XML Response</label>
                            <textarea id="ai-xml-response" placeholder="Paste the <change> blocks here..." style="width: 100%; height: 150px; background: var(--color-bg-primary); color: white; border: 1px solid var(--color-border); font-family: var(--font-code); padding: 10px;"></textarea>
                        </div>
                    </div>
                </div>

                <!-- HISTORY VIEW -->
                <div id="ai-view-history" style="display:none; height:360px; overflow-y:auto;">
                    <div id="ai-history-list"></div>
                    <button id="ai-clear-history" class="secondary-btn danger" style="margin-top:10px; width:100%; color: white;">Clear History</button>
                </div>

                <!-- PREVIEW PANEL -->
                <div id="ai-view-preview" style="display:none;">
                    <h4 style="margin:0 0 10px 0; color:var(--neon-lime);">Manifestation Plan</h4>
                    <div id="ai-change-list" style="max-height: 250px; overflow-y: auto; background: rgba(0,0,0,0.4); border: 1px solid var(--color-border); padding: 5px; border-radius: 4px;"></div>
                    <div style="margin-top:10px; font-size:0.95em; color: white; font-weight: bold;" id="ai-preview-summary"></div>
                </div>
            </div>
        `;
    },

    getChangeItemHTML(change, rootPath) {
        const color = change.operation === 'delete' ? 'var(--color-accent-danger)' : 'var(--neon-lime)';
        
        // B"H - Calculate Relative Path for display
        // If change.path is "/BH/tests/wow1/scripts/init.js" and rootPath is "/BH/tests/wow1"
        // We want to show "scripts/init.js"
        let displayPath = change.path;
        if (displayPath.startsWith(rootPath)) {
            displayPath = displayPath.substring(rootPath.length);
            if (displayPath.startsWith('/')) displayPath = displayPath.substring(1);
        }
        
        const fileName = displayPath.split('/').pop();
        const dirName = displayPath.substring(0, displayPath.lastIndexOf('/')) || './';
        
        return `
            <div style="display:flex; align-items:center; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.02);">
                <span style="color:${color}; margin-right:12px; font-weight:bold; width: 70px; text-transform:uppercase; font-size:0.85em; letter-spacing: 1px;">${change.operation}</span>
                <div style="flex-grow:1; overflow:hidden;">
                    <div style="font-family:var(--font-code); color: white; font-weight: bold; font-size: 1em;">${fileName}</div>
                    <div style="font-size:0.8em; color: var(--neon-cyan); opacity: 0.8; font-family: var(--font-code);">${dirName}</div>
                    <div style="font-size:0.85em; color: white; font-style:italic; margin-top: 2px;">${change.description || 'No description'}</div>
                </div>
            </div>
        `;
    },

    getHistoryItemHTML(entry) {
        return `
            <div style="background: rgba(255,255,255,0.05); padding:12px; border-radius:6px; margin-bottom:10px; border-left:3px solid var(--neon-cyan);">
                <div style="display:flex; justify-content:space-between; font-size:0.85em; margin-bottom:5px;">
                    <span style="color:white; font-weight:bold;">${entry.timestamp}</span>
                    <span style="color: var(--neon-lime);">${entry.count} changes</span>
                </div>
                <div style="font-family:var(--font-code); font-size:0.8em; color: white;">${entry.folder}</div>
            </div>
        `;
    }
};