// B"H
/** Isolated chossid.glb animation laboratory with raw clip buttons. */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { GLTFLoader } from "/games/scripts/jsm/loaders/GLTFLoader.js?compact=true&v=main-menu-tests-20260708-bh1";
import { makeSceneShell } from "./TestSceneShell.js?compact=true&v=main-menu-tests-20260708-bh1";
const GLB = "https://models-3122d.web.app/chossid.glb";
function fit(root) { const box = new THREE.Box3().setFromObject(root), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3()); root.position.sub(center); root.position.y += size.y / 2; root.scale.setScalar(2.6 / Math.max(.001, size.y)); root.updateMatrixWorld(true); }
export function startChossidAnimationTest(back) {
  const shell = makeSceneShell({ title:"Chossid.glb Animation Test", back:() => { shell.dispose(); back(); } });
  const { scene, controls, camera } = shell;
  camera.position.set(0, 2.1, 5.2); camera.lookAt(0, 1.25, 0);
  const status = document.createElement("span"); status.className = "awts-test-readout"; status.textContent = "loading chossid.glb..."; controls.append(status);
  const speed = document.createElement("input"); speed.type = "range"; speed.min = "0"; speed.max = "2"; speed.step = "0.05"; speed.value = "1"; controls.append(speed);
  let mixer = null, root = null, active = null, activeName = "none";
  const play = clip => { active?.fadeOut?.(.12); active = mixer.clipAction(clip); active.reset().setEffectiveTimeScale(Number(speed.value)).setEffectiveWeight(1).fadeIn(.12).play(); activeName = clip.name; status.textContent = `playing: ${clip.name} @ ${speed.value}x`; };
  speed.oninput = () => { if (active) active.timeScale = Number(speed.value); status.textContent = `playing: ${activeName} @ ${speed.value}x`; };
  new GLTFLoader().load(GLB, gltf => { root = gltf.scene; fit(root); scene.add(root); mixer = new THREE.AnimationMixer(root); const clips = gltf.animations || []; status.textContent = `loaded ${clips.length} clips`; clips.forEach(clip => { const b = document.createElement("button"); b.textContent = `${clip.name} (${clip.duration.toFixed(2)}s)`; b.onclick = () => play(clip); controls.append(b); }); if (clips[0]) play(clips[0]); window.__AWTS_CHOSSID_ANIM_TEST__ = { clipNames:clips.map(c => c.name), ready:true, at:Date.now() }; }, undefined, error => { status.textContent = `ERROR: ${error?.message || error}`; });
  const floor = new THREE.Mesh(new THREE.CircleGeometry(2.2, 64), new THREE.MeshStandardMaterial({ color:0x1b6f31 }));
  floor.rotation.x = -Math.PI / 2; scene.add(floor);
  shell.loop(dt => { mixer?.update(dt); if (root) root.rotation.y += dt * .15; });
}
