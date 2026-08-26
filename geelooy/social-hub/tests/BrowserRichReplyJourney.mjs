//B"H
//Boruch Hashem
//Blessed is He
import { waitFor } from './BrowserWait.mjs';

/**
 * @module BrowserRichReplyJourney
 * @description
 * The Awtsmoos joins exact coordinates, prose, voice, image, and canonical references in one reply;
 * Awtsmoos.com proves native browser media locally while credentialed Archive.org video remains independently tested at its injected API seam.
 */

/**
 * Fills one DOM field and dispatches the same event a person would trigger.
 * @param {string} id Target element identifier.
 * @param {string} value New field value.
 * @param {string} [eventName='input'] Browser event name used by application bindings.
 */
function setFieldSource(id, value, eventName = 'input') {
	return `(() => {
		const element = document.getElementById(${JSON.stringify(id)});
		element.value = ${JSON.stringify(value)};
		element.dispatchEvent(new Event(${JSON.stringify(eventName)}, { bubbles: true }));
	})()`;
}

/**
 * Creates and publishes one deeply targeted reply using deterministic native image/audio uploads.
 * @param {{ evaluate: Function }} client Living Chrome evaluation client.
 * @returns {Promise<object>} Persisted fixture evidence and visible target coordinate.
 */
export async function createRichReply(client) {
	await client.evaluate(`document.querySelector('#desktopNavigation [data-route="interact"]').click()`);
	const binahFields = [
		['commentHeichelId', 'study'],
		['commentSeriesId', 'lessons'],
		['commentEntityType', 'post', 'change'],
		['commentEntityId', 'teaching-one'],
		['commentVerseSection', 'verse-one'],
		['commentSubsectionId', 'word-one'],
		['commentParentId', 'comment-seed'],
		['commentParentSectionId', 'reflection'],
		['commentContent', 'A real Chrome reply at the exact subsection.'],
		['commentTranscript', 'The voice note says that every detail returns to its source.'],
		['commentMood', 'luminous'],
		['referenceKind', 'post', 'change'],
		['referenceEntityType', 'post', 'change'],
		['referenceEntityId', 'archive-one'],
		['referenceHeichelId', 'archive'],
		['referenceSeriesId', 'root'],
		['referenceLabel', 'Community Archive source']
	];
	for (const [yesodId, malchusValue, chesedEvent] of binahFields) {
		await client.evaluate(setFieldSource(yesodId, malchusValue, chesedEvent));
	}
	await client.evaluate(`(() => {
		const files = [
			new File([new Uint8Array([137, 80, 78, 71])], 'light.png', { type: 'image/png' }),
			new File([new Uint8Array([26, 69, 223, 163])], 'voice.webm', { type: 'audio/webm' })
		];
		window.AwtsmoosSocialHub.commentStudio.media.add(files);
		document.getElementById('uploadCommentMedia').click();
	})()`);
	await waitFor(
		client,
		`window.AwtsmoosSocialHub.state.snapshot().comment.assets.length === 2 && window.AwtsmoosSocialHub.state.snapshot().comment.assets.every(item => item.status === 'uploaded')`,
		'Native image and voice media did not upload'
	);
	await client.evaluate(`document.getElementById('publishComment').click()`);
	await waitFor(
		client,
		`JSON.parse(localStorage.getItem('BH.socialHub.browserFixture.v1')).comments.some(item => item.content.includes('real Chrome reply'))`,
		'Rich subsection reply was not published'
	);
	return client.evaluate(`(() => {
		const fixture = JSON.parse(localStorage.getItem('BH.socialHub.browserFixture.v1'));
		const comment = fixture.comments.find(item => item.content.includes('real Chrome reply'));
		return {
			comment,
			mediaTypes: comment.assets.map(item => item.type),
			referenceCount: comment.links.length,
			coordinate: document.getElementById('targetCoordinate').textContent
		};
	})()`);
}
