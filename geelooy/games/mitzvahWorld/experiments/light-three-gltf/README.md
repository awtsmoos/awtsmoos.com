B"H

Isolated experiment only. This is not imported by the live game.

Goal: measure whether a tiny local runtime can cover the subset of THREE/GLTF
needed by Mitzvah World props/NPCs without importing full three.module.js and
GLTFLoader.js. The live game must keep using the stable gateway until this proves:

1. loads a real `.glb`,
2. creates enough Object3D/Mesh/Material/Texture shape for current code,
3. handles animation data or clearly refuses it,
4. renders a test scene,
5. stays under a measured byte budget.
