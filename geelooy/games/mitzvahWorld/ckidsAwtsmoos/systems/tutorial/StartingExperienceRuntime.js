// B"H
/** @file StartingExperienceRuntime.js @description Advances the first-shliach tutorial by event ids. */
import TutorialStepRegistry from "./TutorialStepRegistry.js";
import { emitTutorialHint } from "./TutorialHintRuntime.js";
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
export function ensureTutorial(olam) { const p = playerOf(olam); if (!p) return null; p.tutorialState ||= { index: 0, completed: {} }; return p.tutorialState; }
export function currentTutorialStep(olam) { const s = ensureTutorial(olam); return TutorialStepRegistry[s?.index || 0] || null; }
export function startTutorial(olam) { return emitTutorialHint(olam, currentTutorialStep(olam)); }
export function advanceTutorial(olam, eventId) { const s = ensureTutorial(olam), step = currentTutorialStep(olam); if (!s || !step || step.id !== eventId) return false; s.completed[eventId] = Date.now(); s.index += 1; return emitTutorialHint(olam, currentTutorialStep(olam)); }
export default { ensureTutorial, currentTutorialStep, startTutorial, advanceTutorial };
