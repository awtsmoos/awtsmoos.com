// B"H
// js/data/quests/shlichus_campaigns.js

/**
 * Chapter 3: Shlichus is the playable proof that Torah belongs below. Each quest
 * is hand-authored, data-driven, and built to alter travel, dialogue, inventory,
 * and the player's understanding of the maamarim from Adar to Sivan.
 */
export const shlichusCampaignQuests = {
    'shlichus_hidden_letters_1': {
        id: 'shlichus_hidden_letters_1',
        name: 'Adar: Letters Behind the Mask',
        desc: 'Reveal which villagers are real guides and which are shadows of Amalekian doubt. Identity must be proven by inner glyph, not outer costume.',
        status: 'available',
        maamarId: 'adar_hidden_inversion',
        objectives: [
            { id: 'speak_pathfinder', text: 'Speak with the village pathfinder about named roads.', completed: false, target: { type: 'interact', entityId: 'village_pathfinder' } },
            { id: 'resolve_reuven', text: 'Hear Reuven at the ox dispute and accept that justice begins with exact identity.', completed: false, target: { type: 'interact', entityId: 'reuven' } },
            { id: 'collect_hidden_letter', text: 'Find a concealed letter in the repaired village route.', completed: false, target: { type: 'acquire', itemId: 'hidden_adar_letter' } }
        ],
        rewards: { xp: 650, flags: ['adar_identity_awakened'] }
    },
    'shlichus_road_of_exodus_1': {
        id: 'shlichus_road_of_exodus_1',
        name: 'Nissan: Open the Road from Narrowness',
        desc: 'Turn Mitzrayim from a wall into a road by escorting sparks from Malkuth through Yesod toward Gevurah.',
        status: 'locked',
        maamarId: 'nissan_liberation_motion',
        objectives: [
            { id: 'open_yesod_gate', text: 'Pass from Malkuth to Yesod through the named eastern gate.', completed: false, target: { type: 'travel', mapId: 'yesod_shore' } },
            { id: 'defeat_reflection', text: 'Overcome the doppelganger that argues you are only a reflection.', completed: false, target: { type: 'defeat', musagId: 'doppelganger', count: 1 } },
            { id: 'reach_gevurah', text: 'Carry the liberated spark to the entrance of Gevurah.', completed: false, target: { type: 'travel', mapId: 'gevurah_entrance' } }
        ],
        rewards: { xp: 1200, flags: ['nissan_road_opened'] }
    },
    'shlichus_omer_circuit_1': {
        id: 'shlichus_omer_circuit_1',
        name: 'Iyar: The Counted Circuit',
        desc: 'Repair one road for each middah so that emotion becomes a vessel instead of a storm.',
        status: 'locked',
        maamarId: 'iyar_counting_refinement',
        objectives: [
            { id: 'repair_hod', text: 'Repair the Hod Academy link so intellect no longer steals dialogue from the wrong door.', completed: false, target: { type: 'travel', mapId: 'hod_library' } },
            { id: 'repair_gevurah', text: 'Pass the four Gevurah guards, each with a distinct purpose.', completed: false, target: { type: 'travel', mapId: 'gevurah_sanctum' } },
            { id: 'repair_chesed', text: 'Reach Chesed Springs and hear how severity becomes kindness.', completed: false, target: { type: 'travel', mapId: 'chesed_springs' } }
        ],
        rewards: { xp: 1800, flags: ['iyar_middos_circuit_opened'] }
    },
    'shlichus_body_answer_1': {
        id: 'shlichus_body_answer_1',
        name: 'Sivan I: The Angels Object',
        desc: 'Ascend to the debate chamber and hear the claim: Torah is too hidden and precious for flesh and blood.',
        status: 'locked',
        maamarId: 'shavuos_5721_body_answer',
        objectives: [
            { id: 'enter_debate', text: 'Reach Tiferet and open the road toward Binah.', completed: false, target: { type: 'travel', mapId: 'tiferet_garden' } },
            { id: 'hear_angels', text: 'Hear the angelic argument: תנה הודך על השמים.', completed: false, target: { type: 'flag', flag: 'heard_angel_argument' } },
            { id: 'prepare_answer', text: 'Collect embodied proofs from Egypt, yetzer hara, and daily action.', completed: false, target: { type: 'collect', itemId: 'embodied_proof', count: 3 } }
        ],
        rewards: { xp: 2200, flags: ['sivan_debate_opened'] }
    },
    'shlichus_body_answer_2': {
        id: 'shlichus_body_answer_2',
        name: 'Sivan II: Did You Descend to Egypt?',
        desc: 'Prove that the Torah must enter constriction by repairing districts that angels can only observe from above.',
        status: 'locked',
        maamarId: 'shavuos_5721_body_answer',
        objectives: [
            { id: 'heal_body_market', text: 'Feed, clothe, and stabilize the people of Malkuth.', completed: false, target: { type: 'flag', flag: 'malkuth_body_repaired' } },
            { id: 'subdue_heat', text: 'Transform Gevurah fire into disciplined service.', completed: false, target: { type: 'flag', flag: 'gevurah_fire_sanctified' } },
            { id: 'return_answer', text: 'Return to the angelic court with proof from embodied action.', completed: false, target: { type: 'flag', flag: 'returned_body_answer' } }
        ],
        rewards: { xp: 2800, flags: ['egypt_answer_proven'] }
    },
    'shlichus_body_answer_3': {
        id: 'shlichus_body_answer_3',
        name: 'Sivan III: Build from the Lowest Stone',
        desc: 'Raise the building from its lowest foundation: repair matter itself, not only mind or emotion.',
        status: 'locked',
        maamarId: 'shavuos_5721_body_answer',
        objectives: [
            { id: 'collect_stones', text: 'Gather stones from dangerous roads for the Mishkan foundation.', completed: false, target: { type: 'collect', itemId: 'foundation_stone', count: 12 } },
            { id: 'sanctify_tools', text: 'Sanctify tools in Hod so construction follows wisdom.', completed: false, target: { type: 'flag', flag: 'tools_sanctified_in_hod' } },
            { id: 'raise_foundation', text: 'Build the first permanent foundation stone.', completed: false, target: { type: 'flag', flag: 'lowest_stone_raised' } }
        ],
        rewards: { xp: 3600, flags: ['mishkan_foundation_started'] }
    },
    'shlichus_body_answer_4': {
        id: 'shlichus_body_answer_4',
        name: 'Sivan IV: Naaseh Before Nishma',
        desc: 'Win the angelic debate by performing the deed before demanding complete comprehension.',
        status: 'locked',
        maamarId: 'shavuos_5721_body_answer',
        objectives: [
            { id: 'do_before_understand', text: 'Complete three acts of shlichus before unlocking their explanations.', completed: false, target: { type: 'flag', flag: 'naaseh_proven' } },
            { id: 'receive_crowns', text: 'Receive the two crowns from the now-helping angels.', completed: false, target: { type: 'acquire', itemId: 'crown_naaseh_nishma', count: 1 } },
            { id: 'open_dirah_arc', text: 'Unlock the Dirah Betachtonim endgame arc.', completed: false, target: { type: 'flag', flag: 'dirah_arc_open' } }
        ],
        rewards: { xp: 5000, flags: ['angels_conceded', 'dirah_betachtonim_arc_unlocked'] }
    }
};
