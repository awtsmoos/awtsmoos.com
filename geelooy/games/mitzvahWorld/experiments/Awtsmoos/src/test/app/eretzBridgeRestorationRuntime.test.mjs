// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file eretzBridgeRestorationRuntime.test.mjs
 * @description Tests the real bridge quest's authoritative stone, spatial and saving boundaries.
 * The Awtsmoos gives the Chossid a stone only by an earned way;
 * the span shall not consume it when persistence fails to stay.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { EretzBridgeRestorationRuntime } from '../../app/EretzBridgeRestorationRuntime.js';
import { villageBridgeRestorationPlacement } from '../../world/village/VillageBridgeRestorationContract.js';
import { VILLAGE_BRIDGE_RESTORATION_QUEST_ID } from '../../gameplay/VillageBridgeAdventures.js';

/** Build the same transaction contracts provided by real InventoryStore and AdventureStore. */
function fixture(options = {}) {
	const saved = options.saved || new Map();
	const parts = [];
	const events = [];
	const records = {
		'village-bridge-trial': { status: options.trial || 'completed' },
		[VILLAGE_BRIDGE_RESTORATION_QUEST_ID]: { status: 'available' }
	};
	let stones = options.stones ?? 1;
	const center = villageBridgeRestorationPlacement().position;
	const runtime = {
		model: { position: { x:center.x + (options.offset || 0), y:0, z:center.z } },
		scene: {
			add(mesh) { parts.push(mesh); },
			remove(mesh) { const index=parts.indexOf(mesh); if(index>=0)parts.splice(index,1); }
		},
		inventory: {
			quantity() { return stones; },
			remove(id,count) { if(id!=='stone-block'||stones<count)return false;stones-=count;return true; },
			add(id,count) { if(id==='stone-block')stones+=count; }
		},
		catalogAdventures: {
			get(id) { return records[id] || null; },
			offer(id) { return records[id]={status:'offered'}; },
			accept(id) { return records[id]={status:'active'}; }
		},
		bus: { on() { return ()=>{}; }, emit(type,payload) { events.push({type,payload}); } }
	};
	const environment={localStorage: {
		getItem(key) { return saved.get(key)??null; },
		setItem(key,value) { if(options.throwSave)throw Error('QUOTA_FULL');saved.set(key,value); },
		removeItem(key) { saved.delete(key); }
	}};
	const bridge=new EretzBridgeRestorationRuntime(runtime,environment,definition=>({definition}));
	return { runtime,bridge,events,parts,records,saved,get stones() {return stones;} };
}

test('a real trial and earned stone restore one canonical span with exact quest event and save', () => {
	const world=fixture();
	assert.equal(world.bridge.state().kind,'build');
	assert.equal(world.bridge.activate(),true);
	assert.equal(world.stones,0);
	assert.equal(world.parts.length,1);
	assert.equal(world.bridge.built,true);
	assert.equal(world.records[VILLAGE_BRIDGE_RESTORATION_QUEST_ID].status,'active');
	assert.equal(world.events.filter(event=>event.type==='quest:event').length,1);
	assert.equal(world.bridge.activate(),false);
	world.bridge.destroy();
	assert.equal(world.parts.length,0);
	const reload=fixture({saved:world.saved,stones:0});
	assert.equal(reload.bridge.built,true);
	assert.equal(reload.parts.length,1);
	assert.equal(reload.events.length,0);
	reload.bridge.destroy();
});

test('trial, inventory, and position must all authorize an actual build', () => {
	for(const options of [{trial:'active'},{stones:0},{offset:75}]) {
		const world=fixture(options);
		assert.equal(world.bridge.state().kind,'hidden');
		assert.equal(world.bridge.activate(),false);
		assert.equal(world.parts.length,0);
		assert.equal(world.events.length,0);
		world.bridge.destroy();
	}
});

test('a failed persistence write rolls back both the stone and the visible bridge mesh', () => {
	const world=fixture({throwSave:true});
	assert.equal(world.bridge.activate(),false);
	assert.equal(world.bridge.built,false);
	assert.equal(world.parts.length,0);
	assert.equal(world.stones,1);
	assert.equal(world.events.filter(event=>event.type==='quest:event').length,0);
	assert.equal(world.saved.size,0);
	world.bridge.destroy();
});
