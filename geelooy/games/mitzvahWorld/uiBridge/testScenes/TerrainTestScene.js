// B"H
/** Terrain material lab: prove visible ground before fancy shaders. */
import { makeSceneShell } from "./TestSceneShell.js?compact=true&v=main-menu-tests-20260708-bh2";
import { solidGreen, repeatedGrass, fancyMix } from "./TerrainMaterials.js?compact=true&v=main-menu-tests-20260708-bh2";
export function startTerrainTest(back) {
  const shell = makeSceneShell({ title:"Terrain Material Test", back:() => { shell.dispose(); back(); } });
  const { THREE, scene, controls } = shell;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(48, 48, 1, 1), solidGreen(THREE));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  scene.add(ground, new THREE.GridHelper(48, 24, 0xffffff, 0x245524));
  const label = document.createElement("span"); label.className = "awts-test-readout"; controls.append(label);
  const choices = [["Solid green diffuse", () => solidGreen(THREE)], ["Repeated one grass", () => repeatedGrass(THREE)], ["Fancy mix shader", () => fancyMix(THREE)]];
  function setMat(name, make) { ground.material?.dispose?.(); ground.material = make(); label.textContent = `active: ${name}`; window.__AWTS_TERRAIN_TEST__ = { active:name, visible:true, at:Date.now() }; }
  choices.forEach(([name, make]) => { const b = document.createElement("button"); b.textContent = name; b.onclick = () => setMat(name, make); controls.append(b); });
  setMat(choices[0][0], choices[0][1]);
  const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color:0xffffff }));
  cube.position.set(0, .5, 0); scene.add(cube);
  shell.loop(dt => { cube.rotation.y += dt; cube.rotation.x += dt * .5; });
}
