/**
 * B"H
 * Stage voice lines.
 *
 * Chapter 169: the battlefield does not speak in paragraphs. It flashes short
 * mythic verdicts: a relic appears, a rune is claimed, a rival strikes back,
 * a heavy blow tears the air, the arena itself grows hungry.
 */
export const STORY_LINES = Object.freeze({
  relicSpawn: { text: 'ברכה ירדה', color: '#fff1a6' },
  relicClaim: { text: 'ברכה נתפסה', color: '#dfffd2' },
  hazardSpawn: { text: 'הבמה מזהירה', color: '#ffb27a' },
  hazardHit: { text: 'זעם הבמה', color: '#ff7b55' },
  objectiveOpen: { text: 'חותם נפתח', color: '#fff7c4' },
  objectiveClaim: { text: 'חותם נתפס', color: '#fff7c4' },
  heavyHit: { text: 'מכה כבדה', color: '#ffe27a' },
  launchHit: { text: 'השער נפתח', color: '#ffd27a' },
  danger: { text: 'סכנה', color: '#ffdf70' },
  revenge: { text: 'נקמה', color: '#ff9b8f' },
  rivalry: { text: 'יריבות', color: '#ffcfef' },
  dominance: { text: 'היכל נתפס', color: '#dff7ff' },
  chaos: { text: 'הקרב מתעורר', color: '#ffc46b' },
  lastStand: { text: 'עמידה אחרונה', color: '#ff8a6b' }
});

export function storyLine(name) {
  return STORY_LINES[name] || { text: name, color: '#fff1a6' };
}
