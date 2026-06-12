/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
import {intentState} from './intentState.js';import {attackIntent} from './attackIntent.js';import {retreatIntent} from './retreatIntent.js';import {panicIntent} from './panicIntent.js';import {huntIntent} from './huntIntent.js';
export function intentPose(p,f,m,body,intent){const state=intentState(f,intent,m);attackIntent(p,f,m,body,state);retreatIntent(p,f,m,body,state);panicIntent(p,f,m,body,state);huntIntent(p,f,m,body,state);f.visualIntentState=state;return p}
