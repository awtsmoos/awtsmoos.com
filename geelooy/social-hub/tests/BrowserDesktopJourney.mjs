//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserDesktopJourney
 * @description
 * Wide Chrome proves spatial navigation, image/voice/video replies, canonical post
 * references, private activity sharing, ledger pause, profile evidence, and
 * idempotent comment promotion through visible controls beneath the Awtsmoos.
 */

import { waitFor } from './BrowserWait.mjs';

export async function inspectDesktop(client) {
	return client.evaluate(`(() => ({
		desktopRail: getComputedStyle(document.querySelector('.desktopRail')).display,
		mobileDock: getComputedStyle(document.getElementById('mobileNavigation')).display,
		legalLinks: [...document.querySelectorAll('.legalLinks a')].map(link => link.getAttribute('href')),
		alias: window.AwtsmoosSocialHub.state.snapshot().identity.aliasId
	}))()`);
}

export async function createRichReply(client) {
	await client.evaluate(`(() => {
		document.querySelector('#desktopNavigation [data-route="interact"]').click();
		const set = (id, value, eventName = 'input') => {
			const element = document.getElementById(id);
			element.value = value;
			element.dispatchEvent(new Event(eventName, { bubbles: true }));
		};
		set('commentHeichelId', 'study');
		set('commentSeriesId', 'lessons');
		set('commentEntityType', 'post', 'change');
		set('commentEntityId', 'teaching-one');
		set('commentVerseSection', 'verse-one');
		set('commentSubsectionId', 'word-one');
		set('commentParentId', 'comment-seed');
		set('commentParentSectionId', 'reflection');
		set('commentContent', 'A real Chrome reply at the exact subsection.');
		set('commentTranscript', 'The voice note says that every detail returns to its source.');
		set('commentMood', 'luminous');
		set('referenceKind', 'post', 'change');
		set('referenceEntityType', 'post', 'change');
		set('referenceEntityId', 'archive-one');
		set('referenceHeichelId', 'archive');
		set('referenceSeriesId', 'root');
		set('referenceLabel', 'Community Archive source');
		const files = [
			new File([new Uint8Array([137, 80, 78, 71])], 'light.png', { type: 'image/png' }),
			new File([new Uint8Array([26, 69, 223, 163])], 'voice.webm', { type: 'audio/webm' }),
			new File([new Uint8Array([0, 0, 0, 24])], 'report.mp4', { type: 'video/mp4' })
		];
		window.AwtsmoosSocialHub.commentStudio.media.add(files);
		document.getElementById('uploadCommentMedia').click();
	})()`);
	await waitFor(
		client,
		`window.AwtsmoosSocialHub.state.snapshot().comment.assets.length === 3 && window.AwtsmoosSocialHub.state.snapshot().comment.assets.every(item => item.status === 'uploaded')`,
		'Image, voice, and video media did not upload'
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

export async function governActivity(client) {
	await client.evaluate(`document.querySelector('#desktopNavigation [data-route="activity"]').click()`);
	await waitFor(client, `document.querySelectorAll('.activityCard').length > 0`, 'Activity cards did not render');
	await client.evaluate(`(() => {
		const card = document.querySelector('.activityCard');
		const select = card.querySelector('select');
		select.value = 'selected';
		select.dispatchEvent(new Event('change', { bubbles: true }));
		const input = card.querySelector('input');
		input.value = 'reader';
		[...card.querySelectorAll('button')].find(button => button.textContent === 'Save sharing').click();
	})()`);
	await waitFor(
		client,
		`JSON.parse(localStorage.getItem('BH.socialHub.browserFixture.v1')).activity.some(item => item.visibility?.mode === 'selected' && item.visibility.aliases?.includes('reader'))`,
		'Per-event selected-alias sharing did not persist'
	);
	await client.evaluate(`(() => {
		document.querySelector('#desktopNavigation [data-route="privacy"]').click();
		document.getElementById('ledgerEnabled').checked = false;
		document.getElementById('retentionDays').value = '30';
		document.getElementById('privacySave').click();
	})()`);
	await waitFor(
		client,
		`JSON.parse(localStorage.getItem('BH.socialHub.browserFixture.v1')).preferences.enabled === false`,
		'Ledger pause did not persist'
	);
	return client.evaluate(`JSON.parse(localStorage.getItem('BH.socialHub.browserFixture.v1')).preferences`);
}

export async function promoteSeedComment(client) {
	await client.evaluate(`document.querySelector('#desktopNavigation [data-route="profile"]').click()`);
	await waitFor(client, `document.querySelectorAll('#profileComments .commentProfileCard').length >= 2`, 'Profile comments did not refresh');
	await client.evaluate(`(() => {
		const card = [...document.querySelectorAll('#profileComments .commentProfileCard')]
			.find(item => item.textContent.includes('seed comment'));
		[...card.querySelectorAll('button')].find(button => button.textContent === 'Become a post').click();
	})()`);
	await client.evaluate(`document.getElementById('promotionPreview').click()`);
	await waitFor(client, `document.getElementById('promotionResult').textContent.includes('comment-seed')`, 'Promotion preview did not show source comment');
	await client.evaluate(`document.getElementById('promotionPublish').click()`);
	await waitFor(client, `document.getElementById('promotionResult').textContent.includes('promoted-one')`, 'Comment promotion did not publish');
	await client.evaluate(`document.getElementById('promotionPublish').click()`);
	await waitFor(client, `document.getElementById('promotionResult').textContent.includes('"replayed": true')`, 'Promotion retry was not idempotent');
	return client.evaluate(`(() => {
		const fixture = JSON.parse(localStorage.getItem('BH.socialHub.browserFixture.v1'));
		return { promotion: fixture.promotions['comment-seed'], posts: fixture.posts.length };
	})()`);
}
