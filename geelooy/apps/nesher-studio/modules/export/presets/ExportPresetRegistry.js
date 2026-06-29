/* B"H
Preset registry: export choices are gathered without binding the UI to one panel.
*/
import { QUALITY_EXPORT_PRESETS } from './QualityPresets.js';
import { SOCIAL_EXPORT_PRESETS } from './SocialPresets.js';
export function createExportPresetRegistry(extra = []) { return [...QUALITY_EXPORT_PRESETS, ...SOCIAL_EXPORT_PRESETS, ...extra]; }
export function getExportPreset(id, registry = createExportPresetRegistry()) { return registry.find(p => p.id === id) || registry[0]; }
