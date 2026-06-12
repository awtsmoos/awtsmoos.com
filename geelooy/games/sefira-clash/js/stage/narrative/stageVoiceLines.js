/**
 * B"H
 * Stage voice lines.
 *
 * Chapter 96: the battlefield now names the plunge and the awakening after it:
 * skull-crush, stunned silence, then the blow that wakes thunder.
 */
export const STORY_LINES = Object.freeze({
  relicSpawn: { text: 'ברכה ירדה', color: '#fff1a6' },
  relicClaim: { text: 'ברכה נתפסה', color: '#dfffd2' },
  resourcePing: { text: 'כולם שומעים', color: '#c9f7ff' },
  clusterIgnite: { text: 'מוקד הקרב נדלק', color: '#ffd27a' },
  roleRunner: { text: 'רץ אל החותם', color: '#dfffd2' },
  roleHunter: { text: 'הצייד נכנס', color: '#ffcf7a' },
  diveCrush: { text: 'צלילה לראש!', color: '#7fffdc' },
  diveWake: { text: 'התעוררות במכה!', color: '#9ffff0' },
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

export function storyLine(name) { return STORY_LINES[name] || { text: name, color: '#fff1a6' }; }
