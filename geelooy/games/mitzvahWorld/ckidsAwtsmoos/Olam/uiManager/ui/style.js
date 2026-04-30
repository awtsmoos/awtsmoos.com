
import skin from "./skins/2/index.js";

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
