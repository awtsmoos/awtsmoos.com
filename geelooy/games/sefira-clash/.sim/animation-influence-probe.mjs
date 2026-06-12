import { influence } from '../js/skeleton/compose/poseInfluence.js';
import { applyInfluences } from '../js/skeleton/compose/poseComposer.js';
const pose={head:{x:0,y:0},hand:{x:10,y:10}};
applyInfluences(pose,[influence('head',4,2,0.5,10,'test'),influence('hand',-2,3,1,5,'test')]);
if(pose.head.x!==2||pose.head.y!==1||pose.hand.x!==8||pose.hand.y!==13)throw new Error('influence composer mismatch');
console.log(JSON.stringify({ok:true,pose},null,2));
