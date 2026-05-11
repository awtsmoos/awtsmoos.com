
// B"H
/**
 * @file TabActivationOrchestrator.js
 * @brief The Master of the Dimensional Shift.
 */

import { State, DOM } from '../../../state.js';
import { UI } from '../../../ui.js';
import { TabSentinel } from '../../sentinel.js';
import { TabRouter } from '../../router.js';
import { TabsLoader } from '../../loader.js';
import { TabFocusEnforcer } from '../../dom/TabFocusEnforcer.js';
import { RealitySentinel } from '../../../core/validation/RealitySentinel.js';
import { IntentDiscriminator } from './registry/IntentDiscriminator.js';

export const TabActivationOrchestrator = {
    async execute(tabId, forceReload = false) {
        const token = TabSentinel.startNewIntent();
        const numId = Number(tabId);

        const tab = State.tabs.find(t => t.id === numId);
        if (!tab) {
            TabFocusEnforcer.enforce(null);
            UI.switchView('empty');
            return;
        }

        // B"H - THE ABSOLUTE GATE OF PERMISSION
        const ws = State.workspaces.find(w => w.id === tab.item.workspaceId);
        if (ws && ws.type === 'local' && ws.isLocked) {
            TabFocusEnforcer.enforce(numId);
            this._renderLockedWorldUI(tab, ws);
            return;
        }

        const isVirtual = ['vibe-manager', 'browser', 'devtools', 'html-preview-file'].includes(tab.item.type) || tab.fileType === 'devtools' || tab.isPreview;

        // 1. REALITY VERIFICATION
        if (!isVirtual) {
            await RealitySentinel.verify(tab.item);
        }

        if (TabSentinel.isIntentStale(token)) return;

        // 2. VISUAL LOCK
        TabFocusEnforcer.enforce(numId);

        try {
            // 3. THE ROUTING RITUAL
            const viewID = TabRouter.resolveViewID(tab);
            UI.switchView(viewID);

            // 4. THE LOADING RITUAL
            const ok = await TabsLoader.loadTabContent(tab);
            if (TabSentinel.isIntentStale(token)) return;

            if (!ok) {
                UI.switchView('empty');
                return;
            }

            // 5. THE MANIFESTATION
            if (viewID.includes('vibe')) {
                const { VibeController } = await import('../../../vibe/vibe-controller.js');
                await VibeController.render(tab);
            } else if (viewID === 'terminal-wrapper') {
                const { Terminal } = await import('../../../terminal/index.js');
                await Terminal.render(tab, DOM.terminalWrapper);
            } else if (viewID === 'file-commander-wrapper') {
                const { FileCommander } = await import('../../../file-commander/index.js');
                FileCommander.render(tab, DOM.fileCommanderWrapper);
            } else if (viewID === 'browser-wrapper') {
                const { BrowserManager } = await import('../../../browser/index.js');
                BrowserManager.render(tab);
            } else if (viewID === 'devtools-wrapper') {
                // B"H - THE GREAT RECTIFICATION
                // We delegate the entire state initialization and rendering to the DevTools class itself.
                const { DevTools } = await import('../../../devtools/index.js');
                new DevTools(DOM.devtoolsWrapper, tab);
            } else {
                await TabsLoader.renderTabView(tab, forceReload);
            }

            if (TabSentinel.isIntentStale(token)) return;
            tab.forceReload = false;
            
            import('../../index.js').then(m => m.Tabs.render());
            import('../../../app.js').then(m => m.App.saveSessionDebounced());

        } catch (err) {
            console.error("B\"H - Dimensional Shift failed:", err);
            UI.hideLoading();
            UI.showToast("Vision Failure: " + err.message, "error");
        }
    },

    _renderLockedWorldUI(tab, ws) {
        const container = DOM.editorWrapper; 
        UI.switchView('editor'); 
        
        container.innerHTML = '';
        
        const { HTML } = require('../../../html-generator.js');
        const lockedSchema = {
            style: {
                display: 'flex', flexDirection: 'column', alignItems: 'center', 
                justifyContent: 'center', height: '100%', gap: '20px', 
                color: 'var(--neon-cyan)', textAlign: 'center', padding: '40px'
            },
            children: [
                { tag: 'h2', text: 'B"H - The Earthly Anchor is Sealed' },
                { tag: 'p', style: { opacity: 0.7, maxWidth: '400px' }, text: "Your browser has suspended the connection to '" + ws.name + "'. The physical handle must be re-linked to continue the creation." },
                {
                    tag: 'button',
                    className: 'primary-btn',
                    style: { padding: '12px 30px', fontWeight: 'bold', boxShadow: '0 0 20px var(--glow-cyan)' },
                    text: 'RE-LINK WORKSPACE',
                    onClick: async (e) => {
                        const btn = e.target;
                        btn.textContent = "Negotiating...";
                        try {
                            const res = await ws.handle.requestPermission({ mode: 'readwrite' });
                            if (res === 'granted') {
                                ws.isLocked = false;
                                this.execute(tab.id, true); 
                                import('../../../workspaces/index.js').then(m => m.Workspaces.render());
                            } else {
                                btn.textContent = "Refused";
                            }
                        } catch(err) {
                            btn.textContent = "Error";
                            UI.showToast("B\"H - Link failed: " + err.message, "error");
                        }
                    }
                }
            ]
        };

        container.appendChild(HTML(lockedSchema));
    }
};
