
// B"H
/**
 * @file input.js
 * @brief The Scribe of the User's Will for Vibe.
 */
export const ChatInput = {
    bind(container, tab, controller) {
        const c = container;
        const safeBind = (id, event, fn) => {
            const el = c.querySelector(id);
            if (el) {
                el[event] = fn;
            } else {
                console.warn(`B"H - [ChatInput] Vessel ${id} not found for binding.`);
            }
        };

        safeBind('#vibe-send-btn', 'onclick', () => controller.sendMessage(tab));
        safeBind('#vibe-token-btn', 'onclick', () => controller.updateTokenCount(tab));
        safeBind('#vibe-reset-btn', 'onclick', () => controller.resetChat(tab));
        safeBind('#vibe-mgr-btn', 'onclick', () => controller.openManager());

        const input = c.querySelector('#vibe-input');
        if (input) {
            // B"H - IMPROVEMENT 8: Fluid Expansion of the Input Vessel
            input.addEventListener('input', function() {
                this.style.height = 'auto'; // Reset to calculate true height
                const newHeight = Math.min(this.scrollHeight, 300); // Cap at 300px
                this.style.height = newHeight + 'px';
            });

            input.onkeydown = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    controller.sendMessage(tab);
                    // Reset height after sending
                    input.style.height = 'auto'; 
                }
            };
        }
    }
};
