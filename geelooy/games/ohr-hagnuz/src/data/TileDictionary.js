
import { PortalBonds } from './maps/PortalBonds.js';

/**
 * B"H
 * @file TileDictionary.js
 * @chapter The Alphabet of Creation
 */
export const TileDictionary = {
    '1': { t: 'G_T', solid: false },
    '2': { t: 'G_T_DET', solid: false },
    'T': { t: 'G_T', solid: true, obj: 'TREE_1' }, 
    'W': { t: 'G_WALL', solid: true },             
    'S': { t: 'G_T', solid: true, obj: 'NPC_SAGE', eid: 'ELDER1' },
    'E': { t: 'G_T', solid: true, obj: 'NPC_ENEMY', eid: 'PHILOSOPHER', isEnemy: true }, // The Adversary
    '🌿': { t: 'G_GRASS', solid: false, encounter: true }, 
    'default': { t: 'G_VOID', solid: true }
};

Object.keys(PortalBonds).forEach(portalSymbol => {
    TileDictionary[portalSymbol] = { t: 'G_DOOR', solid: false, isPortal: true };
});
