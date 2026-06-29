/* B"H */
import assert from 'node:assert/strict';
import { CUSTOM_PRESET_ID, RESOLUTION_PRESETS, findPresetBySize, presetIdForSize, sanitizeSize, sizeForPreset } from '../modules/recording/resolutionPresets.js';

assert.ok(RESOLUTION_PRESETS.length >= 6);
assert.equal(presetIdForSize(1280, 720), 'hd');
assert.equal(presetIdForSize(1234, 777), CUSTOM_PRESET_ID);
assert.equal(findPresetBySize('1920', '1080').id, 'full-hd');
assert.deepEqual(sizeForPreset('vertical'), { width:1080, height:1920, fps:30 });
assert.deepEqual(sanitizeSize({ width:'10', height:'bad', fps:'999' }), { width:320, height:720, fps:60 });
console.log(JSON.stringify({ ok:true, presets:RESOLUTION_PRESETS.length, custom:CUSTOM_PRESET_ID }));
