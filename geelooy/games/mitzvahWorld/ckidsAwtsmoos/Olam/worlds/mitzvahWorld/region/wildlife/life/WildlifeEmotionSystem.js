// B"H
/** @file WildlifeEmotionSystem.js @description Calm, alert, afraid, aggressive, hungry, injured moods. */
import { dataOf } from './LifeMath.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
export function emotionFor(actor, needs, perception) { const data = dataOf(actor), h = data.health || {}; let mood = 'calm'; if (h.dead) mood = 'dead'; else if (h.current !== undefined && h.max && h.current / h.max < .3) mood = 'injured'; else if (perception.nearestThreat || needs.fear > .6) mood = 'afraid'; else if (data.species === 'fox' && perception.nearestPrey && needs.hunger > .35) mood = 'aggressive'; else if (needs.hunger > .72) mood = 'hungry'; else if (perception.visible.length > 3) mood = 'alert'; data.emotion = mood; return mood; }
export function emotionDecision(actor) { const mood = dataOf(actor).emotion; if (mood === 'injured') return { state:'limp' }; if (mood === 'afraid') return { state:'flee' }; if (mood === 'hungry') return { state:'forage' }; return null; }
export function emotionSummary(actors = []) { const byMood = {}; actors.forEach(a => { const mood = dataOf(a).emotion || 'unknown'; byMood[mood] = (byMood[mood] || 0) + 1; }); return { moods:byMood }; }
