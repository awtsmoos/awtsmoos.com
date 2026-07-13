// B"H
// Boruch Hashem
// Blessed is He

import { buildChapter, objective as o } from './questFactory.js';

const entries = [
	{ title: 'The Singer Returns to Malkuth', summary: 'After the world is restored, the Ragged Cantor finally sings the melody’s opening.', giverId: 'ragged_cantor', objectives: [o('speak_npc', 'ragged_cantor', 1, 'Meet the Cantor in Malkuth'), o('collect_item', 'malkuth_melody_fragment', 1, 'Receive the first melody fragment')] },
	{ title: 'Nine Notes Across the World', summary: 'Every region preserved one note through the Erasure.', giverId: 'ragged_cantor', objectives: [o('collect_item', 'regional_melody_fragment', 9, 'Recover 9 melody fragments'), o('visit_order', 'cantor_region_route', 9, 'Visit all major regions')] },
	{ title: 'The Lake Hears the Whole Song', summary: 'Mirror Lake reflects a bridge that appears only to a completed melody.', giverId: 'tamar', objectives: [o('reach_map', 'mirror_lake', 1, 'Return to Mirror Lake'), o('activate_sequence', 'cantor_melody', 9, 'Play all 9 fragments'), o('discover_landmark', 'sound_bridge', 1, 'Reveal the sound bridge')] },
	{ title: 'A Bridge Made of Listening', summary: 'The bridge holds only while the Scribe answers each note with attention.', giverId: 'ragged_cantor', objectives: [o('timed_traversal', 'sound_bridge', 7, 'Cross 7 sounding spans'), o('battle_condition', 'no_damaging_moves', 1, 'Answer the bridge without damaging moves'), o('reach_map', 'orchard_before_names', 1, 'Reach the hidden orchard')] },
	{ title: 'The Orchard Before Names', summary: 'Here concepts lived before words divided them into separate species.', giverId: 'tamar', objectives: [o('discover_landmark', 'primordial_grove', 6, 'Discover 6 primordial groves'), o('research_species', 'primordial_musag', 9, 'Record 9 primordial Musagim'), o('collect_item', 'unnamed_seed', 3, 'Gather 3 Unnamed Seeds')] },
	{ title: 'Three First Forms', summary: 'Three primordial Musagim test whether the Scribe can preserve distinction without possession.', giverId: 'ragged_cantor', objectives: [o('resolve_boss', 'primordial_letter', 1, 'Defeat or elevate the First Letter'), o('resolve_boss', 'primordial_melody', 1, 'Defeat or elevate the First Melody'), o('resolve_boss', 'primordial_garden', 1, 'Defeat or elevate the First Garden')] },
	{ title: 'Silence Before Song', summary: 'The superboss is not absence but the possibility from which relationship begins.', giverId: 'ragged_cantor', objectives: [o('survive_phase', 'silence_before_song', 4, 'Survive 4 silence phases'), o('use_distinct_musag', 'regional_choir', 9, 'Use Musagim from 9 regions'), o('defeat_boss', 'silence_before_song', 1, 'Overcome Silence Before Song')] },
	{ title: 'The Melody Chooses a Home', summary: 'The Cantor completes the song without ending its capacity to change.', giverId: 'ragged_cantor', objectives: [o('recruit_musag', 'first_song', 1, 'Befriend the First Song'), o('dialogue_choice', 'cantor_ending', 1, 'Choose where the melody will live'), o('unlock_scene', 'unwritten_margins_ending', 1, 'Witness the new ending scene')], mapChanges: [{ mapId: 'orchard_before_names', changeId: 'first_song_awake' }] }
];

export const postgameCampaignQuests = buildChapter('postgame', 81, entries, 'campaign_keter_08');
