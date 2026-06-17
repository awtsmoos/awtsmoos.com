// B"H
/** Dialogue beat compiler for movie scenes. */
export function dialogueBeats(dialogues = [], cutscene = {}) {
  const byId = new Map(dialogues.map(d => [d.id, d]));
  return (cutscene.shots || []).filter(s => s.dialogue).map((shot, i) => { const d = byId.get(shot.dialogue) || { lines:[String(shot.dialogue)] }; return { beat:i + 1, shotId:shot.id || null, speaker:d.speaker || shot.target || "narrator", lines:d.lines || [] }; });
}
