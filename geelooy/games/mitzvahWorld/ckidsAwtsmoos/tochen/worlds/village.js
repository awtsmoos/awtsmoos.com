// B"H
/** @file village.js @description Emerald Village manifest using approved tree bucket only. */
import { compileVillage } from './emeraldVillage/villageCompiler.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
const compiledNivrayim = compileVillage();
export default {
  shaym: "The Emerald Village of Living Letters",
  components: { awduhm: "https://models-3122d.web.app/chossid.glb" },
  nivrayim: {
    ProceduralSky: { domeOfHeaven: { name: "Emerald_Sky", timeMultiplier: 1.5, timeOfDay: 8.0 } },
    Domem: { emeraldGround: { name: "Emerald_Village_Ground", groundAuthority: true, golem: { guf: { BoxGeometry: [2000, 2, 2000] }, toyr: { AwtsmoosGrassMaterial: {} } }, position: { x: 0, y: -1, z: 0 }, isSolid: true, on: { ready(me) { if (me.mesh) me.mesh.frustumCulled = false; } } }, ...(compiledNivrayim.Domem || {}) },
    ProceduralRoad: compiledNivrayim.ProceduralRoad || {}, ProceduralFlowerPatch: compiledNivrayim.ProceduralFlowerPatch || {}, ProceduralRiver: compiledNivrayim.ProceduralRiver || {}, Collectable: compiledNivrayim.Collectable || {},
    VillageHeroTree: compiledNivrayim.VillageHeroTree || {},
    ProceduralBuilding: compiledNivrayim.ProceduralBuilding || {}, InteractiveDoor: compiledNivrayim.InteractiveDoor || {}, InteractiveNpc: compiledNivrayim.InteractiveNpc || {}, Mazik: compiledNivrayim.Mazik || {}, Stairs: compiledNivrayim.Stairs || {}, Portal: compiledNivrayim.Portal || {},
    Chossid: [{ name: "The Chossid", height: 1.5, speed: 180, interactable: true, path: "https://models-3122d.web.app/chossid.glb?k=village_emerald_v5", position: { x: 0, y: 40, z: 0 }, cameraDistance: 3.2, cameraPhi: 35, cameraTargetHeight: 1.4, orLevel: 0, hp: 100, maxHp: 100, koach: 50, maxKoach: 50, xp: 0, level: 1, basePower: 10, baseDefense: 5, on: { ready(n) { if (n?.updateAppearance) n.updateAppearance(); }, "hit floor": function(m) { m.olam.ayshPeula("ui event", "effectsOverlay", { text: "Welcome to the Emerald Village! Seek the Etz Chayim.", color: "#50C878" }); }, addLight: function(m, amount) { m.orLevel += amount; if (m.orLevel > 100) m.olam.ayshPeula("ui event", "effectsOverlay", { text: "You are radiating the Infinite Light!", color: "#ffffff" }); } } }]
  }
};
