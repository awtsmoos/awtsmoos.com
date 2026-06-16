import { resolvePose } from '../js/render/v3/character/animation/AnimationController.js';
const base={x:200,y:300,vx:0,vy:0,face:1,grounded:false,motionClock:40,damage:0};
const cases=[
 ['doubleJump',{...base,vy:-10,jumpsUsed:2}],
 ['dive',{...base,vy:14,diveAttackFrames:20,diving:12}],
 ['ledgeHang',{...base,ledgeHang:{x:260,y:180,side:1,timer:50}}],
 ['ledgeClimb',{...base,input:{jump:true},ledgeHang:{x:260,y:180,side:1,timer:50}}],
 ['ledgeDrop',{...base,input:{down:true},ledgeHang:{x:260,y:180,side:1,timer:50}}],
 ['ledgeAttack',{...base,input:{punch:true},ledgeHang:{x:260,y:180,side:1,timer:50}}]
];
const seen=cases.map(([label,f])=>{const p=resolvePose(f);for(const [k,v] of Object.entries(p))if(v&&typeof v==='object'&&'x'in v&&!Number.isFinite(v.x+v.y))throw new Error(label+' bad '+k);return{label,state:p.anim.name,head:round(p.head),hand:round(p.rightHand),foot:round(p.rightFoot)};});
console.log(JSON.stringify({ok:true,seen},null,2));
function round(p){return{x:Math.round(p.x),y:Math.round(p.y)};}
