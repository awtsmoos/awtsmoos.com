/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
import {personalityProfile} from './personalityProfile.js';import {rhythmProfile} from './rhythmProfile.js';import {aggressionProfile} from './aggressionProfile.js';import {courageProfile} from './courageProfile.js';import {confidenceProfile} from './confidenceProfile.js';
export function personalityPose(p,f,m,body){const base=personalityProfile(f),rhythm=rhythmProfile(base),aggression=aggressionProfile(base),courage=courageProfile(base,f),confidence=confidenceProfile(base,f),s=body.height;p.chest.x+=m.facing*aggression.forwardLean*20*s;p.head.y-=confidence.confidence*3*s;p.leftHand.y+=courage.hesitation*4*s;p.rightHand.y+=courage.hesitation*4*s;f.visualPersonality={base,rhythm,aggression,courage,confidence};return p}
