import assert from 'node:assert/strict';
import { createExportPresetRegistry, getExportPreset } from '../modules/export/presets/ExportPresetRegistry.js';
const registry = createExportPresetRegistry();
assert.ok(registry.some(p => p.id === 'vertical-social'));
assert.equal(getExportPreset('1080p-balanced', registry).width, 1920);
console.log('B"H export presets smoke passed');
