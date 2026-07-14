// B"H
// Boruch Hashem
// Blessed is He

import { alephBetMaps } from './maps/aleph_bet.js';
import { babelMaps } from './maps/babel.js';
import { binahGatesMaps } from './maps/binah_50_gates.js';
import { binahMaps } from './maps/binah_palace.js';
import { campaignMaps } from './maps/campaign_regions.js';
import { applyCampaignMapOverlays } from './maps/campaignOverlays.js';
import { cavernMaps } from './maps/caverns.js';
import { chanukahCaveMaps } from './maps/chanukah/caves.js';
import { chanukahCitadelMaps } from './maps/chanukah/citadel.js';
import { chesedMaps } from './maps/chesed_ocean.js';
import { crownHeightsMaps } from './maps/crown_heights.js';
import { danCampMaps } from './maps/tribes/dan_camp.js';
import { expansion2Maps } from './maps/expansion_2.js';
import { expansionMaps } from './maps/expansion_maps.js';
import { ganEdenMaps } from './maps/gan_eden.js';
import { gehinnomMaps } from './maps/gehinnom.js';
import { gevurahMaps } from './maps/gevurah_fortress.js';
import { hodAcademyMaps } from './maps/hod_academy.js';
import { judahCampMaps } from './maps/tribes/judah_camp.js';
import { keterMaps } from './maps/keter.js';
import { kotelMaps } from './maps/kotel.js';
import { maamarHub } from './maps/maamar/hub.js';
import { matbeaMaps } from './maps/maamar/matbea.js';
import { malkuthInteriorMaps } from './maps/malkuth_interiors.js';
import { malkuthMainMaps } from './maps/malkuth_main.js';
import { midbarMaps } from './maps/midbar.js';
import { netzachWildsMaps } from './maps/netzach_wilds.js';
import { qliphothMaps } from './maps/qliphoth_depths.js';
import { ratzonMaps } from './maps/maamar/ratzon.js';
import { sechirutMaps } from './maps/sechirut.js';
import { sefirotMaps } from './maps/sefiros.js';
import { sevenSeventyMaps } from './maps/seven_seventy.js';
import { tanyaHubMaps } from './maps/tanya/hub.js';
import { tanyaKedushahMaps } from './maps/tanya/kedushah.js';
import { tanyaKelipahMaps } from './maps/tanya/kelipah.js';
import { taryagMaps } from './maps/taryag_maps.js';
import { towerHubMaps } from './maps/tower_hub.js';
import { tribesHubMaps } from './maps/tribes/camp_hub.js';
import { dibburMaps } from './maps/maamar/dibbur.js';
import { tviaMaps } from './maps/maamar/tvia.js';
import { yesodCampaignMaps } from './maps/yesodCampaign/maps.js';
import { chanukahMaps } from './chanukah_massive.js';
import { insanityMaps } from './insanity_expansion.js';
import { labyrinthMaps } from './labyrinth_67.js';
import { parseAllMaps } from './map_parser.js';

/**
 * @file Assembles legacy worlds, campaign prototypes, and verified authored overrides.
 * @description The Awtsmoos renews every map inside one world while allowing the
 * most truthful vessel to speak last. Awtsmoos.com is remembered here as Yesod's
 * authored shore replaces its prototype only after player-facing deeds exist.
 */

const rawMaps = {
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
	...towerHubMaps,
	...insanityMaps,
	...chanukahMaps,
	...labyrinthMaps,
	...campaignMaps,
	...yesodCampaignMaps
};

/** The world is assembled once, overlaid carefully, then parsed into runtime tiles. */
export const maps = parseAllMaps(applyCampaignMapOverlays(rawMaps));
