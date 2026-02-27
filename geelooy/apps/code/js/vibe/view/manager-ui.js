
// B"H
// FILE: js/vibe/view/manager-ui.js
import { VibeDB } from '../db.js';
import { ModelManager } from '../model-manager.js';
import { UI } from '../../ui.js';
import { PromptBuilder } from '../modules/prompt-builder.js';

export const VibeManagerUI = {
    async render(container, controller) {
        const sessions = await VibeDB.getAllSessions();
        const apiKey = ModelManager.getKey() || "";
        const customPrompt = ModelManager.getCustomPrompt() || PromptBuilder.getDefaultSystemBase();
        
        const models = ModelManager.availableModels;
        const modelOptions = models.map(m => 
            `<option value="${m.id}" ${m.id === ModelManager.currentModel ? 'selected' : ''}>${m.displayName}</option>`
        ).join('');

        container.innerHTML = `
            <div style="padding:40px; max-width:1000px; margin:0 auto; color:white; font-family:var(--font-ui); padding-bottom: 100px;">
                <h1 style="color:var(--neon-cyan); border-bottom:2px solid var(--neon-cyan); padding-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                    Vibe Chariot Dashboard
                    <span style="font-size:0.4em; opacity:0.6;">B"H</span>
                </h1>

                <div style="display:grid; grid-template-columns: 1.2fr 0.8fr; gap:30px; margin-top:30px;">
                    
                    <!-- LEFT COLUMN: CONFIGURATION -->
                    <div style="display:flex; flex-direction:column; gap:25px;">
                        
                        <!-- GENERAL SETTINGS -->
                        <div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:12px; border:1px solid var(--color-border);">
                            <h3 style="color:var(--neon-lime); margin-top:0;">Configuration</h3>
                            
                            <div style="margin-bottom:20px;">
                                <label style="display:block; margin-bottom:8px; font-size:0.9em; opacity:0.8;">Gemini API Key</label>
                                <div style="display:flex; gap:10px;">
                                    <input type="password" id="mgr-api-key" value="${apiKey}" placeholder="ghp_..." 
                                        style="flex-grow:1; background:#000; color:#fff; border:1px solid #444; padding:10px; border-radius:6px; outline:none;">
                                    <button id="mgr-save-key" class="primary-btn" style="min-height:0; padding:0 20px;">Save</button>
                                </div>
                            </div>

                            <div style="margin-bottom:10px;">
                                <label style="display:block; margin-bottom:8px; font-size:0.9em; opacity:0.8;">Active Manifestation (Model)</label>
                                <select id="mgr-model-select" style="width:100%; background:#000; color:#fff; border:1px solid #444; padding:10px; border-radius:6px; outline:none;">
                                    ${modelOptions || '<option>Enter API Key first</option>'}
                                </select>
                            </div>
                        </div>

                        <!-- SYSTEM PROMPT EDITOR -->
                        <div style="background:rgba(255,255,255,0.05); padding:20px; border-radius:12px; border:1px solid var(--color-border);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                                <h3 style="color:var(--neon-magenta); margin:0;">System Instruction</h3>
                                <button id="mgr-reset-prompt" class="secondary-btn" style="min-height:0; padding:4px 10px; font-size:0.8em; border-color:var(--neon-magenta); color:var(--neon-magenta);">Reset to Default</button>
                            </div>
                            
                            <p style="font-size:0.85em; opacity:0.6; margin-bottom:10px; line-height:1.4;">
                                Define the base soul of the AI. Ensure it understands the <strong>&lt;change&gt;</strong> directives and the <strong>₪₪₪</strong> Hebrew markers for manifestation to work.
                            </p>

                            <textarea id="mgr-system-prompt" 
                                style="width:100%; height:300px; background:#000; color:var(--neon-lime); border:1px solid #333; padding:15px; border-radius:8px; font-family:var(--font-code); font-size:0.9em; line-height:1.5; outline:none; resize:vertical;"
                            >${customPrompt}</textarea>
                            
                            <div style="margin-top:15px; text-align:right;">
                                <button id="mgr-save-prompt" class="primary-btn" style="min-height:0; padding:10px 30px;">Update Instruction</button>
                            </div>
                        </div>

                    </div>

                    <!-- RIGHT COLUMN: SESSIONS -->
                    <div style="background:rgba(255,255,255,0.02); padding:20px; border-radius:12px; border:1px solid #222; align-self:start;">
                        <h3 style="color:var(--neon-cyan); margin-top:0;">Active Timestreams</h3>
                        <div id="vibe-mgr-list" style="display:flex; flex-direction:column; gap:12px; max-height:600px; overflow-y:auto; padding-right:10px;">
                            ${sessions.length === 0 ? '<p style="opacity:0.4; text-align:center;">No sessions found.</p>' : ''}
                        </div>
                    </div>

                </div>
            </div>
        `;

        // --- BINDINGS: SESSIONS ---
        const list = container.querySelector('#vibe-mgr-list');
        sessions.forEach(sess => {
            const card = document.createElement('div');
            card.className = 'vibe-manifest-card';
            card.style.padding = '12px';
            card.style.display = 'flex';
            card.style.justifyContent = 'space-between';
            card.style.alignItems = 'center';
            card.innerHTML = `
                <div style="overflow:hidden; margin-right:10px;">
                    <div style="font-weight:bold; color:var(--neon-lime); white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${sess.name}</div>
                    <div style="font-size:0.75em; opacity:0.5; font-family:monospace; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${sess.path}</div>
                </div>
                <div style="display:flex; gap:8px; flex-shrink:0;">
                    <button class="secondary-btn open-v" style="min-height:0; padding:6px 12px; font-size:0.85em;">Enter</button>
                    <button class="secondary-btn danger delete-v" style="min-height:0; padding:6px 12px; font-size:0.85em;">×</button>
                </div>`;
            
            card.querySelector('.open-v').onclick = () => controller.open({
                name: sess.name.replace('Vibe: ', ''), path: sess.path, workspaceId: sess.workspaceId, type: sess.originalType, kind: 'directory'
            });
            card.querySelector('.delete-v').onclick = async () => {
                if(await UI.showDialog({ title: "Purge Timestream", message: "This session will be lost forever. Continue?", okText: "Purge" })) {
                    await VibeDB.deleteSession(sess.id);
                    this.render(container, controller);
                }
            };
            list.appendChild(card);
        });

        // --- BINDINGS: CONFIG ---
        container.querySelector('#mgr-save-key').onclick = async () => {
            const newKey = container.querySelector('#mgr-api-key').value.trim();
            if (newKey) {
                await ModelManager.addKey(newKey);
                this.render(container, controller);
            }
        };

        container.querySelector('#mgr-model-select').onchange = (e) => {
            ModelManager.currentModel = e.target.value;
            ModelManager.save();
            UI.showToast("Model selection updated.", "info");
        };

        // --- BINDINGS: PROMPT ---
        const promptArea = container.querySelector('#mgr-system-prompt');
        container.querySelector('#mgr-save-prompt').onclick = () => {
            const newPrompt = promptArea.value.trim();
            if (newPrompt) {
                ModelManager.setCustomPrompt(newPrompt);
                UI.showToast("System Instruction Manifested.", "success");
            }
        };

        container.querySelector('#mgr-reset-prompt').onclick = async () => {
            const confirmed = await UI.showDialog({ 
                title: "Reset Instruction", 
                message: "Restore the original System Prompt instructions? Current changes will be overwritten.", 
                okText: "Restore" 
            });
            if (confirmed) {
                const defaultPrompt = PromptBuilder.getDefaultSystemBase();
                promptArea.value = defaultPrompt;
                ModelManager.setCustomPrompt(defaultPrompt);
                UI.showToast("Default state restored.", "info");
            }
        };
    }
};
