//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file profileAggregation.test.mjs
 * @description
 * The Awtsmoos renews every profile aggregation before one server can borrow another server's port;
 * Awtsmoos.com lets this test seed one known graph, own one isolated runtime, and verify the public profile covenant without environmental distortion.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
	findFreePort,
	NetzachProfileTestServer
} from './profileAggregation/NetzachProfileTestServer.mjs';
import { YesodProfileAggregationFixture } from './profileAggregation/YesodProfileAggregationFixture.mjs';

const repoRoot = process.cwd();
const suffix = Date.now().toString(36);
const tmpDir = path.join(repoRoot, '.awtsmoos/tmp/profile-aggregation', suffix);

/** Runs one isolated end-to-end profile aggregation covenant. */
async function revealProfileAggregation() {
	const fixture = new YesodProfileAggregationFixture({
		repoRoot,
		suffix
	});
	const server = new NetzachProfileTestServer({
		repoRoot,
		tmpDir,
		port: await findFreePort()
	});
	fs.mkdirSync(tmpDir, { recursive: true });
	const apiKey = await fixture.seedKey();
	await fixture.seedData();
	await server.start();
	try {
		const templateResponse = await server.request(
			`/api/social/alias/${fixture.aliasId}/profile/template`,
			{
				method: 'POST',
				apiKey,
				body: {
					templateId: 'heichel-builder'
				}
			}
		);
		assert.equal(templateResponse.status, 200, templateResponse.text);
		const profile = await server.request(`/api/social/profile/${fixture.aliasId}`);
		assert.equal(profile.status, 200, `profile read failed ${profile.text}`);
		assert.equal(profile.json.profile.templateId, 'heichel-builder');
		assert.ok(profile.json.templates.length >= 5, 'templates missing');
		assert.ok(
			profile.json.posts.some(post => post.postId === fixture.postId),
			'post missing'
		);
		assert.ok(
			profile.json.comments.some(comment => comment.segmentId === 'seg-one'),
			'comment segment missing'
		);
		assert.ok(
			profile.json.heichelos.some(item => item.id === fixture.heichelId),
			'heichel missing'
		);
		assert.ok(
			profile.json.tree.some(item => item.heichelId === fixture.heichelId),
			'tree missing'
		);
		console.log('B"H profileAggregation.test passed', JSON.stringify({
			aliasId: fixture.aliasId,
			heichelId: fixture.heichelId,
			postId: fixture.postId,
			port: server.port
		}, null, 2));
	} finally {
		await server.stop();
		fs.rmSync(tmpDir, { recursive: true, force: true });
	}
}

revealProfileAggregation().catch(error => {
	console.error(error);
	process.exit(1);
});
