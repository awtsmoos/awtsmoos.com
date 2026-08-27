//B"H
//Boruch Hashem
//Blessed is He

const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * B"H
 *
 * Provides a request-local social vessel for post-submission tests. The Awtsmoos
 * renews every temporary record while Awtsmoos.com keeps packed mirrors inside the
 * test directory instead of opening the native shard store by accident.
 */

function makeDb() {
	const store = new Map();
	const directory = fs.mkdtempSync(
		path.join(os.tmpdir(), 'awts-post-review-')
	);
	return {
		store,
		directory,
		async get(key) {
			if (store.has(key)) return store.get(key);
			const prefix = key.endsWith('/') ? key : `${key}/`;
			const children = {};
			for (const [childKey, value] of store.entries()) {
				if (!childKey.startsWith(prefix)) continue;
				const rest = childKey.slice(prefix.length);
				if (rest && !rest.includes('/')) children[rest] = value;
			}
			return Object.keys(children).length ? children : undefined;
		},
		async write(key, value) {
			store.set(key, value);
			return { key, value };
		},
		async delete(key) {
			const old = store.get(key);
			store.delete(key);
			return { key, old };
		},
		async arrayAppend(key, value) {
			const current = store.get(key) || [];
			current.push(value);
			store.set(key, current);
			return { key, value };
		}
	};
}

async function makeFixture() {
	const db = makeDb();
	await db.write('/social/heichelos/h1/settings/submissions', {
		allowPostSubmissions: true,
		requirePostApproval: true
	});
	const $i = {
		db,
		$_POST: postBody('authorA', 'A submitted light', 'Please approve this vessel.'),
		async fetchAwtsmoos(route) {
			return route.includes('/ownership') ? { no: true } : null;
		}
	};
	return {
		db,
		$i,
		cleanup() {
			fs.rmSync(db.directory, { recursive: true, force: true });
		}
	};
}

function postBody(aliasId, title, content) {
	return { aliasId, title, content, seriesId: 'root' };
}

async function grantOwner(fixture, aliasId = 'owner') {
	await fixture.db.write('/social/heichelos/h1/editors', [aliasId]);
	fixture.$i.$_POST = { aliasId };
	fixture.$i.fetchAwtsmoos = async () => ({});
}

module.exports = {
	makeFixture,
	postBody,
	grantOwner
};
