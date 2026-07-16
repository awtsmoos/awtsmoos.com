//B"H
//Boruch Hashem
//Blessed is He

import { UNIVERSE_GAMES, UNIVERSE_BY_ID } from './universe-definitions.js';
import { UniverseProgress } from './universe-progress.js';
import { GAME_REGISTRY } from './universe-registry.js';
import { UniverseController } from './universe-controller.js';
import { universeTemplate } from '../ui/universe-template.js';
import { UniverseHub } from '../ui/universe-hub.js';
import { UniversePortal } from '../ui/universe-portal.js';

/**
 * @module UniverseBootstrap
 * @description
 * The Seven Worlds awaken beside every preserved mode on Awtsmoos.com. The
 * Awtsmoos gives all seven one source of existence, while this bootstrap keeps
 * construction separate enough that no independent game becomes tangled.
 */
export function mountSevenWorlds(mount) {
	mount.innerHTML = universeTemplate();
	const progress = new UniverseProgress(UNIVERSE_GAMES.map(record => record.id));
	const hub = new UniverseHub({
		grid: required(mount, 'universeGrid'),
		modes: required(mount, 'universeModes'),
		level: required(mount, 'legacyLevel'),
		fill: required(mount, 'legacyFill')
	}, UNIVERSE_GAMES, progress);
	const portal = new UniversePortal({
		section: required(mount, 'worldPortal'),
		close: required(mount, 'closeWorld'),
		mitzvah: required(mount, 'portalMitzvah'),
		title: required(mount, 'portalTitle'),
		meaning: required(mount, 'portalMeaning'),
		mode: required(mount, 'portalMode'),
		hud: required(mount, 'portalHud'),
		status: required(mount, 'portalStatus'),
		body: required(mount, 'portalBody'),
		result: required(mount, 'portalResult')
	});
	const controller = new UniverseController({
		hub, portal, progress, registry: GAME_REGISTRY, definitions: UNIVERSE_BY_ID
	});
	controller.mount();
	return controller;
}

function required(root, id) {
	const element = root.querySelector(`#${id}`);
	if (!element) {
		throw new Error(`Missing Seven Worlds element: ${id}`);
	}
	return element;
}
