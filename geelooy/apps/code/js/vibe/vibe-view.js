// B"H
// FILE: js/vibe/vibe-view.js

import { State } from '../state.js';
import { ModelManager } from './model-manager.js';
import { WorkspaceTreeRenderer } from '../workspaces/tree-rendering.js';

export const VibeView = {
    container: null,
    
    init() {
        this.container = document.getElementById('vibe-editor-wrapper');
    },

    async render(tab, controller) {
        if (!this.container) this.init();
        
        const session = tab.vibeSession;
        if (!session) return; 

        const isSameTab = this.container.dataset.tabId === String(tab.id);

        if (!isSameTab) {
            this.container.dataset.tabId = tab.id;
            
            this.container.innerHTML = `
                <div class="vibe-container">
                    <div class="vibe-chat-panel">
                        <div class="vibe-chat-history" id="vibe-chat-history"></div>
                        <div class="vibe-input-area">
                            <div class="vibe-input-wrapper">
                                <textarea id="vibe-input" class="vibe-textarea" placeholder="Speak your will to the engine..."></textarea>
                                <button id="vibe-send-btn" class="primary-btn" style="height:60px; width:60px;">➤</button>
                            </div>
                            <div class="vibe-action-bar" style="display:flex; gap:10px; margin-top:5px;">
                                <button id="vibe-reset-btn" class="secondary-btn" style="font-size:0.8em; padding:4px 8px; min-height:0;">Reset Chat</button>
                                <button id="vibe-stop-btn" class="secondary-btn danger hidden" style="font-size:0.8em; padding:4px 8px; min-height:0;">Stop Loop</button>
                            </div>
                        </div>
                    </div>
                    <div class="vibe-side-panel">
                        <div class="vibe-panel-header">
                            <span>Vibe Assets</span>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <button id="vibe-refresh-context" class="icon-button" style="width:24px; height:24px; padding:0;" title="Refresh Reality">
                                    <svg class="svg-icon" style="width:14px; height:14px;"><use href="#icon-refresh"></use></svg>
                                </button>
                            </div>
                        </div>
                        <div class="vibe-context-list" style="padding:0; overflow-y:auto;"></div>
                        <div class="vibe-settings-area">
                            <div class="vibe-model-badge" id="vibe-config-btn">${ModelManager.currentModel}</div>
                            <div id="vibe-iter-badge" style="font-size:0.8em; color:var(--neon-lime); margin-top:5px;">
                                Iterations: ${State.vibeIterations}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('vibe-send-btn').onclick = () => controller.sendMessage(tab);
            document.getElementById('vibe-input').onkeydown = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    controller.sendMessage(tab);
                }
            };
            document.getElementById('vibe-reset-btn').onclick = () => controller.resetChat(tab);
            document.getElementById('vibe-stop-btn').onclick = () => controller.stopLoop();
            document.getElementById('vibe-config-btn').onclick = () => controller.openSettings();
            document.getElementById('vibe-refresh-context').onclick = () => {
                 const treeContainer = this.container.querySelector('.vibe-context-list');
                 treeContainer.innerHTML = '';
                 this.renderTree(tab, controller);
            };

            this.renderTree(tab, controller);
        }

        // --- Active Loop Visuals ---
        const stopBtn = document.getElementById('vibe-stop-btn');
        if (session.isProcessing) stopBtn?.classList.remove('hidden');
        else stopBtn?.classList.add('hidden');

        const badge = document.getElementById('vibe-iter-badge');
        if(badge) badge.textContent = `Iterations: ${State.vibeIterations} ${session.iterationCount > 0 ? `(${session.iterationCount})` : ''}`;

        const historyContainer = document.getElementById('vibe-chat-history');
        if (historyContainer) {
            const renderedCount = historyContainer.querySelectorAll('.vibe-message').length;
            const messagesToRender = session.history.filter(m => m.role !== 'system');
            
            if (messagesToRender.length !== renderedCount) {
                historyContainer.innerHTML = '';
                messagesToRender.forEach(msg => this.appendMessage(msg.role, msg.content, historyContainer));
            }
        }
    },

    async renderTree(tab, controller) {
        const rootItem = controller.getRootItem(tab);
        const treeContainer = this.container.querySelector('.vibe-context-list');
        const rootUl = document.createElement('ul');
        rootUl.className = 'workspace-tree';
        rootUl.style.paddingLeft = '0';
        treeContainer.appendChild(rootUl);
        // B"H - registerDom=true to ensure files open like regular explorer items
        await WorkspaceTreeRenderer.renderTree(rootUl, rootItem, 0, true);
    },

    appendMessage(role, content, container) {
        const div = document.createElement('div');
        div.className = `vibe-message ${role}`;
        
        let html = content
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/```xml([\s\S]*?)```/gi, '<pre class="vibe-xml-change"><code>$1</code></pre>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
            
        div.innerHTML = html;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
        return div;
    },

    showStreamingMessage(container) {
        const div = document.createElement('div');
        div.className = 'vibe-message model';
        div.innerHTML = '<span class="vibe-typing-indicator">...</span>';
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
        return div;
    }
};