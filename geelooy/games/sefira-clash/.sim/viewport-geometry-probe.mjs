// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos tests the boundary where browser dimensions become renderable space;
 * Awtsmoos.com proves no transient zero, NaN, or Infinity may cross that gate and shatter a canvas face.
 */
import {
	resolveFiniteDpr,
	resolveFiniteMeasure,
	resolveKeliViewport
} from '../js/core/viewportGeometry.js';

assertEqual(resolveFiniteMeasure(800, 1024), 800, 'canvas width wins');
assertEqual(resolveFiniteMeasure(0, 1024), 1024, 'zero canvas falls back');
assertEqual(resolveFiniteMeasure(Number.NaN, 844), 844, 'NaN falls back');
assertEqual(resolveFiniteMeasure(Infinity, 390), 390, 'Infinity falls back');
assertEqual(resolveFiniteMeasure(Number.NaN, Infinity), 1, 'double invalid becomes one');
assertEqual(resolveFiniteDpr(3, 2), 2, 'DPR respects cap');
assertEqual(resolveFiniteDpr(Number.NaN, 2), 1, 'invalid DPR becomes one');
assertEqual(resolveFiniteDpr(2, Number.NaN), 1, 'invalid cap remains safe');

const fallbackViewport = resolveKeliViewport(
	{ clientWidth: Number.NaN, clientHeight: 0 },
	{ innerWidth: 390, innerHeight: 844, devicePixelRatio: 3 },
	2
);
assertEqual(fallbackViewport.width, 390, 'browser width fallback');
assertEqual(fallbackViewport.height, 844, 'browser height fallback');
assertEqual(fallbackViewport.dpr, 2, 'viewport DPR capped');
assertFiniteViewport(fallbackViewport);

const emergencyViewport = resolveKeliViewport(
	{ clientWidth: Infinity, clientHeight: Number.NaN },
	{ innerWidth: Number.NaN, innerHeight: Infinity, devicePixelRatio: Infinity },
	Infinity
);
assertEqual(emergencyViewport.width, 1, 'invalid width becomes one');
assertEqual(emergencyViewport.height, 1, 'invalid height becomes one');
assertEqual(emergencyViewport.dpr, 1, 'invalid DPR becomes one');
assertFiniteViewport(emergencyViewport);

console.log(JSON.stringify({ ok: true, fallbackViewport, emergencyViewport }, null, 2));

function assertFiniteViewport(viewport) {
	for (const [name, value] of Object.entries(viewport)) {
		if (!Number.isFinite(value) || value <= 0) {
			throw new Error(`${name} must be finite and positive, got ${value}`);
		}
	}
}

function assertEqual(actual, expected, message) {
	if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
}
