/**
 * B"H
 * Next hyper-real animation vessel: visual-only mass, feet, gait, breath, intent, recovery, personality, damage, micro, impact.
 */
import {centerOfMass} from './centerOfMass.js';import {supportPolygon} from './supportPolygon.js';import {balanceError} from './balanceError.js';import {momentumAxis} from './momentumAxis.js';import {bodyMomentum} from './bodyMomentum.js';import {bodyLean} from './bodyLean.js';
export function massPose(p,f,metrics,body){const com=centerOfMass(p,f,body),support=supportPolygon(p,metrics),balance=balanceError(com,support,metrics),axis=momentumAxis(f,metrics),momentum=bodyMomentum(f,metrics),lean=bodyLean(balance,momentum,metrics),s=body.height;p.chest.x+=lean.torso*18*s;p.head.x+=lean.head*14*s;p.hip.x+=lean.hips*12*s;if(balance.falling){p.leftHand.x-=lean.fallDirection*8*s;p.rightHand.x-=lean.fallDirection*8*s}f.visualMass={com,support,balance,axis,momentum,lean};return p}
