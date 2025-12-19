
// B"H
// FILE: js/vibe/vibe-view.js

import { DOM } from '../state.js';
import { ModelManager } from './model-manager.js';
import { WorkspaceTreeRenderer } from '../workspaces/tree-rendering.js';

export const VibeView = {
    container: null,
    
    init() {
        this.container = document.getElementById('vibe-editor-wrapper');
    },

    /**
     * Renders the Vibe UI for a specific tab instance.
     */
    async render(tab, controller) {
        if (!this.container) this.init();
        
        const session = tab.vibeSession;
        if (!session) return; 

        // B"H - Optimization: Check if we are re-rendering the same tab
        const isSameTab = this.container.dataset.tabId === String(tab.id);

        if (!isSameTab) {
            this.container.dataset.tabId = tab.id;
            
            // Build Layout
            this.container.innerHTML = `
                <div class="vibe-container">
                    <div class="vibe-chat-panel">
                        <div class="vibe-chat-history" id="vibe-chat-history">
                            <!-- Messages go here -->
                        </div>
                        <div class="vibe-input-area">
                            <div class="vibe-input-wrapper">
                                <textarea id="vibe-input" class="vibe-textarea" placeholder="Describe the changes you want..."></textarea>
                                <button id="vibe-send-btn" class="primary-btn" style="height:60px; width:60px;">➤</button>
                            </div>
                        </div>
                    </div>
                    <div class="vibe-side-panel">
                        <div class="vibe-panel-header">
                            <span>Vibe Context</span>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span id="vibe-file-count" style="font-size:0.8em; opacity:0.7;">0 files</span>
                                <button id="vibe-refresh-context" class="icon-button" style="width:24px; height:24px; padding:0;" title="Refresh Context">
                                    <svg class="svg-icon" style="width:14px; height:14px;"><use href="#icon-brain"></use></svg>
                                </button>
                            </div>
                        </div>
                        <div class="vibe-context-list" style="padding:0; overflow-y:auto;">
                            <!-- Tree will be rendered here -->
                        </div>
                        <div class="vibe-settings-area">
                            <div class="vibe-model-badge" id="vibe-config-btn">${ModelManager.currentModel}</div>
                            <div style="font-size:0.8em; color:gray;">
                                Keys: ${ModelManager.keys.length} | Quota Safe
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Bind Events
            document.getElementById('vibe-send-btn').onclick = () => controller.sendMessage(tab);
            document.getElementById('vibe-input').onkeydown = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    controller.sendMessage(tab);
                }
            };
            document.getElementById('vibe-config-btn').onclick = () => controller.openSettings();
            document.getElementById('vibe-refresh-context').onclick = () => controller.refreshContext(tab);

            // Render Full Tree Structure
            const rootItem = controller.getRootItem(tab);
            const treeContainer = this.container.querySelector('.vibe-context-list');
            const rootUl = document.createElement('ul');
            rootUl.className = 'workspace-tree';
            rootUl.style.paddingLeft = '0';
            treeContainer.appendChild(rootUl);
            
            // Use the shared Tree Renderer with registerDom=false
            // This ensures "Reveal in Workspace" still targets the Main Explorer, not this panel.
            await WorkspaceTreeRenderer.renderTree(rootUl, rootItem, 0, false);
        }

        // --- Partial Updates (Always run) ---

        // 1. Update Stats
        const countEl = document.getElementById('vibe-file-count');
        if(countEl) countEl.textContent = `${session.contextPaths ? session.contextPaths.length : 0} files`;
        
        const modelBadge = document.getElementById('vibe-config-btn');
        if(modelBadge) modelBadge.textContent = ModelManager.currentModel;

        // 2. Sync History
        const historyContainer = document.getElementById('vibe-chat-history');
        if (historyContainer) {
            const renderedCount = historyContainer.querySelectorAll('.vibe-message').length;
            // Filter out system messages from count logic as we don't render them
            const messagesToRender = session.history.filter(m => m.role !== 'system');
            
            if (messagesToRender.length > renderedCount) {
                const newMessages = messagesToRender.slice(renderedCount);
                newMessages.forEach(msg => {
                    this.appendMessage(msg.role, msg.content, historyContainer);
                });
            } else if (renderedCount === 0 && messagesToRender.length > 0) {
                // Initial render for new tab logic
                messagesToRender.forEach(msg => {
                    this.appendMessage(msg.role, msg.content, historyContainer);
                });
            }
        }
    },

    appendMessage(role, content, container) {
        const div = document.createElement('div');
        div.className = `vibe-message ${role}`;
        
        let html = content
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
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
    },

    updateStreamingMessage(div, text) {
        div.textContent = text;
        div.scrollIntoView({ behavior: "smooth", block: "end" });
    },
    
    showReviewDialog(diffHtml, onApply, onCancel) {
        let overlay = document.querySelector('.vibe-review-overlay');
        if(overlay) overlay.remove();
        
        overlay = document.createElement('div');
        overlay.className = 'vibe-review-overlay';
        overlay.innerHTML = `
            <div class="vibe-review-header">
                <h3 style="color:var(--neon-lime); margin:0;">Review Suggested Changes</h3>
                <button id="vibe-review-cancel" class="icon-button"><svg class="svg-icon"><use href="#icon-x"></use></svg></button>
            </div>
            <div class="vibe-diff-container">
                ${diffHtml}
            </div>
            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:15px;">
                <button id="vibe-review-apply" class="primary-btn">Apply Changes</button>
            </div>
        `;
        
        this.container.querySelector('.vibe-container').appendChild(overlay);
        
        document.getElementById('vibe-review-apply').onclick = () => {
            overlay.remove();
            onApply();
        };
        document.getElementById('vibe-review-cancel').onclick = () => {
            overlay.remove();
            onCancel();
        };
    }
};
