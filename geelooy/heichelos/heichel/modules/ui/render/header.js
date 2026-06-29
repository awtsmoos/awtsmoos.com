// B"H
/**
 * @module HeaderManifest
 * @description The pinned Heichel crown mirrors the current collection name.
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
    if (DOMElements.topbarHeichelTitle) DOMElements.topbarHeichelTitle.textContent = `Heichel: ${name}`;
    if (DOMElements.topbarHeichelContext) DOMElements.topbarHeichelContext.textContent = 'Browsing current collection';
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
