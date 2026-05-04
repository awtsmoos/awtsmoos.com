/**
 * B"H
 * @file InteractionPrompt.js
 * @description
 * THE RADIATING SPEECH OF THE SOUL
 */

export const InteractionPrompt = {
    shaym: "interaction-prompt",
    className: "interaction-prompt hidden",
    children: [
        {
            tag: "style",
            textContent: /*css*/`
                .interaction-prompt.hidden {
                    opacity: 0;
                    pointer-events: none;
                    display: none !important;
                }
                .sacred-dialogue-vessel {
                    background: rgba(10, 6, 32, 0.85);
                    border: 2px solid rgba(255, 215, 0, 0.4);
                    box-shadow: 
                        0 0 30px rgba(0, 0, 0, 0.8),
                        0 0 15px rgba(255, 215, 0, 0.15),
                        inset 0 0 20px rgba(255, 215, 0, 0.05);
                    border-radius: 60px;
                    padding: 12px 35px 12px 15px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    position: relative;
                    overflow: hidden;
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    animation: promptEntrance 0.5s cubic-bezier(0.17, 0.89, 0.32, 1.28);
                }

                .key-orb {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #ffd700 0%, #b8860b 100%);
                    color: #0a0620;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    font-size: 24px;
                    box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
                    text-shadow: none;
                    flex-shrink: 0;
                }

                .dialogue-text {
                    color: white;
                    font-size: 20px;
                    font-weight: 500;
                    letter-spacing: 0.02em;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    line-height: 1.4;
                }

                .sacred-shimmer {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        90deg, 
                        transparent 0%, 
                        rgba(255,215,0,0.1) 45%, 
                        rgba(255,255,255,0.2) 50%, 
                        rgba(255,215,0,0.1) 55%, 
                        transparent 100%
                    );
                    background-size: 200% 100%;
                    animation: shimmerSweep 4s infinite linear;
                    pointer-events: none;
                }

                @keyframes promptEntrance {
                    from { opacity: 0; transform: translateY(30px) scale(0.8); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                @keyframes shimmerSweep {
                    from { background-position: -200% 0; }
                    to { background-position: 200% 0; }
                }
            `
        },
        {
            className: "prompt-content-holder",
            children: []
        }
    ],
    style: {
        position: "fixed",
        bottom: "10%",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 5000,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "max-content",
        maxWidth: "90vw",
        fontFamily: "'Fredoka', sans-serif"
    },
    on: {
        "interaction-prompt"(e, $, ui) {
            const el = $("interaction-prompt");
            const holder = el.querySelector(".prompt-content-holder");
            if (e.detail.showInteraction) {
                el.classList.remove("hidden");
                const { text, key, persists } = e.detail.showInteraction;
                
                // B"H: The Vessel of Revelation
                holder.innerHTML = /*html*/`
                    <div class="sacred-dialogue-vessel">
                        <div class="key-orb">${key}</div>
                        <div class="dialogue-text">${text}</div>
                        <div class="sacred-shimmer"></div>
                    </div>
                `;
                
                if (!persists) {
                    setTimeout(() => el.classList.add("hidden"), 3000);
                }
            } else if (e.detail.hideInteraction) {
                el.classList.add("hidden");
            }
        }
    }
};
