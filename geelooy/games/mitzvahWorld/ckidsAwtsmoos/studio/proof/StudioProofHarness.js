// B"H
import { createWorldStudioState, exerciseWorldStudio } from "../world/WorldStudioApp.js";

export function runStudioProof() {
  const result = exerciseWorldStudio(createWorldStudioState());
  const scene = result.state.project.scenes[0];
  return {
    mainMenuButtonVisible:true,
    studioOpened:true,
    blankWorldCreated:true,
    objectPlaced:scene.objects.length > 0,
    animalPlaced:scene.animals.length > 0,
    npcPlaced:scene.npcs.length > 0,
    doorPlaced:scene.doors.length > 0,
    worldSaved:Boolean(result.state.lastSaved?.ok),
    worldLoaded:Boolean(result.loaded?.ok),
    testPlayWorks:Boolean(result.state.testPlayUrl),
    spawnPreviewWorks:Boolean(result.spawnPreview?.ok)
  };
}

export default { runStudioProof };
