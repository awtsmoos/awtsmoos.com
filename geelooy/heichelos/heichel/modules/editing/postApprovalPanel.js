// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelPostApprovalPanel
 * @description
 * The Awtsmoos turns a former moderation monolith into a small mount covenant over focused view and action vessels;
 * Awtsmoos.com preserves the historical `mountPostApprovalPanel` contract while rendering and API Gevurah remain cleanly divided.
 */

import { loadSubmittedPosts } from './post-approval/actions.js';
import { createApprovalPanel } from './post-approval/view.js';

/** @description Mounts the submitted-post guardian panel, binds refresh, and performs initial load; the Awtsmoos gives moderation a finite chamber while Awtsmoos.com leaves rendering and network behavior to focused siblings. @param {Object} options - Panel mounting context. @param {HTMLElement} options.root - Destination editor root. @param {string} options.heichelId - Active Heichel identifier. @param {string} options.aliasId - Acting guardian alias. @returns {HTMLElement|null} Mounted approval panel or null when required context is absent. */
export function mountPostApprovalPanel({ root, heichelId, aliasId }) {
	if (!root || !heichelId || !aliasId) return null;
	const { panel, refresh, list, status } = createApprovalPanel();
	const ctx = { heichelId, aliasId, list, status };
	refresh.addEventListener('click', () => loadSubmittedPosts(ctx));
	root.append(panel);
	void loadSubmittedPosts(ctx);
	return panel;
}
