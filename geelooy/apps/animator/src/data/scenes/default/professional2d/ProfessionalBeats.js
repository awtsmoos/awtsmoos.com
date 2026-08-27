// B"H
import { DialogueBeatCompiler } from '../../../../director/dialogue/DialogueBeatCompiler.js';

const beat = (start, end, shotIntent, targets, speaker, listener, text, emotion, gesture, movementIntent = 'hold') => ({
  start, end, shotIntent, targets, speaker, listener, text, emotion, gesture, movementIntent,
  autoShot: true, mode: 'subtitle'
});

const propBeat = (start, end, id, propType, action, from, to, text) => ({
  ...beat(start, end, 'objectInsert', [id, 'hero_lantern'], 'inventor_hero', 'elder_mentor', text, 'wonder', 'careful_reach', 'pushIn'),
  prop: { id, propType, action, from, to, height: 8, size: id === 'lantern_core' ? 18 : 30, color: id === 'lantern_core' ? '#76e4ff' : '#ffd95c' }
});

export class ProfessionalBeats {
  static defaultBeats() {
    return [
      beat(200, 1700, 'group', ['inventor_hero','elder_mentor','hero_lantern'], 'inventor_hero', 'elder_mentor', 'The lantern is ready, except for the part where it refuses to shine.', 'hopeful_worried', 'present_lantern', 'pullOut'),
      propBeat(1850, 3150, 'hero_lantern', 'sparkle', 'pulse', { x:-46,y:-116 }, { x:-42,y:-120 }, 'Insert: the little lamp coughs one shy spark and goes dark.'),
      beat(3300, 4850, 'reaction', ['inventor_hero'], 'inventor_hero', 'elder_mentor', 'I measured every gear twice. Maybe the light simply does not like me.', 'hurt_smile', 'small_shrug', 'pushIn'),
      beat(5000, 6550, 'twoShot', ['inventor_hero','elder_mentor'], 'elder_mentor', 'inventor_hero', 'Or maybe it is waiting for you to ask what it wants to show.', 'gentle_confidence', 'soft_explain'),
      beat(6700, 8150, 'lowAngle', ['tiny_sidekick','coil_wire'], 'tiny_sidekick', 'inventor_hero', 'Pip says nothing, bites the loose wire, and becomes extremely important.', 'overexcited', 'bounce_point'),
      beat(8300, 9900, 'reaction', ['pompous_mayor','mayor_scroll'], 'pompous_mayor', 'inventor_hero', 'The ceremony begins in one minute, and I am allergic to disappointment.', 'nervous_pride', 'tiny_disapproval'),
      propBeat(10050, 11650, 'lantern_core', 'ball', 'hop', { x:-44,y:-119 }, { x:-26,y:-132 }, 'Insert: the blue core jumps toward Pip like it found its missing laugh.'),
      beat(11800, 13350, 'mediumCloseUp', ['inventor_hero','tiny_sidekick'], 'inventor_hero', 'tiny_sidekick', 'You were not breaking it. You were completing the circuit.', 'discovering', 'delighted_point', 'pushIn'),
      beat(13500, 15100, 'group', ['inventor_hero','elder_mentor','tiny_sidekick','pompous_mayor'], 'elder_mentor', 'pompous_mayor', 'Some lights need craft. Some need courage. This one needed a friend.', 'warm', 'bless', 'pullOut'),
      beat(15250, 17250, 'wideShot', ['hero_lantern','magic_spark_1','magic_spark_2'], 'inventor_hero', 'elder_mentor', 'The plaza fills with warm light, and even the mayor pretends he planned it.', 'joy', 'laughing_relief', 'pullOut')
    ];
  }

  static build(beats = this.defaultBeats()) {
    return DialogueBeatCompiler.compile(beats);
  }
}
