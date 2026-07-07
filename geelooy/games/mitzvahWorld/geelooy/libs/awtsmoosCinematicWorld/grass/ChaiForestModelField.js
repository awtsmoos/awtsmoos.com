// B"H
import { CHAI_FOREST_MODELS } from "../assets/ChaiForestStaticAssets.js";
export async function createChaiForestModelField(THREE, GLTFLoader, { count = 240, flowerCount = 24, rockCount = 18, width = 50, depth = 60, heightAt = () => 0, seed = 770 } = {}) {
  const rng = (() => { let s = seed >>> 0; return () => ((s = (1664525 * s + 1013904223) >>> 0) / 4294967296); })();
  const loader = new GLTFLoader(); const urls = [CHAI_FOREST_MODELS.grass, CHAI_FOREST_MODELS.flowerWhite, CHAI_FOREST_MODELS.flowerBlue, CHAI_FOREST_MODELS.flowerYellow, CHAI_FOREST_MODELS.rock1, CHAI_FOREST_MODELS.rock2, CHAI_FOREST_MODELS.rock3];
  const glbs = await Promise.all(urls.map(url => loader.loadAsync(url))); const src = glbs.map(g => g.scene); const group = new THREE.Group(); group.name = 'ChaiForestModelField_static_hosted';
  function place(model, i, scaleBase, name) { const clone = model.clone(true); const x = (rng() - .5) * width, z = -rng() * depth, y = heightAt(x, z); clone.position.set(x, y, z); clone.rotation.y = rng() * Math.PI * 2; clone.scale.setScalar(scaleBase * (.72 + rng() * .65)); clone.name = `${name}_${i}`; group.add(clone); }
  for (let i = 0; i < count; i++) place(src[0], i, .45, 'chai_grass');
  for (let i = 0; i < flowerCount; i++) place(src[1 + (i % 3)], i, .42, 'chai_flower');
  for (let i = 0; i < rockCount; i++) place(src[4 + (i % 3)], i, .55, 'chai_rock');
  group.userData.chaiForestModels = CHAI_FOREST_MODELS; group.userData.counts = { grass: count, flowers: flowerCount, rocks: rockCount }; return group;
}
