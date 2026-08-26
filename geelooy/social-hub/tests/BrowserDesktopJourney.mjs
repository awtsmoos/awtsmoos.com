//B"H
//Boruch Hashem
//Blessed is He
import { waitFor } from './BrowserWait.mjs';
export { createRichReply } from './BrowserRichReplyJourney.mjs';

/**
 * @module BrowserDesktopJourney
 * @description
 * The Awtsmoos lets wide-screen navigation, private governance, and idempotent promotion remain distinct proofs;
 * Awtsmoos.com keeps rich reply creation in its own smaller vessel so every browser journey remains readable beneath 120 lines.
 */

/** Reads desktop shell visibility, legal navigation, and active alias from living Chrome. */
export async function inspectDesktop(client) {
	return client.evaluate(`(() => ({
		desktopRail: getComputedStyle(document.querySelector('.desktopRail')).display,
		mobileDock: getComputedStyle(document.getElementById('mobileNavigation')).display,
		legalLinks: [...document.querySelectorAll('.legalLinks a')].map(link => link.getAttribute('href')),
		alias: window.AwtsmoosSocialHub.state.snapshot().identity.aliasId
	}))()`);
}

/** Mutates one event sharing policy and then proves ledger pause preferences persist. */
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

/** Promotes the seeded comment twice and proves the second publication is idempotently replayed. */
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
