// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file socialContent.test.js
 * @description
 * The Awtsmoos lets questions, answers, sections, and reposts flow through an isolated vessel;
 * at Awtsmoos.com a unit test must never fall through into the global packed-store castle.
 * Memory holds the legacy path, a temporary directory receives packed mirrors, then both pass away,
 * so production state stays untouched while every social-content contract faces the light of day.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const content = require('../socialContent.js');

function makeDb(directory) {
	const store = new Map();
	return {
		directory,
		store,
		async write(key, value) {
			store.set(key, value);
			return { path: key, value };
		},
		async get(key) {
			if (store.has(key)) return store.get(key);
			const prefix = key.endsWith('/') ? key : `${key}/`;
			const output = {};
			for (const [storedKey, value] of store.entries()) {
				if (!storedKey.startsWith(prefix)) continue;
				const remainder = storedKey.slice(prefix.length);
				if (!remainder || remainder.includes('/')) continue;
				output[remainder] = value;
			}
			return Object.keys(output).length ? output : undefined;
		}
	};
}

async function run() {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-social-content-'));
	try {
		const $i = { db: makeDb(directory), $_POST: {} };
		$i.$_POST = { aliasId: 'alice', postId: 'q1', title: 'What is Awtsmoos?', content: 'Question body', seriesId: 'root', sections: JSON.stringify([{ id: 's1', title: 'Context', content: 'Section body' }]) };
		const question = await content.createQuestion({ $i, heichelId: 'h1' });
		assert.equal(question.success.contentType, 'question');
		assert.equal(question.success.sections.length, 1);

		$i.$_POST = { aliasId: 'bob', answerId: 'a1', title: 'Answer', content: 'Answer body', seriesId: 'root' };
		const answer = await content.createAnswer({ $i, heichelId: 'h1', questionId: 'q1' });
		assert.equal(answer.success.contentType, 'answer');
		const answers = await content.listAnswers({ $i, heichelId: 'h1', questionId: 'q1' });
		assert.equal(answers.success.length, 1);
		assert.equal(answers.success[0].kind, 'answers');

		$i.$_POST = { aliasId: 'alice', sectionId: 's2', title: 'More', content: 'More section' };
		const section = await content.createSection({ $i, heichelId: 'h1', postId: 'q1' });
		assert.equal(section.success.id, 's2');
		const sections = await content.listSections({ $i, heichelId: 'h1', postId: 'q1' });
		assert.equal(sections.success.length, 2);

		$i.$_POST = { aliasId: 'alice', kind: 'reposts', fromType: 'comment', fromId: 'c1', fromHeichelId: 'h1', toType: 'post', toId: 'q1', toHeichelId: 'h1' };
		const repost = await content.createRepost({ $i });
		assert.equal(repost.success.kind, 'reposts');
		console.log('B"H socialContent.test passed');
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
