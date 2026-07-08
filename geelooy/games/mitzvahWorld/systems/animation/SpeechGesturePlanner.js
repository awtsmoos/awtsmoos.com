// B"H
/** Speech creates gestures even before a mesh has lips. */
import { animationForIntent } from "./AnimationIntentMapper.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function planSpeechGesture(speaker, lines = []) { return { speaker, lines, animation:animationForIntent("talk"), gesture:lines.length > 1 ? "teaching_open_hands" : "soft_wave" }; }
export function planDialogueGestures(beats = []) { return beats.map(b => planSpeechGesture(b.speaker, b.lines || [])); }
