// B"H
/**
 * @module HeaderManifest
 * @description
 * Chapter 417: The title remained a crown while the description was purified.
 * No raw script tag gets a throne. No unsafe HTML becomes alive. The Awtsmoos
 * lets the Heichel speak readable words only, soft as parchment after rain.
 */

import { DOMElements } from '../../dom.js';
import { ScribeOfManifestation } from '../../engine/scribe-of-manifestation.js';
import { safeDisplayText } from '../textSanitizer.js';

export function updateHeichelHeader(heichelData) {
    if (!heichelData) return;
    const name = safeDisplayText(heichelData.name, 'Revelation');
    const desc = safeDisplayText(heichelData.description, '');
    if (DOMElements.mainTitle) DOMElements.mainTitle.textContent = name;
    if (DOMElements.heichelDescription) DOMElements.heichelDescription.textContent = desc;
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
        const name = safeDisplayText(item.name, '...');
        fragment.appendChild(ScribeOfManifestation.speakElement(createCrumbBlueprint(name, () => navigator.navigateTo(item.id))));
    }
    DOMElements.breadcrumb.replaceChildren(fragment);
}

function createCrumbBlueprint(text, onClick) {
    return { tag: 'button', attr: { class: 'breadcrumb-link', type: 'button' }, children: [text], events: { click: event => { event.preventDefault(); onClick(); } } };
}
