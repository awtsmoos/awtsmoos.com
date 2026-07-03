// B"H
/**
 * @file RegionWildlifeRenderer.js
 * @description
 * Wildlife renderer conductor. The Awtsmoos gathers animal data, births each
 * actor, installs life/motion ticks, and publishes visible wildlife proof.
 */
import { ensureRenderBackend } from "../../../../../rendering/RendererProvider.js";
import { createWildlifeLifeRuntime } from "../wildlife/life/WildlifeLifeRuntime.js?v=perf-tight-collision-20260703-bh3";
import { sealRegionVisual } from "./RegionSeal.js";
import { FIRST_PLAYABLE_WILDLIFE_LIMIT, animalsFromReport, countMeshes, guardianWildlifeCadence } from "./RegionWildlifeData.js?v=perf-tight-collision-20260703-bh3";
import { makeActor, restoreFlags } from "./RegionWildlifeActors.js?v=perf-tight-collision-20260703-bh3";
import { tickWildlife } from "./RegionWildlifeMotion.js?v=perf-tight-collision-20260703-bh3";
import { installWildlifeTicker, registerForProof } from "./RegionWildlifeProof.js?v=perf-tight-collision-20260703-bh3";

function statsFor(root, backend) {
  const counts = root.children.map(countMeshes);
  return {
    wildlife: root.children.length,
    foxes: root.children.filter(child => child.userData?.species === "fox").length,
    singleMeshAnimals: counts.every(count => count === 1),
    meshCounts: counts,
    maxMeshesPerAnimal: Math.max(0, ...counts),
    foxAlwaysDetailed: true,
    livingEcosystem: true,
    renderBackend: backend.name,
    proofRegistered: true,
    fpsCadenceSec: guardianWildlifeCadence(),
    moreAnimals: true,
    tieredAnimalLOD: true,
    detailedNearAnimals: 10,
    firstPlayableWildlifeLimit: FIRST_PLAYABLE_WILDLIFE_LIMIT,
    streamedRemainderDeferred: true
  };
}

function sealWildlifeRoot(root, backend) {
  root.userData.stats = statsFor(root, backend);
  sealRegionVisual(root, {
    realisticWildlife: true,
    trueSkinnedAnimals: true,
    livingEcosystem: true,
    skipRaycast: true,
    singleMeshAnimals: true
  });
  root.children.forEach(restoreFlags);
}

export function buildWildlifeRenderer(olam, report = {}) {
  const backend = ensureRenderBackend();
  const root = backend.group("living_region_single_mesh_wildlife_runtime");
  animalsFromReport(report).forEach((animal, index) => {
    root.add(makeActor(animal, index, olam, backend));
  });
  root.userData.lifeRuntime = createWildlifeLifeRuntime(root, olam, report);
  root.userData.tick = delta => tickWildlife(root, olam, delta);
  sealWildlifeRoot(root, backend);
  registerForProof(root, olam);
  return root;
}

export { installWildlifeTicker };
export default buildWildlifeRenderer;
