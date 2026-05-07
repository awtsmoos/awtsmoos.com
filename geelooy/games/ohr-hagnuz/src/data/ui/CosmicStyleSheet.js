
import { Animations } from './styles/Animations.js';
import { BattleArena } from './styles/BattleArena.js';
import { DialogueVessel } from './styles/DialogueVessel.js';
import { VFX } from './styles/VFX.js';
import { IntenseBackgrounds } from './styles/IntenseBackgrounds.js';
import { GlobalStyles } from './styles/Global.js';

/**
 * B"H
 * @class CosmicStyleSheet
 * @chapter The Unity of Garments (Yichud HaMalbushim)
 */
export const CosmicStyleSheet = {
    tag: 'style',
    id: 'awtsmoos-cosmic-styles',
    text: `
        ${GlobalStyles}
        ${Animations}
        ${BattleArena}
        ${DialogueVessel}
        ${VFX}
        ${IntenseBackgrounds}
        
        /* Utility for the new Effect Vessel */
        #awtsmoos-vfx-layer {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 500;
        }
    `
};
