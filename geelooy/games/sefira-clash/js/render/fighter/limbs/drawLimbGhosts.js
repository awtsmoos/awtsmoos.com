/**
 * B"H
 * Awtsmoos render split vessel: visual-only, small and readable.
 */
import {drawOffsetBone} from './drawBoneLine.js';
export function drawLimbGhosts(ctx,f,color,language){if(!f.attack&&Math.abs(f.vx||0)<=9)return;ctx.save();ctx.globalAlpha=.16+(language.attackGlow||0)*.12;ctx.strokeStyle=color;ctx.lineWidth=5;const dx=-(f.vx||f.face||1)*2.2,dy=-(f.vy||0)*1.2;for(const id of ['rightLowerArm','rightCalf'])drawOffsetBone(ctx,f.bones[id],dx,dy);ctx.restore()}
