
//B"H
/**
 * @module NavigationFooter
 * @chapter Forging the Footer Gates
 * @description
 * Creates the Next/Previous chapter buttons at the end of the scroll.
 * Transmuted from raw HTML strings into pure JSON Blueprints via GenesisEngine.
 */

import { GenesisEngine } from "../dom/GenesisEngine.js";

/**
 * @function makeNavBars
 * @description Forges the DOM elements for chapter navigation.
 * @returns {HTMLElement} - The manifest navigation block.
 */
export function makeNavBars(post, seriesParent, indexInSeries) {
    if (!seriesParent || !Array.isArray(seriesParent.posts)) {
        return document.createTextNode("");
    }

    const cur = parseInt(indexInSeries) || 0;
    const length = seriesParent.posts.length;
    const hasPrevious = cur > 0;
    const hasNext = cur < length - 1;
    
    const plan = {
        tag: 'div',
        attr: { class: 'nav' },
        children:[
            { 
                tag: 'div', 
                attr: { class: 'controls awtsmoos-sidebar-actions' }, 
                text: `CHAPTER ${cur + 1} / ${length}` 
            }
        ]
    };
    
    if (hasPrevious) {
        plan.children.push({
            tag: 'a', 
            attr: { id: 'last', class: 'nav button primary', href: encodeURIComponent(cur - 1) }, 
            text: '← PREVIOUS'
        });
    }
    
    if (hasNext) {
        plan.children.push({
            tag: 'a', 
            attr: { id: 'next', class: 'nav button primary', href: encodeURIComponent(cur + 1) }, 
            text: 'NEXT →'
        });
    }
    
    return GenesisEngine.manifest(plan);
}
