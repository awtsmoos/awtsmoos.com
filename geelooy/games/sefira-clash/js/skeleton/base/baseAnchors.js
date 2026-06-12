/**
 * B"H
 * Awtsmoos visual vessel: pure animation/readability, never gameplay authority.
 */
import {point} from '../poseMath.js';
export function baseAnchors(f,m,body,balance,anim,intent){const s=body.height,face=m.facing,squat=anim.squash*42*s,stretch=anim.stretch*38*s,curl=intent.damageCurl*18*s,lift=intent.confidence*10*s-curl,lean=(balance.balanceLean+balance.recoveryLean+balance.panicBackLean)*32*s,hip=point(f.x-lean*.18,f.y-56*s+squat*.6),chest=point(f.x+face*4+lean,f.y-128*s+squat-stretch-lift),neck=point(chest.x,chest.y-13*s),head=point(chest.x+face*Math.abs(f.vx||0)*.28+intent.airTurn*-face*14*s,chest.y-42*s-stretch*.22-lift*.2);return{hip,chest,neck,head,leftShoulder:point(chest.x-body.shoulderWidth,chest.y+14*s),rightShoulder:point(chest.x+body.shoulderWidth,chest.y+14*s),leftHip:point(hip.x-body.hipWidth*intent.footWiden*body.stanceWidth,hip.y+3*s),rightHip:point(hip.x+body.hipWidth*intent.footWiden*body.stanceWidth,hip.y+3*s)}}
