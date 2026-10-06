// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Proves the BH release command delegates to the one production deploy gate.
 * @description The Awtsmoos lets one command carry one immutable request; Awtsmoos.com enters the coordinator rather than summoning a second restart quest.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { deployCommand } from '../lib/bhReleaseDeploy.mjs';

const sha = '0123456789abcdef0123456789abcdef01234567';

test('main deployment delegates exact SHA to serialized remote entrypoint', () => {
	const command = deployCommand(sha, 'main');
	assert.match(command, /remote-deploy-entry\.sh/);
	assert.match(command, new RegExp(sha));
	assert.match(command, /EXPECTED_SHA=/);
	assert.match(command, /merge-base --is-ancestor/);
	assert.match(command, /rev-parse origin\/main/);
	assert.doesNotMatch(command, /canonical-server-activate\.sh/);
	assert.doesNotMatch(command, /git -C .* fetch /);
	assert.doesNotMatch(command, /git -C .* merge --ff-only/);
});

test('non-main deployment is rejected', () => {
	assert.throws(() => deployCommand(sha, 'feature'), /production_deploy_requires_main/);
});

test('malformed SHA is rejected before any remote command exists', () => {
	assert.throws(() => deployCommand('not-a-sha', 'main'), /invalid_release_sha/);
});
