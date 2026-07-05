// B"H
/** RegionWildlifeRenderer.js — first herd now exists immediately; remainder streams. */
import { ensureRenderBackend } from "../../../../../rendering/RendererProvider.js";
import { createWildlifeLifeRuntime } from "../wildlife/life/WildlifeLifeRuntime.js?v=perf-tight-collision-20260703-bh3";
import { allAnimalsFromReport, animalsFromReport } from "./RegionWildlifeData.js?v=lod-house-octree-20260705-bh1";
import { makeActor } from "./RegionWildlifeActors.js?v=animal-visual-lod-20260705-bh1";
import { tickWildlife } from "./RegionWildlifeMotion.js?v=animal-visual-lod-20260705-bh1";
import { installWildlifeTicker, registerForProof } from "./RegionWildlifeProof.js?v=mitzvah-aggressive-split-20260703-bh1";
import { sealWildlifeRoot } from "./wildlifeRenderer/WildlifeRootStats.js?v=animal-visual-lod-20260705-bh1";
import { scheduleRemainder } from "./wildlifeRenderer/WildlifeStream.js?v=mitzvah-aggressive-split-20260703-bh1";
import { updateAnimalLodRuntime } from "./wildlife/AnimalLodRuntime.js?v=lod-house-octree-20260705-bh1";

function addActor(root, olam, backend, animal, index) {
  const actor = makeActor(animal, index, olam, backend);
  root.add(actor);
  return actor;
}

export function buildWildlifeRenderer(olam, report = {}) {
  const backend = ensureRenderBackend();
  const root = backend.group("living_region_multi_part_wildlife_runtime");
  const first = animalsFromReport(report);
  const all = allAnimalsFromReport(report);
  first.forEach((animal, index) => addActor(root, olam, backend, animal, index));
  root.userData.lifeRuntime = createWildlifeLifeRuntime(root, olam, report);
  root.userData.tick = delta => { tickWildlife(root, olam, delta); root.__lodAcc = (root.__lodAcc || 0) + (Number(delta) || 1 / 60); if (root.__lodAcc > .36) { root.__lodAcc = 0; updateAnimalLodRuntime(root, olam, 12); } };
  root.userData.firstPlayableCount = first.length;
  sealWildlifeRoot(root, backend);
  registerForProof(root, olam);
  scheduleRemainder({ root, olam, backend, all, addActor, sealRoot:sealWildlifeRoot, registerForProof });
  return root;
}

export { installWildlifeTicker };
export default buildWildlifeRenderer;
