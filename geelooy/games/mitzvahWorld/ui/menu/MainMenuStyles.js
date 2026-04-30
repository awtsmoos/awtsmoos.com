
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file MainMenuStyles.js
 * 
 * Chapter: The Infinite Malleability of Space.
 * When the Tzimtzum (restriction) occurred, the light did not break; 
 * it folded and scaled perfectly to fit the newly formed voids.
 * If the user squishes the browser window, the title must not be cut off!
 * 
 * We now rely on \`vmin\` (viewport minimum) for typography and padding.
 * This ensures that the letters shrink perfectly in proportion to the 
 * smallest dimension of the screen, never overflowing their boundaries.
 */

/**
 * @class MainMenuStyles
 * @extends SederHishtalshelusNode
 * @description Master pure data generator for flawlessly scaling nostalgic UI.
 */
export default class MainMenuStyles extends SederHishtalshelusNode {
    constructor() {
        super({ worldName: "Yetzirah_Nostalgic_Garments_Responsive" });
    }

    emanateStyles() {
        const styleId = 'mitzvah-nostalgic-styles';
        let style = document.getElementById(styleId);
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }

        style.innerHTML = `
            /* B"H - Cosmic Deep Blue Background matching the original */
            body, html {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background-color: #3133b3 !important; 
                overflow: hidden !important; /* Keep body fixed */
                font-family: 'Fredoka One', 'Varela Round', 'Comic Sans MS', sans-serif !important;
                touch-action: none !important;
            }

            .mitzvah-overlay {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important; 
                box-sizing: border-box !important;
                padding: 2vmin !important; /* Dynamic padding */
                z-index: 10 !important;
                overflow-y: auto !important; /* Allow scroll if extreme squish */
            }

            /* The floating blurred squares (sparks in the void) */
            .blurred-spark {
                position: fixed; /* Fixed so scrolling doesn't break them */
                background: white;
                border-radius: 4px;
                filter: blur(8px);
                opacity: 0.6;
                animation: driftUp 10s infinite linear;
                pointer-events: none;
            }

            @keyframes driftUp {
                0% { transform: translateY(110vh) rotate(0deg); opacity: 0; }
                10% { opacity: 0.6; }
                90% { opacity: 0.6; }
                100% { transform: translateY(-30vh) rotate(360deg); opacity: 0; }
            }

            /* Title Grouping - Extreme Fluidity */
            .title-group {
                text-align: center;
                margin-bottom: 4vmin;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: relative;
                z-index: 20;
                width: 100%;
                max-width: 900px;
                flex-shrink: 0;
            }

            .title-mitzvah {
                font-size: clamp(2rem, 15vmin, 8rem) !important;
                color: #ffde40 !important;
                font-weight: 900 !important;
                margin: 0 !important;
                line-height: 1.1 !important;
                letter-spacing: 0.2vmin !important;
                text-shadow: 
                    -0.3vmin -0.3vmin 0 #1b2064, 
                     0.3vmin -0.3vmin 0 #1b2064, 
                    -0.3vmin  0.3vmin 0 #1b2064, 
                     0.3vmin  0.3vmin 0 #1b2064,
                     0 2vmin 3vmin rgba(0,0,0,0.4) !important;
            }

            .title-world {
                font-size: clamp(1.5rem, 12vmin, 6rem) !important;
                color: #ffffff !important;
                font-weight: 900 !important;
                margin: -2vmin 0 0 0 !important;
                line-height: 1.1 !important;
                letter-spacing: 0.2vmin !important;
                text-shadow: 
                    -0.3vmin -0.3vmin 0 #1b2064, 
                     0.3vmin -0.3vmin 0 #1b2064, 
                    -0.3vmin  0.3vmin 0 #1b2064, 
                     0.3vmin  0.3vmin 0 #1b2064,
                     0 2vmin 3vmin rgba(0,0,0,0.4) !important;
            }

            .small-mitzvah-world-text {
                font-size: clamp(0.8rem, 3vmin, 1.5rem) !important;
                color: white;
                margin: -0.5vmin 0 2vmin 0;
                opacity: 0.9;
            }

            /* The Intense Pill Buttons */
            .mitzvah-button-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2vmin;
                width: 100%;
                max-width: 500px;
                z-index: 20;
            }

            .mitzvah-pill-btn {
                background-color: #4ade80 !important;
                border: clamp(3px, 1vmin, 8px) solid #eab308 !important;
                border-radius: 50px !important;
                padding: clamp(10px, 3vmin, 25px) clamp(20px, 5vmin, 50px) !important;
                width: 100% !important;
                position: relative !important;
                cursor: pointer !important;
                
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                
                color: #064e3b !important;
                font-size: clamp(0.7rem, 2.5vmin, 1.2rem) !important;
                font-family: inherit !important;
                font-weight: bold !important;
                text-transform: uppercase !important;
                
                box-shadow: 
                    inset 0 0 0 clamp(2px, 0.5vmin, 4px) #064e3b, 
                    0 1vmin 2vmin rgba(0,0,0,0.4) !important;
                
                transition: transform 0.2s, background-color 0.2s !important;
                overflow: hidden !important;
                flex-shrink: 0;
            }

            /* The internal shiny bubble */
            .btn-bubble {
                position: absolute !important;
                right: 5% !important;
                top: 50% !important;
                transform: translateY(-50%) !important;
                width: 15% !important;
                height: 40% !important;
                background-color: #86efac !important; 
                border-radius: 50px !important; 
                opacity: 0.8 !important;
                pointer-events: none !important;
            }

            .mitzvah-pill-btn:hover {
                transform: scale(1.05) !important;
                background-color: #22c55e !important;
            }

            .mitzvah-pill-btn:active {
                transform: scale(0.95) !important;
            }

            /* Corner User Tag */
            .corner-tag {
                position: fixed;
                top: clamp(10px, 3vmin, 30px);
                right: clamp(10px, 3vmin, 30px);
                background: #00ffff;
                color: black;
                padding: clamp(5px, 1.5vmin, 10px) clamp(10px, 3vmin, 20px);
                border-radius: 20px;
                font-weight: bold;
                font-size: clamp(0.7rem, 2vmin, 1rem);
                border: 2px solid black;
                z-index: 30;
                display: flex;
                align-items: center;
                gap: 5px;
                box-shadow: 0 0.5vmin 1vmin rgba(0,0,0,0.3);
            }
        `;
        console.log(`B"H - 🎨 Flawless, perfectly scaling UI manifested.`);
    }
}
