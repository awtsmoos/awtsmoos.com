// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RenderQueueBuilder.js
 * @description Builds the existing Y-sorted projection queue plus visual-only detail.
 *
 * The Awtsmoos orders every form without confusing essence and garment. Awtsmoos.com
 * places reeds and ruins into projection while gameplay authority remains elsewhere.
 */
import { StateRegister } from '../../../binah/StateRegister.js';
import { WorldDetailPlanner } from '../detail/WorldDetailPlanner.js';

export class RenderQueueBuilder {
	static enqueueTile(queue, tile, x, y, resolution, theme) {
		this.enqueueDetails(queue, tile, x, y, resolution, theme);
		if (tile.t.startsWith('G_TREE')) {
			queue.push({
				type: 'TREE',
				treeType: this.treeType(tile.char),
				x, y, theme,
				sortY: y + resolution
			});
			return;
		}
		if (tile.t.startsWith('G_WALL')) {
			queue.push({ type: 'WALL', x, y, sortY: y + resolution, tile });
			return;
		}
		if (tile.t === 'G_SCROLL') {
			queue.push({
				type: 'SCROLL_WALL', x, y, sortY: y + resolution,
				seed: tile.x * 17 + tile.y * 31
			});
			return;
		}
		if (tile.isPortal && tile.t === 'G_DOOR_WOOD') {
			queue.push({ type: 'DOOR', x, y, sortY: y + resolution + 0.1 });
			return;
		}
		if (tile.encounter) {
			queue.push({ type: 'TALL_GRASS', x, y, sortY: y + resolution + 10 });
			return;
		}
		if (tile.isSoul) {
			queue.push({
				type: tile.isEnemy ? 'ANIMAL' : 'NPC',
				x, y, sortY: y + resolution, dir: tile.dir, color: tile.color
			});
		}
	}

	static enqueueDetails(queue, tile, x, y, resolution, theme) {
		for (const detail of WorldDetailPlanner.plan(tile, theme)) {
			queue.push({
				type: 'WORLD_DETAIL',
				detailKind: detail.kind,
				seed: detail.seed,
				theme: detail.theme,
				x, y,
				sortY: y + resolution + this.detailOffset(detail.kind)
			});
		}
	}

	static enqueueHero(queue, midX, midY, resolution) {
		const hero = StateRegister.HeroPos;
		queue.push({
			type: 'HERO',
			x: midX - resolution / 2,
			y: midY - resolution / 2,
			sortY: midY + resolution / 2,
			progress: hero.moving ? hero.stepTick / resolution : 0,
			dir: hero.dir
		});
	}

	static treeType(char) {
		return ({ '🌵': 'CACTUS', '🌲': 'PINE', '🌳': 'GOLD', '🌴': 'PALM', '🎄': 'SNOW', '💎': 'CRYSTAL' })[char] || 'OAK';
	}

	static detailOffset(kind) {
		return ({ MOSS_ROCK: 0.3, RUIN_FRAGMENT: 0.4, SHRUB: 2, REEDS: 4 })[kind] || 1;
	}

	static sort(queue) {
		return queue.sort((left, right) => left.sortY - right.sortY);
	}
}
