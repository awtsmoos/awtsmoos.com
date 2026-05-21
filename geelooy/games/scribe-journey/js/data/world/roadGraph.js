// B"H
// js/data/world/roadGraph.js

/**
 * Chapter 4: The roads are not filler between cities. They are the dangerous
 * ligaments of the world. Every road opens by a master Rabbi's debate and carries
 * its own hazards, lessons, and shlichus work.
 */
export const ROAD_GRAPH = {
    road_malkuth_yesod: { from: 'malkuth_village', to: 'yesod_shore', requiredDebate: 'debate_malkuth_identity', danger: 3, loadMode: 'dynamic_on_walk', theme: 'identity before reflection' },
    road_yesod_netzach: { from: 'yesod_shore', to: 'netzach_wilds_entrance', requiredDebate: 'debate_yesod_truth', danger: 8, loadMode: 'dynamic_on_walk', theme: 'truth tested by endurance' },
    road_netzach_hod: { from: 'netzach_wilds_entrance', to: 'hod_library', requiredDebate: 'debate_netzach_persistence', danger: 12, loadMode: 'dynamic_on_walk', theme: 'victory becomes structured learning' },
    road_hod_gevurah: { from: 'hod_library', to: 'gevurah_entrance', requiredDebate: 'debate_hod_structure', danger: 18, loadMode: 'dynamic_on_walk', theme: 'logic entering fire' },
    road_gevurah_chesed: { from: 'gevurah_entrance', to: 'chesed_springs', requiredDebate: 'debate_gevurah_fire', danger: 24, loadMode: 'dynamic_on_walk', theme: 'severity sweetened into kindness' },
    road_chesed_binah: { from: 'chesed_springs', to: 'binah_entrance', requiredDebate: 'debate_chesed_vessel', danger: 30, loadMode: 'dynamic_on_walk', theme: 'kindness requires form' },
    road_binah_keter: { from: 'binah_entrance', to: 'keter_heights', requiredDebate: 'debate_binah_form', danger: 36, loadMode: 'dynamic_on_walk', theme: 'understanding bows to crown' },
    road_keter_770: { from: 'keter_heights', to: '770_main_hall', requiredDebate: 'debate_keter_will', danger: 42, loadMode: 'dynamic_on_walk', theme: 'will becomes mission' },
    road_770_kotel: { from: '770_main_hall', to: 'kotel_plaza', requiredDebate: 'debate_770_mission', danger: 48, loadMode: 'dynamic_on_walk', theme: 'mission returns to prayer' },
    road_kotel_midbar: { from: 'kotel_plaza', to: 'midbar_entrance', requiredDebate: 'debate_kotel_memory', danger: 54, loadMode: 'dynamic_on_walk', theme: 'memory crosses wilderness' },
    road_midbar_ganeden: { from: 'midbar_entrance', to: 'gan_eden_gate', requiredDebate: 'debate_midbar_wandering', danger: 60, loadMode: 'dynamic_on_walk', theme: 'wandering becomes delight' },
    road_ganeden_dirah: { from: 'gan_eden_gate', to: '770_main_hall', requiredDebate: 'debate_ganeden_delight', danger: 70, loadMode: 'dynamic_on_walk', theme: 'hidden delight returns to dirah betachtonim' }
};

export const WORLD_MAP = {
    title: 'Scribe Journey World Map',
    startCity: 'malkuth_village',
    victoryHorizon: 'road_ganeden_dirah',
    cityOrder: [
        'malkuth_village', 'yesod_shore', 'netzach_wilds_entrance', 'hod_library',
        'gevurah_entrance', 'chesed_springs', 'binah_entrance', 'keter_heights',
        '770_main_hall', 'kotel_plaza', 'midbar_entrance', 'gan_eden_gate'
    ],
    roads: Object.keys(ROAD_GRAPH),
    instruction: 'Open this map to see your current city, the next Master Rabbi debate, and which dangerous road is locked or open.'
};
