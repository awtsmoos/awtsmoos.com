//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PublicAudienceTruth
 * @description
 * The Awtsmoos continuously creates both the visible selector and the server law beneath it;
 * Awtsmoos.com makes those layers agree by turning stale privacy choices into one honest Public vessel.
 * This module changes presentation only; scheduling, moderation, and publication execution remain elsewhere.
 */
import { SOCIAL_PUBLICATION_POLICY } from './SocialPublicationPolicy.js';

export const PUBLIC_AUDIENCE_NOTE_ID = 'publicAudienceTruth';

/**
 * Replaces legacy audience choices with the currently enforceable public-only contract.
 * @param {Document|object} documentValue Document-like composer root.
 * @returns {boolean} True when a legacy visibility selector was found and normalized.
 */
export function installPublicAudienceTruth(documentValue = document) {
	const select = documentValue?.getElementById?.('visibility');
	if (!select) return false;
	const option = documentValue.createElement('option');
	option.value = SOCIAL_PUBLICATION_POLICY.visibility;
	option.textContent = SOCIAL_PUBLICATION_POLICY.label;
	select.replaceChildren(option);
	select.value = SOCIAL_PUBLICATION_POLICY.visibility;
	select.disabled = true;
	select.dataset.publicOnly = 'true';
	select.setAttribute('aria-describedby', PUBLIC_AUDIENCE_NOTE_ID);
	installAudienceNote(documentValue, select);
	markChecklistTruth(documentValue);
	return true;
}

function installAudienceNote(documentValue, select) {
	const label = select.closest?.('label');
	if (!label || documentValue.getElementById?.(PUBLIC_AUDIENCE_NOTE_ID)) return;
	const note = documentValue.createElement('small');
	note.id = PUBLIC_AUDIENCE_NOTE_ID;
	note.className = 'publicAudienceTruth';
	note.textContent = SOCIAL_PUBLICATION_POLICY.note;
	label.append(note);
}

function markChecklistTruth(documentValue) {
	const checklist = documentValue.querySelector?.('[data-check="visibility"]');
	if (!checklist) return;
	checklist.dataset.state = 'complete';
	const label = checklist.querySelector?.('span');
	const status = checklist.querySelector?.('small');
	if (label) label.textContent = 'Public audience confirmed';
	if (status) status.textContent = 'Public by current social contract';
}

export { installAudienceNote, markChecklistTruth };
