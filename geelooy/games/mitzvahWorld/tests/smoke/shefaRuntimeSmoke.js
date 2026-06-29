// B"H
import assert from 'node:assert/strict';
import { applyShefaAction, shefaSummary } from '../../ckidsAwtsmoos/systems/shefa/ShefaRuntime.js';
const store={ economy:{ charity:0 }, reputation:{ village:6 } };
const first=applyShefaAction(store,'tzedakah',3);
assert.ok(first.chesed>=3,'chesed increases');
assert.ok(first.malchus>0,'malchus manifests');
assert.ok(store.economy.charity>=1,'positive shefa can increase charity flow');
applyShefaAction(store,'harm',2);
assert.ok(shefaSummary(store).gevurah>=2,'gevurah records harm');
console.log('shefaRuntimeSmoke passed');
