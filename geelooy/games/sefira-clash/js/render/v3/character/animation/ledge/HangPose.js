/** B"H — hanging: one hand anchors, legs kick beneath. */
import { add,pt } from '../../CharacterRig.js';
import { wave } from '../Math.js';
export function hangPose(p,f){
 const side=f.ledgeHang?.side||-p.face||-1,edgeX=f.ledgeHang?.x??p.pelvis.x,edgeY=f.ledgeHang?.y??p.floor-130,kick=wave(f,.14);
 p.face=-side;p.pelvis=pt(edgeX-side*18,edgeY+76);p.chest=pt(edgeX-side*22,p.pelvis.y-54);
 p.neck=add(p.chest,-side,-12);p.head=add(p.neck,-side*4,-18);
 p.leftShoulder=add(p.chest,-32,12);p.rightShoulder=add(p.chest,32,12);
 const handSide=side<0?'left':'right',free=handSide==='left'?'right':'left';
 p[handSide+'Elbow']=pt(edgeX-side*10,edgeY+48);p[handSide+'Hand']=pt(edgeX,edgeY+2);
 p[free+'Elbow']=add(p[free+'Shoulder'],-side*18,28);p[free+'Hand']=add(p[free+'Shoulder'],-side*33,55);
 p.leftKnee=add(p.leftHip,-side*(10+kick*4),44);p.rightKnee=add(p.rightHip,side*(15-kick*4),50);
 p.leftFoot=add(p.leftKnee,-side*8,52);p.rightFoot=add(p.rightKnee,side*10,50);
 return p;
}
