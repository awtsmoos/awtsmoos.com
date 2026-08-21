//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos renews gesture, attention, and inspection while tests need no borrowed scene fixture to see;
 * Awtsmoos.com exercises the real camera director through tiny neutral doubles and verifies lifecycle ownership where it truly came to be.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	personActionName,
	setPersonAction,
	updatePersonAction
} from "../js/animation/contextual-action.js";
import { CameraDirector } from "../js/webgl/camera-director.js";
import { readSevenSource } from "./test-source-reader.mjs";

/** Minimal mutable vector required by the public camera surface under test. */
class TestVector {
	constructor(x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	copy(source) {
		this.x = source.x;
		this.y = source.y;
		this.z = source.z;
		return this;
	}

	lerp(target, factor) {
		this.x += (target.x - this.x) * factor;
		this.y += (target.y - this.y) * factor;
		this.z += (target.z - this.z) * factor;
		return this;
	}
}

/** Minimal camera double that records the director's authored look target. */
class TestCamera {
	constructor() {
		this.position = new TestVector();
		this.lookTarget = new TestVector();
	}

	lookAt(target) {
		this.lookTarget.copy(target);
	}
}

/** Build one focus root that writes a stable world position into the director's target. */
function focusRoot(x, y, z) {
	return {
		getWorldPosition(target) {
			target.set(x, y, z);
			return target;
		}
	};
}

test("contextual actions blend limb motion and expire smoothly", () => {
	const names = ["left-arm", "right-arm", "head", "torso"];
	const parts = Object.fromEntries(names.map(name => {
		return [name, {
			name,
			rotation: { x: 0, y: 0, z: 0 }
		}];
	}));
	const person = {
		userData: {},
		getObjectByName(name) {
			return parts[name];
		}
	};
	setPersonAction(person, "wave", 0.2);
	updatePersonAction(person, 0.1, 1 / 60);
	assert.equal(personActionName(person), "wave");
	assert.ok(parts["right-arm"].rotation.z < 0);
	for (let index = 0; index < 180; index += 1) {
		updatePersonAction(person, index / 60, 1 / 60);
	}
	assert.equal(personActionName(person), "");
});

test("camera director enters focus and restores authored home", () => {
	const camera = new TestCamera();
	const director = new CameraDirector(camera);
	director.setHome([0, 6, 10], [0, 1, 0]);
	director.focus(focusRoot(3, 1, -2), 1000);
	assert.equal(director.mode(), "focus");
	director.update(1 / 60);
	assert.notEqual(camera.position.x, 0);
	director.restore();
	assert.equal(director.mode(), "home");
});

test("inspection stays separate from gameplay activation", () => {
	const source = readSevenSource("js/webgl/semantic-picker.js");
	assert.match(source, /this\.targets\.push\(root\)/);
	assert.match(source, /this\.interactive = new Set/);
	assert.match(source, /this\.inspector\.show\(root\)/);
	assert.match(source, /this\.cameraDirector\.focus\(root\)/);
	assert.match(source, /if \(this\.interactive\.has\(root\)\)/);
});

test("stage runtime bundle owns camera, picker, detail, and disposal", () => {
	const bundle = readSevenSource("js/webgl/stage-runtime-bundle.js");
	const stage = readSevenSource("js/webgl/webgl-stage.js");
	assert.match(bundle, /new CameraDirector/);
	assert.match(bundle, /new DetailGovernor/);
	assert.match(bundle, /new SemanticPicker/);
	assert.match(bundle, /this\.picker\.destroy\(\)/);
	assert.match(bundle, /this\.detailGovernor\.destroy\(\)/);
	assert.match(stage, /this\.runtime\.destroy\(\)/);
});
