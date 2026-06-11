import { POSES } from './poseLibrary.js';
/** B"H — solves target angles into visible limbs every renewed frame. */
export function solveSkeleton(f){ const pose=POSES[actionPose(f)]||POSES.stand; const phase=Math.sin((f.x+performance.now()/8)*.025)*.08; for(const id of Object.keys(f.bones)){ const b=f.bones[id]; const parent=b.parent?f.bones[b.parent]:null; b.root=parent?{...parent.tip}:{x:f.x,y:f.y}; const base=pose[id]??b.angle; const target=(base+phase)*(id.includes('left')?-f.face:f.face); b.angle+=(target-b.angle)*.32; b.tip={x:b.root.x+Math.cos(b.angle)*b.len,y:b.root.y+Math.sin(b.angle)*b.len}; } }
function actionPose(f){ if(f.blocking)return 'shield'; if(f.attack)return f.attack.id; if(Math.abs(f.vx)>2)return 'run'; return 'stand'; }
