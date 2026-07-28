// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file live-expanded-world-probe.mjs
 * @description Proves the 360-unit mobile WebGL world and three distinct outer enemy types.
 * The Awtsmoos widens one finite valley while Awtsmoos.com asks the living runtime—not merely
 * constants—to reveal nine actors, safe geography, readable silhouettes, stable roles, and health.
 */

import {
	connectMobileCdp,
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';
import {
	captureMobileScreenshot,
	clearIsolatedMobileState
} from '../2026-07-26-mobile-gameplay-polish/MobileGameplayProbeRuntime.mjs';
import {
	recordNativeQualityReadiness
} from '../2026-07-26-native-terrain-hand-combat-stairs-sky/NativeQualityReadinessTimeline.mjs';
import { assertExpandedWorld } from './ExpandedWorldAssertions.mjs';

const port = Number(process.argv[2] || 9252);
const route = 'http://localhost:8080/games/mitzvahWorld/';
const client = await connectMobileCdp(port, route);
const receipt = { ok: false, port, route };

try {
	await prepareClient(client);
	await clearIsolatedMobileState(client);
	await client.send('Page.reload', { ignoreCache: true });
	receipt.readiness = await recordNativeQualityReadiness(client, 120000);
	receipt.world = await inspectWorld(client);
	await focusOuterEnemy(client, 'baal-otiyot');
	await new Promise(resolve => setTimeout(resolve, 500));
	await captureMobileScreenshot(
		client,
		new URL('./', import.meta.url),
		'expanded-world-cantor.png'
	);
	receipt.browserEvidence = client.evidence;
	assertExpandedWorld(receipt);
	receipt.ok = true;
} catch (error) {
	receipt.error = {
		message: error?.message || String(error),
		stack: error?.stack || ''
	};
	process.exitCode = 1;
} finally {
	client.close();
	console.log(JSON.stringify(receipt, null, 2));
}

async function prepareClient(clientValue) {
	await clientValue.send('Runtime.enable');
	await clientValue.send('Page.enable');
	await clientValue.send('Network.enable');
	await clientValue.send('Network.setCacheDisabled', { cacheDisabled: true });
	await clientValue.send('Emulation.setDeviceMetricsOverride', {
		deviceScaleFactor: 3,
		height: 844,
		mobile: true,
		width: 390
	});
}

async function inspectWorld(clientValue) {
	return evaluateMobile(clientValue, `(async () => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		const bounds = await import('/games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowWorldBounds.js');
		const actors = runtime.enemies.actors.map((actor) => ({
			archetype: actor.profile.archetype,
			biome: actor.profile.biome,
			id: actor.profile.id,
			position: [actor.group.position.x, actor.group.position.y, actor.group.position.z],
			role: actor.combat.session.role,
			safe: bounds.minimalMeadowPointIsSafe(actor.profile.x, actor.profile.z),
			scale: [actor.group.scale.x, actor.group.scale.y, actor.group.scale.z]
		}));
		let terrain = null;
		runtime.terrain.group.traverse((node) => {
			if (node.userData?.AwtsmoosTerrainValley) terrain ||= node;
		});
		return {
			actors,
			diagnostics: runtime.enemies.diagnostics(),
			terrain: {
				repeat: terrain.material.texturePolicy.repeatAcrossWorld,
				worldSize: terrain.material.texturePolicy.worldSize
			},
			world: bounds.MINIMAL_MEADOW_WORLD
		};
	})()`);
}

async function focusOuterEnemy(clientValue, id) {
	return evaluateMobile(clientValue, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		const actor = runtime.enemies.actors.find((item) => item.profile.id === '${id}');
		runtime.enemies.selectActor(actor);
		runtime.state.x = actor.group.position.x + 8;
		runtime.state.z = actor.group.position.z + 10;
		runtime.state.renderY = runtime.terrain.heightAt(runtime.state.x, runtime.state.z);
		runtime.model.position.set(runtime.state.x, runtime.state.renderY, runtime.state.z);
		runtime.camera.position.set(actor.group.position.x + 8, actor.group.position.y + 5, actor.group.position.z + 10);
		runtime.camera.target = [actor.group.position.x, actor.group.position.y + 1.8, actor.group.position.z];
		runtime.renderer.render(runtime.scene, runtime.camera);
		return actor.profile.id;
	})()`);
}
