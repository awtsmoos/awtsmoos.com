
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';
import MainMenuData from './MainMenuData.js';

/**
 * B"H
 * @file MainMenuGenerator.js
 * 
 * The generator does not touch the DOM directly. It is like the brain
 * planning the speech before it is spoken. It takes the pure thought (MainMenuData)
 * and formats it into the letters of speech (HTML String).
 */

/**
 * @class MainMenuGenerator
 * @extends SederHishtalshelusNode
 * @description Orchestrates the pure HTML generation for the intense front page.
 */
export default class MainMenuGenerator extends SederHishtalshelusNode {
    constructor() {
        super({ worldName: "Beriya_Menu_Formulation" });
        this.dataProvider = new MainMenuData();
    }

    /**
     * @method generateHTML
     * @description Crafts the extreme HTML structure based solely on the data manifest.
     * @returns {string} The raw HTML string.
     */
    generateHTML() {
        this.acknowledgeCreator();
        
        const data = this.dataProvider.getManifest();
        console.log(`B"H - 🏗️ Formulating HTML vessels for the singularity menu...`);

        // We only map over the buttons array, but right now it only contains the ONE true button.
        const buttonsHTML = data.buttons.map(btn => `
            <button 
                id="${btn.id}" 
                class="btn-infinite-void" 
                data-action="${btn.actionType}">
                ${btn.text}
            </button>
        `).join('');

        const finalHTML = `
            <div id="awtsmoos-divine-menu" class="mitzvah-menu-container">
                <h2 class="mitzvah-super-title">${data.superTitle}</h2>
                <h1 class="mitzvah-main-title">${data.mainTitle}</h1>
                <p class="mitzvah-subtitle">${data.subtitle}</p>
                
                <div class="menu-action-cluster">
                    ${buttonsHTML}
                </div>
            </div>
        `;

        return finalHTML;
    }
}
