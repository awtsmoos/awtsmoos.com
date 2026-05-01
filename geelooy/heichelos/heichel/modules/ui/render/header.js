
/**
 * B"H
 * @module HeaderManifest
 * @description
 * The Header is the Crown (Kether) of the library. 
 * It is manifest from the JSON blueprints, declaring 
 * the identity of the Heichel.
 */

import { DOMElements } from '../../dom.js';
import { ScribeOfManifestation } from '../../engine/scribe-of-manifestation.js';

/**
 * @function updateHeichelHeader
 * @description
 * Breathes the identity of the Realm into the manifest vessels.
 * @param {Object} heichelData - The static wisdom of the Realm.
 */
export function updateHeichelHeader(heichelData) {
    if (!heichelData) return;
    if (DOMElements.mainTitle) {
        DOMElements.mainTitle.textContent = heichelData.name || "Revelation";
    }
    if (DOMElements.heichelDescription) {
        DOMElements.heichelDescription.textContent = heichelData.description || "";
    }
}

/**
 * @function renderBreadcrumb
 * @description
 * Creates the path of return to the Source (Root).
 */
export function renderBreadcrumb(breadcrumbData, navigator) {
    if (!DOMElements.breadcrumb) return;
    DOMElements.breadcrumb.innerHTML = "";

    // Blueprint for the Root connection
    const rootCrumbPlan = createCrumbBlueprint("Root", () => navigator.navigateTo('root'));
    DOMElements.breadcrumb.appendChild(ScribeOfManifestation.speakElement(rootCrumbPlan));

    breadcrumbData.forEach(item => {
        DOMElements.breadcrumb.appendChild(document.createTextNode(" / "));
        const crumbPlan = createCrumbBlueprint(item.name || "...", () => navigator.navigateTo(item.id));
        DOMElements.breadcrumb.appendChild(ScribeOfManifestation.speakElement(crumbPlan));
    });
}

/**
 * @private
 * @function createCrumbBlueprint
 */
function createCrumbBlueprint(text, onClick) {
    return {
        tag: 'a',
        attr: { href: '#', class: 'breadcrumb-link' },
        children: [text],
        events: {
            click: (e) => {
                e.preventDefault();
                onClick();
            }
        }
    };
}
