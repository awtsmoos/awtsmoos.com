// B"H
import { createBlankWorldProject, createWorldObject, createDoor, createNpc, createAnimal, addEntity, duplicateEntity, deleteEntity, activeScene } from "../core/StudioState.js";
import { saveProjectLocal, loadProjectLocal, downloadProject } from "../core/StudioPersistence.js";
import { createSpawnRule, saveSpawnRulesToWorld, weightedSpawnPreview } from "../generation/SpawnProbabilityTable.js";
import { generateAnimalPreset } from "../animals/AnimalGeneratorApp.js";
import { compileLivingCreationDocument } from "../platform/LivingCreationPlatform.js";

export function createWorldStudioState(project = createBlankWorldProject()) {
  return { project, selected:null, mode:"select", lastSaved:null, testPlayUrl:null, platform:null };
}

export function exerciseWorldStudio(state = createWorldStudioState()) {
  addEntity(state.project, "objects", createWorldObject("object", { name:"Crate", position:{ x:2, z:2 } }));
  addEntity(state.project, "animals", createAnimal({ species:"fox", name:"Fox", position:{ x:4, z:1 } }));
  addEntity(state.project, "npcs", createNpc({ name:"Quest Guide", position:{ x:0, z:3 } }));
  addEntity(state.project, "doors", createDoor({ name:"Cottage Door", position:{ x:-2, z:1 } }));
  const rule = createSpawnRule({ species:"fox", weight:.12, maxCount:8, biomes:["villageEdge", "forest"], hostility:"hostile", groupSize:[1, 2], lootTable:"foxLoot" });
  saveSpawnRulesToWorld(state.project, [rule]);
  state.project.speciesPresets.fox = generateAnimalPreset("fox", { seed:613 });
  state.platform = compileLivingCreationDocument({
    world:"village",
    seed:613,
    population:120,
    generate:["Village", "Marketplace", "Synagogue", "River", "Bridge", "Forest"],
    houses:[["brick", "door", "shop"], ["wood", "door", "trainer"]],
    animals:[{ sp:"fox", n:4, hostile:true, loot:"fur,coin" }, { sp:"goat", n:5, friendly:true }],
    npcs:[{ id:"guide", role:"questVendor", q:"clear_path" }, { id:"trainer", role:"trainer", teach:["block", "dodge"] }],
    quests:[{ id:"clear_path", obj:"collect supplies 3", reward:"coin:8,xp:30" }],
    movie:{ shots:[["wide", "village", 3], ["dialog", "guide", "talkHands", 4], ["action", "chossid", "dodge", 3]] }
  });
  state.project.graph = state.platform.graph;
  const storage = memoryStorage();
  state.lastSaved = saveProjectLocal(state.project, "mitzvahWorld.worldStudio.proof", storage);
  const loaded = loadProjectLocal("mitzvahWorld.worldStudio.proof", storage);
  state.testPlayUrl = `./index.html?worldProject=${encodeURIComponent(state.project.id)}`;
  return { state, loaded, spawnPreview:weightedSpawnPreview(state.project.animalSpawnRules, 613, 12), platform:state.platform };
}

function memoryStorage() {
  const bag = new Map();
  return { setItem(k, v){ bag.set(k, String(v)); }, getItem(k){ return bag.get(k) || null; }, removeItem(k){ bag.delete(k); } };
}

export function mountWorldStudioApp(root = document.body) {
  const state = createWorldStudioState();
  root.innerHTML = `<main class="studio-shell world-studio" data-app="world-studio"><header><a href="./">PLAY WORLD</a><strong>WORLD STUDIO</strong><a href="./movie.html">MOVIE MAKER</a></header><section class="workspace"><aside class="palette"><button data-place="object">Object</button><button data-place="building">Building</button><button data-place="door">Door</button><button data-place="npc">NPC</button><button data-place="animal">Animal</button><button data-action="blank">Blank</button><button data-action="save">Save</button><button data-action="load">Load</button><button data-action="download">Download</button><button data-action="test">Test Play</button></aside><div class="map" data-role="map"></div><aside class="inspector"><h2>Inspector</h2><div data-role="details"></div></aside></section><nav class="mobile-toolbar"><button data-place="object">Obj</button><button data-place="animal">Animal</button><button data-place="npc">NPC</button><button data-place="door">Door</button></nav></main>`;
  const map = root.querySelector("[data-role='map']");
  const details = root.querySelector("[data-role='details']");
  const render = () => {
    const scene = activeScene(state.project);
    map.innerHTML = ["objects", "buildings", "doors", "npcs", "animals"].flatMap(collection => scene[collection].map(entity => `<button class="map-entity ${collection}" data-collection="${collection}" data-id="${entity.id}" style="left:${50 + entity.position.x * 3}%;top:${50 + entity.position.z * 3}%">${entity.species || entity.kind}</button>`)).join("");
    details.textContent = state.selected ? `${state.selected.collection}: ${state.selected.id}` : `${scene.objects.length} objects, ${scene.animals.length} animals, ${scene.npcs.length} NPCs, ${scene.doors.length} doors, ${state.project.graph?.nodes?.length || 0} graph nodes`;
  };
  root.addEventListener("click", event => {
    const place = event.target?.dataset?.place;
    const action = event.target?.dataset?.action;
    const entityId = event.target?.dataset?.id;
    if (place === "object") addEntity(state.project, "objects", createWorldObject("object", { name:"Object" }));
    if (place === "building") addEntity(state.project, "buildings", createWorldObject("building", { name:"Building", scale:{ x:3, y:2, z:3 } }));
    if (place === "door") addEntity(state.project, "doors", createDoor({ name:"Door" }));
    if (place === "npc") addEntity(state.project, "npcs", createNpc({ name:"Friendly NPC" }));
    if (place === "animal") addEntity(state.project, "animals", createAnimal({ species:"fox", name:"Fox" }));
    if (entityId) state.selected = { collection:event.target.dataset.collection, id:entityId };
    if (action === "blank") state.project = createBlankWorldProject();
    if (action === "save") state.lastSaved = saveProjectLocal(state.project);
    if (action === "load") { const loaded = loadProjectLocal(); if (loaded.ok) state.project = loaded.project; }
    if (action === "download") downloadProject(state.project);
    if (action === "test") location.href = "./?mode=play&studioProject=local";
    render();
  });
  root.addEventListener("keydown", event => {
    if (!state.selected) return;
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d") duplicateEntity(state.project, state.selected.collection, state.selected.id);
    if (event.key === "Delete" || event.key === "Backspace") deleteEntity(state.project, state.selected.collection, state.selected.id);
    render();
  });
  render();
  globalThis.__MITZVAH_WORLD_STUDIO__ = { state, exercise:() => exerciseWorldStudio(state), render };
  return globalThis.__MITZVAH_WORLD_STUDIO__;
}

export default { createWorldStudioState, exerciseWorldStudio, mountWorldStudioApp };
