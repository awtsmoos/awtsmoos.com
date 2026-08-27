// B"H

/**
 * @file DialogueAudioEngine.js
 * @description
 * Builds the spoken and sonic nefesh of a twenty-minute episode: voice cues,
 * mouth-shape budgets, foley, music beds, and timing anchors for nonstop output.
 */
export class DialogueAudioEngine {
  static build(plan) {
    return {
      voices: this.voices(plan.characters),
      cues: plan.screenplay.flatMap((page) => this.pageCues(page)),
      musicBeds: this.musicBeds(plan.acts),
      foley: this.foley(plan.shots)
    };
  }

  static voices(characters) {
    return characters.map((character, index) => ({
      character: character.name,
      voiceId: `original_voice_${index + 1}`,
      mouthShapes: 12,
      emotionalRange: ['deadpan', 'panic', 'smug', 'sincere']
    }));
  }

  static pageCues(page) {
    return page.dialogue.map((line, index) => ({
      id: `${page.id}_cue_${index + 1}`,
      shotId: page.shotId,
      time: page.time + index * 4200,
      speaker: line.speaker,
      line: line.line,
      phonemePass: 'queued',
      reactionHoldMs: 700
    }));
  }

  static musicBeds(acts) {
    return acts.map((act) => ({ id: `music_${act.name.replaceAll(' ', '_').toLowerCase()}`, start: act.start, duration: act.duration, mood: 'satirical orchestral pulse' }));
  }

  static foley(shots) {
    return shots.map((shot, index) => ({ id: `foley_${shot.id}`, start: shot.start, duration: shot.duration, pack: index % 5 === 0 ? 'fur_cloth_prop_detail' : 'cartoon_body_prop' }));
  }
}
