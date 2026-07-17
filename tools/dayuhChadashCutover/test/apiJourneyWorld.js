// B"H
// Boruch Hashem
// Blessed is He

/** @file apiJourneyWorld.js @description Creates, edits, reads, and removes a social world. */

const assert = require('node:assert/strict');
const { requireSuccess } = require('./apiJourneyHttp.js');

function identifiers() {
	const run = `cutover_${Date.now().toString(36)}`;
	return {
		run,
		user: `${run}_user`,
		alias: `${run}_alias`,
		heichel: `${run}_heichel`,
		series: `${run}_series`,
		post: `${run}_post_hint`,
		question: `${run}_question_hint`,
		answer: `${run}_answer_hint`,
		section: `${run}_section`
	};
}

async function createWorld(origin, apiKey, ids) {
	await requireSuccess('alias create', origin, '/api/social/aliases', {
		method: 'POST', apiKey, body: {
			aliasName: ids.run,
			inputId: ids.alias,
			description: 'isolated Dayuh cutover journey'
		}
	});
	await requireSuccess('heichel create', origin, (
		`/api/social/alias/${ids.alias}/heichelos`
	), {
		method: 'POST', apiKey, body: {
			aliasId: ids.alias,
			inputId: ids.heichel,
			heichelId: ids.heichel,
			name: ids.run,
			heichelName: ids.run,
			description: 'isolated heichel',
			isPublic: 'yes'
		}
	});
	await requireSuccess('series create', origin, (
		`/api/social/heichelos/${ids.heichel}/addNewSeries`
	), {
		method: 'POST', apiKey, body: {
			aliasId: ids.alias,
			inputId: ids.series,
			seriesId: ids.series,
			seriesName: ids.run,
			title: ids.run,
			parentSeriesId: 'root',
			description: 'first description'
		}
	});
	await requireSuccess('series edit', origin, (
		`/api/social/heichelos/${ids.heichel}/series/${ids.series}/editSeriesDetails`
	), {
		method: 'PUT', apiKey, body: {
			aliasId: ids.alias,
			seriesName: `${ids.run} updated`,
			description: 'updated description'
		}
	});
	const series = await requireSuccess('series read', origin, (
		`/api/social/heichelos/${ids.heichel}/series/${ids.series}/details`
	), { apiKey });
	assert.match(JSON.stringify(series.json), /updated description/);
}

async function createContent(origin, apiKey, ids) {
	const created = await requireSuccess('post create', origin, (
		`/api/social/content/heichelos/${ids.heichel}/posts`
	), {
		method: 'POST', apiKey, body: {
			aliasId: ids.alias,
			postId: ids.post,
			title: ids.run,
			content: 'first post body',
			seriesId: ids.series,
			sections: JSON.stringify([{
				id: ids.section,
				title: 'Initial section',
				content: 'Initial section body',
				verseSection: 'root'
			}])
		}
	});
	ids.post = created.json?.success?.postId;
	assert.ok(ids.post, `canonical post ID absent: ${created.text}`);
	await requireSuccess('post edit', origin, (
		`/api/social/heichelos/${ids.heichel}/series/${ids.series}/post/${ids.post}`
	), {
		method: 'PUT', apiKey, body: {
			aliasId: ids.alias,
			newTitle: `${ids.run} updated`,
			newContent: 'updated post body'
		}
	});
	const post = await requireSuccess('post read', origin, (
		`/api/social/heichelos/${ids.heichel}/series/${ids.series}/post/${ids.post}`
	), { apiKey });
	assert.match(JSON.stringify(post.json), /updated post body/);
	return post;
}

module.exports = {
	createContent,
	createWorld,
	identifiers
};
