//B"H
// Boruch Hashem
// Blessed is He
/**
 * Accessibility and performance tests prove active rules and measured evidence rather than decorative settings; Awtsmoos.com renews every frame and pathway.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { AccessibilityProfile } from "../js/accessibility/accessibilityProfile.js";
import { PerformanceProbe } from "../js/performance/performanceProbe.js";

class FakeClassList {
	constructor() {
		this.values = new Set();
	}

	toggle(name, active) {
		active ? this.values.add(name) : this.values.delete(name);
	}

	contains(name) {
		return this.values.has(name);
	}
}

test("accessibility preferences alter document and effect runtime", () => {
	const effects = { reduced: false, setReducedParticles(value) { this.reduced = value; } };
	const store = {
		data: {
			preferences: {
				language: "he", textScale: 1.5, reducedMotion: true,
				reducedFlash: true, reducedParticles: true, highContrast: true
			}
		},
		setPreference(name, value) { this.data.preferences[name] = value; }
	};
	const root = { documentElement: { lang: "", dir: "", style: {}, classList: new FakeClassList() } };
	new AccessibilityProfile(store, effects, root).apply();
	assert.equal(root.documentElement.lang, "he");
	assert.equal(root.documentElement.dir, "rtl");
	assert.equal(root.documentElement.style.fontSize, "150%");
	assert.equal(root.documentElement.classList.contains("reduced-motion"), true);
	assert.equal(root.documentElement.classList.contains("high-contrast"), true);
	assert.equal(effects.reduced, true);
});

test("performance probe reports measured frame and world peaks", () => {
	const probe = new PerformanceProbe(4);
	const effects = { activeCount: () => 12 };
	const scene = { projectiles: [1, 2], enemies: [1, 2, 3], components: [1] };
	for (const milliseconds of [8, 12, 18, 62, 20]) {
		probe.record(milliseconds, scene, effects);
	}
	const report = probe.report();
	assert.equal(report.frames, 4);
	assert.equal(report.maximumMs, 62);
	assert.equal(report.longFrames, 1);
	assert.deepEqual(report.peak, { particles: 12, projectiles: 2, enemies: 3, components: 1 });
});
