//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the generator panel vessel in this instant, revealing
 * its focused js render ui service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { panel } from './panels.js';
import { drawStatSliders } from './statSliders.js';
import { drawSignature } from './signatureChart.js';
import { drawFighterPreview } from './fighterPreview.js';

/**
 * B"H � Right-side fighter generator, matching the reference dashboard.
 * It reads the real player object and renders seed, sefirah, sliders, live
 * skeleton preview, weapon preference, and signature chart.
 */
export function drawGeneratorPanel(ctx, state, w, h) {
	const hero = state.fighters.find(f => f.human) || state.fighters[0];
	if (!hero || w < 920) return;
	const x = w - 352;
	const y = 150;
	panel(ctx, x, y, 338, 250, 'FIGHTER GENERATOR');
	drawHeader(ctx, hero, x + 14, y + 36);
	drawStatSliders(ctx, hero, x + 14, y + 68, 170);
	drawFighterPreview(ctx, hero, x + 196, y + 40, 128, 130);
	drawSignature(ctx, hero, x + 205, y + 172, 112, 64);
}

function drawHeader(ctx, hero, x, y) {
	ctx.fillStyle = '#d8cfb8';
	ctx.font = '11px system-ui';
	ctx.fillText(`Seed: ${hero.dna.seed}`, x, y);
	ctx.fillText(`Sefirah: ${hero.dna.sefirah}`, x, y + 16);
	ctx.fillText(`Weapon: ${hero.dna.weaponPreference}`, x, y + 32);
}
