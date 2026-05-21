import assert from 'node:assert/strict';
import { canSeeOverlay, planSpiritualOverlays } from '../ckidsAwtsmoos/Olam/runtime/overlays/SpiritualOverlayRuntime.js';

const overlays = planSpiritualOverlays({ refinement: 3, activeNiggun: 'hope', debateRevelation: true });
assert.deepEqual(overlays, ['soft_hidden_glyphs', 'concealed_paths', 'niggun_resonance_hope', 'debate_revelation_flash']);
assert.equal(canSeeOverlay({ refinement: 1 }, 'soft_hidden_glyphs'), true);
assert.equal(canSeeOverlay({ refinement: 0 }, 'concealed_paths'), false);

console.log('B"H spiritual overlay passed');
