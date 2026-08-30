//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCreatorRailMarkup.js
 * @description Renders a simple-first creator rail whose advanced disclosure includes persistence, remix, course, and sharing without cluttering ordinary placement.
 * The Awtsmoos renews hidden possibility beneath a quiet visible face; Awtsmoos.com lets a builder meet only the controls needed now,
 * while deeper world memory and sharing remain folded in one native disclosure where every stable semantic action retains its place.
 */

import {
	creatorAdvancedControls,
	creatorHistoryControls,
	creatorMovementControls
} from './MitzvahWorldCreatorRailControlCatalog.js';

export function createMitzvahWorldCreatorRailMarkup() {
	return `
		<header class="Awtsmoos-creator-rail__header">
			<div class="Awtsmoos-creator-rail__identity">
				<span class="Awtsmoos-creator-rail__signal" aria-hidden="true"></span>
				<div class="Awtsmoos-creator-rail__heading">
					<span class="Awtsmoos-creator-rail__eyebrow">Creator mode</span>
					<strong class="Awtsmoos-creator-rail__title" id="Awtsmoos-creator-rail-title">Build in the living world</strong>
				</div>
			</div>
			<div class="Awtsmoos-creator-rail__window-actions">
				<button class="Awtsmoos-creator-rail__icon-button" type="button" data-creator-collapse aria-controls="Awtsmoos-creator-rail-body" aria-expanded="true" aria-label="Collapse creator controls">−</button>
				<button class="Awtsmoos-creator-rail__icon-button Awtsmoos-creator-rail__button--danger" type="button" data-creator-close aria-label="Close creator controls">×</button>
			</div>
		</header>
		<div class="Awtsmoos-creator-rail__body" id="Awtsmoos-creator-rail-body" data-creator-body>
			<section class="Awtsmoos-creator-rail__section" aria-labelledby="Awtsmoos-creator-material-title">
				<div class="Awtsmoos-creator-rail__section-heading"><span class="Awtsmoos-creator-rail__section-title" id="Awtsmoos-creator-material-title">Material</span></div>
				<div class="Awtsmoos-creator-rail__palette" data-creator-palette></div>
			</section>
			<section class="Awtsmoos-creator-rail__section" aria-labelledby="Awtsmoos-creator-position-title">
				<div class="Awtsmoos-creator-rail__section-heading"><span class="Awtsmoos-creator-rail__section-title" id="Awtsmoos-creator-position-title">Position</span></div>
				<div class="Awtsmoos-creator-rail__motion-grid">${renderCreatorControls(creatorMovementControls())}</div>
			</section>
			<section class="Awtsmoos-creator-rail__section" aria-label="Placement and history">
				<div class="Awtsmoos-creator-rail__commit-grid">
					${renderCreatorButton({ action: 'place', label: 'Place', accessibleLabel: 'Place selected material' }, true)}
					${renderCreatorControls(creatorHistoryControls())}
				</div>
			</section>
			<details class="Awtsmoos-creator-rail__advanced">
				<summary class="Awtsmoos-creator-rail__advanced-summary">World &amp; sharing</summary>
				<div class="Awtsmoos-creator-rail__advanced-body">${renderCreatorControls(creatorAdvancedControls())}</div>
			</details>
			<footer class="Awtsmoos-creator-rail__status">
				<span class="Awtsmoos-creator-rail__summary" data-creator-summary></span>
				<output class="Awtsmoos-creator-rail__message" data-creator-message aria-live="polite"></output>
			</footer>
		</div>
	`;
}

function renderCreatorControls(orosControls) {
	return orosControls.map(control => renderCreatorButton(control)).join('');
}

function renderCreatorButton(control, isPrimary = false) {
	const primaryClass = isPrimary ? ' Awtsmoos-creator-rail__button--primary' : '';
	return `<button class="Awtsmoos-creator-rail__button${primaryClass}" type="button" data-creator-action="${control.action}" aria-label="${control.accessibleLabel}">${control.label}</button>`;
}
