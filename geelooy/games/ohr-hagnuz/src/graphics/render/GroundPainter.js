// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GroundPainter.js
 * @description Routes canonical glyphs through regional overhead ground painters.
 *
 * The Awtsmoos gives each terrain its garment while remaining one. Awtsmoos.com
 * adds only visual accents after the established ground identity has been drawn.
 */
import { TerrainAccentPainter } from './detail/TerrainAccentPainter.js';
import { CrystalPainter } from './ground/CrystalPainter.js';
import { GrassPainter } from './ground/GrassPainter.js';
import { LavaPainter } from './ground/LavaPainter.js';
import { MountainPainter } from './ground/MountainPainter.js';
import { OhrPainter } from './ground/OhrPainter.js';
import { ParchmentPainter } from './ground/ParchmentPainter.js';
import { SandPainter } from './ground/SandPainter.js';
import { SnowPainter } from './ground/SnowPainter.js';
import { VoidPainter } from './ground/VoidPainter.js';
import { WaterPainter } from './ground/WaterPainter.js';

export class GroundPainter {
	static draw(context, x, y, size, tile, theme) {
		const seed = tile.x * 13 + tile.y * 7;
		const routers = {
			'1': () => GrassPainter.draw(context, x, y, size, seed, false, theme),
			'🌿': () => GrassPainter.draw(context, x, y, size, seed, true, theme),
			'.': () => SandPainter.draw(context, x, y, size, seed),
			'~': () => WaterPainter.draw(context, x, y, size, seed, theme),
			'*': () => SnowPainter.draw(context, x, y, size, seed),
			'^': () => MountainPainter.draw(context, x, y, size, seed),
			'✧': () => CrystalPainter.draw(context, x, y, size, seed),
			'☁': () => this.drawMist(context, x, y, size),
			'✨': () => this.drawSparkTile(context, x, y, size, seed),
			'☰': () => ParchmentPainter.draw(context, x, y, size, seed),
			'☼': () => OhrPainter.draw(context, x, y, size, seed),
			'♨': () => LavaPainter.draw(context, x, y, size, seed),
			'⬣': () => VoidPainter.draw(context, x, y, size, seed),
			'≈': () => this.drawBrightWater(context, x, y, size, seed, theme)
		};
		(routers[tile.char] || routers['1'])();
		TerrainAccentPainter.draw(context, x, y, size, tile, theme);
	}

	static drawMist(context, x, y, size) {
		context.save();
		context.fillStyle = 'rgba(255,255,255,0.6)';
		context.beginPath();
		context.arc(x + size / 2, y + size / 2, size / 1.5, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}

	static drawSparkTile(context, x, y, size, seed) {
		CrystalPainter.draw(context, x, y, size, seed);
		context.save();
		context.fillStyle = '#ffeb3b';
		context.shadowBlur = 15;
		context.shadowColor = '#fff';
		context.beginPath();
		context.arc(x + size / 2, y + size / 2, 4, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}

	static drawBrightWater(context, x, y, size, seed, theme) {
		WaterPainter.draw(context, x, y, size, seed, theme);
		context.fillStyle = 'rgba(255,255,255,0.16)';
		context.fillRect(x, y, size, size);
	}
}
