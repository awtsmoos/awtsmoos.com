// B"H

const cam = (id, type, at, zoom, y, extra = {}) => ({
  id, name: id.replaceAll('_', ' '), type, at, x: 0, y, zoom,
  transition: at === 0 ? 'cut' : 'ease', duration: 260, weatherAware: true, ...extra
});

export const OUTDOOR_CAMERAS = [
  cam('opening_cliff_plaza_wide', 'establishingShot', 0, .64, 112, { targetMode: 'multi', targetActors: ['storm_lantern_maker','kite_cartographer','festival_captain'] }),
  cam('rain_on_lantern_insert', 'objectInsert', 1650, 1.82, 132, { targetMode: 'prop', targetProp: 'storm_lantern', renderDetailMode: 'closeup' }),
  cam('maker_face_thunder_close', 'reactionShot', 3100, 2.12, 128, { targetMode: 'actor', targetActors: ['storm_lantern_maker'], renderDetailMode: 'closeup' }),
  cam('mentor_weather_profile', 'profileShot', 4850, 1.28, 126, { targetMode: 'actor', targetActors: ['kite_cartographer'] }),
  cam('goat_low_comedy_pop', 'lowAngle', 6500, 1.58, 148, { targetMode: 'actor', targetActors: ['goat_sidekick'] }),
  cam('captain_schedule_panic', 'reactionShot', 8050, 1.94, 130, { targetMode: 'actor', targetActors: ['festival_captain'], renderDetailMode: 'closeup' }),
  cam('child_lantern_silent_close', 'reactionShot', 9800, 2.02, 134, { targetMode: 'actor', targetActors: ['quiet_lamp_child'], renderDetailMode: 'closeup' }),
  cam('circle_of_hands_overhead', 'overheadShot', 12100, 1.08, 104, { targetMode: 'multi', targetActors: ['storm_lantern_maker','kite_cartographer','goat_sidekick','quiet_lamp_child'] }),
  cam('puddle_light_reveal', 'objectInsert', 14400, 1.7, 150, { targetMode: 'prop', targetProp: 'wet_plaza_puddle_big', renderDetailMode: 'closeup' }),
  cam('final_rain_glow_wide', 'wideShot', 16400, .7, 110, { targetMode: 'multi', targetActors: ['storm_lantern_maker','kite_cartographer','goat_sidekick','festival_captain','quiet_lamp_child'] })
];

export const OUTDOOR_SHOT_FLOW = OUTDOOR_CAMERAS.map(({ at, type, id }) => ({ at, name: type, purpose: id.replaceAll('_', ' ') }));
