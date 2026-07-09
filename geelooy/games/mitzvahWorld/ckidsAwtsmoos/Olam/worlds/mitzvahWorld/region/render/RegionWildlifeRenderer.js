// B"H
/** RegionWildlifeRenderer.js — first herd now exists immediately; remainder streams. */
import { ensureRenderBackend } from "../../../../../rendering/RendererProvider.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { createWildlifeLifeRuntime } from "../wildlife/life/WildlifeLifeRuntime.js?compact=true&v=perf-tight-collision-20260703-bh3";
import { allAnimalsFromReport, animalsFromReport, guardianWildlifeCadence } from "./RegionWildlifeData.js?compact=true&v=lod-house-octree-20260705-bh1";
import { makeActor } from "./RegionWildlifeActors.js?compact=true&v=mobile-crisp-passive-herd-lod-20260705-bh2";
import { tickWildlife } from "./RegionWildlifeMotion.js?compact=true&v=animal-visual-lod-20260705-bh1";
import { installWildlifeTicker, registerForProof } from "./RegionWildlifeProof.js?compact=true&v=mitzvah-aggressive-split-20260703-bh1";
import { sealWildlifeRoot } from "./wildlifeRenderer/WildlifeRootStats.js?compact=true&v=animal-visual-lod-20260705-bh1";
import { scheduleRemainder } from "./wildlifeRenderer/WildlifeStream.js?compact=true&v=mitzvah-aggressive-split-20260703-bh1";
import { updateAnimalLodRuntime } from "./wildlife/AnimalLodRuntime.js?compact=true&v=mobile-crisp-passive-herd-lod-20260705-bh2";

function addActor(root, olam, backend, animal, index) {
  const actor = makeActor(animal, index, olam, backend);
  root.add(actor);
  return actor;
}

export function buildWildlifeRenderer(olam, report = {}) {
  const backend = ensureRenderBackend();
  const root = backend.group("living_region_single_mesh_wildlife_runtime");
  const first = animalsFromReport(report);
  const all = allAnimalsFromReport(report);
  first.forEach((animal, index) => addActor(root, olam, backend, animal, index));
  root.userData.lifeRuntime = createWildlifeLifeRuntime(root, olam, report);
  root.userData.tick = delta => {
    tickWildlife(root, olam, delta);
    root.__lodAcc = (root.__lodAcc || 0) + (Number(delta) || 1 / 60);
    if (root.__lodAcc > .22) {
      root.__lodAcc = 0;
      updateAnimalLodRuntime(root, olam, 18);
    }
  };
  root.userData.firstPlayableCount = first.length;
  root.userData.guardianWildlifeCadence = guardianWildlifeCadence();
  root.userData.singleMeshAnimals = true;
  root.userData.maxMeshesPerAnimal = 1;
  sealWildlifeRoot(root, backend);
  registerForProof(root, olam);
  scheduleRemainder({ root, olam, backend, all, addActor, sealRoot:sealWildlifeRoot, registerForProof });
  return root;
}

export { installWildlifeTicker };
export default buildWildlifeRenderer;
