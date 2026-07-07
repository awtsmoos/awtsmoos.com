// B"H
import { EZ_TREE_MODELS } from "../assets/EzTreeStaticAssets.js";
/** Loads EZ Tree GLB grass/flowers/rocks and scatters reusable instances. */
export async function createEzTreeGrassModelField(THREE, GLTFLoader, { count = 240, flowerCount = 24, rockCount = 18, width = 50, depth = 60, heightAt = () => 0, seed = 770 } = {}) {
  const rng = (() => { let s = seed >>> 0; return () => ((s = (1664525 * s + 1013904223) >>> 0) / 4294967296); })();
  const loader = new GLTFLoader();
  const [grass, white, blue, yellow, rock1, rock2, rock3] = await Promise.all([EZ_TREE_MODELS.grass, EZ_TREE_MODELS.flowerWhite, EZ_TREE_MODELS.flowerBlue, EZ_TREE_MODELS.flowerYellow, EZ_TREE_MODELS.rock1, EZ_TREE_MODELS.rock2, EZ_TREE_MODELS.rock3].map(url => loader.loadAsync(url)));
  const group = new THREE.Group(); group.name = "EzTreeGrassModelField_static_hosted";
  const source = [grass.scene, white.scene, blue.scene, yellow.scene, rock1.scene, rock2.scene, rock3.scene];
  function place(model, i, scaleBase, name) {
    const clone = model.clone(true); const x = (rng() - 0.5) * width; const z = -rng() * depth; const y = heightAt(x, z);
    clone.position.set(x, y, z); clone.rotation.y = rng() * Math.PI * 2; const s = scaleBase * (0.72 + rng() * 0.65); clone.scale.setScalar(s); clone.name = `${name}_${i}`; group.add(clone);
  }
  for (let i = 0; i < count; i++) place(source[0], i, 0.45, "ez_grass");
  for (let i = 0; i < flowerCount; i++) place(source[1 + (i % 3)], i, 0.42, "ez_flower");
  for (let i = 0; i < rockCount; i++) place(source[4 + (i % 3)], i, 0.55, "ez_rock");
  group.userData.ezTreeModels = EZ_TREE_MODELS; group.userData.counts = { grass: count, flowers: flowerCount, rocks: rockCount };
  return group;
}
