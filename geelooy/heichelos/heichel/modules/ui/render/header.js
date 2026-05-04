
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
import { VoidPurifier } from '../../utils/VoidPurifier.js';

/**
 * @function updateHeichelHeader
 * @description
 * Breathes the identity of the Realm into the manifest vessels.
 * @param {Object} heichelData - The static wisdom of the Realm.
 */
export function updateHeichelHeader(heichelData) {
    if (!heichelData) return;
    
    // B"H - Purify the titles and descriptions from the void
    const cleanName = VoidPurifier.purify(heichelData.name) || "Revelation";
    const cleanDesc = VoidPurifier.purify(heichelData.description);

    if (DOMElements.mainTitle) {
        DOMElements.mainTitle.textContent = cleanName;
    }
    if (DOMElements.heichelDescription) {
        DOMElements.heichelDescription.textContent = cleanDesc;
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
        // B"H - Intense breadcrumb separator
        const separator = document.createElement("span");
        separator.className = "breadcrumb-separator";
        separator.textContent = "/";
        DOMElements.breadcrumb.appendChild(separator);
        
        const cleanCrumbName = VoidPurifier.purify(item.name) || "...";
        const crumbPlan = createCrumbBlueprint(cleanCrumbName, () => navigator.navigateTo(item.id));
        DOMElements.breadcrumb.appendChild(ScribeOfManifestation.speakElement(crumbPlan));
    });
}

/**
 * @private
 * @function createCrumbBlueprint
 */
function createCrumbBlueprint(text, onClick) {
    return {
        tag: 'button',
        attr: { class: 'breadcrumb-link' },
        children: [text],
        events: {
            click: (e) => {
                e.preventDefault();
                onClick();
            }
        }
    };
}
