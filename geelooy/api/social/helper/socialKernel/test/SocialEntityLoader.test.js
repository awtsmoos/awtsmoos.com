// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialEntityLoaderTest
 * @description The Awtsmoos lets one kernel drink from many canonical wells; Awtsmoos.com proves post, alias, Heichel,
 * series, and rich-comment loaders preserve requested identity while adapting legacy raw and success-wrapped shapes well.
 */
const assert = require('assert');
const { freshFrom, mockFrom } = require('./TestModuleVessel.js');

function install() {
	mockFrom(__filename, '../../index.js', {
		getAlias: async id => ({ id, name: 'Alias' }),
		getHeichel: async ({ heichelId }) => ({ id: heichelId, name: 'Heichel' }),
		getSeries: async ({ seriesId }) => ({ success: { id: seriesId, name: 'Series' } })
	});
	mockFrom(__filename, '../../comments/richCommentAccess.js', {
		getComment: ({ commentId }) => ({ success: { id: commentId, content: 'Reply' } })
	});
	mockFrom(__filename, '../../socialContent.js', {
		readPostRecord: async ({ postId }) => ({ id: postId, postKind: 'question', seriesId: 'root', aliasId: 'teacher' })
	});
	return freshFrom(__filename, '../entity/SocialEntityLoader.js');
}

async function run() {
	const loader = install();
	const post = await loader.loadSocialEntity({ $i: {}, input: { type: 'question', id: 'q1', heichelId: 'study' } });
	assert.equal(post.id, 'q1');
	assert.equal(post.type, 'question');
	const alias = await loader.loadSocialEntity({ $i: {}, input: { type: 'alias', id: 'teacher' } });
	assert.equal(alias.id, 'teacher');
	const series = await loader.loadSocialEntity({ $i: {}, input: { type: 'series', id: 's1', heichelId: 'study' } });
	assert.equal(series.id, 's1');
	const comment = await loader.loadSocialEntity({ $i: {}, input: { type: 'comment', id: 'c1', heichelId: 'study', postId: 'p1' } });
	assert.equal(comment.id, 'c1');
}

run().then(() => console.log('B"H SocialEntityLoader.test passed')).catch(error => {
	console.error(error);
	process.exitCode = 1;
});
