/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
import {risePose} from './risePose.js';import {apexPose} from './apexPose.js';import {fallPose} from './fallPose.js';import {fastFallPose} from './fastFallPose.js';import {airTurnPose} from './airTurnPose.js';
export function airPose(p,f,m,style,body,intent){risePose(p,f,m,style,body);apexPose(p,f,m,style,body);fallPose(p,f,m,style,body,intent);fastFallPose(p,f,m,style,body);airTurnPose(p,f,m,style,body);return p}
