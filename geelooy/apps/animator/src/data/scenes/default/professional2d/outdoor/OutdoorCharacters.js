// B"H
import { OUTDOOR_EXPRESSIONS } from './OutdoorExpressions.js';

const shared = { view: 'threeQuarter', locomotion: 'idle', motionMode: 'windAlive', gazeMode: 'stormSceneAware', renderDetailMode: 'closeup' };
const physics = (hair, cloth, extra) => ({ hair, cloth, tail: extra, ears: extra, scarf: cloth + .2, overlap: .68, rainDrag: .34 });
const actor = (id, name, x, scale, color, expressionKey, extra = {}) => ({
  ...shared, id, name, position: { x, y: 0, scale }, style: 'professional_2d_outdoor_appeal',
  expressionSet: OUTDOOR_EXPRESSIONS[id], expressionProfile: OUTDOOR_EXPRESSIONS[id][expressionKey],
  weatherReaction: 'wind_pushes_then_character_recovers', colors: color, ...extra
});

export const OUTDOOR_CHARACTERS = {
  storm_lantern_maker: actor('storm_lantern_maker', 'Nira of the Storm Lamp', -150, .86,
    { jacket: '#1f6f9b', hood: '#17445d', shirt: '#fff1bd', skin: '#cf9367', hair: '#43210f', lantern: '#ffc95a' }, 'calculating_fear',
    { archetype: 'young_inventor', emotion: 'brave_but_scared', gesture: 'shield_lantern', silhouetteShape: 'rain_hood_satchel_big_lamp_small_boots', physics: physics(.72, .66, .2) }),
  kite_cartographer: actor('kite_cartographer', 'Tovan the Wind Reader', 46, .96,
    { coat: '#4d3a67', scarf: '#e7a94b', shirt: '#f8e7c2', skin: '#b98261', hair: '#dfd4bd', map: '#d7b06a' }, 'weather_listening',
    { archetype: 'mentor_cartographer', emotion: 'calm_in_weather', gesture: 'read_the_wind', silhouetteShape: 'long_scarf_map_tube_leaning_hat', physics: physics(.18, .9, .1), flipX: true }),
  goat_sidekick: actor('goat_sidekick', 'Mossbell', -42, .48,
    { fur: '#f4f0dc', horn: '#b68b55', bell: '#ffd35b', leaf: '#65b85d', hoof: '#514035' }, 'chew_blank',
    { archetype: 'tiny_goat_sidekick', emotion: 'blankly_important', gesture: 'chew_wrong_cord', silhouetteShape: 'tiny_goat_square_pupils_bell_leaf', physics: physics(.12, .2, .82) }),
  festival_captain: actor('festival_captain', 'Captain Brindle', 168, .9,
    { coat: '#79374f', sash: '#f3ca5b', pants: '#20222d', skin: '#d29a72', hat: '#63273f', paper: '#ffe0a2' }, 'public_confidence',
    { archetype: 'comic_captain', emotion: 'official_panic', gesture: 'protect_schedule', silhouetteShape: 'tall_thin_soaked_hat_wide_board', physics: physics(.16, .58, .1), flipX: true }),
  quiet_lamp_child: actor('quiet_lamp_child', 'Eli With the Paper Lamp', 250, .62,
    { coat: '#285c49', scarf: '#f6cf7a', lamp: '#fff4bd', skin: '#c98863', hair: '#2d1a13', boots: '#2a2c34' }, 'watching',
    { archetype: 'silent_heart_witness', emotion: 'small_hope', gesture: 'hug_unlit_lamp', silhouetteShape: 'small_child_round_lamp_big_eyes', physics: physics(.34, .42, .12), flipX: true })
};
