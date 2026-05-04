// B"H
/**
 * @module DialogueVesselStyle
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE VESSELS OF COMMUNICATION — Premium Dialogue UI                          ║
 * ║                                                                                  ║
 * ║  Chapter 82: The Radiant Word                                                 ║
 * ║                                                                                  ║
 * ║  "Words of grace from a wise man's mouth" (Kohelet 10:12)                     ║
 * ║                                                                                  ║
 * ║  This module defines the glassmorphic, animated vessels that hold the          ║
 * ║  speech of the Messengers and the Chossid. Gold borders, deep shadows,         ║
 * ║  and rhythmic opacity shifts ensure that every word feels monumental.           ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

export default /*css*/`
.dialogue {
    position: fixed;
    display: none;
    flex-direction: column;
    max-width: 420px;
    padding: 24px;
    border-radius: 18px;
    font-family: 'Fredoka', sans-serif;
    font-size: 1.1rem;
    line-height: 1.5;
    z-index: 2000;
    pointer-events: auto;
    
    backdrop-filter: blur(12px) saturate(1.8);
    -webkit-backdrop-filter: blur(12px) saturate(1.8);
    box-shadow: 
        0 15px 35px rgba(0,0,0,0.5),
        0 0 0 1px rgba(255,215,0,0.15);
    
    transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.dialogue.active {
    display: flex;
    animation: dialoguePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes dialoguePop {
    from { opacity: 0; transform: scale(0.8) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}

.dialogue.npc {
    background: rgba(10, 15, 45, 0.85);
    border-left: 4px solid #ffd700;
    color: #fff;
    text-shadow: 0 1px 3px rgba(0,0,0,0.4);
}

.dialogue.chossid {
    background: rgba(25, 45, 20, 0.85);
    border-right: 4px solid #1adc6e;
    color: #f0fff0;
}

.dialogue .selected {
    color: #ffd700;
    font-weight: 700;
    text-decoration: underline;
    cursor: pointer;
    background: rgba(255,215,0,0.1);
    border-radius: 4px;
    padding: 2px 8px;
    margin: 4px 0;
}

.dialogue div[data-index] {
    padding: 8px 12px;
    margin: 4px 0;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.1s ease;
    background: rgba(255,255,255,0.05);
}

.dialogue div[data-index]:hover {
    background: rgba(255,215,0,0.2);
    transform: translateX(5px);
}

.dialogue div[data-index].selected {
    background: rgba(255,215,0,0.3);
    border: 1px solid rgba(255,215,0,0.5);
}

/* The Sacred Shimmer */
.dialogue::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(135deg, transparent 45%, rgba(255,255,255,0.05) 50%, transparent 55%);
    background-size: 200% 200%;
    animation: dialogueShimmer 8s linear infinite;
    pointer-events: none;
    border-radius: 18px;
}

@keyframes dialogueShimmer {
    0% { background-position: -100% -100%; }
    100% { background-position: 100% 100%; }
}
`;
