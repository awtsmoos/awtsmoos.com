
// B"H
/**
 * @file ui.js
 * @brief The Visual Forge for AI Manifestation - Version 4.0
 */

export const ManifestationUI = {
    getMainDialogHTML(folderName) {
        return `
            <div class="ai-manifest-container" style="color: white; display: flex; flex-direction: column; height: 75vh; min-width: 500px; font-family: 'Inter', sans-serif;">
                <div style="background: var(--neon-magenta); color: black; padding: 4px 10px; font-size: 10px; font-weight: bold; text-align: center; border-radius: 4px 4px 0 0; flex-shrink: 0;">
                    Vessel Version: 4.0 - B"H
                </div>
                <div class="ai-tabs" style="display:flex; border-bottom:1px solid var(--color-border); margin-bottom:15px; flex-shrink: 0; background: rgba(255,255,255,0.02);">
                    <button class="ai-tab active" data-view="input" style="padding:12px 20px; background:none; border:none; color:var(--neon-cyan); cursor:pointer; font-weight:bold; border-bottom:2px solid var(--neon-cyan);">Input XML</button>
                    <button class="ai-tab" data-view="history" style="padding:12px 20px; background:none; border:none; color:white; cursor:pointer;">History</button>
                </div>

                <div id="ai-view-input" style="display: flex; flex-direction: column; flex-grow: 1; overflow: hidden; padding: 0 10px;">
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <button id="download-context-btn" class="secondary-btn" style="flex:1;">Download Context</button>
                        <button id="copy-prompt-btn" class="secondary-btn" style="flex:1;">Copy Prompt</button>
                    </div>
                    <textarea id="ai-xml-response" placeholder="Paste <chan"+"ge> blocks here..." 
                        style="width: 100%; flex-grow: 1; background: #000; color: #a8ff00; border: 1px solid var(--color-border); font-family: var(--font-code); padding: 12px; border-radius: 8px; resize: none; outline: none; font-size: 13px;"
                    ></textarea>
                </div>

                <div id="ai-view-preview" style="display:none; flex-grow: 1; overflow: hidden; flex-direction: column; padding: 0 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0; padding: 10px; background: rgba(0,246,255,0.05); border-radius: 8px; border: 1px solid var(--neon-cyan);">
                        <h4 style="margin:0; color:var(--neon-lime); font-size: 14px;">Manifestation Plan</h4>
                        <span id="ai-preview-summary" style="font-size:12px; font-weight: bold; color: white;"></span>
                    </div>
                    <div id="ai-change-list" style="flex-grow: 1; overflow-y: auto; padding-right: 8px; display: flex; flex-direction: column; gap: 12px;">
                        <!-- Cards will manifest here -->
                    </div>
                </div>

                <div id="ai-view-history" style="display:none; flex-grow: 1; overflow-y:auto; padding: 10px;">
                    <div id="ai-history-list"></div>
                </div>
            </div>
        `;
    },

    getChangeItemHTML(change, index, rootPath) {
        const isDelete = change.operation === 'delete';
        const color = isDelete ? 'var(--color-accent-danger)' : 'var(--neon-lime)';
        const isEnabled = change.isEnabled !== false;
        
        // B"H - SUPER RELATIVE PATH CALCULATION
        let displayPath = change.path || "unknown";
        
        // If the path is a long absolute string (like in the screenshot), 
        // we strip everything until the 'js' or current folder name.
        if (displayPath.includes('/code/js/')) {
            displayPath = 'js/' + displayPath.split('/code/js/')[1];
        } else if (rootPath) {
            const root = rootPath.replace(/\/+$/, "");
            if (displayPath.startsWith(root)) {
                displayPath = displayPath.substring(root.length).replace(/^\/+/, "");
            }
        }
        
        const fileName = displayPath.split('/').pop();

        return `
            <div class="ai-change-card" style="
                background: ${isEnabled ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255,255,255,0.01)'}; 
                border: 1px solid ${isEnabled ? 'var(--color-border)' : '#222'}; 
                border-left: 5px solid ${isEnabled ? color : '#444'};
                border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px;
                ${!isEnabled ? 'opacity: 0.5;' : ''}
            ">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px; overflow: hidden;">
                        <input type="checkbox" class="ai-change-toggle" data-index="${index}" ${isEnabled ? 'checked' : ''} 
                            style="width: 20px; height: 20px; cursor: pointer; accent-color: var(--neon-cyan);">
                        <span style="font-weight: bold; color: #fff; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${fileName}
                        </span>
                    </div>
                    <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: ${color}; background: rgba(0,0,0,0.4); padding: 2px 8px; border-radius: 10px;">
                        ${change.operation}
                    </span>
                </div>
                <div style="font-family: var(--font-code); font-size: 11px; color: var(--neon-cyan); opacity: 0.8; word-break: break-all; padding-left: 32px;">
                    ${displayPath}
                </div>
                ${change.description && isEnabled ? `
                    <div style="font-size: 12px; line-height: 1.4; color: #bbb; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; border-top: 1px solid rgba(255,255,255,0.05);">
                        ${change.description}
                    </div>
                ` : ''}
            </div>
        `;
    },

    getHistoryItemHTML(entry) {
        return `<div style="background: rgba(255,255,255,0.05); padding:12px; border-radius:6px; margin-bottom:10px; border-left:3px solid var(--neon-cyan);">
            <div style="display:flex; justify-content:space-between; font-size:0.85em; margin-bottom:5px;">
                <span style="color:white; font-weight:bold;">${entry.timestamp}</span>
                <span style="color: var(--neon-lime);">${entry.count} changes</span>
            </div>
            <div style="font-family:var(--font-code); font-size:0.8em; color: white;">${entry.folder}</div>
        </div>`;
    }
};
