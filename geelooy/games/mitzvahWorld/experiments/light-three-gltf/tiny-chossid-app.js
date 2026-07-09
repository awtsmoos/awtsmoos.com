// B"H
import { Scene, PerspectiveCamera } from './tiny-runtime.js';
import { TinyWebGLRenderer } from './tiny-webgl-renderer.js';
import { loadTinyGltf } from './tiny-gltf-loader.js';
import { TinyAnimationPlayer } from './tiny-animation.js';
import { setMeshKindVisibility } from './tiny-skin-system.js';
import { TinyOrbitControls } from './tiny-orbit-controls.js';
import { fillAnimationSelect, mountAnimationButtons } from './tiny-animation-buttons.js';
import { wireHud } from './tiny-viewer-hud.js';

/**
 * Chossid viewer bootstrap.
 *
 * This is intentionally only orchestration. The Awtsmoos in the code is that
 * every specialized action lives in a small module, while this file conducts
 * the canvas, model, controls, animation buttons, and helper primitive toggles.
 */
const src = new URLSearchParams(location.search).get('src') ||
  'https://models-3122d.web.app/chossid.glb';

const canvas = document.getElementById('c');
const scene = new Scene();
const camera = new PerspectiveCamera(39, innerWidth / innerHeight, 0.1, 500);
const renderer = new TinyWebGLRenderer({ canvas });
const controls = new TinyOrbitControls(canvas, camera, {
  target: [0, 0.45, 4.25],
  distance: 5.6,
  theta: Math.PI,
  phi: 1.47,
  minDistance: 2.4,
  maxDistance: 10,
});

let model = null;
let player = null;
let hud = null;
let loadStats = null;
let last = performance.now();
let lastHud = 0;
let showSkinned = true;
let showRigid = true;
let clipUi = null;

function resize() {
  renderer.setSize(innerWidth * devicePixelRatio, innerHeight * devicePixelRatio);
  camera.aspect = innerWidth / innerHeight;
}

function paintNow(message = 'B"H custom WebGL chossid runtime live') {
  hud?.paint(true, message);
}

function applyMeshVisibility() {
  if (model) {
    setMeshKindVisibility(model, { skinned: showSkinned, rigid: showRigid });
  }
  paintNow();
}

function setButtonText(id, onText, offText, state) {
  const button = document.getElementById(id);
  if (button) button.textContent = state ? onText : offText;
}

function wireMeshToggles() {
  document.getElementById('skinBtn').onclick = () => {
    showSkinned = !showSkinned;
    applyMeshVisibility();
    setButtonText('skinBtn', 'hide skinned', 'show skinned', showSkinned);
  };

  document.getElementById('rigidBtn').onclick = () => {
    showRigid = !showRigid;
    applyMeshVisibility();
    setButtonText('rigidBtn', 'hide rigid', 'show rigid', showRigid);
  };
}

function wireRenderPolicyToggles() {
  document.getElementById('helperLinesBtn').onclick = () => {
    renderer.options.showHelperLines = !renderer.options.showHelperLines;
    setButtonText('helperLinesBtn', 'hide helper lines', 'show helper lines', renderer.options.showHelperLines);
    paintNow();
  };

  document.getElementById('helperPointsBtn').onclick = () => {
    renderer.options.showHelperPoints = !renderer.options.showHelperPoints;
    setButtonText('helperPointsBtn', 'hide helper points', 'show helper points', renderer.options.showHelperPoints);
    paintNow();
  };
}

function wireAnimationControls() {
  document.getElementById('nextBtn').onclick = () => {
    player?.next();
    document.getElementById('animSelect').value = String(player.currentIndex);
    clipUi?.sync();
    paintNow();
  };
}

function bootUi() {
  hud = wireHud({
    renderer,
    player,
    controls,
    getStats: () => ({ src, loadStats }),
  });

  const changed = () => {
    clipUi?.sync();
    paintNow();
  };

  fillAnimationSelect(document.getElementById('animSelect'), player, changed);
  clipUi = mountAnimationButtons({
    host: document.getElementById('clipButtons'),
    select: document.getElementById('animSelect'),
    player,
    onChange: changed,
  });

  wireMeshToggles();
  wireRenderPolicyToggles();
  wireAnimationControls();
}

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000 || 0);
  last = now;

  if (player) player.update(dt);
  renderer.render(scene, camera);

  if (hud && now - lastHud > 250) {
    lastHud = now;
    paintNow();
  }
}

async function main() {
  try {
    const gltf = await loadTinyGltf(src);
    model = gltf.scene;
    loadStats = gltf.stats;
    model.position.set(0, -1.22, 4.25);
    model.scale.set(1.62, 1.62, 1.62);
    model.setBaseTransform();
    scene.add(model);

    player = new TinyAnimationPlayer(model, gltf.animations);
    bootUi();

    const stand = player.names.findIndex((name) => /stand_Armature$/.test(name));
    player.play(stand >= 0 ? stand : 0);
    document.getElementById('animSelect').value = String(player.currentIndex);
    clipUi.sync();
    applyMeshVisibility();

    window.__AWTS_TINY_CHOSSID_APP__ = {
      scene,
      camera,
      renderer,
      controls,
      player,
      model,
    };

    paintNow('B"H hierarchy, skins, orbit, clips live');
  } catch (error) {
    document.getElementById('title').className = 'bad';
    document.getElementById('title').textContent = 'B"H custom WebGL GLB test failed';
    window.__AWTS_TINY_CHOSSID_TEST__ = {
      ok: false,
      src,
      errors: [String(error?.message || error), String(error?.stack || '').slice(0, 1200)],
    };
  }
}

addEventListener('resize', resize);
resize();
main();
requestAnimationFrame(frame);
