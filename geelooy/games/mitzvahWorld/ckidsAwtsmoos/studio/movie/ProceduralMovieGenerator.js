// B"H
import { createTimeline, addTimelineClip, addTimelineKeyframe } from "./Timeline.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createChossidCharacterWardrobe } from "../../characters/chossid/wardrobe/ChossidWardrobe.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { speciesNames } from "../../platform/MitzvahPlatformCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { DEFAULT_CUSTOM_MOVIE_ACTIONS, actionPickerModel, movieActionNames, normalizeMovieActionName } from "./MovieActionCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

function chossidCharacter(input) {
  return { ...input, model:"chossid.glb", wardrobe:createChossidCharacterWardrobe(input), customActionReady:true };
}

function v3(value, fallback) {
  return Array.isArray(value) && value.length >= 3 ? value : fallback;
}

function n(value, fallback) {
  const x = Number(value);
  return Number.isFinite(x) ? x : fallback;
}

function customActions(options = {}) {
  return [...DEFAULT_CUSTOM_MOVIE_ACTIONS, ...(Array.isArray(options.customActions) ? options.customActions : [])];
}

function clipAction(action, actions) {
  return normalizeMovieActionName(action || "idle", actions);
}

export function createDefaultMovieScene(options = {}) {
  const actions = customActions(options);
  const actionSet = movieActionNames(actions);
  return {
    id:options.id || "default_village_movie_scene",
    location:options.location || "village",
    seed:Number(options.seed || 770),
    terrain:{ grass:{ visible:true, density:"high-near-lod", clumpsNearCamera:true }, mountains:{ visible:true, count:7 }, path:{ visible:true, material:"packed-dirt-stone-edge" } },
    characters:[
      chossidCharacter({ character:"chossid", id:"chossid", name:"Yossi", clothes:{ hat:"cap", shirt:"white", coat:"brown", pants:"black", shoes:"black" }, actions:actionSet }),
      chossidCharacter({ character:"chossid", id:"rebbe", name:"Rebbe", role:"guide", clothes:{ hat:"topHat", shirt:"white", coat:"black", pants:"black", shoes:"black" }, actions:actionSet }),
      chossidCharacter({ character:"chossid", id:"student_blue", name:"Levi", role:"singing-school-student", clothes:{ hat:"yamulka", shirt:"blue", coat:"navy", pants:"gray", shoes:"black" }, actions:actionSet }),
      chossidCharacter({ character:"chossid", id:"student_burgundy", name:"Mendel", role:"singing-school-student", clothes:{ hat:"cap", shirt:"cream", coat:"burgundy", pants:"black", shoes:"brown" }, actions:actionSet })
    ],
    animals:[
      { id:"fox_hero_1", species:"fox", action:"prowl", position:[2,0,4], singleMesh:true, diet:"small-prey", behavior:["prowl", "flee", "protect-den"] },
      { id:"goat_1", species:"goat", action:"graze", position:[-2,0,3], singleMesh:true, diet:"grass", behavior:["graze", "herd", "drink"] },
      { id:"deer_1", species:"deer", action:"flee", position:[1,0,2], singleMesh:true, diet:"leaves", behavior:["graze", "flee", "herd"] }
    ],
    singingSchool:{ id:"village_niggun_school", teacher:"rebbe", students:["student_blue", "student_burgundy"], actions:["singNiggun", "conductChoir", "talkHands"] },
    captions:[{ text:"A mitzvah turns the whole village into light.", start:1, duration:4, style:"extreme-glow" }],
    speechBubbles:[
      { actor:"rebbe", text:"Choose the action. Walk, run, sing, speak with hands — all of it.", start:8, duration:4 },
      { actor:"student_blue", text:"The singing school action is custom, not hard-coded.", start:13, duration:4 }
    ],
    customActions:actions,
    availableActions:actionSet,
    availableSpecies:speciesNames(),
    questMoment:{ questId:"clear_the_garden", actor:"rebbe", action:"acceptQuest" }
  };
}

export function createCameraShotPlan(scene = createDefaultMovieScene(), options = {}) {
  const actions = customActions(scene);
  const duration = Math.max(18, Number(options.duration || 34));
  const provided = Array.isArray(options.shots) ? options.shots : Array.isArray(scene.shots) ? scene.shots : null;
  if (provided?.length) return provided.map((shot, i) => ({ label:shot.label || `${shot.shot || "shot"} ${i + 1}`, shot:shot.shot || "wide", start:n(shot.start, i * 3), duration:n(shot.duration, 3), actor:shot.actor, action:clipAction(shot.action, actions), position:v3(shot.position, [i, 3, 7 - i * .4]), lookAt:v3(shot.lookAt, [0, 1, 0]), lens:shot.lens || "35mm", cameraCall:shot.cameraCall || `CALL_${i + 1}` }));
  return [
    { shot:"wide", label:"CALL 01 / establishing mountains grass village", start:0, duration:4, position:[0,5.4,10], lookAt:[0,1,0], lens:"24mm", cameraCall:"ESTABLISHING_WIDE" },
    { shot:"tracking", label:"CALL 02 / walk and talk with chossid", start:4, duration:4, actor:"chossid", action:"walkAndTalk", position:[-2,2.4,4], lookAt:[0,1,0], lens:"35mm", cameraCall:"TRACK_WALK_TALK" },
    { shot:"lowRun", label:"CALL 03 / low angle run", start:8, duration:3, actor:"chossid", action:"run", position:[1.8,1.25,4.6], lookAt:[1,1,0], lens:"28mm", cameraCall:"LOW_RUN" },
    { shot:"overShoulder", label:"CALL 04 / speech bubble Rebbe with hands", start:11, duration:5, actor:"rebbe", action:"talkHands", position:[2.3,1.8,3.2], lookAt:[-.4,1.3,-1], lens:"50mm", cameraCall:"OTS_DIALOGUE" },
    { shot:"singingSchool", label:"CALL 05 / singing school custom actions", start:16, duration:4, actor:"student_blue", action:"singNiggun", position:[-1.2,1.5,3.4], lookAt:[-.2,1.1,0], lens:"45mm", cameraCall:"SINGING_SCHOOL" },
    { shot:"animalHero", label:"CALL 06 / realistic one-mesh goat and fox", start:20, duration:4, actor:"goat_1", action:"graze", position:[-.5,1.2,3], lookAt:[-2,.6,3], lens:"70mm", cameraCall:"ANIMAL_HERO" },
    { shot:"action", label:"CALL 07 / custom staff cast", start:24, duration:5, actor:"chossid", action:"customStaffSpecial", position:[-1.5,2.4,4.2], lookAt:[2,1,3], lens:"35mm", cameraCall:"SPELL_ACTION" },
    { shot:"crane", label:"CALL 08 / crane finale", start:29, duration:Math.max(4, duration - 29), position:[0,7,11], lookAt:[0,1,0], lens:"24mm", cameraCall:"CRANE_FINISH" }
  ];
}

export function generateProceduralMovie(options = {}) {
  const scene = options.scene || createDefaultMovieScene(options);
  const actions = customActions(scene);
  const duration = Math.max(18, Number(options.duration || 34));
  const shots = createCameraShotPlan(scene, { duration, shots:options.shots });
  const timeline = createTimeline({ id:`movie_${Date.now().toString(36)}`, duration });
  for (const character of scene.characters || []) {
    addTimelineClip(timeline, "actor", { label:`${character.id} wardrobe ${character.wardrobe.coat}`, start:0, duration, payload:{ actor:character.id, model:character.model, wardrobe:character.wardrobe, clothes:character.clothes, availableActions:scene.availableActions, customActionReady:true } });
  }
  for (const shot of shots) {
    const camera = addTimelineClip(timeline, "camera", { label:shot.label, start:shot.start, duration:shot.duration, payload:{ shot:shot.shot, lens:shot.lens, cameraCall:shot.cameraCall, actor:shot.actor || null, location:scene.location, cut:true, angle:shot.label } });
    addTimelineKeyframe(timeline, camera.id, { time:shot.start, value:{ position:shot.position, lookAt:shot.lookAt, lens:shot.lens, call:shot.cameraCall } });
    addTimelineKeyframe(timeline, camera.id, { time:shot.start + shot.duration, value:{ position:shot.position.map((value, i) => i === 1 ? value + .25 : value + .35), lookAt:shot.lookAt, lens:shot.lens, call:`${shot.cameraCall}_OUT` } });
    if (shot.actor) addTimelineClip(timeline, "actor", { label:`${shot.actor} ${clipAction(shot.action, actions)}`, start:shot.start, duration:shot.duration, payload:{ actor:shot.actor, action:clipAction(shot.action, actions), availableActions:scene.availableActions, runtimeAction:true, customAction:actions.some(item => item.id === shot.action) } });
  }
  for (const animal of scene.animals || []) addTimelineClip(timeline, "actor", { label:`single mesh ${animal.species} ${animal.action}`, start:1, duration:duration - 2, payload:{ actor:animal.id, species:animal.species, diet:animal.diet, behavior:animal.behavior, action:normalizeMovieActionName(animal.action, actions), singleMeshAnimal:true, runtimeAction:true, realisticAnimal:true } });
  for (const caption of scene.captions || []) addTimelineClip(timeline, "subtitle", { label:`caption ${caption.style || "default"}`, start:n(caption.start, 0), duration:n(caption.duration, 3), payload:{ ...caption, extremeCaption:true } });
  for (const bubble of scene.speechBubbles || []) addTimelineClip(timeline, "dialogue", { label:`bubble ${bubble.actor || "speaker"}`, start:n(bubble.start, 0), duration:n(bubble.duration, 3), payload:{ ...bubble, speechBubble:true } });
  addTimelineClip(timeline, "audio", { label:"Village niggun and action mix", start:0, duration, payload:{ sound:"village_niggun_action_mix", music:true, singingSchool:scene.singingSchool } });
  return { ok:true, theme:options.theme || "mitzvah", scene, shots, timeline, actionPicker:actionPickerModel(actions), proceduralDirector:{ generated:true, cameraCuts:shots.length, cameraCalls:shots.map(s => s.cameraCall), actionsPlayed:shots.filter(s => s.actor).map(s => clipAction(s.action, actions)), availableActions:movieActionNames(actions).length, customActions:actions.map(item => item.id), singingSchool:scene.singingSchool, animalPresence:(scene.animals || []).length, singleMeshAnimals:true, questEvent:scene.questMoment } };
}

export default { createDefaultMovieScene, createCameraShotPlan, generateProceduralMovie };
