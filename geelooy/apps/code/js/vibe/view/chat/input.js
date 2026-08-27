
// B"H
/**
 * @file input.js
 * @brief The Scribe of the User's Will for Vibe.
 */
import { AutoLoopState } from '../../agent/state/AutoLoopState.js';

export const ChatInput = {
    bind(container, tab, controller) {
        const c = container;
        const safeBind = (id, event, fn) => {
            const el = c.querySelector(id);
            if (el) el[event] = fn;
        };

        safeBind('#vibe-send-btn', 'onclick', () => controller.sendMessage(tab));
        safeBind('#vibe-token-btn', 'onclick', () => controller.updateTokenCount(tab));
        safeBind('#vibe-reset-btn', 'onclick', () => controller.resetChat(tab));
        safeBind('#vibe-mgr-btn', 'onclick', () => controller.openManager());
        
        safeBind('#vibe-new-chat-btn', 'onclick', () => {
            const rootItem = controller.getRootItem(tab);
            controller.open(rootItem, true);
        });

        // B"H - Auto-Refine Configuration binding
        safeBind('#vibe-auto-refine-btn', 'onclick', async () => {
            const { AutoRefineConfigUI } = await import('./components/AutoRefineConfigUI.js');
            AutoRefineConfigUI.show(tab, controller);
        });
        
        safeBind('#vibe-limits-btn', 'onclick', async () => {
            const { ModelLimitsModal } = await import('./components/ModelLimitsModal.js');
            ModelLimitsModal.show();
        });

        if (!tab.vibeSession.viewState) {
            tab.vibeSession.viewState = { activeSidebarTab: 'tree' };
        }
        if (!tab.vibeSession.viewState.activeRole) {
            tab.vibeSession.viewState.activeRole = 'auto';
        }

        const roleSel = c.querySelector('#vibe-role-select');
        if (roleSel) {
            roleSel.value = tab.vibeSession.viewState.activeRole || 'auto';
            roleSel.onchange = (e) => {
                tab.vibeSession.viewState.activeRole = e.target.value || 'auto';
                import('../../db.js').then(m => m.VibeDB.saveSession(tab.vibeSession.id, tab.vibeSession));
            };
        }

        const stopBtn = c.querySelector('#vibe-stop-btn');
        if (stopBtn) {
            stopBtn.onclick = () => {
                AutoLoopState.halt();
                stopBtn.textContent = "HALTED";
                setTimeout(() => stopBtn.classList.add('hidden'), 2000);
            };

            if (tab.vibeSession.isProcessing) {
                stopBtn.classList.remove('hidden');
                stopBtn.textContent = "HALT LOOP ✋";
            } else {
                stopBtn.classList.add('hidden');
            }
        }

        const input = c.querySelector('#vibe-input');
        if (input) {
            input.onkeydown = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    controller.sendMessage(tab);
                }
            };
        }
    }
};
