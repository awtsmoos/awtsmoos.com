// B"H
/** Absolute minimum visual proof: one renderer, one camera, one blue cube. */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export function startBlueCubeTest(back) {
  const host = document.getElementById("ikar") || document.body;
  host.replaceChildren(); document.querySelectorAll(".awts-test-panel").forEach(n => n.remove());
  const panel = document.createElement("div"); panel.className = "awts-test-panel";
  panel.innerHTML = `<div class="awts-test-title">One Rotating Blue Cube</div><div class="awts-test-controls"></div>`;
  const btn = document.createElement("button"); btn.textContent = "← Main Menu"; btn.onclick = () => { dispose(); back?.(); };
  panel.querySelector(".awts-test-controls").append(btn); document.body.append(panel);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x071324);
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 50); camera.position.z = 4;
  const renderer = new THREE.WebGLRenderer({ antialias:true }); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.setSize(innerWidth, innerHeight); host.append(renderer.domElement);
  const cube = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), new THREE.MeshBasicMaterial({ color:0x1266ff })); scene.add(cube);
  let alive = true; const resize = () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); }; addEventListener("resize", resize);
  window.__AWTS_BLUE_CUBE_TEST__ = { ready:true, canvases:document.querySelectorAll("canvas").length, at:Date.now(), seal:"minimal-blue-cube-20260708-bh1" };
  function dispose() { alive = false; removeEventListener("resize", resize); panel.remove(); renderer.dispose(); host.replaceChildren(); }
  function loop() { if (!alive) return; cube.rotation.x += 0.01; cube.rotation.y += 0.015; renderer.render(scene, camera); requestAnimationFrame(loop); }
  loop();
}
