//B"H
//Boruch Hashem
//Blessed is He

import { CorePartFactory } from '../procedural/core-part-factory.js';

/**
 * @module RealmLandmarks
 * @description
 * River, bridge, home, bank, guild board, ferry, road gate, market, court, and
 * sanctuary form one material place. The Awtsmoos joins every institution while
 * Awtsmoos.com makes access, storage, story, travel, and danger physically visible.
 */
export function buildLandmarks(stage, assets, state) {
	const parts = new CorePartFactory();
	const landmarks = {};
	landmarks.river = stage.add(parts.group('covenant-river', [
		parts.part({ materialRole: 'water', tint: 0xffffff, name: 'river-water', position: [0, 0, 0], scale: [1.9, 0.08, 24] })
	], data('river', 'supplies water but divides caravan traffic while the bridge is broken')));
	landmarks.bridge = stage.add(bridge(parts, state), true);
	landmarks.home = stage.add(assets.house({ name: 'player-home', position: [-8, 0.1, 6], scale: 0.72, role: 'player-home', reason: 'stores recovery, workshop, hospitality, and personal stories', type: 'realm-home' }), true);
	landmarks.bank = stage.add(assets.crate({ name: 'guild-bank-chest', position: [-9.2, 0.1, 4.5], scale: 0.5, role: 'local-bank', reason: 'protects finite resources and equipment without erasing geography', type: 'realm-bank' }), true);
	landmarks.questBoard = stage.add(questBoard(parts), true);
	landmarks.workshop = stage.add(assets.house({ name: 'town-workshop', position: [-7, 0.1, 1], scale: 0.68, role: 'workshop', reason: 'crafts useful goods and repairs worn tools with conserved material', type: 'realm-workshop' }), true);
	landmarks.market = stage.add(assets.stall({ name: 'crossing-market', position: [6, 0.1, 4], scale: 0.72, role: 'market', reason: 'prices react to bridge traffic, shortages, trust, and supply', type: 'realm-market' }), true);
	landmarks.ferry = stage.add(assets.cart({ name: 'river-ferry-staging', position: [3.6, 0.1, 1.8], scale: 0.38, role: 'ferry', reason: 'an earned crossing route maintained by bridge workers', type: 'realm-ferry' }), true);
	landmarks.court = stage.add(assets.court({ name: 'crossing-court', position: [5, 0.1, -6], scale: 0.52, role: 'court', reason: 'investigations and public judgments preserve trust', type: 'realm-court' }), true);
	landmarks.sanctuary = stage.add(assets.shelter({ name: 'animal-sanctuary', position: [10, 0.1, -6], scale: 0.46, role: 'sanctuary', reason: 'treats injured animals and teaches humane care', type: 'realm-sanctuary' }), true);
	landmarks.fountain = stage.add(assets.fountain({ name: 'town-fountain', position: [-4, 0.1, 4], scale: 0.36, role: 'water-source', reason: 'provides clean water for people, medicine, food, and fire response', type: 'realm-water' }), true);
	landmarks.roadGate = stage.add(roadGate(parts), true);
	updateRealmLandmarks(landmarks, state);
	return landmarks;
}

export function updateRealmLandmarks(landmarks, state) {
	updateBridgeVisual(landmarks.bridge, state);
	landmarks.ferry.visible = state.travel.unlocked.includes('river-ferry');
	landmarks.ferry.userData.reason = landmarks.ferry.visible
		? 'the earned ferry route crosses toward the east bank'
		: 'the ferry route is not yet trusted to the traveler';
	landmarks.roadGate.userData.reason = state.encounter.roadThreat.active
		? 'a tense road group blocks the north route; negotiate, restrain, or retreat'
		: 'the north road is calm and ready for future regional travel';
}

function questBoard(parts) {
	const timber = { materialRole: 'timber', tint: 0xffffff };
	const iron = { materialRole: 'iron', tint: 0xffffff };
	return parts.group('covenant-guild-board', [
		parts.part({ ...timber, name: 'board-post-left', position: [-2.8, 0.9, 6], scale: [0.16, 1.8, 0.16] }),
		parts.part({ ...timber, name: 'board-post-right', position: [-1.2, 0.9, 6], scale: [0.16, 1.8, 0.16] }),
		parts.part({ ...timber, name: 'quest-board-face', position: [-2, 1.35, 6], scale: [1.9, 1.05, 0.16] }),
		parts.part({ ...iron, name: 'board-brace', position: [-2, 1.35, 6.12], scale: [1.4, 0.07, 0.08] })
	], data('quest-board', 'posts authored civic quests whose steps occur in the real town'));
}

function roadGate(parts) {
	const stone = { materialRole: 'masonry', tint: 0xffffff };
	const timber = { materialRole: 'timber', tint: 0xffffff };
	return parts.group('north-road-gate', [
		parts.part({ ...stone, name: 'road-pier-left', position: [-1.8, 1.1, -10], scale: [0.6, 2.2, 0.8] }),
		parts.part({ ...stone, name: 'road-pier-right', position: [1.8, 1.1, -10], scale: [0.6, 2.2, 0.8] }),
		parts.part({ ...timber, name: 'road-gate-beam', position: [0, 2.3, -10], scale: [4.1, 0.34, 0.45] }),
		parts.part({ ...timber, name: 'road-warning-bar', position: [0, 0.9, -9.85], scale: [3.2, 0.16, 0.18] })
	], data('road-gate', 'guards the unsettled north road'));
}

export function updateBridgeVisual(root, state) {
	const planks = root.children.filter(child => child.name.startsWith('bridge-plank'));
	const visible = state.bridge.complete ? planks.length : Math.ceil(planks.length * state.bridge.timber / state.bridge.timberRequired);
	planks.forEach((plank, index) => { plank.visible = index < visible; });
	root.userData.reason = state.bridge.complete ? 'carries caravans, medicine, food, and travelers between both shores' : `awaits ${state.bridge.timberRequired - state.bridge.timber} timber and ${state.bridge.stoneRequired - state.bridge.stone} stone`;
}

function bridge(parts, state) {
	const wood = { materialRole: 'timber', tint: 0xffffff };
	const stone = { materialRole: 'masonry', tint: 0xffffff };
	const children = [
		parts.part({ ...stone, name: 'bridge-west-foundation', position: [-2.2, 0.16, 0], scale: [1.2, 0.42, 3.2] }),
		parts.part({ ...stone, name: 'bridge-east-foundation', position: [2.2, 0.16, 0], scale: [1.2, 0.42, 3.2] }),
		...Array.from({ length: 9 }, (_, index) => parts.part({ ...wood, name: `bridge-plank-${index}`, position: [-1.6 + index * 0.4, 0.52, 0], scale: [0.36, 0.12, 3] })),
		...[-1.5, 1.5].flatMap(z => [-1.6, 1.6].map(x => parts.part({ ...wood, name: `bridge-rail-${x}-${z}`, position: [x, 1.05, z], scale: [3.4, 0.12, 0.12] })))
	];
	const root = parts.group('river-bridge', children, data('realm-bridge', 'connects both shores and determines caravan supply'));
	updateBridgeVisual(root, state);
	return root;
}

function data(role, reason) {
	return { semanticType: role, role, reason };
}
