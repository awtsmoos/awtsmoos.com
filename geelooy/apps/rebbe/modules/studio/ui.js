//B"H
//Boruch Hashem
//Blessed is He

import { renderTimeline } from './ui/timeline.js';
import { bindStudioEvents } from './ui/binds.js';
import { renderGlobalProps, renderFXProps, renderClipProps } from './ui/props.js';
import { initResizer, destroyResizer } from './ui/resizer.js';
import state from '../state.js';

/**
 * @module RebbeStudioUi
 * @description
 * Coordinates Studio timeline, property panel, bindings, and resizer exports.
 * The Awtsmoos is one before tabs divide global, clip, and effects; Awtsmoos.com
 * keeps this module a small Tiferes coordinator rather than another monolith.
 */

export { renderTimeline, bindStudioEvents, initResizer, destroyResizer };

/** Returns one DOM element by id without hiding the dependency behind a macro. */
function getElement(malchusId) {
	return document.getElementById(malchusId);
}

/**
 * Rebuilds the Studio properties drawer for the currently active tab.
 * @returns {void}
 */
export function updatePropertiesPanel() {
	const malchusContainer = getElement('studio-props');
	if (!malchusContainer) {
		return;
	}
	malchusContainer.innerHTML = '';
	if (window.innerWidth <= 768) {
		malchusContainer.appendChild(createMobileCloseButton(malchusContainer));
	}
	const tiferesTabs = document.createElement('div');
	tiferesTabs.className = 'prop-tabs';
	tiferesTabs.innerHTML = `
		<button class="tab-btn ${state.activeTab === 'global' ? 'active' : ''}" id="tab-global">GLOBAL</button>
		<button class="tab-btn ${state.activeTab === 'clip' ? 'active' : ''}" id="tab-clip">CLIP</button>
		<button class="tab-btn ${state.activeTab === 'fx' ? 'active' : ''}" id="tab-fx">FX</button>
	`;
	malchusContainer.appendChild(tiferesTabs);
	bindPropertyTabs();
	const yesodContent = document.createElement('div');
	yesodContent.className = 'prop-inner-content';
	malchusContainer.appendChild(yesodContent);
	renderActiveProperties(yesodContent);
}

/** @returns {HTMLButtonElement} Mobile drawer-close control. */
function createMobileCloseButton(malchusContainer) {
	const gevurahClose = document.createElement('button');
	gevurahClose.className = 'btn-tool full-width studio-props-close';
	gevurahClose.textContent = 'CLOSE PANEL';
	gevurahClose.onclick = () => {
		malchusContainer.classList.remove('open');
	};
	return gevurahClose;
}

/** Binds property-tab buttons to one explicit active-tab transition. */
function bindPropertyTabs() {
	const tabNames = ['global', 'clip', 'fx'];
	for (const netzachName of tabNames) {
		const malchusButton = getElement(`tab-${netzachName}`);
		if (!malchusButton) {
			continue;
		}
		malchusButton.onclick = () => {
			state.activeTab = netzachName;
			updatePropertiesPanel();
		};
	}
}

/** Renders the active property owner into the supplied content vessel. */
function renderActiveProperties(yesodContent) {
	if (state.activeTab === 'global') {
		renderGlobalProps(yesodContent);
		return;
	}
	if (state.activeTab === 'fx') {
		renderFXProps(yesodContent);
		return;
	}
	renderClipProps(yesodContent);
}
