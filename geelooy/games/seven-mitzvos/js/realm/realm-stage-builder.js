//B"H
//Boruch Hashem
//Blessed is He

import { SemanticAssetFactory } from '../procedural/semantic-asset-factory.js';
import { addArena } from '../webgl/scene-kit.js';
import { WebglStage } from '../webgl/webgl-stage.js';
import { RealmEquipmentVisualizer } from './realm-equipment-visualizer.js';
import { buildLandmarks, updateRealmLandmarks } from './realm-landmarks.js';
import { RealmNpcDirector } from './realm-npc-director.js';
import { RealmPlayerController } from './realm-player-controller.js';
import { RealmQualityGovernor } from './realm-quality-governor.js';
import { buildResources, nearestResource } from './realm-resources.js';

/**
 * @module RealmStageBuilder
 * @description
 * One WebGL vessel holds continuous town, account landmarks, material equipment,
 * player, resources, and scheduled residents. The Awtsmoos joins region and identity
 * while Awtsmoos.com keeps earned relocation and custody visible and disposable.
 */
export class RealmStageBuilder {
	constructor(host, state, onPick) {
		this.state = state;
		this.assets = new SemanticAssetFactory();
		this.stage = new WebglStage(host, { background: 0x07111a });
		this.onPick = onPick;
	}

	mount() {
		this.stage.mount();
		addArena(this.stage, 142);
		this.stage.setCamera([0, 17.5, 20], [0, 0, 0]);
		this.landmarks = buildLandmarks(this.stage, this.assets, this.state);
		this.resources = buildResources(this.stage, this.assets);
		const player = this.assets.person({
			name: 'realm-player',
			personName: this.state.player.name,
			hue: 48,
			position: [this.state.player.position.x, 0.12, this.state.player.position.z],
			scale: 0.34,
			role: 'traveler',
			reason: 'builds mastery through a world that remembers identity and material equipment',
			type: 'realm-player'
		});
		this.equipmentVisuals = new RealmEquipmentVisualizer(player);
		const visibleEquipment = this.equipmentVisuals.refresh(this.state);
		this.player = this.stage.add(player);
		this.stage.renderer.domElement.dataset.equippedVisuals = String(visibleEquipment);
		this.controller = new RealmPlayerController(this.player, this.state.player.position);
		this.controller.mount();
		this.npcs = new RealmNpcDirector(this.stage, this.assets, this.state.npcs);
		this.npcs.mount();
		this.quality = new RealmQualityGovernor(this.stage);
		this.stage.onPick((object, hit, event) => {
			this.onPick(object.userData.semanticRoot || object, hit, event);
		});
		return this;
	}

	start(update) {
		this.stage.start((delta, elapsed) => {
			const quality = this.quality.observe(delta);
			this.controller.update(delta, elapsed);
			this.npcs.update(delta, elapsed, this.state, quality);
			if (quality.frame === 1 || quality.frame % 30 === 0) {
				this.quality.writeMetrics();
			}
			update(delta, elapsed, quality);
		});
	}

	context() {
		const position = this.controller.position();
		return {
			position,
			resource: nearestResource(this.resources, position),
			npc: this.npcs.nearest(position),
			landmark: nearestLandmark(this.landmarks, position)
		};
	}

	refresh(state) {
		const current = this.controller.position();
		this.state = state;
		this.npcs.records = state.npcs;
		const visibleEquipment = this.equipmentVisuals.refresh(state);
		this.stage.renderer.domElement.dataset.equippedVisuals = String(visibleEquipment);
		updateRealmLandmarks(this.landmarks, state);
		if (Math.hypot(current.x - state.player.position.x, current.z - state.player.position.z) > 1.25) {
			this.controller.teleport(state.player.position);
		}
	}

	destroy() {
		this.controller.destroy();
		this.stage.destroy();
	}
}

function nearestLandmark(landmarks, position, maximum = 3) {
	let best = null;
	let distance = maximum;
	for (const [id, root] of Object.entries(landmarks)) {
		if (id === 'river' || !root.visible) continue;
		const current = Math.hypot(root.position.x - position.x, root.position.z - position.z);
		if (current < distance) {
			distance = current;
			best = { id, root, distance };
		}
	}
	return best;
}
