// B"H
import { createAnimalGenome, genomeRealismScore } from "./AnimalGenome.js";

const part = (name, shape, scale, offset = [0, 0, 0], tags = []) => ({ name, shape, scale, offset, tags });

export function generateAnimalAnatomy(species = "fox", options = {}) {
  const genome = options.genome || createAnimalGenome(species, options);
  const a = genome.archetype;
  const s = genome.variation.size;
  const sections = [
    part("chest", "ellipsoid", [1.1 * s, .7 * s, .85 * s], [0, .8 * s, 0], ["body"]),
    part("belly", "ellipsoid", [1.25 * s, .62 * s, .9 * s], [-.2 * s, .68 * s, 0], ["body"]),
    part("head", a.muzzle === "wide" ? "wide-skull" : "skull", [.58 * s, .48 * s, .48 * s], [.95 * s, 1.1 * s, 0], ["head"]),
    part("snout", a.muzzle || "snout", [.42 * s, .22 * s, .22 * s], [1.42 * s, 1.04 * s, 0], ["snout", "nostrils", "mouth-jaw"]),
    part("leftEye", "wet-eye", [.07 * s, .07 * s, .04 * s], [1.18 * s, 1.2 * s, .25 * s], ["eye", "eyelid"]),
    part("rightEye", "wet-eye", [.07 * s, .07 * s, .04 * s], [1.18 * s, 1.2 * s, -.25 * s], ["eye", "eyelid"])
  ];
  if (a.ears) sections.push(part("leftEar", a.ears, [.14 * s, .36 * s * genome.variation.earScale, .08 * s], [.78 * s, 1.48 * s, .28 * s], ["ear"]), part("rightEar", a.ears, [.14 * s, .36 * s * genome.variation.earScale, .08 * s], [.78 * s, 1.48 * s, -.28 * s], ["ear"]));
  if (a.tail) sections.push(part("tail", a.tail, [.72 * s * genome.variation.tailScale, .2 * s, .2 * s], [-1.05 * s, .78 * s, 0], ["tail"]));
  if (a.horns || a.antlers) sections.push(part("leftHorn", a.antlers ? "branching-antler" : "curved-horn", [.08 * s, .46 * s, .08 * s], [.72 * s, 1.5 * s, .2 * s], ["horn-antler"]), part("rightHorn", a.antlers ? "branching-antler" : "curved-horn", [.08 * s, .46 * s, .08 * s], [.72 * s, 1.5 * s, -.2 * s], ["horn-antler"]));
  if (a.beak) sections.push(part("beak", "beak", [.24 * s, .11 * s, .12 * s], [1.48 * s, 1.08 * s, 0], ["beak"]));
  if (a.comb) sections.push(part("comb", "serrated-comb", [.18 * s, .25 * s, .04 * s], [.92 * s, 1.42 * s, 0], ["comb"]));
  if (a.wings) sections.push(part("leftWing", "layered-wing", [.45 * s, .12 * s, .34 * s], [.05 * s, .82 * s, .52 * s], ["wing", "feathers"]), part("rightWing", "layered-wing", [.45 * s, .12 * s, .34 * s], [.05 * s, .82 * s, -.52 * s], ["wing", "feathers"]));
  for (const side of [-1, 1]) for (const x of [-.55, .55]) {
    sections.push(part(`leg_${x}_${side}`, a.legs || "leg", [.13 * s, .62 * s * genome.variation.legLength, .13 * s], [x * s, .25 * s, side * .38 * s], ["leg", "knee", "ankle", a.hooves ? "hoof" : a.paws ? "paw-claw" : "foot"]));
    if (a.webbed) sections.push(part(`webbedFoot_${x}_${side}`, "webbed-foot", [.22 * s, .04 * s, .16 * s], [(x + .05) * s, .04 * s, side * .42 * s], ["webbed", "foot", "toe"]));
  }
  if (a.eyes === "raised") sections.push(part("raisedEyeRidgeLeft", "raised-eye-ridge", [.12 * s, .08 * s, .06 * s], [1.08 * s, 1.3 * s, .22 * s], ["eye", "eyelid"]), part("raisedEyeRidgeRight", "raised-eye-ridge", [.12 * s, .08 * s, .06 * s], [1.08 * s, 1.3 * s, -.22 * s], ["eye", "eyelid"]));
  if (a.skin) sections.push(part("mottledSkinMarks", "mottled-skin-markings", [.75 * s, .03 * s, .48 * s], [-.08 * s, 1.05 * s, 0], ["marking", "skin"]));
  if (a.beard) sections.push(part("beard", "fur-tuft", [.22 * s, .3 * s, .16 * s], [1.05 * s, .75 * s, 0], ["beard", "fur-tuft"]));
  if (a.mane) sections.push(part("mane", "hair-ridge", [.62 * s, .28 * s, .14 * s], [.25 * s, 1.35 * s, 0], ["mane"]));
  if (a.bristles) sections.push(part("bristles", "coarse-ridge", [.9 * s, .18 * s, .08 * s], [-.05 * s, 1.22 * s, 0], ["bristles"]));
  if (a.wool) sections.push(part("woolLayer", "clustered-fleece", [1.35 * s, .78 * s, .98 * s], [-.1 * s, .82 * s, 0], ["fur-tuft", "wool"]));
  return {
    genome,
    sections,
    collisionProxy:{ radius:.72 * s, height:1.45 * s },
    selectableProxy:{ radius:.9 * s, height:1.65 * s },
    hitboxProxy:{ radius:.8 * s, height:1.35 * s },
    corpseProxy:{ radius:1.0 * s, height:.35 * s },
    distinctSilhouette:sections.length >= 11 && genomeRealismScore(genome) >= 5,
    noBlobAnimal:sections.length >= 10
  };
}

export default { generateAnimalAnatomy };
