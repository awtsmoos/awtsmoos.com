// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileGameplayProbeInteractionScenarios.mjs
 * @description Exercises actual Shlichus choices, side guidance, selective corpse taking, and Loot All.
 * The Awtsmoos gives each mobile action a visible consequence; Awtsmoos.com clicks the same
 * buttons a player touches and records what remains before and after every deliberate choice.
 */

import { evaluateMobile } from './MobileCdpClient.mjs';

export async function openShlichusOffer(client) {
	return evaluateMobile(client, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		runtime.bus.emit('quest:offer', runtime.quest.snapshot());
		const root = document.querySelector('.Awtsmoos-quest-parchment-backdrop');
		return {
			acceptButton: Boolean(root.querySelector('[data-accept]')),
			story: root.textContent,
			visible: !root.hidden
		};
	})()`);
}

export async function acceptAndProgressShlichus(client) {
	return evaluateMobile(client, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		document.querySelector('[data-accept]')?.click();
		runtime.bus.emit('enemy:defeated', runtime.enemies.actors[0].payload());
		const tracker = document.querySelector('.Awtsmoos-quest-mini-tracker');
		return {
			faces: tracker.querySelectorAll('.quest-face-row span').length,
			status: runtime.quest.snapshot(),
			text: tracker.textContent,
			visible: !tracker.hidden
		};
	})()`);
}

export async function moveTeachingToBook(client) {
	return evaluateMobile(client, `(() => {
		const tracker = document.querySelector('.Awtsmoos-quest-mini-tracker');
		tracker.querySelector('[data-teaching-placement]')?.click();
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		runtime.bus.emit('quest:offer', runtime.quest.snapshot());
		const parchment = document.querySelector('.Awtsmoos-quest-parchment-backdrop');
		return {
			parchmentHasCounsel: parchment.textContent.includes('Counsel for the road'),
			parchmentVisible: !parchment.hidden,
			trackerHidden: tracker.hidden
		};
	})()`);
}

export async function openCorpseLoot(client) {
	return evaluateMobile(client, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		document.querySelector('.Awtsmoos-quest-parchment-backdrop [data-close]')?.click();
		const actor = runtime.enemies.actors[1];
		actor.defeat();
		runtime.enemies.selectActor(actor);
		actor.interact();
		const panel = document.querySelector('.Awtsmoos-corpse-loot-backdrop');
		return {
			actorId: actor.profile.id,
			lootAll: Boolean(panel.querySelector('[data-loot-all]')),
			rows: panel.querySelectorAll('.loot-item-row').length,
			takeButtons: panel.querySelectorAll('[data-loot-item]').length,
			visible: !panel.hidden
		};
	})()`);
}

export async function takeAndLootAll(client) {
	return evaluateMobile(client, `(() => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		const actor = runtime.enemies.actors[1];
		document.querySelector('[data-loot-item]')?.click();
		const afterTake = {
			looted: actor.looted,
			remaining: actor.lootPreview().length,
			visible: actor.group.visible
		};
		document.querySelector('[data-loot-all]')?.click();
		return {
			afterAll: {
				looted: actor.looted,
				remaining: actor.lootPreview().length,
				visible: actor.group.visible
			},
			afterTake,
			modalClosed: document.querySelector('.Awtsmoos-corpse-loot-backdrop').hidden
		};
	})()`);
}
