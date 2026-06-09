// B"H
/**
 * @module HeaderManifest
 * @description
 * Chapter 290: Breadcrumbs gather before touching the page.
 *
 * The header and breadcrumb renderer now use fragments and DOM replacement,
 * reducing repeated layout contact while keeping the path of return clear.
 */

import { DOMElements } from '../../dom.js';
import { ScribeOfManifestation } from '../../engine/scribe-of-manifestation.js';
import { VoidPurifier } from '../../utils/VoidPurifier.js';

export function updateHeichelHeader(heichelData) {
    if (!heichelData) return;
    const cleanName = VoidPurifier.purify(heichelData.name) || 'Revelation';
    const cleanDesc = VoidPurifier.purify(heichelData.description);
    if (DOMElements.mainTitle) DOMElements.mainTitle.textContent = cleanName;
    if (DOMElements.heichelDescription) DOMElements.heichelDescription.textContent = cleanDesc;
}

export function renderBreadcrumb(breadcrumbData, navigator) {
    if (!DOMElements.breadcrumb) return;
    const fragment = document.createDocumentFragment();
    fragment.appendChild(ScribeOfManifestation.speakElement(createCrumbBlueprint('Root', () => navigator.navigateTo('root'))));
    for (const item of breadcrumbData || []) {
        const separator = document.createElement('span');
        separator.className = 'breadcrumb-separator';
        separator.textContent = '/';
        fragment.appendChild(separator);
        const cleanCrumbName = VoidPurifier.purify(item.name) || '...';
        fragment.appendChild(ScribeOfManifestation.speakElement(createCrumbBlueprint(cleanCrumbName, () => navigator.navigateTo(item.id))));
    }
    DOMElements.breadcrumb.replaceChildren(fragment);
}

function createCrumbBlueprint(text, onClick) {
    return {
        tag: 'button',
        attr: { class: 'breadcrumb-link', type: 'button' },
        children: [text],
        events: {
            click: event => {
                event.preventDefault();
                onClick();
            }
        }
    };
}
