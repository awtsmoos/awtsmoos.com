/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
import {clothProfile} from './clothProfiles.js';import {stepChain} from './clothPhysics.js';
export function ensureClothState(f,c){const prof=clothProfile(c),st=f.clothState||={kind:prof.kind,scarf:[],hem:[],cape:[],sleeves:[]};if(st.kind!==prof.kind){st.kind=prof.kind;st.scarf=[];st.hem=[];st.cape=[];st.sleeves=[]}seed(st.scarf,prof.kind==='scarf'?prof.points:2);seed(st.hem,Math.max(2,prof.points));seed(st.cape,prof.kind==='capelet'?prof.points:0);seed(st.sleeves,2);return st}
export function stepClothState(f,c,a=f.poseClothAnchors){const prof=clothProfile(c),st=ensureClothState(f,c),back=a?.back||{x:f.x,y:f.y-115},hip=a?.hip||{x:f.x,y:f.y-52};stepChain(st.scarf,back,prof,f.vx||0,f.vy||0);stepChain(st.hem,hip,{...prof,length:prof.length*.72},f.vx||0,f.vy||0);stepChain(st.cape,back,{...prof,length:prof.length*.9},f.vx||0,f.vy||0);stepChain(st.sleeves,a?.sleeves?.right||back,{...prof,length:16},f.vx||0,f.vy||0);return st}
function seed(ch,n){while(ch.length<n)ch.push({x:0,y:0});if(ch.length>n)ch.length=n}
