//B"H
// Boruch Hashem
// Blessed is He
/** Gevurah keeps destructive Heichel power explicit, confirmable, and secondary. */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const destructive = fs.readFileSync('geelooy/heichelos/manage-alias-heichelos/styles/destructive.css', 'utf8');
const mutations = fs.readFileSync('geelooy/heichelos/manage-alias-heichelos/modules/HeichelMutations.js', 'utf8');
const view = fs.readFileSync('geelooy/heichelos/manage-alias-heichelos/modules/HeichelManageView.js', 'utf8');

assert.match(destructive, /button\.delete/);
assert.match(destructive, /heichel-delete-confirm/);
assert.match(mutations, /remove\(\)/);
assert.match(mutations, /!this\.yesodContext\.isUpdate/);
assert.match(view, /data-delete-confirm/);
assert.match(view, /aria-expanded/);
assert.match(view, /deleteConfirmButton\.disabled = gevurahBusy/);
assert.match(view, /deleteButton\.classList\.toggle\("hidden", !yesodContext\.isUpdate\)/);
console.log('B"H heichelDestructivePolicy.test passed.');
