import assert from 'node:assert/strict';
import { createAssetDatabase, addAssetRecord, getAssetRecord, removeAssetRecord } from '../modules/bin/AssetDatabase.js';
const db = createAssetDatabase();
const asset = addAssetRecord(db, { name:'clip.mov', mediaKind:'video', duration:2 });
assert.equal(getAssetRecord(db, asset.id).name, 'clip.mov');
assert.equal(removeAssetRecord(db, asset.id).id, asset.id);
console.log('B"H bin asset model smoke passed');
