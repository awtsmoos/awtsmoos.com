// B"H
/** Shared renderer shell for isolated menu test scenes. */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export function makeSceneShell({ title = "Test Scene", back }) {
  const host = document.getElementById("ikar") || document.body;
  host.replaceChildren();
  const panel = document.createElement("div");
  panel.className = "awts-test-panel";
  panel.innerHTML = `<div class="awts-test-title">${title}</div><div class="awts-test-controls"></div>`;
  const backBtn = document.createElement("button");
  backBtn.textContent = "← Main Menu";
  backBtn.onclick = () => back?.();
  panel.querySelector(".awts-test-controls").append(backBtn);
  document.body.append(panel);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9fd8ee);
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 500);
  camera.position.set(7, 5, 8);
  camera.lookAt(0, 0, 0);
  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.append(renderer.domElement);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x426b35, 1.8);
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(4, 9, 6);
  scene.add(hemi, sun);
  let running = true;
  const clock = new THREE.Clock();
  const listeners = [];
  function on(type, fn) { addEventListener(type, fn); listeners.push([type, fn]); }
  on("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
  function dispose() { running = false; listeners.forEach(([t, f]) => removeEventListener(t, f)); panel.remove(); renderer.dispose(); host.replaceChildren(); }
  function loop(step = () => {}) { if (!running) return; requestAnimationFrame(() => loop(step)); const dt = Math.min(0.05, clock.getDelta()); step(dt); renderer.render(scene, camera); }
  return { THREE, scene, camera, renderer, panel, controls:panel.querySelector(".awts-test-controls"), dispose, loop };
}
