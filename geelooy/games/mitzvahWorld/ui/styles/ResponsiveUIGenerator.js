
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file ResponsiveUIGenerator.js
 * 
 * "Measure it exactly." The dimensions of the physical world must perfectly
 * align to hold the spiritual light. If the UI is too big on mobile, the 
 * vessels shatter. If too small on desktop, the light is concealed.
 * 
 * This generator emanates pure CSS strings based on divine ratios,
 * adapting seamlessly to the viewport (the boundaries of the current universe).
 */

/**
 * @class ResponsiveUIGenerator
 * @extends SederHishtalshelusNode
 * @description Generates and injects the master CSS rules for a flawless responsive layout.
 */
export default class ResponsiveUIGenerator extends SederHishtalshelusNode {
    constructor() {
        super({ worldName: "Asiyah_UI_Dimensions" });
    }

    /**
     * @method injectDivineStyles
     * @description Appends the dynamically generated CSS into the head of the document.
     * @returns {void}
     */
    injectDivineStyles() {
        console.log(`B"H - 🎨 Emanating flawless responsive UI styles into the document head.`);
        
        const styleId = 'awtsmoos-divine-ui-styles';
        if (document.getElementById(styleId)) {
            return; // Styles already emanated
        }

        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.innerHTML = this.generateCSSString();
        document.head.appendChild(styleElement);
    }

    /**
     * @method generateCSSString
     * @description Pure string manipulation to map out the CSS matrix.
     * @returns {string}
     */
    generateCSSString() {
        return `
            /* B"H - Master UI Container */
            .ui-container {
                position: absolute;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                pointer-events: none; /* Let touches pass through to the void by default */
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                z-index: 1000;
                overflow: hidden;
            }

            /* Re-enable pointer events only for actual UI vessels */
            .ui-container > div, .ui-container button, .ui-container .dialogue-box-container {
                pointer-events: auto;
            }

            /* Dialogue Box - Scales flawlessly */
            .dialogue-box-container {
                background: rgba(10, 20, 40, 0.9);
                border: 2px solid #00ffff;
                border-radius: 12px;
                padding: 2vw;
                margin: 2vw auto;
                width: 90vw;
                max-width: 600px;
                color: #ffffff;
                font-family: 'Courier New', Courier, monospace;
                box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
                backdrop-filter: blur(5px);
            }

            .dialogue-header h3 {
                margin: 0 0 10px 0;
                font-size: clamp(1.2rem, 3vw, 2rem);
                text-shadow: 0 0 5px #fff;
            }

            .dialogue-text {
                font-size: clamp(1rem, 2.5vw, 1.2rem);
                margin-bottom: 20px;
                line-height: 1.5;
            }

            .dialogue-options-container {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .dialogue-option {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.3);
                padding: 15px;
                color: white;
                font-size: clamp(0.9rem, 2vw, 1.1rem);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: left;
            }

            .dialogue-option:hover {
                background: rgba(0, 255, 255, 0.2);
                border-color: #00ffff;
                transform: translateX(5px);
            }

            .quest-option {
                border-left: 4px solid #FFD700;
            }

            .merchant-option {
                border-left: 4px solid #32CD32;
            }

            .quest-marker, .merchant-marker {
                font-weight: bold;
                margin-right: 8px;
                font-size: 1.2em;
            }
        `;
    }
}
