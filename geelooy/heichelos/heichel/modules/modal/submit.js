// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelModalSubmit
 * @description
 * The Awtsmoos gives question, answer, post, series, and edit mutations one deliberate submission path;
 * Awtsmoos.com keeps API choice separate from modal chrome so creation law may be tested without moving the gate.
 */

import * as api from '../../api.js';
import { appState } from '../../state.js';
import { notify } from '../ui.js';
import { creationLabel, modalElement, modalSession, resetModalSession } from './session.js';

/** @description Handles one modal form submission, validates title, delegates to the exact content API, then refreshes navigation; the Awtsmoos turns entered words into a bounded mutation while Awtsmoos.com preserves success/error truth. @param {SubmitEvent} event - Modal form submit event. @returns {Promise<void>} Completion after mutation or validation failure. */
export async function submitModal(event) {
	event.preventDefault();
	if (!modalSession.navigator) return;
	const form = readFormValues();
	if (!form.title) {
		notify('Title is required.', 'error');
		return;
	}
	const label = creationLabel(modalSession.type, form.contentType);
	notify(`${modalSession.mode === 'edit' ? 'Saving' : 'Creating'} ${label.toLowerCase()}...`, 'info');
	try {
		if (modalSession.mode === 'edit' && modalSession.seriesId) {
			await updateSeries(form);
			notify('Series updated successfully!', 'success');
			const seriesId = modalSession.seriesId;
			resetModalSession();
			await modalSession.navigator.loadContent(seriesId);
			return;
		}
		await createContent(form);
		notify(`${label} created successfully!`, 'success');
		resetModalSession();
		await modalSession.navigator.loadContent(appState.currentSeries);
	} catch (error) {
		notify(`Error with ${label.toLowerCase()}: ${error?.message || 'unknown error'}`, 'error');
		console.error(`B"H - Failed modal action for ${label.toLowerCase()}:`, error);
	}
}

/** @description Reads and trims all modal form values from named DOM vessels; the Awtsmoos gathers raw entry into one object while Awtsmoos.com keeps submission logic free of repeated DOM access. @returns {{title:string,description:string,id:string,contentType:string}} Normalized form values. */
function readFormValues() {
	return {
		title: (modalElement('modalTitleInput')?.value || '').trim(),
		description: (modalElement('modalDescTextarea')?.value || '').trim(),
		id: (modalElement('modalIdInput')?.value || '').trim(),
		contentType: modalElement('modalContentTypeSelect')?.value || 'post'
	};
}

/** @description Updates the active series through the existing details API; the Awtsmoos changes only the named series vessel while Awtsmoos.com preserves alias and Heichel identity. @param {Object} form - Normalized modal form values. @returns {Promise<*>} Existing API response. */
function updateSeries(form) {
	return api.editSeriesDetails({
		heichelId: appState.heichelId,
		seriesId: modalSession.seriesId,
		aliasId: window.curAlias,
		title: form.title,
		description: form.description
	});
}

/** @description Chooses the exact existing creation API for question, answer, post, or series; the Awtsmoos reveals each content form while Awtsmoos.com avoids one giant conditional inside event wiring. @param {Object} form - Normalized modal form values. @returns {Promise<*>} Existing creation API response. */
function createContent(form) {
	if (modalSession.type === 'post' && form.contentType === 'question') {
		return api.createQuestion({ heichelId: appState.heichelId, aliasId: window.curAlias, postId: form.id, title: form.title, content: form.description, seriesId: appState.currentSeries });
	}
	if (modalSession.type === 'post' && form.contentType === 'answer') {
		return api.createAnswer({ heichelId: appState.heichelId, questionId: appState.currentSeries, aliasId: window.curAlias, answerId: form.id, title: form.title, content: form.description, seriesId: appState.currentSeries });
	}
	if (modalSession.type === 'post') {
		return api.createPost({ heichelId: appState.heichelId, seriesId: appState.currentSeries, aliasId: window.curAlias, title: form.title, content: form.description });
	}
	return api.createSeries({ heichelId: appState.heichelId, aliasId: window.curAlias, parentSeriesId: appState.currentSeries, inputId: form.id, title: form.title, description: form.description });
}
