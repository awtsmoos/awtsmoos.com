// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HomeComposerSubmission
 * @description
 * Carries posts, Heichel creation, and series creation through the real social
 * API. The Awtsmoos turns intention into a durable object on Awtsmoos.com while
 * every pending, successful, and recoverable failure state remains visible.
 */
import {
	createIkarPostDraft,
	createSeries,
	resolvePostingHome
} from '../ikarFeedApi.js';
import {
	setComposerBusy,
	setComposerStatus
} from './state.js';

/** Publishes the current composer form through the real submission endpoint. */
export async function submitComposer(form) {
	if (!form.reportValidity()) {
		setComposerStatus(form, 'Complete the highlighted fields before publishing.', 'error');
		return false;
	}
	const editor = form.querySelector('[data-home-html-editor]');
	form.elements.content.value = editor?.innerHTML.trim() || form.elements.title.value;
	setComposerBusy(form, true);
	setComposerStatus(form, 'Publishing through your Heichel…', 'loading');
	try {
		const result = await createIkarPostDraft(composerPayload(form));
		if (!result?.success) {
			throw new Error('The server returned without confirming publication.');
		}
		setComposerStatus(form, 'Published or submitted. The live river will refresh soon.', 'success');
		return true;
	} catch (error) {
		setComposerStatus(form, `Could not publish yet: ${error.message}`, 'error');
		return false;
	} finally {
		setComposerBusy(form, false);
	}
}

/** Resolves or creates the requested Heichel and paints its confirmed ID. */
export async function createComposerHeichel(form) {
	setComposerBusy(form, true);
	setComposerStatus(form, 'Creating your Heichel…', 'loading');
	try {
		const target = await resolvePostingHome({
			aliasId: form.elements.aliasId.value,
			heichelId: form.elements.heichelId.value,
			createHeichelName: form.elements.newHeichelName.value || 'My Posts'
		});
		form.elements.heichelId.value = target.heichelId;
		setComposerStatus(form, `Heichel ready: ${target.heichelId}`, 'success');
	} catch (error) {
		setComposerStatus(form, `Could not create Heichel: ${error.message}`, 'error');
	} finally {
		setComposerBusy(form, false);
	}
}

/** Creates a series below the selected parent and paints its confirmed ID. */
export async function createComposerSeries(form) {
	setComposerBusy(form, true);
	setComposerStatus(form, 'Creating the series…', 'loading');
	try {
		const seriesId = await createSeries({
			aliasId: form.elements.aliasId.value,
			heichelId: form.elements.heichelId.value || 'ikar',
			seriesName: form.elements.newSeriesName.value || 'New Series',
			parentSeriesId: form.elements.seriesId.value || 'root'
		});
		form.elements.seriesId.value = seriesId;
		setComposerStatus(form, `Series ready: ${seriesId}`, 'success');
	} catch (error) {
		setComposerStatus(form, `Could not create series: ${error.message}`, 'error');
	} finally {
		setComposerBusy(form, false);
	}
}

function composerPayload(form) {
	return {
		aliasId: form.elements.aliasId.value,
		heichelId: form.elements.heichelId.value,
		seriesId: form.elements.seriesId.value,
		createHeichelName: form.elements.newHeichelName.value,
		createSeriesName: form.elements.newSeriesName.value,
		title: form.elements.title.value,
		content: form.elements.content.value,
		sections: collectVerses(form)
	};
}

function collectVerses(form) {
	return [...form.querySelectorAll('[data-home-verses] article')]
		.map((row, index) => {
			const title = row.querySelector('[name="verseTitle"]')?.value.trim() || '';
			const content = row.querySelector('[name="verseText"]')?.value.trim() || '';
			return {
				id: `home-${index + 1}`,
				title: title || `Verse ${index + 1}`,
				content
			};
		})
		.filter(verse => verse.content || verse.title !== `Verse ${verse.id.split('-').at(-1)}`);
}
