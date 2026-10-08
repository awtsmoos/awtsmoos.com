//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Tradition blender for the Awtsmoos Design OS.
 * @description Synthesizes new design traditions by interpolating between two
 * parent profiles in DNA space. Numeric dimensions interpolate linearly;
 * categorical dimensions resolve by weighted vote; palettes mix channel-wise
 * using the solver's own color math. The result is a real profile object
 * (same shape as profiles.mjs entries) whose DSL source is generated from
 * the blended DNA — and it is verified by actually solving it.
 */

import { hexToRgb, rgbToHex } from "../constraints/solver.mjs";
import { NUMERIC_DIMENSIONS, validateDNA } from "./dna.mjs";
import { getProfile } from "./profiles.mjs";

function lerp(a, b, t) {
	return a + (b - a) * t;
}

function round2(n) {
	return Math.round(n * 100) / 100;
}

/** Mixes two hex colors channel-wise. t=0 → a, t=1 → b. */
export function mixHex(a, b, t) {
	const ra = hexToRgb(a);
	const rb = hexToRgb(b);
	return rgbToHex({
		r: Math.round(lerp(ra.r, rb.r, t)),
		g: Math.round(lerp(ra.g, rb.g, t)),
		b: Math.round(lerp(ra.b, rb.b, t)),
	});
}

/**
 * Interpolates two DNA coordinates. weightA in [0,1]: 1 = fully A, 0 = fully B.
 */
export function blendDNA(dnaA, dnaB, weightA) {
	const t = 1 - weightA; // t toward B
	const out = {};
	for (const dim of NUMERIC_DIMENSIONS) {
		let v = lerp(dnaA[dim], dnaB[dim], t);
		if (dim === "spacing.density" || dim === "color.warmth") {
			v = Math.min(1, Math.max(0, v));
		}
		out[dim] = round2(v);
	}
	// Categorical: weighted vote; ties go to A (the first parent).
	out["ornament.level"] = weightA >= 0.5 ? dnaA["ornament.level"] : dnaB["ornament.level"];
	out["formality.level"] = weightA >= 0.5 ? dnaA["formality.level"] : dnaB["formality.level"];
	return out;
}

/**
 * Generates constraint-DSL source from a DNA coordinate + palette.
 * Mirrors the hand-written profile sources so blends feel native.
 */
export function dslFromDNA(dna, palette) {
	const bodyPx = Math.round(dna["typography.bodySize"]);
	const lh = round2(dna["typography.lineHeight"]);
	const scale = round2(dna["typography.scale"]);
	const floor = round2(dna["color.contrastFloor"]);
	// Spacing rhythm follows density: dense → tighter, airy → looser.
	const density = dna["spacing.density"];
	const sectionGap = round2(lerp(3, 1.5, density));
	const paraGap = round2(lerp(1.25, 0.75, density));
	const titleTop = round2(lerp(2, 1.5, density));
	const maxWidth = Math.round(lerp(34, 40, density));
	return `
body.fontSize = ${bodyPx}px
body.lineHeight = ${lh} * body.fontSize
body.fontWeight = 400
title.fontSize = ${scale} * body.fontSize
title.lineHeight = 1.25 * title.fontSize
title.fontWeight = 700
title.marginTop = ${titleTop} * body.fontSize
title.marginBottom = 1 * body.fontSize
section.marginTop = ${sectionGap} * body.fontSize
section.marginBottom = ${sectionGap} * body.fontSize
paragraph.marginBottom = ${paraGap} * body.fontSize
content.maxWidth = ${maxWidth}em
paper.background = ${palette.background}
paper.color = ${palette.color}
contrast(paper.color, paper.background) >= ${floor}
accent.color = ${palette.accent}
link.color = accent.color
ornament.level = "${dna["ornament.level"]}"
`.trim();
}

/**
 * Blends two traditions into a new synthesized profile.
 * @param {string} nameA First tradition name.
 * @param {string} nameB Second tradition name.
 * @param {number} weightA 0..1 — 1 = fully A, 0 = fully B.
 * @returns Profile-shaped object {name, tradition, description, sources, dna, palette, source}.
 */
export function blendStyles(nameA, nameB, weightA = 0.5) {
	if (weightA < 0 || weightA > 1) throw new Error("weightA must be in [0,1]");
	const a = getProfile(nameA);
	const b = getProfile(nameB);
	const t = 1 - weightA;
	const dna = blendDNA(a.dna, b.dna, weightA);
	const check = validateDNA(dna);
	if (!check.ok) throw new Error(`Blended DNA invalid: ${check.errors.join("; ")}`);
	const palette = Object.freeze({
		background: mixHex(a.palette.background, b.palette.background, t),
		color: mixHex(a.palette.color, b.palette.color, t),
		accent: mixHex(a.palette.accent, b.palette.accent, t),
	});
	const pctA = Math.round(weightA * 100);
	return Object.freeze({
		name: `${nameA}-${nameB}`,
		tradition: `${a.tradition} × ${b.tradition}`,
		description:
			`Synthesized blend: ${pctA}% ${a.tradition}, ${100 - pctA}% ${b.tradition}. ` +
			`Numeric DNA interpolated; palette mixed channel-wise.`,
		sources: Object.freeze([...a.sources, ...b.sources]),
		dna: Object.freeze(dna),
		palette,
		source: dslFromDNA(dna, palette),
	});
}
