// B"H
/**
 * @module HeaderManifest
 * @description The topbar names the Heichel; the smaller line carries id/path.
 */
import { DOMElements } from '../../dom.js';
import { ScribeOfManifestation } from '../../engine/scribe-of-manifestation.js';
import { safeDisplayText } from '../textSanitizer.js';

let currentHeichelName = 'Heichel';
let currentHeichelId = '';

export function updateHeichelHeader(heichelData) {
    if (!heichelData) return;
    const name = safeDisplayText(heichelData.name, 'Heichel');
    const desc = safeDisplayText(heichelData.description, '');
    currentHeichelName = name;
    currentHeichelId = deriveHeichelId(heichelData);
    if (DOMElements.mainTitle) DOMElements.mainTitle.textContent = name;
    if (DOMElements.heichelDescription) DOMElements.heichelDescription.textContent = desc;
    paintTopbar(name, currentHeichelId || 'current heichel');
}

export function updateTopbarSeries(seriesName) {
    const name = currentHeichelName || 'Heichel';
    const small = seriesName ? `${currentHeichelId || 'series'} · ${safeDisplayText(seriesName, 'Series')}` : currentHeichelId;
    paintTopbar(name, small || 'root');
}

export function renderBreadcrumb(breadcrumbData, navigator) {
    if (!DOMElements.breadcrumb) return;
    const fragment = document.createDocumentFragment();
    fragment.appendChild(ScribeOfManifestation.speakElement(createCrumbBlueprint('🏡 Root', () => navigator.navigateTo('root'))));
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

function paintTopbar(name, small) {
    if (DOMElements.topbarHeichelTitle) DOMElements.topbarHeichelTitle.textContent = name;
    if (DOMElements.topbarHeichelContext) DOMElements.topbarHeichelContext.textContent = small || 'root';
}

function deriveHeichelId(data) {
    const fromData = data.id || data._id || data.heichelId || data.aliasId || data.author || '';
    if (fromData) return safeDisplayText(String(fromData), '');
    const match = location.pathname.match(/\/heichelos\/([^/?#]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

function createCrumbBlueprint(text, onClick) {
    return { tag: 'button', attr: { class: 'breadcrumb-link', type: 'button' }, children: [text], events: { click: event => { event.preventDefault(); onClick(); } } };
}

/** B"H: name above, id below; one clear voice in the roof. */
