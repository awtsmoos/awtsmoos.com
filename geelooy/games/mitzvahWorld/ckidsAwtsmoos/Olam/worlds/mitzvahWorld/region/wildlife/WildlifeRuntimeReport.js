// B"H
/**
 * @file WildlifeRuntimeReport.js
 * @description
 * The meadow must prove its creatures are attached and visible. The Awtsmoos
 * records species counts without letting warnings erase living motion.
 */
function scopeOf(olam) {
  return olam?.aysh?.window || globalThis;
}

function speciesOf(animal) {
  return animal?.userData?.species || animal?.userData?.motion?.species || "unknown";
}

function meshCount(root) {
  let count = 0;
  root?.traverse?.(child => {
    if (child?.isMesh || child?.isSkinnedMesh || child?.isInstancedMesh) count += 1;
  });
  return count;
}

function visibleMeshCount(root) {
  let count = 0;
  root?.traverse?.(child => {
    if ((child?.isMesh || child?.isSkinnedMesh || child?.isInstancedMesh) && child.visible !== false) count += 1;
  });
  return count;
}

function addSpecies(counts, species) {
  counts[species] = (counts[species] || 0) + 1;
}

export function buildWildlifeRuntimeReport(root, olam) {
  const animals = root?.children || [];
  const bySpecies = {};
  animals.forEach(animal => addSpecies(bySpecies, speciesOf(animal)));
  const rows = animals.map(animal => ({
    id: animal.userData?.motion?.id || animal.name,
    name: animal.name,
    species: speciesOf(animal),
    visible: animal.visible !== false,
    meshes: meshCount(animal),
    visibleMeshes: visibleMeshCount(animal),
    x: Number(animal.position?.x || 0),
    z: Number(animal.position?.z || 0)
  }));

  return {
    seal: "B'H WILDLIFE_VISIBLE_REPORT",
    animalCount: animals.length,
    visibleAnimalCount: rows.filter(row => row.visible && row.visibleMeshes > 0).length,
    meshCount: rows.reduce((sum, row) => sum + row.meshes, 0),
    visibleMeshCount: rows.reduce((sum, row) => sum + row.visibleMeshes, 0),
    bySpecies,
    sample: rows.slice(0, 18),
    at: Date.now(),
    olamName: olam?.name || "mitzvahWorld"
  };
}

export function publishWildlifeRuntimeReport(root, olam) {
  const report = buildWildlifeRuntimeReport(root, olam);
  root.userData.visibleWildlifeReport = report;
  const scope = scopeOf(olam);
  scope.__MITZVAH_WILDLIFE_VISIBLE_REPORT__ = report;
  scope.__MITZVAH_WILDLIFE_ROOT__ = root;
  console.log("B\"H WILDLIFE_VISIBLE_REPORT", report);
  return report;
}

export default publishWildlifeRuntimeReport;
