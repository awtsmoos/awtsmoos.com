// B"H
import { routeCameraBeat } from "./CutsceneCameraRouter.js";
import { routeDialogueBeat } from "./CutsceneDialogueRouter.js";
import { routeAnimationBeat } from "./CutsceneAnimationRouter.js";
import { routeAudioBeat } from "./CutsceneAudioRouter.js";
import { routeLightingBeat } from "./CutsceneLightingRouter.js";
import { routeControlBeat } from "./CutsceneControlRouter.js";
import { routeConsequenceBeat } from "./CutsceneConsequenceRouter.js";

export function routeCutsceneBeat(beat = {}) {
  const key = beat.track || beat.kind;
  if (key === "camera") return routeCameraBeat(beat);
  if (key === "dialogue" || key === "subtitles" || key === "subtitle") return routeDialogueBeat(beat);
  if (key === "animation" || key === "actor") return routeAnimationBeat(beat);
  if (key === "audio") return routeAudioBeat(beat);
  if (key === "lighting") return routeLightingBeat(beat);
  if (key === "control" || key === "hud") return routeControlBeat(beat);
  if (key === "consequence" || key === "quest" || key === "flag") return routeConsequenceBeat(beat);
  return null;
}

export function routeCutsceneBeats(beats = []) {
  return beats.map(routeCutsceneBeat).filter(Boolean);
}

export default routeCutsceneBeats;
