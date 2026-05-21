
// B"H
// js/data/maps.js

// Imports
import { malkuthMainMaps } from './maps/malkuth_main.js';
import { malkuthInteriorMaps } from './maps/malkuth_interiors.js';
import { netzachWildsMaps } from './maps/netzach_wilds.js';
import { hodAcademyMaps } from './maps/hod_academy.js';
import { cavernMaps } from './maps/caverns.js';
import { sefirotMaps } from './maps/sefiros.js';
import { gevurahMaps } from './maps/gevurah_fortress.js';
import { chesedMaps } from './maps/chesed_ocean.js';
import { binahMaps } from './maps/binah_palace.js';
import { qliphothMaps } from './maps/qliphoth_depths.js';
import { keterMaps } from './maps/keter.js';
import { chanukahCaveMaps } from './maps/chanukah/caves.js';
import { chanukahCitadelMaps } from './maps/chanukah/citadel.js';
import { sechirutMaps } from './maps/sechirut.js';
// Maamar
import { maamarHub } from './maps/maamar/hub.js';
import { matbeaMaps } from './maps/maamar/matbea.js';
import { tviaMaps } from './maps/maamar/tvia.js';
import { dibburMaps } from './maps/maamar/dibbur.js';
import { ratzonMaps } from './maps/maamar/ratzon.js';
// Tanya
import { tanyaHubMaps } from './maps/tanya/hub.js';
import { tanyaKelipahMaps } from './maps/tanya/kelipah.js';
import { tanyaKedushahMaps } from './maps/tanya/kedushah.js';
// Tribes
import { tribesHubMaps } from './maps/tribes/camp_hub.js';
import { judahCampMaps } from './maps/tribes/judah_camp.js';
import { danCampMaps } from './maps/tribes/dan_camp.js';
// New Expansions
import { crownHeightsMaps } from './maps/crown_heights.js';
import { binahGatesMaps } from './maps/binah_50_gates.js';
import { sevenSeventyMaps } from './maps/seven_seventy.js';
import { ganEdenMaps } from './maps/gan_eden.js';
import { gehinnomMaps } from './maps/gehinnom.js';
import { expansionMaps } from './maps/expansion_maps.js';
import { midbarMaps } from './maps/midbar.js';
import { kotelMaps } from './maps/kotel.js';
import { babelMaps } from './maps/babel.js';
import { expansion2Maps } from './maps/expansion_2.js';
import { taryagMaps } from './maps/taryag_maps.js';
import { alephBetMaps } from './maps/aleph_bet.js';
import { insanityMaps } from './insanity_expansion.js';
import { chanukahMaps } from './chanukah_massive.js';
import { labyrinthMaps } from './labyrinth_67.js'; // NEW 67 FEATURES

import { parseAllMaps } from './map_parser.js';

// --- THE TOWER OF 1234 LOBBY ---
const towerHub = {
    'tower_lobby': {
        width: 15,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜ﶁ⬜1️⃣⬜2️⃣⬜3️⃣⬜4️⃣⬜ﶂ⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜ﶃ⬜⬜⬜⬜ﶄ⬜⬜⬜⬜ﶅ⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱ﶆ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜ﶇ🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', uu: '\ufd86', visual: '🚪', emoji: '🚪', x: 1, y: 6, targetMap: 'malkuth_village', targetX: 7, targetY: 6 },
            'start_climb': { type: 'door', uu: '\ufd84', visual: '🆙', emoji: '🆙', x: 7, y: 4, targetMap: 'tower_floor_1', targetX: 7, targetY: 7, dialogue: {start: ["You stand before the Infinite Loop. 1234 Floors. Good luck."]} },
            'feature_npc': { type: 'npc', uu: '\ufd81', visual: '🔢', emoji: '🔢', x: 2, y: 2, dialogue: {start: ["You wanted features? We have 1234 features upstairs. Go get them."]} },
            'feature_npc_east': { type: 'npc', uu: '\ufd82', visual: '🔢', emoji: '🔢', x: 12, y: 2, dialogue: {start: ["Every feature has a name now. Even the mirror sign is unique."]} },
            'glitch_west': { type: 'npc', uu: '\ufd83', visual: '👾', emoji: '👾', x: 2, y: 4, dialogue: {start: ["A glitch admits it used to steal identities."]} },
            'glitch_east': { type: 'npc', uu: '\ufd85', visual: '👾', emoji: '👾', x: 12, y: 4, dialogue: {start: ["The second glitch is now named separately."]} },
            'east_exit': { type: 'door', uu: '\ufd87', visual: '🚪', emoji: '🚪', x: 13, y: 6, targetMap: 'malkuth_village', targetX: 7, targetY: 6 },
            'feature_npc_east': { type: 'npc', uu: '\ufd82', visual: '🔢', emoji: '🔢', x: 12, y: 2, dialogue: {start: ["Every feature has a name now. Even the mirror sign is unique."]} },
            'glitch_west': { type: 'npc', uu: '\ufd83', visual: '👾', emoji: '👾', x: 2, y: 4, dialogue: {start: ["A glitch admits it used to steal identities."]} },
            'glitch_east': { type: 'npc', uu: '\ufd85', visual: '👾', emoji: '👾', x: 12, y: 4, dialogue: {start: ["The second glitch is now named separately."]} },
            'east_exit': { type: 'door', uu: '\ufd87', visual: '🚪', emoji: '🚪', x: 13, y: 6, targetMap: 'malkuth_village', targetX: 7, targetY: 6 }
        }
    }
};

// Combine
const allMaps = {
    ...malkuthMainMaps,
    ...malkuthInteriorMaps,
    ...netzachWildsMaps,
    ...hodAcademyMaps,
    ...cavernMaps,
    ...sefirotMaps,
    ...gevurahMaps,
    ...chesedMaps,
    ...binahMaps,
    ...qliphothMaps,
    ...keterMaps,
    ...chanukahCaveMaps,
    ...chanukahCitadelMaps,
    ...sechirutMaps,
    ...maamarHub,
    ...matbeaMaps,
    ...tviaMaps,
    ...dibburMaps,
    ...ratzonMaps,
    ...tanyaHubMaps,
    ...tanyaKelipahMaps,
    ...tanyaKedushahMaps,
    ...tribesHubMaps,
    ...judahCampMaps,
    ...danCampMaps,
    ...crownHeightsMaps,
    ...binahGatesMaps,
    ...sevenSeventyMaps,
    ...ganEdenMaps,
    ...gehinnomMaps,
    ...expansionMaps,
    ...midbarMaps,
    ...kotelMaps,
    ...babelMaps,
    ...expansion2Maps,
    ...taryagMaps,
    ...alephBetMaps,
    ...towerHub, 
    ...insanityMaps,
    ...chanukahMaps,
    ...labyrinthMaps // INJECT 67 MAPS
};

// Export Parsed
export const maps = parseAllMaps(allMaps);
