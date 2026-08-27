//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos renews each resident with purpose while bounded projection keeps a living city smooth and known;
 * Awtsmoos.com proves frame-independent motion, adaptive direct crowds, canonical named residents, and reusable state are shown.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { dampFactor, moveTo } from "../js/motion/smooth-motion.js";
import { readSevenSource } from "./test-source-reader.mjs";

test("motion damping is frame-rate independent and approaches without snapping", () => {
	assert.ok(dampFactor(5, 1 / 30) > dampFactor(5, 1 / 60));
	const actor = {
		position: { x: 0, z: 0 },
		rotation: { y: 0 }
	};
	const moving = moveTo(
		actor,
		10,
		0,
		1 / 60,
		{ maxSpeed: 3, response: 6, turnRate: 8 }
	);
	assert.equal(moving, true);
	assert.ok(actor.position.x > 0 && actor.position.x < 1);
	assert.ok(actor.rotation.y > 0);
});

test("semantic population uses adaptive counts, routes, roles, and reasons", () => {
	const source = readSevenSource("js/population/semantic-population.js");
	assert.match(source, /this\.mobile \? mobileCount : desktopCount/);
	assert.match(source, /role: options\.role/);
	assert.match(source, /reason: options\.reason/);
	assert.match(source, /advanceRoute/);
	assert.match(source, /animatePerson/);
	assert.match(source, /animateAnimal/);
});

test("rescue uses smooth target motion and keeps collected people visible", () => {
	const motion = readSevenSource("js/games3d/rescue-motion.js");
	const field = readSevenSource("js/games3d/rescue-field.js");
	assert.match(motion, /followActor/);
	assert.match(motion, /moveTo\(this\.player/);
	assert.match(field, /this\.motion\.addFollower/);
	assert.match(field, /rescued-follower/);
	assert.doesNotMatch(field, /person\.visible = false/);
});

test("all seven worlds connect rules to purposeful population reactions", () => {
	const expectations = {
		"false-powers-game.js": /community\.evacuate/,
		"words-creation-game.js": /life\.focus/,
		"every-life-game.js": /Following/,
		"households-game.js": /neighborhood\.threaten/,
		"honest-market-game.js": /life\.queueAt/,
		"living-sanctuary-game.js": /life\?\.focus/,
		"court-nations-game.js": /life\.inspect/
	};
	for (const [name, pattern] of Object.entries(expectations)) {
		assert.match(
			readSevenSource(`js/games3d/${name}`),
			pattern,
			name
		);
	}
});

test("civic and landmark models carry explicit reason metadata", () => {
	for (const path of [
		"js/procedural/civic-prop-factory.js",
		"js/procedural/building-factory.js",
		"js/procedural/world-prop-factory.js",
		"js/procedural/person-factory.js",
		"js/procedural/animal-factory.js"
	]) {
		assert.match(readSevenSource(path), /reason:/, path);
	}
});

test("direct population modules keep adaptive bounded counts", () => {
	for (const path of [
		"js/games3d/false-powers-community.js",
		"js/games3d/creation-garden-life.js",
		"js/games3d/rescue-neighborhood-life.js",
		"js/games3d/household-neighborhood.js",
		"js/games3d/market-life.js",
		"js/games3d/sanctuary-life.js",
		"js/games3d/court-life.js"
	]) {
		assert.match(readSevenSource(path), /population\.count\(/, path);
	}
});

test("central city delegates to bounded canonical resident projection", () => {
	const life = readSevenSource("js/city/city-life-system.js");
	const population = readSevenSource("js/city/canonical-city-population.js");
	const projector = readSevenSource("js/city/canonical-city-resident-projector.js");
	const support = readSevenSource("js/city/canonical-city-population-support.js");
	assert.match(life, /new CanonicalCityPopulation/);
	assert.match(population, /this\.projector\.project/);
	assert.match(population, /ensureCanonicalCityActorCapacity/);
	assert.match(projector, /partitionCanonicalResidents/);
	assert.match(support, /for \(let index = actors\.length; index < residents\.length/);
});

test("smooth loops reuse state rather than allocating follower options each frame", () => {
	const source = readSevenSource("js/games3d/rescue-motion.js");
	assert.match(source, /this\.followOptions\.spacing =/);
	assert.doesNotMatch(source, /const options = \{ \.\.\.this\.followOptions/);
});
