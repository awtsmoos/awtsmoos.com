// B"H
/** @file AnimalRigBlueprints.js @description Pure quadruped bone blueprints; no renderer imports. */
function n(v, f = 0) { return Number.isFinite(Number(v)) ? Number(v) : f; }
function add(list, id, parent, position, tags = []) { list.push({ id, parent, position, tags }); }
function legs(list, p, z, prefix, hind = false) {
  for (const side of [-1, 1]) {
    const s = side < 0 ? "l" : "r", root = `${prefix}_${s}`;
    add(list, `${root}_hip`, hind ? "pelvis" : "chest", [side * p.legs.stanceX, hind ? -.03 : .02, z], ["leg", root]);
    add(list, `${root}_upper`, `${root}_hip`, [0, -p.legs.length * .34, 0], ["leg", "upper"]);
    add(list, `${root}_knee`, `${root}_upper`, [0, -p.legs.length * .32, hind ? -.05 : .04], ["leg", "knee"]);
    add(list, `${root}_ankle`, `${root}_knee`, [0, -p.legs.length * .28, hind ? .06 : -.02], ["leg", "ankle"]);
    add(list, `${root}_paw`, `${root}_ankle`, [0, -p.legs.length * .1, .09], ["leg", "paw"]);
  }
}
function tail(list, p) { const len = n(p.tail && p.tail.length, 0); if (!len) return; let parent = "pelvis"; for (let i = 0; i < 6; i++) { const id = `tail_${i}`; add(list, id, parent, [0, .01, -len / 6], ["tail"]); parent = id; } }
function faceExtras(list, p) { add(list, "jaw", "head", [0, -.08, .1], ["jaw"]); add(list, "snout", "head", [0, -.02, p.body.snout[2] * .5], ["snout"]); if (p.ears && p.ears.height) { add(list, "ear_l", "head", [-p.body.head[0] * .35, p.ears.height * .5, -.02], ["ear"]); add(list, "ear_r", "head", [p.body.head[0] * .35, p.ears.height * .5, -.02], ["ear"]); } if (p.markings && p.markings.horns) { add(list, "horn_l", "head", [-.16, .22, -.06], ["horn"]); add(list, "horn_r", "head", [.16, .22, -.06], ["horn"]); } }
export function createAnimalRigBlueprint(species, profile) {
  const p = profile, bones = [], torsoZ = p.body.torso[2], h = p.height;
  add(bones, "root", null, [0, 0, 0], ["root"]); add(bones, "pelvis", "root", [0, h * .72, -torsoZ * .38], ["body"]);
  add(bones, "spine_0", "pelvis", [0, .02, torsoZ * .22], ["spine"]); add(bones, "spine_1", "spine_0", [0, .04, torsoZ * .26], ["spine"]);
  add(bones, "chest", "spine_1", [0, h * .08, torsoZ * .24], ["body"]); add(bones, "neck_0", "chest", [0, h * .18, torsoZ * .18], ["neck"]);
  add(bones, "neck_1", "neck_0", [0, h * .18, p.body.neck[2] * .7], ["neck"]); add(bones, "head", "neck_1", [0, h * .08, p.body.head[2] * .52], ["head"]);
  legs(bones, p, p.legs.stanceZ, "fore", false); if (species !== "bird") legs(bones, p, -p.legs.stanceZ, "hind", true); tail(bones, p); faceExtras(bones, p);
  return { species, root:"root", bones };
}
export default createAnimalRigBlueprint;
