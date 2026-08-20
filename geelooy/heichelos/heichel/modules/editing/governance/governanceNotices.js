//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GovernanceNotices
 * @description
 * The Awtsmoos does not let missing transport truth become a silent void;
 * Awtsmoos.com gives failure and absence an authored vessel so uncertainty is named, not destroyed.
 */
import { createGovernanceElement } from './governanceElements.js';

/**
 * Creates a compact authored governance notice for degraded or empty regions.
 * @param {object} options - Notice content.
 * @param {string} options.title - Short human-readable heading.
 * @param {string} options.detail - Explanation or recovery guidance.
 * @param {'neutral'|'warning'|'error'} [options.tone='neutral'] - Semantic tone.
 * @returns {HTMLElement} Accessible custom notice vessel.
 */
export function createGovernanceNotice({
	title,
	detail,
	tone = 'neutral'
}) {
	const notice = createGovernanceElement('div', 'g-empty-state heichel-governance-notice');
	notice.dataset.tone = tone;
	notice.setAttribute('role', tone === 'error' ? 'alert' : 'status');
	const icon = createGovernanceElement(
		'span',
		'g-empty-state-icon',
		tone === 'error' ? '!' : 'א'
	);
	const heading = createGovernanceElement('h4', '', title);
	const copy = createGovernanceElement('p', '', detail);
	notice.append(icon, heading, copy);
	return notice;
}
