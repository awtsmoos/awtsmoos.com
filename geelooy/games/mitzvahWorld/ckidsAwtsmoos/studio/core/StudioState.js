// B"H
export const WORLD_PROJECT_SCHEMA_VERSION = "mitzvah-world-project-v1";

const clone = value => JSON.parse(JSON.stringify(value));
const id = prefix => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function createBlankWorldProject(options = {}) {
  return {
    schema: WORLD_PROJECT_SCHEMA_VERSION,
    id: options.id || id("world"),
    name: options.name || "Untitled Mitzvah World",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scenes: [createWorldScene({ id:"main", name:"Main Scene" })],
    activeSceneId: "main",
    animalSpawnRules: [],
    speciesPresets: {},
    items: [],
    shops: [],
    trainers: [],
    quests: [],
    interiors: [],
    cutscenes: []
  };
}

export function createWorldScene(options = {}) {
  return {
    id: options.id || id("scene"),
    name: options.name || "Scene",
    terrain: options.terrain || { kind:"flat", size:[160, 160], biome:"villageEdge" },
    objects: [],
    buildings: [],
    doors: [],
    npcs: [],
    animals: []
  };
}

export function activeScene(project) {
  return project.scenes.find(scene => scene.id === project.activeSceneId) || project.scenes[0];
}

export function createWorldObject(kind = "object", props = {}) {
  return {
    id: props.id || id(kind),
    kind,
    name: props.name || kind,
    type: props.type || kind,
    position: { x:n(props.position?.x), y:n(props.position?.y), z:n(props.position?.z) },
    rotation: { x:n(props.rotation?.x), y:n(props.rotation?.y), z:n(props.rotation?.z) },
    scale: { x:n(props.scale?.x, 1), y:n(props.scale?.y, 1), z:n(props.scale?.z, 1) },
    properties: { ...(props.properties || {}) }
  };
}

export function createDoor(props = {}) {
  return {
    ...createWorldObject("door", props),
    prompt: props.prompt || "Open door",
    destination: props.destination || { type:"interior", interiorId:"cottage_interior" },
    open: Boolean(props.open),
    collision: props.collision || { closedBlocks:true, openBlocks:false, doorwayWidth:1.2 }
  };
}

export function createNpc(props = {}) {
  return {
    ...createWorldObject("npc", props),
    identity: props.identity || { id:props.id || id("npc_identity"), displayName:props.name || "Friendly NPC" },
    role: props.role || "questGiver",
    dialogueState: props.dialogueState || { treeId:"starter_dialogue", nodeId:"start" },
    questState: props.questState || { questId:"starter_quest", state:"available" },
    shopState: props.shopState || null,
    trainerState: props.trainerState || null,
    friendliness: n(props.friendliness, 1)
  };
}

export function createAnimal(props = {}) {
  return {
    ...createWorldObject("animal", props),
    species: props.species || "fox",
    behavior: props.behavior || { hostility:props.hostility || "hostile", friendliness:n(props.friendliness, 0.15) },
    lootTable: props.lootTable || `${props.species || "fox"}Loot`,
    selectable: true,
    hitbox: props.hitbox || { radius:0.8, height:1.1 },
    corpseProxy: true
  };
}

export function addEntity(project, collection, entity) {
  const scene = activeScene(project);
  scene[collection].push(entity);
  project.updatedAt = new Date().toISOString();
  return entity;
}

export function updateEntity(project, collection, entityId, patch = {}) {
  const scene = activeScene(project);
  const entity = scene[collection].find(item => item.id === entityId);
  if (!entity) return null;
  Object.assign(entity, patch);
  project.updatedAt = new Date().toISOString();
  return entity;
}

export function duplicateEntity(project, collection, entityId) {
  const scene = activeScene(project);
  const source = scene[collection].find(item => item.id === entityId);
  if (!source) return null;
  const copy = clone(source);
  copy.id = id(source.kind || collection);
  copy.name = `${source.name || source.kind} Copy`;
  copy.position.x += 1;
  copy.position.z += 1;
  scene[collection].push(copy);
  project.updatedAt = new Date().toISOString();
  return copy;
}

export function deleteEntity(project, collection, entityId) {
  const scene = activeScene(project);
  const before = scene[collection].length;
  scene[collection] = scene[collection].filter(item => item.id !== entityId);
  project.updatedAt = new Date().toISOString();
  return scene[collection].length !== before;
}

export function serializeWorldProject(project) {
  return JSON.stringify(project, null, 2);
}

export function normalizeWorldProject(raw = {}) {
  const project = { ...createBlankWorldProject(), ...(raw || {}) };
  project.schema = WORLD_PROJECT_SCHEMA_VERSION;
  if (!Array.isArray(project.scenes) || !project.scenes.length) project.scenes = [createWorldScene({ id:"main" })];
  project.activeSceneId ||= project.scenes[0].id;
  project.animalSpawnRules ||= [];
  project.speciesPresets ||= {};
  project.items ||= [];
  project.shops ||= [];
  project.trainers ||= [];
  project.quests ||= [];
  project.interiors ||= [];
  project.cutscenes ||= [];
  return project;
}

export default {
  WORLD_PROJECT_SCHEMA_VERSION,
  createBlankWorldProject,
  createWorldScene,
  activeScene,
  createWorldObject,
  createDoor,
  createNpc,
  createAnimal,
  addEntity,
  updateEntity,
  duplicateEntity,
  deleteEntity,
  serializeWorldProject,
  normalizeWorldProject
};
