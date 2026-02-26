
// B"H
// FILE: js/features/ai-manifestation/ui.js

import { SystemPrompt } from './prompt.js';

export const ManifestationUI = {
    getMainDialogHTML(folderName) {
        return `
            <div class="ai-manifest-container" style="color: white;">
                <div class="ai-tabs" style="display:flex; border-bottom:1px solid var(--color-border); margin-bottom:15px;">
                    <button class="ai-tab active" data-view="input" style="padding:8px 15px; background:none; border:none; color:var(--neon-cyan); cursor:pointer; font-weight:bold; border-bottom:2px solid var(--neon-cyan);">Input</button>
                    <button class="ai-tab" data-view="history" style="padding:8px 15px; background:none; border:none; color:white; cursor:pointer;">Session History</button>
                </div>

                <!-- INPUT VIEW -->
                <div id="ai-view-input">
                    <div class="ai-instructions" style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; margin-bottom: 15px; font-size: 0.9em; border-left: 3px solid var(--neon-cyan);">
                        1. <b>Download</b> context. 2. <b>Copy</b> Prompt. 3. <b>Paste</b> XML below.
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <button id="download-context-btn" class="secondary-btn" style="flex:1;">
                            <svg class="svg-icon"><use href="#icon-download"></use></svg> Download .md
                        </button>
                        <button id="copy-prompt-btn" class="secondary-btn" style="flex:1;">
                            <svg class="svg-icon"><use href="#icon-copy"></use></svg> Copy Prompt
                        </button>
                        <textarea id="ai-system-prompt" style="display:none;">${SystemPrompt.replace(/</g, '&lt;')}</textarea>
                    </div>
                    
                    <textarea id="ai-xml-response" placeholder="Paste the <change> blocks here..." style="width: 100%; height: 200px; background: var(--color-bg-primary); color: white; border: 1px solid var(--color-border); font-family: var(--font-code); padding: 10px; border-radius: 6px;"></textarea>
                </div>

                <!-- HISTORY VIEW -->
                <div id="ai-view-history" style="display:none; height:360px; overflow-y:auto;">
                    <div id="ai-history-list"></div>
                    <button id="ai-clear-history" class="secondary-btn danger" style="margin-top:10px; width:100%; color: white;">Clear History</button>
                </div>

                <!-- PREVIEW PANEL -->
                <div id="ai-view-preview" style="display:none;">
                    <h4 style="margin:0 0 10px 0; color:var(--neon-lime);">Manifestation Plan</h4>
                    <div id="ai-change-list" style="max-height: 300px; overflow-y: auto; background: rgba(0,0,0,0.4); border: 1px solid var(--color-border); padding: 5px; border-radius: 4px;"></div>
                    <div style="margin-top:10px; font-size:0.95em; color: white; font-weight: bold;" id="ai-preview-summary"></div>
                </div>
            </div>
        `;
    },

    getChangeItemHTML(change, rootPath) {
        const color = change.operation === 'delete' ? 'var(--color-accent-danger)' : 'var(--neon-lime)';
        
        // B"H - RELATIVE PATH CALCULATION
        let displayPath = change.path;
        if (rootPath && displayPath.startsWith(rootPath)) {
            displayPath = displayPath.substring(rootPath.length);
            if (displayPath.startsWith('/')) displayPath = displayPath.substring(1);
        }

        return `
            <div style="display:flex; align-items:center; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.02);">
                <span style="color:${color}; margin-right:12px; font-weight:bold; width: 50px; text-transform:uppercase; font-size:0.85em; letter-spacing: 1px;">${change.operation}</span>
                <div style="flex-grow:1; overflow:hidden;">
                    <div style="font-family:var(--font-code); color: white; font-weight: bold; font-size: 0.95em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${change.path}">
                        ${displayPath}
                    </div>
                    ${change.description ? `<div style="font-size:0.85em; color: var(--color-text-tertiary); font-style:italic; margin-top: 2px;">${change.description}</div>` : ''}
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
