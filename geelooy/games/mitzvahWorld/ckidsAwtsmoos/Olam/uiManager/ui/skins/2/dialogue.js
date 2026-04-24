/**B"H
 * CSS for dialogue boxes - EXTREME EDITION
 */

import borderShadow from "../../resources/borderShadow.js";

var DIALOGUE_BORDER = 2;

export default /*css*/`
    :root {
        --shadowWidth: 1.6px;
        --neon-blue: #00f3ff;
        --neon-pink: #bc13fe;
        --glass-bg: rgba(20, 10, 40, 0.85);
    }

    @keyframes dialoguePop {
        0% { transform: scale(0.8) translateY(20px); opacity: 0; }
        60% { transform: scale(1.05) translateY(-5px); opacity: 1; }
        100% { transform: scale(1) translateY(0); opacity: 1; }
    }

    @keyframes glowPulse {
        0% { box-shadow: 0 0 5px var(--neon-blue), 0 0 10px var(--neon-blue), inset 0 0 5px var(--neon-pink); }
        50% { box-shadow: 0 0 20px var(--neon-blue), 0 0 30px var(--neon-pink), inset 0 0 20px var(--neon-pink); }
        100% { box-shadow: 0 0 5px var(--neon-blue), 0 0 10px var(--neon-blue), inset 0 0 5px var(--neon-pink); }
    }

    @keyframes insaneGlitch {
        0% { transform: translate(0); text-shadow: none; }
        20% { transform: translate(-2px, 2px); text-shadow: 2px 0 #ff00ea, -2px 0 #00dbff; }
        40% { transform: translate(2px, -2px); text-shadow: -2px 0 #ff00ea, 2px 0 #00dbff; }
        60% { transform: translate(-2px, 0); text-shadow: 2px 0 #ff00ea, -2px 0 #00dbff; }
        80% { transform: translate(2px, 2px); text-shadow: -2px 0 #ff00ea, 2px 0 #00dbff; }
        100% { transform: translate(0); text-shadow: none; }
    }

    .dialogue {
        display: flex;
        max-width: 650px;
        /* B"H: Allow scrolling for many options */
        max-height: 60vh;
        overflow-y: auto;
        
        flex-direction: column;
        z-index: 100;
        justify-content: flex-start; /* Changed to flex-start for scrolling content */
        align-items: flex-start;
       
        border-radius: 20px;
        background: var(--glass-bg);
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-top: 2px solid rgba(255, 255, 255, 0.3);
        border-left: 2px solid rgba(255, 255, 255, 0.3);
        
        box-shadow: 0 15px 35px rgba(0,0,0,0.5);
        
        padding: 25px;
        gap: 15px;

        color: #FFF;
        font-family: 'Fredoka One', sans-serif;
        font-size: 1.8em;
        font-weight: 500;
        line-height: 1.4;
        letter-spacing: 1px;

        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s, visibility 0.3s, transform 0.3s;
        
        transform-origin: bottom center;
        
        /* Custom Scrollbar */
        scrollbar-width: thin;
        scrollbar-color: var(--neon-pink) rgba(0,0,0,0.3);
    }
    
    .dialogue::-webkit-scrollbar {
        width: 8px;
    }
    .dialogue::-webkit-scrollbar-track {
        background: rgba(0,0,0,0.3);
        border-radius: 4px;
    }
    .dialogue::-webkit-scrollbar-thumb {
        background-color: var(--neon-pink);
        border-radius: 4px;
    }

    .dialogue.active {
        animation: dialoguePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        animation-fill-mode: forwards;
    }

    .dialogue.npc {
        border-right: 5px solid var(--neon-pink);
        background: linear-gradient(135deg, rgba(40, 20, 60, 0.9), rgba(10, 5, 20, 0.95));
    }

    .dialogue.chossid {
        border-left: 5px solid var(--neon-blue);
        background: linear-gradient(135deg, rgba(20, 40, 60, 0.9), rgba(5, 10, 30, 0.95));
        align-items: stretch; /* Stretch items to full width */
    }

    .dialogue > div {
        background: rgba(255, 255, 255, 0.05);
        padding: 15px 20px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        position: relative;
        overflow: hidden;
        width: 100%;
        box-sizing: border-box;
        flex-shrink: 0; /* Prevent shrinking in flex container */
    }

    .dialogue.chossid > div:hover {
        cursor: pointer;
        background: rgba(255, 255, 255, 0.15);
        transform: translateX(10px) scale(1.02);
        box-shadow: 0 0 20px rgba(0, 243, 255, 0.4);
        border-color: var(--neon-blue);
        z-index: 1;
        animation: insaneGlitch 0.3s infinite;
    }
    
    .dialogue.chossid > div:active {
        transform: scale(0.98);
    }

    /* Selected Response Style */
    .selected {
        background: linear-gradient(90deg, rgba(254, 203, 57, 0.2), rgba(254, 203, 57, 0.0)) !important;
        border-left: 5px solid #FECB39 !important;
        box-shadow: 0 0 25px rgba(254, 203, 57, 0.3);
        padding-left: 25px !important;
    }

    .selected::before {
        content: "➤";
        position: absolute;
        left: 5px;
        color: #FECB39;
        animation: pulse 1s infinite;
    }

    /* Approach Box */
    .asApproachNpc {
        position: absolute;
        top: 20%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: var(--neon-blue);
        border: 2px solid var(--neon-blue);
        border-radius: 50px;
        padding: 15px 40px;
        font-family: 'Fredoka One', cursive;
        font-size: 1.5em;
        text-transform: uppercase;
        letter-spacing: 2px;
        box-shadow: 0 0 20px var(--neon-blue), inset 0 0 20px rgba(0, 243, 255, 0.2);
        animation: glowPulse 2s infinite alternate;
        white-space: nowrap;
        pointer-events: none;
        z-index: 2000;
    }

    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }

    /* Mobile Optimizations */
    @media (max-width: 768px) {
        .dialogue {
            font-size: 16px;
            padding: 15px;
            max-width: none;
            width: 90%;
            left: 5% !important;
            right: 5% !important;
            transform: none !important;
            bottom: auto !important;
        }
        
        .dialogue.npc {
            top: 20% !important;
            max-height: 30%;
        }

        .dialogue.chossid {
             top: auto !important;
             bottom: 5% !important;
             max-height: 40%;
             border-left: 3px solid var(--neon-blue);
        }
    }
`;