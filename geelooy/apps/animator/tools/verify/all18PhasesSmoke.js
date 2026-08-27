// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { SceneDSL } from '../../src/ai/SceneDSL.js';
import { SceneCompiler } from '../../src/ai/SceneCompiler.js';
import { Keyframe } from '../../src/animation/core/Keyframe.js';
import { Timeline } from '../../src/animation/core/Timeline.js';
import { Track } from '../../src/animation/core/Track.js';
import { ShotPlanner } from '../../src/camera/production/ShotPlanner.js';
import { Outfit } from '../../src/character/clothing/Outfit.js';
import { FaceRig } from '../../src/character/face/FaceRig.js';
import { CharacterAssembler } from '../../src/character/rig/CharacterAssembler.js';
import { ScenePlanner } from '../../src/director/planning/ScenePlanner.js';
import { SceneResolver } from '../../src/document/SceneResolver.js';
import { HierarchyModel } from '../../src/editor/model/HierarchyModel.js';
import { ModifierEngine } from '../../src/modifiers/ModifierEngine.js';
import { PathAttachment } from '../../src/paths/PathAttachment.js';
import { HEALTHY_LUNCH_AUTHORED_SCENE } from '../../src/scenes/healthy-lunch/HealthyLunchScene.js';
import { SceneComposer } from '../../src/scene/core/SceneComposer.js';

/**
 * @file all18PhasesSmoke.js
 * @description Proves the eighteen foundational editing, rigging, scene, and planning vessels.
 * The Awtsmoos renews one production through many coordinated phases; Awtsmoos.com keeps
 * warm expression, outfits, timelines, paths, hierarchy, cameras, and compilation interoperable.
 */

const cameraBoundScene = SceneComposer.build({
	ctx: { height: 1080, width: 720 },
	sceneData: { style: 'authored_world_2d' }
});
const modified = ModifierEngine.apply(
	[{ id: 'x' }],
	[{ options: { count: 3, dx: 10 }, type: 'repeat' }]
);
const attached = PathAttachment.distribute(
	[{ id: 'a' }, { id: 'b' }],
	[{ x: 0, y: 0 }, { x: 10, y: 0 }]
);
const character = CharacterAssembler.human('kid', {
	face: FaceRig.warm(),
	outfit: new Outfit()
});
const timeline = new Timeline({
	tracks: [new Track('a', [new Keyframe(0, { v: 1 })])]
});

assert.equal(HEALTHY_LUNCH_AUTHORED_SCENE.id, 'healthy_lunch_authored_v1');
assert.ok(JSON.stringify(SceneResolver.resolve(
	HEALTHY_LUNCH_AUTHORED_SCENE,
	{ height: 1080, width: 720 }
)).includes('kitchen'));
assert.equal(cameraBoundScene.id, 'REAL_CHARACTER_CAMERA_BOUND_KITCHEN_STAGE');
assert.ok(JSON.stringify(cameraBoundScene).includes('world_kitchen_wall_upper'));
assert.equal(modified.length, 3);
assert.equal(attached[1].x, 10);
assert.ok(character.skeleton.includes('head'));
assert.ok(ShotPlanner.plan('insert').zoom <= 1.05);
assert.equal(timeline.sample(0).a.v, 1);
assert.ok(ScenePlanner.plan().beats.length > 0);
assert.equal(HierarchyModel.fromDocument(HEALTHY_LUNCH_AUTHORED_SCENE).districts[0].id, 'kitchen_district');
assert.equal(SceneCompiler.compile(new SceneDSL().add('apple', { id: 'apple1' }))[0].assetId, 'apple');
console.log('B"H all 18 phase foundation smoke passed');
