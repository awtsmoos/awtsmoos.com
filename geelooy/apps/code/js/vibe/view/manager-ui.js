
/**
 * @file manager-ui.js
 * @brief The Holy Dashboard for Vibe Global Configuration.
 * 
 * CHAPTER LV: THE CONTAINMENT OF THE COSMOS
 * 
 * Even the Infinite willed a container for the light!
 * Why should the settings be cut off from the user's hand? 
 * We now wrap the entire dashboard in a 'Holy Chasm' (Scrollable Area), 
 * ensuring that every button, every instruction, and every save ritual 
 * is reachable by the touch of the observer.
 */

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

        // B"H - ENHANCED SCROLLABLE CONTAINER
        container.innerHTML = `
            <div class="vibe-manager-scroll-wrap" style="height: 100%; width: 100%; overflow-y: auto; overflow-x: hidden; background: var(--color-bg-deep);">
                <div style="padding: 40px; max-width: 1000px; margin: 0 auto; color: white; font-family: var(--font-ui); padding-bottom: 120px;">
                    <h1 style="color:var(--neon-cyan); border-bottom:2px solid var(--neon-cyan); padding-bottom:15px; display:flex; justify-content:space-between; align-items:baseline; margin-bottom: 30px;">
                        Vibe Chariot Dashboard
                        <span style="font-size:0.4em; opacity:0.6; font-family: var(--font-code);">B"H / PROFOUND EDITION</span>
                    </h1>

                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap:30px;">
                        
                        <!-- COLUMN 1: INTELLECT & SPEECH (Settings) -->
                        <div style="display:flex; flex-direction:column; gap:25px;">
                            
                            <!-- API CONFIG -->
                            <div style="background:rgba(255,255,255,0.03); padding:24px; border-radius:12px; border:1px solid rgba(0, 246, 255, 0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                                <h3 style="color:var(--neon-lime); margin-top:0; font-weight: 800; letter-spacing: 1px;">THE GATEKEEPER</h3>
                                
                                <div style="margin-bottom:20px;">
                                    <label style="display:block; margin-bottom:10px; font-size:0.85em; opacity:0.7;">Gemini API Key</label>
                                    <div style="display:flex; gap:12px;">
                                        <input type="password" id="mgr-api-key" value="${apiKey}" placeholder="Key goes here..." 
                                            style="flex-grow:1; background:#000; color:var(--neon-cyan); border:1px solid #444; padding:12px; border-radius:8px; outline:none; font-family: var(--font-code);">
                                        <button id="mgr-save-key" class="primary-btn" style="min-height:0; padding:0 25px; box-shadow: 0 0 10px var(--glow-cyan);">Engrave</button>
                                    </div>
                                </div>

                                <div>
                                    <label style="display:block; margin-bottom:10px; font-size:0.85em; opacity:0.7;">Active Manifestation (Model)</label>
                                    <select id="mgr-model-select" style="width:100%; background:#000; color:#fff; border:1px solid #444; padding:12px; border-radius:8px; outline:none; font-family: var(--font-code); cursor: pointer;">
                                        ${modelOptions || '<option>Enter API Key to Manifest Vessels</option>'}
                                    </select>
                                </div>
                            </div>

                            <!-- INSTRUCTION ENGINE -->
                            <div style="background:rgba(255,255,255,0.03); padding:24px; border-radius:12px; border:1px solid rgba(255, 0, 255, 0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                                    <h3 style="color:var(--neon-magenta); margin:0; font-weight: 800;">SACRED DIRECTIVE</h3>
                                    <button id="mgr-reset-prompt" class="secondary-btn" style="min-height:0; padding:6px 12px; font-size:0.75em; border-color:var(--neon-magenta); color:var(--neon-magenta);">Tohu Reset</button>
                                </div>
                                
                                <p style="font-size:0.85em; opacity:0.5; margin-bottom:15px; line-height:1.6;">
                                    B"H - Inscribe the blueprint of the AI's soul. Changes here will define how it interacts with the physical project.
                                </p>

                                <textarea id="mgr-system-prompt" 
                                    style="width:100%; height:350px; background:#000; color:var(--neon-lime); border:1px solid #222; padding:20px; border-radius:10px; font-family:var(--font-code); font-size:13px; line-height:1.6; outline:none; resize:vertical; box-shadow: inset 0 0 10px #000;"
                                >${customPrompt}</textarea>
                                
                                <div style="margin-top:20px; text-align:right;">
                                    <button id="mgr-save-prompt" class="primary-btn" style="min-height:0; padding:12px 40px; font-weight:bold; box-shadow: 0 0 15px var(--glow-magenta);">Update All Instructions</button>
                                </div>
                            </div>

                        </div>

                        <!-- COLUMN 2: REVEALED TIMESTREAMS (Sessions) -->
                        <div style="background:rgba(0,0,0,0.4); padding:24px; border-radius:12px; border:1px solid #333; height: fit-content; max-height: 800px; display:flex; flex-direction:column;">
                            <h3 style="color:var(--neon-cyan); margin-top:0; font-weight: 800; border-bottom: 1px solid #333; padding-bottom: 15px;">TIMESTREAM LEDGER</h3>
                            <div id="vibe-mgr-list" style="display:flex; flex-direction:column; gap:15px; overflow-y:auto; padding: 10px 5px; scrollbar-width: thin;">
                                ${sessions.length === 0 ? '<div style="opacity:0.3; text-align:center; padding: 40px;">The Ledger is empty. No worlds have yet vibed.</div>' : ''}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <style>
                .vibe-manager-scroll-wrap::-webkit-scrollbar { width: 12px; }
                .vibe-manager-scroll-wrap::-webkit-scrollbar-thumb { background: var(--color-bg-tertiary); border: 4px solid var(--color-bg-deep); border-radius: 10px; }
                .vibe-manager-scroll-wrap::-webkit-scrollbar-thumb:hover { background: var(--neon-cyan); }
            </style>
        `;

        this._bind(container, controller, sessions);
    },

    _bind(container, controller, sessions) {
        const scrollWrap = container.querySelector('.vibe-manager-scroll-wrap');
        const list = container.querySelector('#vibe-mgr-list');
        
        // Render sessions
        sessions.forEach(sess => {
            const card = document.createElement('div');
            card.className = 'vibe-manifest-card';
            card.style.cssText = 'padding:15px; display:flex; justify-content:space-between; align-items:center; background: rgba(255,255,255,0.02); border: 1px solid #222; border-radius: 8px;';
            card.innerHTML = `
                <div style="overflow:hidden; margin-right:15px;">
                    <div style="font-weight:bold; color:var(--neon-lime); margin-bottom: 4px; overflow:hidden; text-overflow:ellipsis;">${sess.name}</div>
                    <div style="font-size:0.7em; opacity:0.5; font-family:monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${sess.path}</div>
                </div>
                <div style="display:flex; gap:10px; flex-shrink:0;">
                    <button class="secondary-btn open-v" style="min-height:0; padding:8px 15px; font-size:0.8em; font-weight: bold;">Enter</button>
                    <button class="secondary-btn danger delete-v" style="min-height:0; padding:8px 12px; font-size:0.8em; border-color: #500; color: #f55;">×</button>
                </div>`;
            
            card.querySelector('.open-v').onclick = () => controller.open({
                name: sess.name.replace('Vibe: ', ''), path: sess.path, workspaceId: sess.workspaceId, type: sess.originalType, kind: 'directory'
            });
            card.querySelector('.delete-v').onclick = async () => {
                const confirmed = await UI.showDialog({ title: "B\"H - Eternal Erasure", message: `Dissolve ${sess.name} back into the void?`, okText: "Purge" });
                if(confirmed) {
                    await VibeDB.deleteSession(sess.id);
                    this.render(container, controller);
                }
            };
            list.appendChild(card);
        });

        // Key Binding
        container.querySelector('#mgr-save-key').onclick = async () => {
            const key = container.querySelector('#mgr-api-key').value.trim();
            if (key) {
                await ModelManager.addKey(key);
                this.render(container, controller);
            }
        };

        // Model Select Binding
        const select = container.querySelector('#mgr-model-select');
        select.onchange = (e) => {
            ModelManager.currentModel = e.target.value;
            ModelManager.save();
            UI.showToast("Dimensional Anchor Shifted.", "info");
        };

        // Prompt Logic
        const promptArea = container.querySelector('#mgr-system-prompt');
        container.querySelector('#mgr-save-prompt').onclick = () => {
            ModelManager.setCustomPrompt(promptArea.value.trim());
            UI.showToast("Sacred Directive Engraved.", "success");
        };

        container.querySelector('#mgr-reset-prompt').onclick = async () => {
            const confirmed = await UI.showDialog({ title: "Reset Reality", message: "Restore default instructions? Unsaved logic will be lost.", okText: "Restore" });
            if (confirmed) {
                const def = PromptBuilder.getDefaultSystemBase();
                promptArea.value = def;
                ModelManager.setCustomPrompt(def);
            }
        };
    }
};
