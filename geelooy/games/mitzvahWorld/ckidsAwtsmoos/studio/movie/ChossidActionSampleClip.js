// B"H
/**
 * The Awtsmoos breathes a twenty-second proof clip into the movie maker:
 * one chossid.glb body, many living motions, no cardboard labels.
 */
import { DEFAULT_CUSTOM_MOVIE_ACTIONS } from "./MovieActionCatalog.js";

export const CHOSSID_ACTION_SAMPLE_ACTIONS = Object.freeze([
  { id:"studentHarmony", label:"Student Harmony", target:"singNiggun", school:"singing" },
  { id:"busyWalkTalk", label:"Busy Walk Talk", target:"walkAndTalk", clip:"walk_Armature", speech:true, rootMotion:true },
  { id:"busyRun", label:"Busy Run", target:"run", clip:"run_Armature", rootMotion:true },
  { id:"busyJump", label:"Busy Jump", target:"jump", clip:"jump_Armature", airborne:true },
  { id:"busyTalkHands", label:"Busy Talk Hands", target:"talkHands", clip:"hands-out", speech:true }
]);

export const CHOSSID_ACTION_SAMPLE_VIDEO = Object.freeze({
  id:"chossid_glb_busy_action_sample_20s",
  title:"Chossid GLB Busy Action Proof",
  durationSec:20,
  customActions:[...DEFAULT_CUSTOM_MOVIE_ACTIONS, ...CHOSSID_ACTION_SAMPLE_ACTIONS],
  characters:[
    { id:"chossid", actor:"chossid", model:"chossid.glb", action:"busyWalkTalk", start:0, duration:20, clothes:{ shirt:"white", coat:"brown", pants:"black", shoes:"black" }, playbackProof:{ required:true, source:"chossid.glb" } },
    { id:"rebbe", actor:"rebbe", model:"chossid.glb", action:"busyTalkHands", start:8, duration:7, clothes:{ shirt:"white", coat:"black", pants:"black" } },
    { id:"student_blue", actor:"student_blue", model:"chossid.glb", action:"singNiggun", start:4, duration:12, clothes:{ shirt:"blue", coat:"navy", pants:"gray" } }
  ],
  shots:[
    { cameraCall:"BUSY_01_WALK_TALK", shot:"tracking", actor:"chossid", action:"busyWalkTalk", start:0, duration:5, lens:"35mm", position:[-2,2.2,5], lookAt:[0,1,0] },
    { cameraCall:"BUSY_02_RUN", shot:"lowRun", actor:"chossid", action:"busyRun", start:5, duration:4, lens:"28mm", position:[1.6,1.1,4.4], lookAt:[1,1,0] },
    { cameraCall:"BUSY_03_JUMP", shot:"heroJump", actor:"chossid", action:"busyJump", start:9, duration:3, lens:"32mm", position:[0,1.5,4], lookAt:[0,1.6,0] },
    { cameraCall:"BUSY_04_TALK", shot:"dialogue", actor:"chossid", action:"busyTalkHands", start:12, duration:5, lens:"50mm", position:[2,1.8,3.6], lookAt:[0,1.25,0] },
    { cameraCall:"BUSY_05_LIVING_VILLAGE", shot:"crane", subject:"village", start:17, duration:3, lens:"24mm", position:[0,6.2,9.5], lookAt:[0,1,0] }
  ],
  animals:[
    { id:"goat_busy_1", species:"goat", action:"graze", start:0, duration:20, diet:"grass", behavior:["graze","herd"] },
    { id:"fox_busy_1", species:"fox", action:"prowl", start:2, duration:15, diet:"small-prey", behavior:["prowl","flee"] }
  ],
  dialogue:[
    { speaker:"chossid", start:12, duration:4, text:"I am walking, running, jumping, and talking from real action clips.", bubble:true },
    { speaker:"rebbe", start:15, duration:3, text:"Every action must be proven in the timeline.", bubble:true }
  ],
  captions:[{ text:"20 SECOND CHOSSID.GLB ACTION PROOF", start:0, duration:3, style:"neon-gold" }],
  speechBubbles:[{ actor:"chossid", text:"Walk → run → jump → talk.", start:1, duration:4 }],
  audio:[{ sound:"busy_village_niggun", start:0, duration:20, music:true }],
  effects:[{ name:"footstep_dust_and_jump_spark", start:5, duration:8 }]
});

export const CHOSSID_ACTION_SAMPLE_PROJECT = Object.freeze({
  id:"chossid_glb_busy_action_project",
  customActions:CHOSSID_ACTION_SAMPLE_ACTIONS,
  video:CHOSSID_ACTION_SAMPLE_VIDEO
});

export function requiredChossidActionProofs() {
  return ["busyWalkTalk", "busyRun", "busyJump", "busyTalkHands"];
}

export default CHOSSID_ACTION_SAMPLE_PROJECT;
