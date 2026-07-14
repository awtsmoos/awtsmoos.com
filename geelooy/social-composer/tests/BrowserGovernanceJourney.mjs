//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserGovernanceJourney
 * @description
 * Real Chrome promotes a member, sends a consent-bearing invitation, and narrows
 * series policy through visible controls. The Awtsmoos gives every relation its
 * truth while Awtsmoos.com proves mutations only after authoritative refresh.
 */

async function waitFor(client, expression, message) {
	return client.evaluate(`(async () => {
		for (let attempt = 0; attempt < 180; attempt += 1) {
			if (${expression}) return true;
			await new Promise(resolve => setTimeout(resolve, 50));
		}
		throw new Error(${JSON.stringify(message)});
	})()`);
}

export async function inspectGovernance(client) {
	await waitFor(
		client,
		`document.getElementById('governanceRole').textContent === 'admin'`,
		'Governance overview did not load admin evidence'
	);
	return client.evaluate(`(() => ({
		role: document.getElementById('governanceRole').textContent,
		members: [...document.querySelectorAll('.memberCard strong')].map(node => node.textContent),
		invitations: document.querySelectorAll('.invitationCard').length
	}))()`);
}

export async function promoteReader(client) {
	await client.evaluate(`(() => {
		const card = [...document.querySelectorAll('.memberCard')]
			.find(item => item.querySelector('strong')?.textContent === 'reader');
		if (!card) throw new Error('Reader member card not found');
		const select = card.querySelector('select');
		select.value = 'contributor';
		select.dispatchEvent(new Event('change', { bubbles: true }));
		card.querySelector('input').value = 'Trusted community submissions.';
		card.querySelector('button').click();
	})()`);
	await waitFor(
		client,
		`[...document.querySelectorAll('.memberCard')].some(card => card.querySelector('strong')?.textContent === 'reader' && card.textContent.includes('Effective role: contributor'))`,
		'Reader role did not refresh to contributor'
	);
}

export async function inviteEditor(client) {
	await client.evaluate(`(() => {
		document.getElementById('inviteAliasId').value = 'student';
		document.getElementById('inviteRole').value = 'editor';
		document.getElementById('inviteReason').value = 'Curate the new learning series.';
		document.getElementById('inviteRoleButton').click();
	})()`);
	await waitFor(
		client,
		`[...document.querySelectorAll('.invitationCard')].some(card => card.textContent.includes('student') && card.textContent.includes('editor'))`,
		'Editor invitation did not appear after refresh'
	);
}

export async function saveRootPolicy(client) {
	await client.evaluate(`(() => {
		document.getElementById('policySeriesId').value = 'root';
		document.getElementById('policyAllowContent').checked = true;
		document.getElementById('policyRequireContentApproval').checked = true;
		document.getElementById('policyAllowReferences').checked = true;
		document.getElementById('policyRequireReferenceApproval').checked = true;
		document.getElementById('policyCommentsEnabled').checked = false;
		document.getElementById('policyAnswersEnabled').checked = true;
		document.getElementById('saveSeriesPolicyButton').click();
	})()`);
	await waitFor(
		client,
		`document.getElementById('statusMessage').textContent.includes('reverified')`,
		'Series policy save did not receive server confirmation'
	);
	return client.evaluate(`(() => {
		const fixture = JSON.parse(localStorage.getItem('BH.unifiedSocial.browserFixture.v1'));
		return {
			readerRole: fixture.heichelos.archive.members.reader,
			invitation: fixture.invitations.find(item => item.invitedAliasId === 'student'),
			policy: fixture.heichelos.archive.series.root.policy
		};
	})()`);
}

export async function exerciseGovernance(client) {
	const initial = await inspectGovernance(client);
	await promoteReader(client);
	await inviteEditor(client);
	const final = await saveRootPolicy(client);
	return { initial, final };
}

export {
	waitFor
};
