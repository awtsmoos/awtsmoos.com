//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module BrowserComposerJourney
 * @description
 * Chrome composes rich question content, precise verses, media, a verified
 * publication plan, local restoration, answer mode, and final execution. The
 * Awtsmoos gives the living thought while Awtsmoos.com proves every visible vessel.
 */
import { BROWSER_MEDIA_FIXTURE } from './BrowserMediaFixture.mjs';
import { waitForState } from './BrowserIdentityJourney.mjs';
export async function composeQuestion(client) {
	const fixture = JSON.stringify(BROWSER_MEDIA_FIXTURE);
	return client.evaluate(`(async () => {
		const media = ${fixture};
		const change = (id, value, eventName = 'input') => {
			const element = document.getElementById(id);
			element.value = value;
			element.dispatchEvent(new Event(eventName, { bubbles: true }));
		};
		change('postKind', 'question', 'change');
		change('title', 'What does the first verse reveal?');
		change('summary', 'A question with voice, image, video, exact verse discussion, and a moderated reference.');
		change('answerPolicy', 'onePerAlias', 'change');
		change('answerGuidance', 'Bring a source and explain your reasoning.');
		const root = document.querySelector('#rootBlocks textarea');
		root.value = '**Light** enters through a [safe link](https://awtsmoos.com).';
		root.dispatchEvent(new Event('input', { bubbles: true }));
		document.getElementById('addSectionButton').click();
		await new Promise(resolve => setTimeout(resolve, 50));
		const section = document.querySelector('.sectionEditor');
		const sectionTitle = section.querySelector('.sectionHeader input');
		sectionTitle.value = 'Verse One';
		sectionTitle.dispatchEvent(new Event('input', { bubbles: true }));
		const sectionText = section.querySelector('.blockEditor textarea');
		sectionText.value = '_A verse_ with a precise comment coordinate.';
		sectionText.dispatchEvent(new Event('input', { bubbles: true }));
		section.querySelector('.subsectionList .secondaryAction').click();
		await new Promise(resolve => setTimeout(resolve, 50));
		const subsection = document.querySelector('.subsectionEditor');
		const subsectionTitle = subsection.querySelector('.sectionHeader input');
		subsectionTitle.value = 'First word';
		subsectionTitle.dispatchEvent(new Event('input', { bubbles: true }));
		window.RichSocialComposer.state.mutate('attachments:add', snapshot => {
			snapshot.rootAttachments.push(
				uploaded('image-one', 'image', 'image/svg+xml', media.image),
				uploaded('audio-one', 'audio', 'audio/wav', media.audio),
				uploaded('video-one', 'video', 'video/mp4', media.video)
			);
		});
		await new Promise(resolve => setTimeout(resolve, 60));
		document.getElementById('saveLocalButton').click();
		document.getElementById('previewPlanButton').click();
		return true;
		function uploaded(id, type, mime, publicPath) {
			return { id, name: id, type, mime, publicPath, status: 'uploaded', alt: id, caption: '' };
		}
	})()`);
}
export async function inspectComposed(client) {
	await waitForState(
		client,
		`document.getElementById('publicationPlanResult').textContent.includes('submitPlacement')`,
		'Publication plan did not reveal moderated placement'
	);
	return client.evaluate(`(() => ({
		payload: window.RichSocialComposer.payload(),
		plan: window.RichSocialComposer.publicationPlan(),
		preview: {
			images: document.querySelectorAll('#postPreview img').length,
			audio: document.querySelectorAll('#postPreview audio').length,
			video: document.querySelectorAll('#postPreview video').length,
			coordinates: document.querySelectorAll('.discussionCoordinate').length
		},
		status: document.getElementById('statusMessage').textContent,
		planResult: document.getElementById('publicationPlanResult').textContent
	}))()`);
}
export async function inspectRestored(client) {
	return client.evaluate(`(() => {
		const snapshot = window.RichSocialComposer.state.snapshot();
		return {
			title: snapshot.title,
			kind: snapshot.postKind,
			sections: snapshot.sections.length,
			subsections: snapshot.sections[0]?.subsections.length || 0,
			media: snapshot.rootAttachments.length,
			secondary: snapshot.secondaryDestinations.length,
			aliasId: snapshot.identity.aliasId,
			heichelId: snapshot.identity.heichelId,
			seriesId: snapshot.identity.seriesId
		};
	})()`);
}
export async function publishCurrent(client) {
	await client.evaluate(`document.getElementById('publishButton').click()`);
	await waitForState(
		client,
		`document.getElementById('publishResult').textContent.includes('published-one')`,
		'Unified publication did not complete'
	);
	return client.evaluate(`(() => ({
		status: document.getElementById('statusMessage').textContent,
		result: JSON.parse(document.getElementById('publishResult').textContent)
	}))()`);
}
export async function inspectAnswerMode(client) {
	return client.evaluate(`(() => ({
		kind: window.RichSocialComposer.state.snapshot().postKind,
		questionId: window.RichSocialComposer.state.snapshot().questionId,
		locked: document.getElementById('postKind').disabled,
		contextVisible: !document.getElementById('answerContext').hidden
	}))()`);
}
