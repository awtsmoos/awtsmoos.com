// B"H
import { DialogueBeatCompiler } from '../../../../../director/dialogue/DialogueBeatCompiler.js';

const beat = (start, end, shotIntent, targets, speaker, listener, text, emotion, gesture, movementIntent = 'hold', expression = '') => ({
  start, end, shotIntent, targets, speaker, listener, text, emotion, gesture, movementIntent,
  expression, autoShot: true, mode: 'subtitle', weatherCue: true
});
const propBeat = (start, end, id, propType, action, from, to, text) => ({
  ...beat(start, end, 'objectInsert', [id, 'storm_lantern'], 'storm_lantern_maker', 'kite_cartographer', text, 'wonder', 'protect_spark', 'pushIn', 'spark_discovery'),
  prop: { id, propType, action, from, to, height: 8, size: id === 'blue_storm_core' ? 18 : 34, color: id === 'blue_storm_core' ? '#9ee8ff' : '#ffd978' }
});

export class OutdoorBeats {
  static defaultBeats() {
    return [
      beat(180, 1550, 'wideShot', ['storm_lantern_maker','storm_lantern'], 'storm_lantern_maker', 'kite_cartographer', 'The lamp can light a room. Tonight it has to answer the whole storm.', 'calculating_fear', 'shield_lantern', 'pullOut', 'calculating_fear'),
      propBeat(1700, 2850, 'storm_lantern', 'sparkle', 'flicker', { x:-76,y:-116 }, { x:-74,y:-121 }, 'Rain taps the glass until the little flame hides.'),
      beat(3050, 4300, 'reaction', ['storm_lantern_maker'], 'storm_lantern_maker', 'quiet_lamp_child', 'I promised them light. I brought them a whisper.', 'hurt_resolve', 'small_lamp_hug', 'pushIn', 'hurt_resolve'),
      beat(4500, 5850, 'profileShot', ['kite_cartographer'], 'kite_cartographer', 'storm_lantern_maker', 'A whisper survives because it listens before it shines.', 'soft_warning', 'read_the_wind', 'hold', 'soft_warning'),
      beat(6120, 7600, 'lowAngle', ['goat_sidekick','wrong_cord'], 'goat_sidekick', 'storm_lantern_maker', 'Mossbell chews the wrong cord with the confidence of a hero.', 'heroic_misread', 'chew_wrong_cord', 'pushIn', 'heroic_misread'),
      beat(7820, 9100, 'reaction', ['festival_captain','soaked_schedule_board'], 'festival_captain', 'kite_cartographer', 'The schedule says clear skies, and paper is never wrong on purpose.', 'private_panic', 'protect_schedule', 'hold', 'private_panic'),
      beat(9350, 10800, 'reaction', ['quiet_lamp_child','paper_child_lamp'], 'quiet_lamp_child', 'storm_lantern_maker', 'The child says nothing. The empty paper lamp says everything.', 'hope_rising', 'offer_lamp', 'pushIn', 'hope_rising'),
      propBeat(11050, 12350, 'blue_storm_core', 'ball', 'hop', { x:-74,y:-121 }, { x:-50,y:-133 }, 'The blue core jumps toward the bell, the map, the child, the circle.'),
      beat(12500, 14100, 'overheadShot', ['storm_lantern_maker','kite_cartographer','goat_sidekick','quiet_lamp_child'], 'kite_cartographer', 'festival_captain', 'Hands make a small roof. Courage becomes weatherproof.', 'proud_restraint', 'circle_shelter', 'pullOut', 'proud_restraint'),
      beat(14300, 15800, 'objectInsert', ['wet_plaza_puddle_big','lantern_gold_bloom'], 'storm_lantern_maker', 'quiet_lamp_child', 'First the puddle lights. Then the lantern remembers the sky.', 'spark_discovery', 'delighted_point', 'pushIn', 'spark_discovery'),
      beat(16000, 17650, 'wideShot', ['storm_lantern_maker','kite_cartographer','goat_sidekick','festival_captain','quiet_lamp_child'], 'festival_captain', 'storm_lantern_maker', 'Proceeding exactly as accidentally planned.', 'accidental_grace', 'lower_board', 'pullOut', 'accidental_grace'),
      beat(17800, 19100, 'wideShot', ['storm_lantern','paper_child_lamp','lantern_gold_bloom'], 'quiet_lamp_child', 'storm_lantern_maker', 'The rain does not stop. It starts glowing.', 'shared_light', 'offer_lamp', 'pullOut', 'shared_light')
    ];
  }
  static build(beats = this.defaultBeats()) { return DialogueBeatCompiler.compile(beats); }
}
