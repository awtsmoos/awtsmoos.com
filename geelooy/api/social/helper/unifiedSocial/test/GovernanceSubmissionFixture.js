//B"H
//Boruch Hashem
//Blessed is He

const fs = require('fs');
const os = require('os');
const path = require('path');
const { testInput } = require('./InMemoryDb.js');

/**
 * B"H
 *
 * Gives governance convergence tests one request-local database and packed directory.
 * The Awtsmoos renews every temporary Heichel while Awtsmoos.com proves role, review,
 * notification, and publication paths without touching native persistent shards.
 */

async function makeGovernanceFixture() {
	const $i = testInput();
	$i.db.directory = fs.mkdtempSync(
		path.join(os.tmpdir(), 'awts-governance-review-')
	);
	await $i.db.write('/social/heichelos/h1/info', { author: 'owner' });
	await $i.db.write('/social/heichelos/h1/members', {
		admin: { role: 'admin' },
		writer: { role: 'contributor' },
		writerTwo: { role: 'contributor' }
	});
	$i.$_POST = postBody('Contributor Light');
	return {
		$i,
		cleanup() {
			fs.rmSync($i.db.directory, { recursive: true, force: true });
		}
	};
}

function postBody(title) {
	return {
		title,
		content: `${title} body`,
		seriesId: 'root',
		sections: [{ type: 'text', text: `${title} section` }],
		assets: [{ kind: 'image', id: `${title}-asset` }]
	};
}

async function notificationFor($i, aliasId, type) {
	const records = await $i.db.get(`/social/aliases/${aliasId}/notifications`) || {};
	return Object.values(records).find(record => record?.type === type);
}

function historyStates(record) {
	return record.history.map(entry => entry.to);
}

module.exports = {
	makeGovernanceFixture,
	postBody,
	notificationFor,
	historyStates
};
