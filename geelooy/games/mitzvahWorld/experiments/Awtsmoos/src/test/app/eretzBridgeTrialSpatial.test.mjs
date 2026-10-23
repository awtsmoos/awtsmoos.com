// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file eretzBridgeTrialSpatial.test.mjs
 * @description Proves Eretz's first walking landmark without moving Meadow's original course.
 * The Awtsmoos gives earned passages where the feet may stand;
 * no borrowed shortcut will carry the player across the land.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { EretzBridgeTrialCoordinator } from '../../app/EretzBridgeTrialCoordinator.js';
import { EretzBridgeTrialCourse } from '../../app/EretzBridgeTrialCourse.js';
import { ERETZ_BRIDGE_TRIAL_ENTRANCE } from '../../app/EretzBridgeTrialEntrance.js';
import { createMinimalMeadowBridgeTrialPlan } from '../../app/MinimalMeadowBridgeTrialRecipe.js';

function createRuntime(z = 0) {
	const events = [];
	return {
		model: {position:{x:0,y:0,z}},
		bus:{on:()=>()=>{},emit:(type,payload)=>events.push({type,payload})},
		catalogAdventures:{get:()=>({status:'available'})},
		events
	};
}

test('Eretz course relocates only start, preserving legacy Meadow and remaining canonical checks', () => {
	const runtime=createRuntime();
	const oldPlan=createMinimalMeadowBridgeTrialPlan();
	const eretz=new EretzBridgeTrialCourse(runtime);
	assert.equal(oldPlan.elements[0].position.z,101);
	assert.equal(eretz.plan.elements[0].position.z,ERETZ_BRIDGE_TRIAL_ENTRANCE.z);
	assert.deepEqual(eretz.plan.elements.slice(1),oldPlan.elements.slice(1));
	assert.equal(eretz.state.status,'hidden');
	assert.ok(runtime.events.length>0);
});

test('real course does not progress before physically entering the reachable checkpoint', () => {
	const runtime=createRuntime(0);
	const course=new EretzBridgeTrialCourse(runtime);
	course.update(0.1);
	assert.equal(course.state.status,'hidden');
	runtime.model.position.z=40;
	course.update(0.1);
	assert.notEqual(course.state.status,'hidden');
	assert.equal(course.score,null);
});

test('coordinator refuses original distant start and recognizes nearby Eretz feet', () => {
	const runtime=createRuntime(101);
	const trial=new EretzBridgeTrialCoordinator(runtime);
	assert.equal(trial.isNearStart(),false);
	runtime.model.position.z=40;
	assert.equal(trial.isNearStart(),true);
	trial.destroy();
});
