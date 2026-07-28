// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NativeQualityBrowserStairs.mjs
 * @description Walks the live player across exterior steps, interior treads, and upper landing.
 * The Awtsmoos joins meadow, threshold, floor, and ascent through level supports;
 * Awtsmoos.com uses production collision so sliding, falling, and trapping cannot hide.
 */

import {
	evaluateMobile
} from '../2026-07-26-mobile-gameplay-polish/MobileCdpClient.mjs';

export async function traverseNativeQualityStairs(client) {
	return evaluateMobile(client, `(async () => {
		const runtime = globalThis.AwtsmoosMitzvahWorld.runtime;
		const movement = await import('/games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowMovementRuntime.js');
		const math = await import('/games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowHouseMath.js');
		const receipt = (state) => ({
			airPhase: state.airPhase,
			grounded: state.grounded,
			groundY: state.groundY,
			renderY: state.renderY,
			velY: state.velY,
			x: state.x,
			y: state.y,
			z: state.z
		});
		const place = (point, height) => {
			Object.assign(runtime.state, {
				airPhase: 'ground',
				grounded: true,
				groundY: height,
				renderY: height,
				velY: 0,
				x: point.x,
				y: height,
				z: point.z
			});
			runtime.model.position.set(point.x, height, point.z);
		};
		const advance = (previous, next) => {
			movement.applyMovementCollision(runtime, runtime.state, {
				x: next.x - previous.x,
				z: next.z - previous.z
			});
		};
		const house = runtime.houses.houses.find((candidate) => candidate.stairSupport);
		const entry = house.groundSupports.find((support) => support.kind === 'entry');
		const stairs = house.stairSupport;
		const profile = house.profile;
		const policy = profile.layout;
		const original = receipt(runtime.state);
		const entryStart = math.housePoint(profile, 0, entry.outerZ + 0.16);
		place(entryStart, runtime.terrain.heightAt(entryStart.x, entryStart.z));
		const entryHeights = [];
		let previous = entryStart;
		for (let index = 0; index < entry.steps; index += 1) {
			const localZ = entry.outerZ - entry.tread * (index + 0.5);
			const next = math.housePoint(profile, 0, localZ);
			advance(previous, next);
			entryHeights.push(runtime.state.renderY);
			previous = next;
		}
		const threshold = math.housePoint(profile, 0, profile.depth / 2 + 0.08);
		advance(previous, threshold);
		entryHeights.push(runtime.state.renderY);
		const interiorStart = math.housePoint(profile, 0, stairs.startZ + 0.16);
		place(interiorStart, entry.threshold);
		const stairHeights = [];
		previous = interiorStart;
		for (let index = 0; index < policy.stairSteps; index += 1) {
			const localZ = stairs.startZ - policy.stairTread * (index + 0.5);
			const next = math.housePoint(profile, 0, localZ);
			advance(previous, next);
			stairHeights.push(runtime.state.renderY);
			previous = next;
		}
		const landing = math.housePoint(
			profile,
			0,
			stairs.endZ - policy.stairLandingDepth * 0.5
		);
		advance(previous, landing);
		stairHeights.push(runtime.state.renderY);
		const result = {
			airPhase: runtime.state.airPhase,
			collision: house.stairs.collision,
			entryHeights,
			entryRise: entry.maximumRise,
			entrySteps: entry.steps,
			finalHeight: runtime.state.renderY,
			grounded: runtime.state.grounded,
			landingHeight: stairs.lowerY + profile.storyHeight,
			minimumHeight: runtime.terrain.heightAt(entryStart.x, entryStart.z),
			rise: stairs.rise,
			stairHeights,
			stepCount: policy.stairSteps,
			stuck: !Number.isFinite(runtime.state.x) || !Number.isFinite(runtime.state.z)
		};
		Object.assign(runtime.state, original);
		runtime.model.position.set(original.x, original.renderY, original.z);
		return result;
	})()`);
}
