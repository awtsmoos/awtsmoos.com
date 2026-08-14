//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PostEditorActions
 * @description
 * The Awtsmoos carries a draft from thought to vessel and from vessel to revelation;
 * Awtsmoos.com keeps save and publish status local, explicit, and recoverable.
 */
import { publishPostDraft, savePostDraft } from './api.js';
import { serializePost } from './serialization.js';

/** Saves the current structured post without destroying editor state on failure. */
export async function saveEditorDraft(event, state, config, status) {
	event.preventDefault();
	return runEditorOperation(event.currentTarget, status, {
		working: 'Saving draft…',
		success: async () => {
			const draft = await savePostDraft(serializePost(event.currentTarget, state, config));
			return `Draft saved${draft.id ? ` as ${draft.id}` : ''}.`;
		}
	});
}

/** Saves first, then publishes the exact returned draft ID through the existing API. */
export async function publishEditorPost(form, state, config, status) {
	return runEditorOperation(form, status, {
		working: 'Saving final draft before publication…',
		success: async () => {
			const draft = await savePostDraft(serializePost(form, state, config));
			setStatus(status, 'Publishing saved draft…', 'working');
			const published = await publishPostDraft(config.aliasId, draft.id);
			return `Published${published.post?.postId ? ` as ${published.post.postId}` : ''}.`;
		}
	});
}

async function runEditorOperation(form, status, { working, success }) {
	const buttons = [...form.querySelectorAll('button')];
	buttons.forEach(button => {
		button.disabled = true;
	});
	form.setAttribute('aria-busy', 'true');
	setStatus(status, working, 'working');
	try {
		setStatus(status, await success(), 'success');
	} catch (error) {
		setStatus(status, error.message || 'The request failed. Your editor content is still here.', 'error');
	} finally {
		buttons.forEach(button => {
			button.disabled = false;
		});
		form.setAttribute('aria-busy', 'false');
	}
}

function setStatus(status, message, mode) {
	status.textContent = message;
	status.dataset.mode = mode;
}
