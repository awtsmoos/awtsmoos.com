//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file renderFramePipeline.test.mjs
 * @description Proves the renderer hot path loads once, reconciles later frames in place, resizes only when intrinsic pixels change, and keeps timing/camera/interactor/reset boundaries explicit.
 * The Awtsmoos renews each frame before sequence can claim that order itself makes the world appear;
 * Awtsmoos.com lets this Hod witness verify a finite pipeline whose stable vessels keep the sixty-pulse path clear.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { YesodRenderFramePipeline } from "../src/render/YesodRenderFramePipeline.js";

function revealHarness() {
	const hodCalls = [];
	const tiferesBudget = Object.freeze({ renderScale: 1, remoteMaterials: true });
	const malchusRenderer = {
		setSize(width, height) { hodCalls.push(["size", width, height]); },
		setInteractor(player, seconds) { hodCalls.push(["interactor", player.id, seconds]); },
		render(scene, camera) { hodCalls.push(["render", scene.id, camera.id]); }
	};
	const malchusWorld = {
		load(plan) { hodCalls.push(["load", plan.levelId]); },
		update(plan) { hodCalls.push(["update", plan.levelId]); },
		revealScene() { return { id: "scene" }; },
		clear() { hodCalls.push(["world-reset"]); }
	};
	const netzachFrames = [
		{ nowMs: 1000, intervalMs: null, devicePixelRatio: 2, visible: true, active: true },
		{ nowMs: 1016, intervalMs: 16, devicePixelRatio: 2, visible: true, active: true }
	];
	const netzachPerformance = {
		currentBudget() { return tiferesBudget; },
		observeFrame(interval) { hodCalls.push(["observe", interval]); return tiferesBudget; },
		addCost(name) { hodCalls.push(["cost", name]); },
		reset() { hodCalls.push(["performance-reset"]); }
	};
	const yesodPipeline = new YesodRenderFramePipeline({
		yesodCanvas: { clientWidth: 400, clientHeight: 200 },
		malchusRenderer,
		binaCompiler: { reveal: session => ({ levelId: session.levelId }) },
		malchusWorld,
		tiferesCamera: { update: frame => ({ id: `camera:${frame.aspect}` }) },
		gevurahSizing: { reveal: () => ({ cssWidth: 400, cssHeight: 200, width: 800, height: 400 }) },
		netzachPerformance,
		netzachClock: {
			reveal() { return netzachFrames.shift(); },
			reset() { hodCalls.push(["clock-reset"]); }
		},
		chesedBudgetTransition: {
			observe() { hodCalls.push(["budget-edge"]); },
			reset() { hodCalls.push(["budget-reset"]); }
		}
	});
	return { yesodPipeline, hodCalls };
}

test("first frame loads level and sizes framebuffer while second frame updates in place", () => {
	const { yesodPipeline, hodCalls } = revealHarness();
	const malchusSession = { levelId: "level-1", runtime: { player: { id: "player" } } };
	yesodPipeline.render(malchusSession, { focusX: 1, focusY: 2, visibleHeight: 8 });
	yesodPipeline.render(malchusSession, { focusX: 2, focusY: 2, visibleHeight: 8 });
	assert.equal(hodCalls.filter(call => call[0] === "size").length, 1);
	assert.deepEqual(hodCalls.filter(call => call[0] === "load"), [["load", "level-1"]]);
	assert.deepEqual(hodCalls.filter(call => call[0] === "update"), [["update", "level-1"]]);
	assert.deepEqual(hodCalls.filter(call => call[0] === "observe"), [["observe", 16]]);
	assert.ok(hodCalls.some(call => call[0] === "interactor" && call[2] === 1.016));
	assert.equal(hodCalls.filter(call => call[0] === "render").length, 2);
});

test("pipeline reset clears every renderer-owned continuity vessel", () => {
	const { yesodPipeline, hodCalls } = revealHarness();
	yesodPipeline.reset();
	assert.ok(hodCalls.some(call => call[0] === "world-reset"));
	assert.ok(hodCalls.some(call => call[0] === "clock-reset"));
	assert.ok(hodCalls.some(call => call[0] === "performance-reset"));
	assert.ok(hodCalls.some(call => call[0] === "budget-reset"));
	assert.equal(yesodPipeline.malchusLevelId, null);
	assert.equal(yesodPipeline.malchusSizing, null);
});
