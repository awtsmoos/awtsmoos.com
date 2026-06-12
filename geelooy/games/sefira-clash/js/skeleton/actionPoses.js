/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
import {combatPose} from './combat/combatPose.js';import {bodyArchetype} from './style/bodyArchetype.js';
export const applyActionPose=(f,p,facing,s,intent)=>combatPose(p,f,{facing},bodyArchetype(f),intent||{});
