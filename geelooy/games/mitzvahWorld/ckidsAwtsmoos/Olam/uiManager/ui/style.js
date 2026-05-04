//B"H
import skin from "./skins/2/index.js";
import dialogueStyle from "./gameUI/components/DialogueVesselStyle.js";

/**
 * @file style.js
 * @description
 * THE COHESION OF DIMENSIONS (MALCHUS)
 */

export default {
    tag: "style",
    innerHTML: /*css*/`
        :root {
            --neon-cyan: #00f3ff;
            --mitzvah-gold: #ffde40;
            --void-bg: #0a0a1e;
        }
        
        ${dialogueStyle}

        .mainAv {
            position: fixed !important;
            inset: 0 !important;
            overflow: hidden !important;
            background-color: #000;
            z-index: 1;
        }

        canvas {
            position: absolute; top: 0; left: 0;
            width: 100% !important; height: 100% !important;
            display: block;
            z-index: 1;
            /* 
               B"H: REPEL DEFAULT BROWSING 
               Disables standard browser swiping/pinch behaviors 
               so the MobileTouchLogic can purely calculate camera rotation.
            */
            touch-action: none !important; 
        }

        /* The Spiritual Interface Overlay */
        .gameUi {
            position: fixed; inset: 0;
            z-index: 10000;
            /* 
               B"H: THE DECREE OF PASS-THROUGH
               The overlay itself MUST be porous.
            */
            pointer-events: none !important; 
            overflow: visible;
        }

        /* 
           B"H: SELECTIVE SOLIDIFICATION
           Only these holy vessels catch the user's touch.
           Everything else allows the touch to fall onto the world.
        */
        button, a, input, select, textarea, 
        .awtsmoosBtn, .mitzvahBtn, .controller-button, 
        #joystick-container, #joystick-base, 
        .awtsmoosContextMenu, .inventory-body {
            pointer-events: auto !important;
            cursor: pointer;
            touch-action: manipulation;
        }

        /* 
           Protect the empty zones inside UI containers so they don't block 
           camera swiping if someone swipes NEAR a button but not on it.
        */
        .gameUi > div:not([id="joystick-container"]):not([id="game-controller"]),
        .awtsmoosAction, .action-slots, .menuTop {
            pointer-events: none !important; 
        }

        .hidden { display: none !important; visibility: hidden !important; }

        /* B"H: THE HUD OF RADIANCE */
        .game-hud {
            position: absolute;
            top: 70px;
            left: 20px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            z-index: 1000;
            pointer-events: none;
            font-family: 'Fredoka One', sans-serif;
        }

        .hud-bar-container {
            height: 25px;
            background: rgba(0, 0, 0, 0.6);
            border-radius: 12px;
            border: 2px solid #555;
            position: relative;
            overflow: hidden;
            pointer-events: none;
        }

        .hud-bar {
            height: 100%;
            transition: width 0.2s;
        }

        .hud-text {
            position: absolute;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            text-shadow: 1px 1px 2px black;
        }

        .awtsmoos-tooltip {
            background: black;
            color: #00ff00;
            padding: 8px 12px;
            border: 1px solid #00ff00;
            border-radius: 4px;
            font-size: 16px;
            font-family: 'Courier New', Courier, monospace;
            text-shadow: 0 0 5px #00ff00;
            box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
            pointer-events: none;
            z-index: 99999;
            white-space: nowrap;
            position: fixed;
        }

        ${skin}

        body, html {
            margin: 0; padding: 0;
            width: 100%; height: 100%;
            background: #000;
            overflow: hidden;
            -webkit-user-select: none;
            user-select: none;
            overscroll-behavior: none;
            touch-action: none !important;
        }
    `
};
