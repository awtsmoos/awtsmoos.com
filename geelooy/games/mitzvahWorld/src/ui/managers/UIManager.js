
import BittleNullification from '../../core/BittleNullification.js';
import YesodCSSGenerator from '../generators/YesodCSSGenerator.js';
import MalchusHTMLGenerator from '../generators/MalchusHTMLGenerator.js';
import { OrEinSofAnimationsData } from '../styles/OrEinSofAnimationsData.js';
import { MitzvahWorldLandingStyles } from '../styles/MitzvahWorldLandingStyles.js';
import { getLandingScreenData } from '../data/LandingScreenData.js';

/**
 * B"H
 * @class UIManager
 * @description
 * Orchestrates the revelation of the UI elements. Combines the generators.
 */
export default class UIManager extends BittleNullification {
    constructor() {
        super();
        this.cssYotzeir = new YesodCSSGenerator();
        this.htmlBorei = new MalchusHTMLGenerator();
        
        this.acknowledgeAwtsmoos('UIManager');
    }

    /**
     * @method manifestLandingScreen
     * @description Brings the landing screen into physical existence.
     */
    manifestLandingScreen() {
        // 1. Inject Styles
        const combinedStyles = {
            ...OrEinSofAnimationsData,
            ...MitzvahWorldLandingStyles
        };
        this.cssYotzeir.injectStyles('awtsmoos-landing-styles', combinedStyles);

        // 2. Generate HTML
        const data = getLandingScreenData();
        const el = this.htmlBorei.speakIntoExistence(data);

        // 3. Append to Body
        if (el) {
            document.body.appendChild(el);
        }
    }

    /**
     * @method updateProgress
     * @description Updates the state of the physical vessels based on spiritual progress.
     * @param {number} percent 
     * @param {string} text 
     */
    updateProgress(percent, text) {
        const bar = document.getElementById('genesisProgressBar');
        const status = document.getElementById('genesisStatusText');

        if (bar) bar.style.width = `${percent}%`;
        if (status) status.innerText = text;
    }
}
