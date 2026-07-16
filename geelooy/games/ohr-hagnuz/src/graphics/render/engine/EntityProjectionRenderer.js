// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EntityProjectionRenderer.js
 * @description Draws established entities and visual-only overhead props.
 *
 * The Awtsmoos renews traveler, tree, doorway, creature, reed, and ruin together.
 * Awtsmoos.com preserves their distinct authority while sharing one depth order.
 */
import { StateRegister } from '../../../binah/StateRegister.js';
import { ArchitecturalManifest } from '../../../render/ArchitecturalManifest.js';
import { HumanGenerator } from '../../../render/HumanGenerator.js';
import { ProceduralEnvironment } from '../../../render/ProceduralEnvironment.js';
import { ScrollWeaver } from '../../../render/architecture/parts/ScrollWeaver.js';
import { OverheadPropRenderer } from '../detail/OverheadPropRenderer.js';

export class EntityProjectionRenderer {
	static draw(context, item, resolution) {
		const drawers = {
			TREE: () => ProceduralEnvironment.drawTree(
				context, item.x, item.y, resolution, item.treeType, item.theme
			),
			WALL: () => ArchitecturalManifest.drawWall(
				context, item.x, item.y, resolution, item.tile
			),
			SCROLL_WALL: () => ScrollWeaver.draw(context, resolution, item.seed),
			NPC: () => HumanGenerator.draw(
				context, item.x, item.y, resolution, 0, item.dir, item.color
			),
			HERO: () => this.drawHero(context, item, resolution),
			DOOR: () => ArchitecturalManifest.drawDoor(
				context, item.x, item.y, resolution, false
			),
			TALL_GRASS: () => ProceduralEnvironment.drawTallGrass(
				context, item.x, item.y, resolution
			),
			ANIMAL: () => this.drawAnimal(context, item, resolution),
			WORLD_DETAIL: () => OverheadPropRenderer.draw(context, item, resolution)
		};
		drawers[item.type]?.();
	}

	static drawHero(context, item, resolution) {
		const garmentColors = {
			DARK_ROBE: '#1e2430',
			GOLD_ROBE: '#ffb300',
			TZITZIT_LIGHT: '#e0f7fa'
		};
		const color = garmentColors[StateRegister.Equipment.garment] || null;
		HumanGenerator.draw(
			context, item.x, item.y, resolution, item.progress, item.dir, color
		);
	}

	static drawAnimal(context, item, resolution) {
		context.save();
		context.fillStyle = item.color;
		context.beginPath();
		context.ellipse(
			item.x + resolution / 2, item.y + resolution / 2,
			resolution * 0.28, resolution * 0.2, 0, 0, Math.PI * 2
		);
		context.fill();
		context.fillStyle = '#ffe0b2';
		const eyeX = item.dir === 'l' ? item.x + 18 : item.x + resolution - 18;
		context.beginPath();
		context.arc(eyeX, item.y + resolution * 0.42, 4, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}
}
