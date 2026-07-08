// B"H
import { routeCameraBeat } from "./CutsceneCameraRouter.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { routeDialogueBeat } from "./CutsceneDialogueRouter.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { routeAnimationBeat } from "./CutsceneAnimationRouter.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { routeAudioBeat } from "./CutsceneAudioRouter.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { routeLightingBeat } from "./CutsceneLightingRouter.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { routeControlBeat } from "./CutsceneControlRouter.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { routeConsequenceBeat } from "./CutsceneConsequenceRouter.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";

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
