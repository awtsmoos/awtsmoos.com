import { resolvePose } from '../js/render/v3/character/animation/AnimationController.js';
const base={x:200,y:300,vx:0,vy:0,face:1,grounded:true,motionClock:44,damage:20};
const attack=id=>({id,startup:5,active:5,recovery:10,charge:id.includes('charge')?.7:0});
const cases=[
 ['jumpStart',{grounded:false,vy:-8,jumpMemory:{hold:1}}],['rising',{grounded:false,vy:-8,jumpMemory:{hold:20}}],['landing',{landingLag:4,preLandingVy:8}],['hardLanding',{landingLag:4,preLandingVy:16}],
 ['kick',{attack:attack('kick'),attackFrame:7}],['roundhouse',{attack:attack('roundhouse'),attackFrame:7}],['aerialKick',{grounded:false,attack:attack('aerialKick'),attackFrame:7}],['meteorKick',{grounded:false,attack:attack('meteorKick'),attackFrame:7}],
 ['hitHeavy',{stun:40,vx:-9,hitstop:6}],['stunned',{stun:20,vx:0}],['dizzy',{stun:5,vx:0,damage:160}],['shieldIdle',{blocking:true}],['shieldHit',{blocking:true,shieldHit:5}],['shieldBreak',{shieldBreak:10}],['death',{dead:true}],['respawn',{respawnTimer:30}]
];
for(const [label,patch] of cases){const p=resolvePose({...base,...patch}); console.log(label, p.anim.name, JSON.stringify({head:p.head,rightHand:p.rightHand,rightFoot:p.rightFoot,leftFoot:p.leftFoot,chest:p.chest}));}
