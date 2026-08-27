// B"H
import { DialogueBeatCompiler } from '../../director/dialogue/DialogueBeatCompiler.js';

/**
 * A simple risky scene: one manuscript, one spill, one tense discovery.
 * The Awtsmoos hides the treasure in a small table moment, not complexity.
 */
export class GoalBoardBeatCompiler {
  static build(beats = []) {
    return DialogueBeatCompiler.compile(beats.map(beat => ({ autoShot: true, mode: 'subtitle', ...beat })));
  }

  static normalize(beats = []) {
    return beats.map(beat => ({ autoShot: true, mode: 'subtitle', ...beat }));
  }

  static defaultBeats() {
    return [
      this.beat(200, 1700, 'group', ['rabbi_left', 'rabbi_right', 'table_book', 'sealed_manuscript'], 'rabbi_left', 'rabbi_right', 'The study is quiet, but the sealed manuscript sits too close to the tea.', 'watchful', 'open_hand', 'pullOut'),
      this.beat(1850, 3300, 'dialogue', ['rabbi_left', 'rabbi_right', 'sealed_manuscript'], 'rabbi_right', 'rabbi_left', 'Rebbe, the edge of the cup is wet. If it falls, the writing may be lost.', 'worried', 'point'),
      this.beat(3450, 5000, 'reaction', ['rabbi_left'], 'rabbi_left', 'rabbi_right', 'Then we do not panic. We look closely before the page drinks the spill.', 'focused', 'calm_stop', 'pushIn'),
      this.insertManuscriptRisk(),
      this.beat(7000, 8500, 'reaction', ['rabbi_right'], 'rabbi_right', 'rabbi_left', 'The student freezes: the seal is dry, but the mark beside it is empty.', 'alarmed', 'touch_chest'),
      this.beat(8650, 10100, 'overTheShoulder', ['rabbi_left', 'rabbi_right', 'empty_manuscript_mark'], 'rabbi_left', 'rabbi_right', 'The missing place is the clue. It was moved before the cup spilled.', 'thinking', 'showBook'),
      this.beat(10250, 11800, 'dialogue', ['rabbi_left', 'rabbi_right'], 'rabbi_right', 'rabbi_left', 'So the danger was not the tea. The danger was that we stopped watching.', 'curious', 'open_explain'),
      this.insertHiddenShelf(),
      this.beat(13650, 15300, 'reaction', ['rabbi_left'], 'rabbi_left', 'rabbi_right', 'There. Behind the small shelf. The manuscript was hidden from the draft.', 'relieved', 'point'),
      this.beat(15450, 17200, 'dialogue', ['rabbi_left', 'rabbi_right', 'sealed_manuscript'], 'rabbi_right', 'rabbi_left', 'A small fright, a clear lesson: protect the source before explaining it.', 'relieved', 'soft_nod'),
      this.beat(17350, 19600, 'group', ['rabbi_left', 'rabbi_right', 'table_book', 'sealed_manuscript', 'spilled_tea'], 'rabbi_left', 'rabbi_right', 'The room breathes again. The story was risky, but simple enough to read.', 'warm', 'bless', 'pullOut')
    ];
  }

  static beat(start, end, shotIntent, targets, speaker, listener, text, emotion, gesture, movementIntent) {
    return { start, end, shotIntent, targets, speaker, listener, text, emotion, gesture, movementIntent };
  }

  static insertManuscriptRisk() {
    return {
      ...this.beat(5150, 6850, 'objectInsert', ['sealed_manuscript', 'spilled_tea', 'tea_cup_right'], 'rabbi_right', 'rabbi_left', 'Insert: the manuscript, the tea, the tiny danger between them.', 'tense', 'present'),
      prop: {
        id: 'sealed_manuscript',
        propType: 'box',
        action: 'hop',
        from: { x: 34, y: -112 },
        to: { x: 24, y: -116 },
        height: 5,
        size: 30,
        color: '#f2d184'
      }
    };
  }

  static insertHiddenShelf() {
    return {
      ...this.beat(11950, 13500, 'objectInsert', ['table_book', 'sealed_manuscript'], 'rabbi_left', 'rabbi_right', 'Insert: the hidden shelf gives back what fear almost stole.', 'discovering', 'point'),
      prop: {
        id: 'table_book',
        propType: 'book',
        action: 'hop',
        from: { x: -18, y: -104 },
        to: { x: -8, y: -110 },
        height: 7,
        size: 40,
        color: '#1c2c4a'
      }
    };
  }
}
