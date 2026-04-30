
import BittulSoul from '../../core/BittulSoul.js';
import YesodCSSGenerator from '../generators/YesodCSSGenerator.js';
import MalchusHTMLGenerator from '../generators/MalchusHTMLGenerator.js';
import { RuachAnimationsData } from '../styles/animations/RuachAnimationsData.js';
import { ExtremeMainMenuStyles } from '../styles/screens/ExtremeMainMenuStyles.js';
import { GenesisLandingStyles } from '../styles/screens/GenesisLandingStyles.js';
import { getMainMenuStructure } from '../data/screens/MainMenuStructure.js';
import { getGenesisLandingStructure } from '../data/screens/GenesisLandingStructure.js';

/**
 * B"H
 * @class AwtsmoosScreenConduit
 * @description
 * 🌊 CONDUIT OF APPEARANCES AND DISAPPEARANCES 🌊
 * A manager utterly surrendered to moving between cosmic views.
 * It injects style bundles using YESOD and speaks HTML nodes using MALCHUS.
 */
export default class AwtsmoosScreenConduit extends BittulSoul {
    constructor() {
        super();
        this.surrenderToAwtsmoos('AwtsmoosScreenConduit');
        
        this.yotzerCSS = new YesodCSSGenerator();
        this.boreiHTML = new MalchusHTMLGenerator();
        
        // Let there be base styles in the Heaven (Head) always
        this.yotzerCSS.anointToCrown('base-animation-souls', RuachAnimationsData);
    }

    /**
     * @method mountMenuScreen
     * @description Mounts the absolute majestic Gates to the World.
     * @param {Object} rootContainer - The physical attachment DOM Node.
     * @param {Object} eventHooks - the mapped commands (click play, etc).
     */
    mountMenuScreen(rootContainer, eventHooks) {
        this.yotzerCSS.anointToCrown('extreme-menu-rules', ExtremeMainMenuStyles);
        
        const schema = getMainMenuStructure(eventHooks);
        const physicalElement = this.boreiHTML.speakExistence(schema);
        
        rootContainer.innerHTML = ''; // Reverting the specific vessel to Tohu and Vohu!
        rootContainer.appendChild(physicalElement);
    }

    /**
     * @method mountGenesisScreen
     * @description Casts the loading veil over reality. Appends without destroying.
     */
    mountGenesisScreen() {
        this.yotzerCSS.anointToCrown('genesis-gate-rules', GenesisLandingStyles);
        const schema = getGenesisLandingStructure();
        const physicalElement = this.boreiHTML.speakExistence(schema);
        document.body.appendChild(physicalElement);
    }

    /**
     * @method manipulateStreamFlow
     * @description Acts dynamically upon physical nodes without breaking Bittul.
     * @param {number} widthPercentage 
     * @param {string} deepMessage 
     */
    manipulateStreamFlow(widthPercentage, deepMessage) {
        const line = document.getElementById('lightStreamProgress');
        const scrollText = document.getElementById('divineCommStreamText');

        if (line) line.style.width = `${widthPercentage}%`;
        if (scrollText) scrollText.innerText = deepMessage;
    }

    /**
     * @method fadeAndDismantleVeil
     * @description A peaceful resolution dissolving the transitionary screen.
     */
    fadeAndDismantleVeil() {
        const veil = document.getElementById('veilOfGenesis');
        if (veil) {
            veil.style.opacity = '0'; // Withdraw the Light
            setTimeout(() => veil.remove(), 1600); // Fully uncreate it.
        }
    }

    /**
     * @method completelyVanishMenu
     * @description Cleans up main menu elements after successful ingress into Void.
     */
    completelyVanishMenu() {
         const menu = document.getElementById('epicMenuGate');
         if (menu) menu.remove();
    }
}
