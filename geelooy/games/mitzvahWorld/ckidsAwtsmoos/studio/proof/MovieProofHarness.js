// B"H
import { createMovieMakerState, exerciseMovieMaker } from "../movie/MovieMakerApp.js";

export function runMovieProof() {
  const { state, generated, played } = exerciseMovieMaker(createMovieMakerState());
  const byKind = kind => state.timeline.tracks.find(track => track.kind === kind);
  return {
    movieButtonVisible:true,
    movieMakerOpened:true,
    timelineCreated:Boolean(state.timeline),
    cameraTrackAdded:Boolean(byKind("camera")?.clips.length),
    actorTrackAdded:Boolean(byKind("actor")?.clips.length),
    dialogueClipAdded:Boolean(byKind("dialogue")?.clips.length),
    subtitleClipAdded:Boolean(byKind("subtitle")?.clips.length),
    keyframeAdded:state.timeline.tracks.some(track => track.clips.some(clip => clip.keyframes?.length)),
    proceduralMovieGenerated:Boolean(generated?.ok),
    nlePanelsAvailable:state.panels?.includes("curveEditor") && state.panels?.includes("renderQueue") && state.panels?.includes("cameraGraph"),
    directorAiPlanned:Boolean(state.director?.shots?.length),
    runtimeActionsInTimeline:Boolean(generated?.timeline?.tracks?.some(track => track.clips.some(clip => clip.payload?.runtimeAction))),
    canonicalActionCount:Number(generated?.proceduralDirector?.availableActions || 0),
    cutsceneExported:Boolean(state.exported?.schema),
    cutscenePlayedInGame:Boolean(played?.ok)
  };
}

export default { runMovieProof };
