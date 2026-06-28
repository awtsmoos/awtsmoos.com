// B"H
/** Protects safe THREE abstraction seams already migrated to ThreeAdapter. */
import fs from 'node:fs';
const guarded = [
  'ckidsAwtsmoos/Olam/properties/CameraProperties.js',
  'ckidsAwtsmoos/Olam/properties/SceneProperties.js',
  'ckidsAwtsmoos/Olam/properties/PhysicsProperties.js',
  'ckidsAwtsmoos/Olam/properties/InputProperties.js',
  'ckidsAwtsmoos/Olam/properties/MiscProperties.js',
  'ckidsAwtsmoos/Olam/properties/StateProperties.js',
  'ckidsAwtsmoos/Olam/methods/lighting/sunRig.js',
  'ckidsAwtsmoos/Olam/methods/lighting/hemisphereRig.js',
  'ckidsAwtsmoos/Olam/methods/lighting/fogRig.js',
  'ckidsAwtsmoos/Olam/methods/lighting/emeraldLightingProfile.js',
  'ckidsAwtsmoos/Olam/core/OlamVessel.js',
  'ckidsAwtsmoos/Olam/camera/index.js',
  'ckidsAwtsmoos/Olam/camera/methods/calculatePosition.js',
  'ckidsAwtsmoos/Olam/camera/methods/update/HeightCalculator.js',
  'ckidsAwtsmoos/Olam/camera/methods/update/distance.js',
  'ckidsAwtsmoos/Olam/camera/methods/update/index.js',
  'ckidsAwtsmoos/Olam/camera/methods/update/rotation.js'
];
const failures = [];
for (const file of guarded) {
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('/games/scripts/build/three.module.js') || /import\s+\*\s+as\s+THREE/.test(text)) failures.push(file);
  if (!text.includes('ThreeAdapter.js')) failures.push(`${file}:missing-adapter`);
}
if (!fs.readFileSync('ckidsAwtsmoos/Olam/rendering/ThreeAdapter.js', 'utf8').includes('/games/scripts/build/three.module.js')) failures.push('ThreeAdapter missing raw bridge');
const result = { ok:failures.length === 0, guarded:guarded.length, failures };
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
