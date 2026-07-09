// B"H

/**
 * @file ScreenplayEngine.js
 * @description
 * Converts long-form episode blocks into playable screenplay pages: dialogue,
 * action, cutaways, continuity tags, and production intent.
 */
export class ScreenplayEngine {
  static compile(plan) {
    return plan.shots.map((shot, index) => ({
      id: `page_${String(index + 1).padStart(2, '0')}`,
      shotId: shot.id,
      time: shot.start,
      heading: `${shot.act.toUpperCase()} / ${shot.sequence.toUpperCase()}`,
      action: this.action(shot, index),
      dialogue: this.dialogue(index, plan.characters),
      transition: index % 8 === 7 ? 'ACT BREAK SMASH CUT' : 'CUT TO',
      continuity: plan.continuity[index % plan.continuity.length]
    }));
  }

  static action(shot, index) {
    const verbs = ['reveals', 'compresses', 'stretches', 'interrupts', 'explodes'];
    return `The scene ${verbs[index % verbs.length]} ${shot.description}. ${shot.furDetail}`;
  }

  static dialogue(index, characters) {
    const a = characters[index % characters.length].name;
    const b = characters[(index + 2) % characters.length].name;
    return [
      { speaker: a, line: `This is block ${index + 1}, and somehow the problem is still getting bigger.` },
      { speaker: b, line: 'Good. That means the episode has not run out of engine.' }
    ];
  }
}
