// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralMaterialSvg.mjs
 * @description Builds seamless role-aware SVG textures without external dependencies.
 * The Awtsmoos bends noise, grain, mortar, water, and leaf-light into finite tiles;
 * Awtsmoos.com keeps every generated garment deterministic, compact, and local.
 */

import {
	earthMarks,
	fiberMarks,
	foliageMarks,
	grassMarks,
	metalMarks
} from './ProceduralMaterialOrganicMarks.mjs';
import { proceduralMaterialProfile } from './ProceduralMaterialProfile.mjs';

export function proceduralMaterialSvg(sourcePath) {
	const profile = proceduralMaterialProfile(sourcePath);
	const background = profile.alpha ? 'fill="none"' : `fill="${profile.base}"`;
	return [
		'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">',
		definitions(profile),
		`<rect width="256" height="256" ${background}/>` ,
		profile.alpha
			? ''
			: '<rect width="256" height="256" filter="url(#grain)" opacity=".52"/>',
		familyMarks(profile),
		'</svg>'
	].join('\n');
}

function definitions(profile) {
	return `<defs>
	<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".055" numOctaves="4" seed="${profile.seed % 997}"/><feColorMatrix type="saturate" values=".3"/><feBlend mode="multiply" in2="SourceGraphic"/></filter>
	<linearGradient id="shine" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${profile.accent}"/><stop offset=".5" stop-color="${profile.base}"/><stop offset="1" stop-color="${profile.dark}"/></linearGradient>
</defs>`;
}

function familyMarks(profile) {
	const builders = {
		brick: brickMarks,
		earth: earthMarks,
		fiber: fiberMarks,
		foliage: foliageMarks,
		grass: grassMarks,
		metal: metalMarks,
		mineral: stoneMarks,
		roof: roofMarks,
		stone: stoneMarks,
		water: waterMarks,
		wood: woodMarks
	};
	return (builders[profile.family] || stoneMarks)(profile);
}

function brickMarks(profile) {
	const rows = Array.from({ length: 9 }, (_, row) => {
		const y = row * 32;
		const offset = row % 2 ? 32 : 0;
		return `<path d="M0 ${y}H256 ${offset} ${y}V${y + 32} M${offset + 64} ${y}V${y + 32} M${offset + 128} ${y}V${y + 32} M${offset + 192} ${y}V${y + 32}"/>`;
	}).join('');
	return `<g fill="none" stroke="${profile.dark}" stroke-width="5" opacity=".68">${rows}</g>`;
}

function stoneMarks(profile) {
	return `<g fill="${profile.accent}" stroke="${profile.dark}" stroke-width="4" opacity=".64">
	<path d="M-8 24L41 3l39 28-8 45-56 4zM80 6l57-9 21 42-30 39-51-8zM160 3l74 3 31 38-33 39-67-11zM-12 91l61-17 41 34-20 49-73 4zM86 86l71-9 25 50-43 43-63-17zM181 87l62-8 27 48-22 47-73-8zM-5 170l72-8 25 54-42 42-61-13zM92 171l65-6 34 42-20 52-76 5zM184 176l61-4 23 44-18 47-72-5z"/>
	</g>`;
}

function woodMarks(profile) {
	const lines = Array.from({ length: 13 }, (_, index) => {
		const y = index * 21 + (index % 3) * 3;
		return `<path d="M-8 ${y}C48 ${y - 10} 78 ${y + 14} 140 ${y}S220 ${y - 8} 270 ${y + 4}"/>`;
	}).join('');
	return `<g fill="none" stroke="${profile.dark}" stroke-width="3" opacity=".55">${lines}<ellipse cx="74" cy="92" rx="19" ry="9"/><ellipse cx="196" cy="186" rx="15" ry="7"/></g>`;
}

function waterMarks(profile) {
	const waves = Array.from({ length: 12 }, (_, index) => {
		const y = index * 23;
		return `<path d="M-20 ${y}Q16 ${y - 13} 52 ${y}T124 ${y}T196 ${y}T276 ${y}"/>`;
	}).join('');
	return `<rect width="256" height="256" fill="url(#shine)" opacity=".7"/><g fill="none" stroke="${profile.accent}" stroke-width="4" opacity=".5">${waves}</g>`;
}

function roofMarks(profile) {
	const rows = Array.from({ length: 9 }, (_, row) => {
		const y = row * 31;
		return `<path d="M-32 ${y}Q0 ${y + 34} 32 ${y}Q64 ${y + 34} 96 ${y}Q128 ${y + 34} 160 ${y}Q192 ${y + 34} 224 ${y}Q256 ${y + 34} 288 ${y}"/>`;
	}).join('');
	return `<g fill="none" stroke="${profile.dark}" stroke-width="5" opacity=".7">${rows}</g>`;
}
