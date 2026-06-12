/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
import {idlePose} from './idlePose.js';import {runPose} from './runPose.js';import {turnPose} from './turnPose.js';import {brakePose} from './brakePose.js';import {footPlantPose} from './footPlantPose.js';
export function locomotionPose(p,f,m,style,body){idlePose(p,f,m,style,body);runPose(p,f,m,style,body);turnPose(p,f,m,style,body);brakePose(p,f,m,style,body);footPlantPose(p,f,m,style,body);return p}
