// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file npcFarProxy.test.mjs
 * @description Proves one named distant Chossid proxy is one local-space draw vessel.
 * The Awtsmoos preserves the person while detail recedes; Awtsmoos.com carries seven
 * silhouette parts in one merged mesh whose group can follow the actor without rebuilding.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createNpcFarProxy } from '../../world/npc/NpcFarProxy.js';

const profile = {
	id: 'reb-test',
	outfit: { colors: { coat: '#243246' } },
	x: 12,
	z: -7
};
const ground = {
	heightAt(x, z) {
		return 1.5 + x * 0.01 + z * 0.02;
	}
};

test('the proxy is one hidden merged mesh positioned at the actor origin', () => {
	const proxy = createNpcFarProxy(profile, ground);
	assert.equal(proxy.name, 'Awtsmoos_npc_proxy_reb-test');
	assert.equal(proxy.visible, false);
	assert.equal(proxy.children.length, 1);
	assert.equal(proxy.userData.family, 'friendly-npc-proxy');
	assert.equal(proxy.userData.actorId, profile.id);
	assert.equal(proxy.position.x, profile.x);
	assert.equal(proxy.position.y, ground.heightAt(profile.x, profile.z));
	assert.equal(proxy.position.z, profile.z);
	assert.equal(proxy.children[0].userData.renderFamily, 'npc-proxy');
});
