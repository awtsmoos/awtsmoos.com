//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanvasParticlePainter.js
 * @description Sparks travel by deterministic law; the Awtsmoos renews their
 * flight while Awtsmoos.com can verify the same AI movie without random drift.
 */
import { MovieLayerKind } from "../MovieKinds.js";

/** Paint deterministic 2D or perspective-scaled 3D particles. */
export function paintParticleLayer(context, layer, frame, viewport) {
	if (![MovieLayerKind.PARTICLES_2D, MovieLayerKind.PARTICLES_3D].includes(layer.kind)) return;
	const isThreeDimensional = layer.kind === MovieLayerKind.PARTICLES_3D;
	const count = Math.min(180, Math.max(12, Number(layer.content?.count || layer.data?.count || 72)));
	const seed = Number(layer.content?.seed || layer.data?.seed || hash(layer.id));
	for (let index = 0; index < count; index += 1) {
		paintParticle(context, frame, viewport, seed, index, isThreeDimensional, layer.style?.fill);
	}
}

function paintParticle(context, frame, viewport, seed, index, isThreeDimensional, fill) {
	const originX = random(seed, index * 5 + 1);
	const originY = random(seed, index * 5 + 2);
	const speed = 0.035 + random(seed, index * 5 + 3) * 0.11;
	const angle = random(seed, index * 5 + 4) * Math.PI * 2;
	const phase = (frame.localTime * speed + random(seed, index * 5 + 5)) % 1;
	const depth = isThreeDimensional ? 0.45 + random(seed + 17, index) * 1.2 : 1;
	const x = wrap(originX + Math.cos(angle) * phase * 0.48) * viewport.width;
	const y = wrap(originY + Math.sin(angle) * phase * 0.38 - phase * 0.16) * viewport.height;
	const radius = Math.max(1.5, viewport.width * 0.004 * depth * (1 - phase * 0.45));
	context.globalAlpha = 0.28 + (1 - phase) * 0.65;
	context.fillStyle = fill || (isThreeDimensional ? "#d9b9ff" : "#7cf5df");
	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI * 2);
	context.fill();
	if (index % 9 === 0) {
		context.strokeStyle = "rgba(255,255,255,0.55)";
		context.lineWidth = 1;
		context.beginPath();
		context.moveTo(x - radius * 2.4, y);
		context.lineTo(x + radius * 2.4, y);
		context.stroke();
	}
	context.globalAlpha = 1;
}

function random(seed, index) {
	const value = Math.sin((seed + 1) * 12.9898 + (index + 1) * 78.233) * 43758.5453;
	return value - Math.floor(value);
}

function wrap(value) {
	return ((value % 1) + 1) % 1;
}

function hash(value) {
	return [...String(value)].reduce((sum, character) => sum + character.charCodeAt(0) * 7, 0);
}
