/**
 * B"H
 * 
 * THE DIALOGUE UI - THE VESSEL OF SPEECH
 * 
 * In the realm of Malchus (Action/Manifestation), the spoken word
 * must take on a physical form to be perceived by the player.
 * 
 * This module defines the aesthetic structure of the dialogue box,
 * using a premium, data-driven design as requested by the Awtsmoos.
 * 
 * @module DialogueUI
 */

export const DialogueUI = {
    /**
     * @method generate
     * @description Returns a JSON representation of the dialogue UI.
     * @param {Object} data - The data to populate the UI with.
     * @returns {Object}
     */
    generate(data) {
        const { npcName, message, responses, onChoice } = data;

        return {
            tag: "div",
            shaym: "dialogue-vessel",
            className: "premium-dialogue-container",
            methods: {
                classList: {
                    remove: "hidden",
                    add: "active"
                }
            },
            style: {
                position: "fixed",
                bottom: "10%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "80%",
                maxWidth: "800px",
                padding: "2rem",
                background: "rgba(10, 10, 20, 0.85)", // Deep, spiritual dark blue
                backdropFilter: "blur(15px)", // Glassmorphism
                border: "2px solid rgba(0, 255, 204, 0.3)", // Cyan energy border
                borderRadius: "15px",
                boxShadow: "0 0 30px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 255, 204, 0.1)",
                color: "#fff",
                fontFamily: "'Inter', sans-serif",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                animation: "dialogue-slide-up 0.5s cubic-bezier(0.19, 1, 0.22, 1)"
            },
            children: [
                // NPC Name (The Source of the Speech)
                {
                    tag: "div",
                    className: "dialogue-header",
                    style: {
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem"
                    },
                    children: [
                        {
                            tag: "div",
                            style: {
                                width: "40px",
                                height: "4px",
                                background: "linear-gradient(90deg, #00FFCC, transparent)",
                                borderRadius: "2px"
                            }
                        },
                        {
                            tag: "h2",
                            textContent: npcName,
                            style: {
                                margin: 0,
                                fontSize: "1.2rem",
                                textTransform: "uppercase",
                                letterSpacing: "2px",
                                color: "#00FFCC"
                            }
                        }
                    ]
                },
                // The Message (The Holy Statement)
                {
                    tag: "p",
                    className: "dialogue-text",
                    textContent: message,
                    style: {
                        fontSize: "1.4rem",
                        lineHeight: "1.6",
                        margin: 0,
                        fontWeight: "300",
                        textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                    }
                },
                // Responses (The Player's Choice/Will)
                {
                    tag: "div",
                    className: "dialogue-responses",
                    style: {
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.8rem",
                        marginTop: "1rem"
                    },
                    children: responses.map((r, i) => ({
                        tag: "button",
                        className: "dialogue-response-btn",
                        textContent: r.text,
                        style: {
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            padding: "1rem 1.5rem",
                            borderRadius: "8px",
                            color: "#ccc",
                            textAlign: "left",
                            fontSize: "1.1rem",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            outline: "none"
                        },
                        events: {
                            click: () => onChoice(i),
                            mouseover: (e) => {
                                e.target.style.background = "rgba(0, 255, 204, 0.15)";
                                e.target.style.borderColor = "rgba(0, 255, 204, 0.5)";
                                e.target.style.color = "#fff";
                                e.target.style.paddingLeft = "2rem";
                            },
                            mouseout: (e) => {
                                e.target.style.background = "rgba(255, 255, 255, 0.05)";
                                e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                                e.target.style.color = "#ccc";
                                e.target.style.paddingLeft = "1.5rem";
                            }
                        }
                    }))
                }
            ]
        };
    }
};
