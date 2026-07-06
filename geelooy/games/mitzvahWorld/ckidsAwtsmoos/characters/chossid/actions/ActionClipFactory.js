// B"H
export const CHOSSID_BONES = Object.freeze({
  hips:"mixamorig:Hips",
  spine:"mixamorig:Spine",
  spine1:"mixamorig:Spine1",
  spine2:"mixamorig:Spine2",
  neck:"mixamorig:Neck",
  head:"mixamorig:Head",
  leftShoulder:"mixamorig:LeftShoulder",
  leftArm:"mixamorig:LeftArm",
  leftForeArm:"mixamorig:LeftForeArm",
  leftHand:"mixamorig:LeftHand",
  rightShoulder:"mixamorig:RightShoulder",
  rightArm:"mixamorig:RightArm",
  rightForeArm:"mixamorig:RightForeArm",
  rightHand:"mixamorig:RightHand",
  leftUpLeg:"mixamorig:LeftUpLeg",
  leftLeg:"mixamorig:LeftLeg",
  leftFoot:"mixamorig:LeftFoot",
  leftToe:"mixamorig:LeftToeBase",
  rightUpLeg:"mixamorig:RightUpLeg",
  rightLeg:"mixamorig:RightLeg",
  rightFoot:"mixamorig:RightFoot",
  rightToe:"mixamorig:RightToeBase"
});

const E = 1e-6;
function quatFromEuler(THREE, euler) {
  const e = new THREE.Euler(euler[0] || 0, euler[1] || 0, euler[2] || 0, "XYZ");
  return new THREE.Quaternion().setFromEuler(e).toArray();
}

function trackName(bone, prop) { return `${bone}.${prop}`; }

export function resolveChossidBones(availableNames = []) {
  const available = new Set(availableNames);
  const resolved = {};
  for (const [key, name] of Object.entries(CHOSSID_BONES)) {
    resolved[key] = available.size === 0 || available.has(name) ? name : null;
  }
  return resolved;
}

export function makeRotationTrack(THREE, bone, keys) {
  const times = [];
  const values = [];
  for (const key of keys) {
    times.push(Math.max(0, Number(key.t || 0)));
    values.push(...quatFromEuler(THREE, key.r || [0, 0, 0]));
  }
  return new THREE.QuaternionKeyframeTrack(trackName(bone, "quaternion"), times, values);
}

export function makePositionTrack(THREE, bone, keys) {
  const times = [];
  const values = [];
  for (const key of keys) {
    times.push(Math.max(0, Number(key.t || 0)));
    values.push(...(key.p || [0, 0, 0]).map(value => Math.abs(value) < E ? 0 : value));
  }
  return new THREE.VectorKeyframeTrack(trackName(bone, "position"), times, values);
}

export function createChossidActionClip(THREE, spec, availableBoneNames = []) {
  if (!THREE?.AnimationClip) throw new Error("createChossidActionClip requires THREE.AnimationClip");
  const bones = resolveChossidBones(availableBoneNames);
  const tracks = [];
  for (const rotation of spec.rotations || []) {
    const bone = bones[rotation.bone] || rotation.bone;
    if (bone) tracks.push(makeRotationTrack(THREE, bone, rotation.keys));
  }
  for (const position of spec.positions || []) {
    const bone = bones[position.bone] || position.bone;
    if (bone) tracks.push(makePositionTrack(THREE, bone, position.keys));
  }
  return new THREE.AnimationClip(spec.name, spec.duration, tracks);
}

export function buildActionSpec(name, duration, rotations = [], positions = [], meta = {}) {
  return { name, duration, rotations, positions, meta:{ skeleton:"chossid.glb Armature mixamorig", ...meta } };
}

export default { CHOSSID_BONES, resolveChossidBones, createChossidActionClip, buildActionSpec };
