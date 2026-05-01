// B"H
/**
 * @module InteractionPrompt
 * @description
 * 📢 THE CALL TO ACTION 📢
 * A persistent HUD overlay that appears when the soul approaches
 * an interactive vessel (door, gate, NPC, etc).
 */
export const InteractionPrompt = {
    shaym: "interaction-prompt",
    awtsmoosClick: true,
    className: "interaction-prompt hidden",
    children: [
        {
            tag: "style",
            textContent: /*css*/`
                .interaction-prompt {
                    position: fixed;
                    bottom: 20%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(10, 0, 30, 0.9);
                    border: 2px solid #ffde40;
                    border-radius: 12px;
                    padding: 14px 28px;
                    color: #fff;
                    font-family: 'Outfit', sans-serif;
                    font-size: 20px;
                    font-weight: 700;
                    box-shadow: 0 0 30px rgba(255, 222, 64, 0.3);
                    z-index: 5000;
                    pointer-events: none;
                    transition: opacity 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }
                .interaction-prompt.hidden {
                    opacity: 0;
                    pointer-events: none;
                    display: none !important;
                }
                .interaction-prompt .key-badge {
                    background: #ffde40;
                    color: #000;
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-weight: 900;
                    font-size: 22px;
                    letter-spacing: 1px;
                    box-shadow: 0 2px 8px rgba(255,222,64,0.4);
                }
            `
        }
    ],
    on: {
        showInteraction(e, $, ui) {
            const { text, key } = e.detail || {};
            const el = e.target;
            el.classList.remove("hidden");
            // Preserve the style tag, append content after it
            const styleChild = el.querySelector('style');
            // Clear non-style children
            Array.from(el.children).forEach(c => {
                if (c.tagName !== 'STYLE') c.remove();
            });
            
            const badge = document.createElement('div');
            badge.className = 'key-badge';
            badge.textContent = key || 'C';
            el.appendChild(badge);
            
            const label = document.createElement('div');
            label.textContent = text || 'Interact';
            el.appendChild(label);
        },
        hideInteraction(e) {
            e.target.classList.add("hidden");
        }
    }
};
