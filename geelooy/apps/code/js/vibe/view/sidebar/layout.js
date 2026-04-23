
// B"H
/**
 * @file layout.js
 * @brief The Pure Structural Blueprint of the Vibe World.
 */
export const VibeLayout = {
    getHTML() {
        return `
            <div class="vibe-container">
                <div class="vibe-chat-panel">
                    <div id="vibe-chat-history" class="vibe-chat-history"></div>
                    <div class="vibe-token-bar">
                        <span id="vibe-token-counter">Tokens: --</span>
                        <button id="vibe-token-btn" class="vibe-token-refresh-btn">⟳</button>
                    </div>
                    <div id="vibe-input-area" class="vibe-input-area">
                        <div class="vibe-input-wrapper">
                            <textarea id="vibe-input" class="vibe-textarea" placeholder="Speak your will..."></textarea>
                            <button id="vibe-send-btn" class="primary-btn">➤</button>
                        </div>
                        <div class="vibe-actions">
                            <div class="vibe-actions-left">
                                <button id="vibe-reset-btn" class="secondary-btn">Reset</button>
                                <button id="vibe-mgr-btn" class="secondary-btn">Settings</button>
                            </div>
                            <button id="vibe-sidebar-toggle-btn" class="icon-button"><svg class="svg-icon"><use href="#icon-sidebar"></use></svg></button>
                        </div>
                    </div>
                </div>
                
                <div class="vibe-resizer" id="vibe-resizer-vertical"></div>
                <div class="vibe-resizer" id="vibe-resizer-horizontal"></div>
                
                <div class="vibe-side-panel" id="vibe-side-panel" style="display:flex; flex-direction:column;">
                    <div id="vibe-panel-restore-btn" class="vibe-panel-restore-btn">
                        <svg class="svg-icon"><use href="#icon-plus"></use></svg>
                    </div>
                    <div class="vibe-panel-inner" style="flex-grow:1; display:flex; flex-direction:column; min-height:0;">
                        <div class="vibe-sidebar-tabs">
                            <div class="vibe-sb-tab" data-tab="tree">Tree</div>
                            <div class="vibe-sb-tab" data-tab="manifest">External</div>
                            <div class="vibe-sb-tab" data-tab="timeline">Timeline</div>
                            <div class="vibe-tab-spacer"></div>
                            <div class="vibe-header-actions">
                                <button id="vibe-panel-max-btn" class="icon-button"><svg class="svg-icon"><use href="#icon-fullscreen"></use></svg></button>
                                <button id="vibe-panel-min-btn" class="icon-button"><svg viewBox="0 0 24 24" class="svg-icon" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg></button>
                            </div>
                        </div>
                        <div id="vibe-tree-container" class="vibe-context-list" style="flex-grow:1; overflow-y:auto;"></div>
                        <div id="vibe-manifest-container" class="vibe-manifest-view" style="flex-grow:1; overflow-y:auto; display:none;"></div>
                        <div id="vibe-timeline-container" class="vibe-timeline-view" style="flex-grow:1; overflow-y:auto; display:none;"></div>
                        <div class="vibe-settings-area"><div id="vibe-model-badge">...</div></div>
                    </div>
                </div>
            </div>
        `;
    }
};
