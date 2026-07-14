//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserIdentityJourney
 * @description
 * Real Chrome creates an alias, Heichel, nested series, and moderated Archive
 * reference without leaving the draft. The Awtsmoos forms every identity and room;
 * Awtsmoos.com waits for exact destination evidence before carrying the next act.
 */

export async function waitForComposer(client) {
	return client.evaluate(`(async () => {
		for (let attempt = 0; attempt < 160; attempt += 1) {
			if (window.RichSocialComposer) return true;
			await new Promise(resolve => setTimeout(resolve, 50));
		}
		throw new Error('RichSocialComposer did not awaken');
	})()`);
}

export async function waitForState(client, expression, label) {
	return client.evaluate(`(async () => {
		for (let attempt = 0; attempt < 160; attempt += 1) {
			if (${expression}) return true;
			await new Promise(resolve => setTimeout(resolve, 50));
		}
		throw new Error(${JSON.stringify(label)});
	})()`);
}

export async function resetDrafts(client) {
	return client.evaluate(`(() => {
		for (const key of Object.keys(localStorage)) {
			if (key.startsWith('awtsmoos.socialComposer.')) localStorage.removeItem(key);
		}
		return true;
	})()`);
}

function setInputs(source) {
	return `(() => {
		const values = ${JSON.stringify(source)};
		for (const [id, value] of Object.entries(values)) {
			const element = document.getElementById(id);
			element.value = value;
			element.dispatchEvent(new Event('input', { bubbles: true }));
		}
	})()`;
}

export async function createIdentityAndDestinations(client) {
	await client.evaluate(setInputs({
		newAliasName: 'Teacher of Light',
		newAliasDescription: 'A public teaching identity.'
	}));
	await client.evaluate(`document.getElementById('createAliasButton').click()`);
	await waitForState(
		client,
		`window.RichSocialComposer.state.snapshot().identity.aliasId === 'teacher'`,
		'Inline alias creation did not select teacher'
	);
	await client.evaluate(setInputs({
		newHeichelName: 'Study Hall',
		newHeichelDescription: 'Canonical teachings and structured questions.',
		newHeichelId: 'study'
	}));
	await client.evaluate(`document.getElementById('createHeichelButton').click()`);
	await waitForState(
		client,
		`window.RichSocialComposer.state.snapshot().identity.heichelId === 'study'`,
		'Inline Heichel creation did not select study'
	);
	await client.evaluate(setInputs({
		newSeriesName: 'Foundational Lessons',
		newSeriesDescription: 'An ordered course inside the Study Hall.',
		newSeriesId: 'lessons'
	}));
	await client.evaluate(`document.getElementById('createSeriesButton').click()`);
	await waitForState(
		client,
		`window.RichSocialComposer.state.snapshot().identity.seriesId === 'lessons'`,
		'Inline series creation did not select lessons'
	);
	await client.evaluate(setInputs({ destinationSearch: 'archive' }));
	await waitForState(
		client,
		`[...document.querySelectorAll('.heichelOpenButton')].some(button => button.textContent.includes('Community Archive'))`,
		'Archive destination did not appear'
	);
	await client.evaluate(`(() => {
		[...document.querySelectorAll('.heichelOpenButton')]
			.find(button => button.textContent.includes('Community Archive')).click();
	})()`);
	await waitForState(
		client,
		`document.getElementById('selectedDestinationSummary').textContent.includes('Community Archive')`,
		'Archive destination detail did not replace the prior series tree'
	);
	await client.evaluate(`(() => {
		const reference = document.querySelector('#seriesBrowser .secondaryAction');
		if (!reference) throw new Error('Archive reference action did not appear');
		reference.click();
	})()`);
	await waitForState(
		client,
		`window.RichSocialComposer.state.snapshot().secondaryDestinations.some(item => item.heichelId === 'archive')`,
		'Archive reference was not added to state'
	);
	return client.evaluate(`(() => {
		const snapshot = window.RichSocialComposer.state.snapshot();
		return {
			identity: snapshot.identity,
			secondary: snapshot.secondaryDestinations
		};
	})()`);
}

export {
	setInputs
};
