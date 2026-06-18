// B"H
/**
 * @file ResidencySmoke.mjs
 * @description Chapter 467: sectors awaken, sleep, write, and return in a
 * small proof before gameplay is risked.
 */
import assert from "node:assert/strict";
import { sectorFromPoint } from "../sector/SectorKey.js";
import SectorResidencyManager from "../core/SectorResidencyManager.js";
import MemorySectorStore from "../store/MemorySectorStore.js";
import SectorDirtyJournal from "../store/SectorDirtyJournal.js";
import ColliderPayloadRegistry from "../collider/ColliderPayloadRegistry.js";
import RenderLodRegistry from "../lod/RenderLodRegistry.js";
import { catchUpRecord, decodeEntityRecord, encodeEntityRecord } from "../entities/EntityRecordCodec.js";
const sector = sectorFromPoint(130, -20, 64);
assert.equal(sector.key, "2:-1");
const manager = new SectorResidencyManager({ sectorSize:64 });
const first = manager.update(0, 0);
assert.ok(first.load.length > 0);
const second = manager.update(256, 0);
assert.ok(second.unload.length > 0 || second.promote.length > 0 || second.load.length > 0);
const store = new MemorySectorStore();
const journal = new SectorDirtyJournal(store);
journal.mark("0:0", "entities", [{ id:"rebbe" }]);
assert.deepEqual(await journal.flush("test"), ["0:0:entities"]);
assert.deepEqual(await store.get({ worldId:"test", sectorId:"0:0", kind:"entities" }), [{ id:"rebbe" }]);
const colliders = new ColliderPayloadRegistry(store);
await colliders.hydrate("0:0");
assert.equal(colliders.snapshot().active.length, 1);
const lods = new RenderLodRegistry(store);
await lods.hydrate("0:0", 3);
assert.equal(lods.snapshot().active[0], "0:0:lod3");
const rec = encodeEntityRecord({ id:"a", type:"npc", position:{ x:1, y:2, z:3 } }, 1000);
assert.equal(decodeEntityRecord(rec).position.z, 3);
assert.equal(catchUpRecord(rec, 2500).catchUpElapsedMs, 1500);
console.log("B'H Residency smoke passed", manager.snapshot().current.length);
