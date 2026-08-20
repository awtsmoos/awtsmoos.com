//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GovernanceElements
 * @description
 * The Awtsmoos gives governance a few truthful keilim for heading, status, and action;
 * Awtsmoos.com lets every mutation speak clearly while native semantics remain the foundation.
 */

/**
 * Creates one semantic DOM element with optional class and visible text.
 * @param {string} tagName - Native element name to manifest.
 * @param {string} [className=''] - Classes applied without inline styling.
 * @param {string} [text=''] - Visible text assigned through textContent.
 * @returns {HTMLElement} The manifested element.
 */
export function createGovernanceElement(tagName, className = '', text = '') {
	const element = document.createElement(tagName);
	if (className) {
		element.className = className;
	}
	if (text) {
		element.textContent = text;
	}
	return element;
}

/**
 * Creates a titled explanatory heading for one governance region.
 * @param {string} title - Short region title.
 * @param {string} detail - Human explanation of the region's authority.
 * @returns {HTMLElement} A composed heading vessel.
 */
export function createGovernanceHeading(title, detail) {
	const heading = createGovernanceElement('div', 'heichel-governance-heading');
	const copy = createGovernanceElement('div', 'heichel-governance-heading-copy');
	copy.append(
		createGovernanceElement('h4', '', title),
		createGovernanceElement('p', '', detail)
	);
	heading.append(copy);
	return heading;
}

/**
 * Creates the shared live region through which async governance state is announced.
 * @returns {HTMLElement} Polite status rail with a neutral initial tone.
 */
export function createGovernanceStatus() {
	const status = createGovernanceElement('div', 'g-status-rail heichel-role-status');
	status.dataset.tone = 'neutral';
	status.setAttribute('role', 'status');
	status.setAttribute('aria-live', 'polite');
	status.textContent = 'Governance ready.';
	return status;
}

/**
 * Updates semantic tone and message without direct style mutation.
 * @param {HTMLElement} status - Existing live status rail.
 * @param {'neutral'|'busy'|'success'|'warning'|'error'} tone - Semantic state.
 * @param {string} message - Human-readable operation result.
 * @returns {void}
 */
export function announceGovernance(status, tone, message) {
	status.dataset.tone = tone;
	status.textContent = message;
}

/**
 * Creates a shared custom button while preserving native button behavior.
 * @param {string} label - Visible action label.
 * @param {'standard'|'danger'|'primary'} [tone='standard'] - Visual action intent.
 * @returns {HTMLButtonElement} Native button with shared Awtsmoos.com classes.
 */
export function createGovernanceButton(label, tone = 'standard') {
	const toneClasses = {
		danger: 'g-danger-charge',
		primary: 'g-primary-charge'
	};
	const button = createGovernanceElement('button', 'g-control', label);
	button.type = 'button';
	if (toneClasses[tone]) {
		button.classList.add(toneClasses[tone]);
	}
	return button;
}
