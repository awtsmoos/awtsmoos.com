// B"H
import { createTimeline, addTimelineClip, addTimelineKeyframe } from "./Timeline.js";

export function createDefaultMovieScene(options = {}) {
  return {
    id:options.id || "default_village_movie_scene",
    location:options.location || "village",
    seed:Number(options.seed || 770),
    terrain:{
      grass:{ visible:true, density:"high-near-lod", clumpsNearCamera:true, fadeDistance:34, texture:"procedural-blade-variation" },
      path:{ visible:true, material:"packed-dirt-stone-edge" }
    },
    houses:[
      { id:"bakery_house", material:"brick", door:"door_bakery", service:"shop", position:[-4, 0, -3] },
      { id:"trainer_house", material:"wood", door:"door_trainer", service:"trainer", position:[4, 0, -2] }
    ],
    doors:[
      { id:"door_bakery", opensTo:"bakery_interior", action:"openDoor" },
      { id:"door_trainer", opensTo:"trainer_interior", action:"openDoor" }
    ],
    characters:[
      {
        character:"chossid",
        id:"chossid",
        name:"Yossi",
        clothes:{ hat:"cap", shirt:"white", coat:"brown", pants:"black", shoes:"black" },
        actions:["walk", "run", "talkHands", "castStorm", "openDoor"]
      },
      {
        character:"chossid",
        id:"jill",
        name:"Jill",
        role:"questVendor",
        clothes:{ hat:"none", shirt:"blue", coat:"tan", pants:"brown", shoes:"black" },
        actions:["idle", "talkHands", "giveItem"]
      }
    ],
    animals:[
      { id:"fox_hero_1", species:"fox", action:"prowl", position:[2, 0, 4] },
      { id:"goat_1", species:"goat", action:"graze", position:[-2, 0, 3] },
      { id:"chicken_1", species:"chicken", action:"peck", position:[1, 0, 2] }
    ],
    questMoment:{ questId:"clear_the_garden", actor:"jill", action:"acceptQuest" }
  };
}

export function createCameraShotPlan(scene = createDefaultMovieScene(), options = {}) {
  const duration = Math.max(18, Number(options.duration || 32));
  return [
    { shot:"wide", label:"Opening village wide", start:0, duration:4, position:[0, 5.4, 9], lookAt:[0, 1, 0] },
    { shot:"follow", label:"Follow Yossi walking", start:4, duration:5, actor:"chossid", action:"walk", position:[-2, 2.4, 4], lookAt:[0, 1, 0] },
    { shot:"medium", label:"Run to the quest giver", start:9, duration:3, actor:"chossid", action:"run", position:[1.8, 2.2, 4.6], lookAt:[1, 1, 0] },
    { shot:"overShoulder", label:"Jill dialogue", start:12, duration:5, actor:"jill", action:"talkHands", position:[2.3, 1.8, 3.2], lookAt:[-.4, 1.3, -1] },
    { shot:"closeup", label:"Quest accepted", start:17, duration:3, actor:"chossid", action:"acceptQuest", position:[.8, 1.6, 2.2], lookAt:[.5, 1.45, 0] },
    { shot:"action", label:"Storm cast at foxes", start:20, duration:5, actor:"chossid", action:"castStorm", position:[-1.5, 2.4, 4.2], lookAt:[2, 1, 3] },
    { shot:"follow", label:"Open the shop door", start:25, duration:4, actor:"chossid", action:"openDoor", position:[-4.2, 2, 2], lookAt:[-4, 1, -3] },
    { shot:"crane", label:"Village crane finish", start:29, duration:Math.max(3, duration - 29), position:[0, 7, 10], lookAt:[0, 1, 0] }
  ];
}

export function generateProceduralMovie(options = {}) {
  const scene = options.scene || createDefaultMovieScene(options);
  const duration = Math.max(18, Number(options.duration || 32));
  const shots = createCameraShotPlan(scene, { duration });
  const timeline = createTimeline({ id:`movie_${Date.now().toString(36)}`, duration });
  for (const shot of shots) {
    const camera = addTimelineClip(timeline, "camera", { label:shot.label, start:shot.start, duration:shot.duration, payload:{ shot:shot.shot, actor:shot.actor || null, location:scene.location, cut:true } });
    addTimelineKeyframe(timeline, camera.id, { time:shot.start, value:{ position:shot.position, lookAt:shot.lookAt } });
    addTimelineKeyframe(timeline, camera.id, { time:shot.start + shot.duration, value:{ position:shot.position.map((v, i) => i === 1 ? v + .25 : v + .35), lookAt:shot.lookAt } });
    if (shot.actor) addTimelineClip(timeline, "actor", { label:`${shot.actor} ${shot.action}`, start:shot.start, duration:shot.duration, payload:{ actor:shot.actor, action:shot.action, clothes:scene.characters.find(c => c.id === shot.actor)?.clothes || null } });
  }
  for (const animal of scene.animals) addTimelineClip(timeline, "actor", { label:`${animal.species} ${animal.action}`, start:1, duration:duration - 2, payload:{ actor:animal.id, species:animal.species, action:animal.action } });
  addTimelineClip(timeline, "dialogue", { label:"Jill quest dialogue", start:12.4, duration:4.2, payload:{ speaker:"jill", text:options.dialogueStyle === "brief" ? "Can you clear the garden?" : "The garden is full of pests. Please clear three and bring back what you find." } });
  addTimelineClip(timeline, "subtitle", { label:"Quest subtitle", start:12.4, duration:4.2, payload:{ text:"Clear the garden and bring back useful drops." } });
  addTimelineClip(timeline, "audio", { label:"Village music placeholder", start:0, duration, payload:{ sound:"village_theme_placeholder", music:true } });
  addTimelineClip(timeline, "audio", { label:"Storm cast sound", start:20.2, duration:1.8, payload:{ sound:"storm_cast_placeholder", effect:true } });
  return {
    ok:true,
    theme:options.theme || "mitzvah",
    scene,
    shots,
    timeline,
    proceduralDirector:{ generated:true, cameraCuts:shots.length, actionsPlayed:["walk", "run", "talkHands", "castStorm", "openDoor"], animalPresence:scene.animals.length, questEvent:scene.questMoment }
  };
}

export default { createDefaultMovieScene, createCameraShotPlan, generateProceduralMovie };
