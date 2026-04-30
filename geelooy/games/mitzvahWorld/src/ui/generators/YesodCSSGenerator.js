
import BittulSoul from '../../core/BittulSoul.js';

/**
 * B"H
 * @file YesodCSSGenerator.js
 * @description
 * 🎨 THE TRIBUTARY OF VISUALIZATION (YESOD) 🎨
 * 
 * Before there is a final Kingdom (Malchus), there must be a Foundation (Yesod).
 * Yesod collects all Sefirot, organizing the infinite permutations of light 
 * into a single unified pillar. 
 * 
 * Here, we take our heavily-nested JSON mapping of aesthetic essence and convert it
 * into standard, browser-understandable textual declarations (CSS). Notice the Bittul 
 * required: this class creates NO physical structures—it merely structures the intent.
 */
export default class YesodCSSGenerator extends BittulSoul {
    constructor() {
        super();
        this.surrenderToAwtsmoos('YesodCSSGenerator');
    }

    /**
     * @method forgeStyles
     * @description Takes raw objects and extracts the divine form from nothingness.
     * @param {Object} styleSchema - Extreme data mapping.
     * @returns {string} Fully formulated stylesheet payload.
     */
    forgeStyles(styleSchema) {
        let manifestedStyles = '';
        const blocks = Object.entries(styleSchema);

        for (const[selector, guidelines] of blocks) {
            // Is it a global cosmic frame (keyframes) or media queries?
            if (selector.startsWith('@')) {
                manifestedStyles += `${selector} { ${this._unwrapNestedEmanation(guidelines)} }\n`;
            } else {
                manifestedStyles += `${selector} { ${this._compileStandardMitzvos(guidelines)} }\n`;
                // Add pseudo states processing
                if (guidelines['_pseudo']) {
                    manifestedStyles += this._parsePseudoRealms(selector, guidelines['_pseudo']);
                }
            }
        }
        return manifestedStyles;
    }

    /**
     * @method _parsePseudoRealms
     * @private
     * @description Extracts hidden dimensions like :hover, :before, :after
     * @param {string} baseSelector 
     * @param {Object} pseudos 
     * @returns {string} 
     */
    _parsePseudoRealms(baseSelector, pseudos) {
        let expansion = '';
        for (const [state, traits] of Object.entries(pseudos)) {
            expansion += `${baseSelector}${state} { ${this._compileStandardMitzvos(traits)} }\n`;
        }
        return expansion;
    }

    /**
     * @method _compileStandardMitzvos
     * @private
     * @description Transforms camelCase Sefirotic descriptions to Kebab physical limits.
     * @param {Object} laws - Physical parameters.
     * @returns {string}
     */
    _compileStandardMitzvos(laws) {
        return Object.entries(laws)
            .filter(([prop]) => prop !== '_pseudo') // Skip the special keyword
            .map(([attribute, bound]) => {
                const physicalAttr = attribute.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
                return `${physicalAttr}: ${bound};`;
            }).join(' ');
    }

    /**
     * @method _unwrapNestedEmanation
     * @private
     * @description Parses @keyframes
     * @param {Object} deeperLayers 
     * @returns {string}
     */
    _unwrapNestedEmanation(deeperLayers) {
        return Object.entries(deeperLayers)
            .map(([timeDilation, physics]) => `${timeDilation} { ${this._compileStandardMitzvos(physics)} }`)
            .join(' ');
    }

    /**
     * @method anointToCrown
     * @description Directly seizes the DOM HEAD element and anoints it with this style tag.
     * @param {string} domId - The seal id of the vessel tag.
     * @param {Object} styleSchema - The pure JSON array.
     */
    anointToCrown(domId, styleSchema) {
        const textCss = this.forgeStyles(styleSchema);
        let crown = document.head;
        let seal = document.getElementById(domId);
        
        if (!seal) {
            seal = document.createElement('style');
            seal.id = domId;
            crown.appendChild(seal);
        }
        seal.innerHTML = textCss;
    }
}
