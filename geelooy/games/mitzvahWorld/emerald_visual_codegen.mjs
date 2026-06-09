import fs from 'node:fs';
import path from 'node:path';
const base='ckidsAwtsmoos/tochen/worlds/emeraldVillage/visualPasses';
fs.rmSync(base,{recursive:true,force:true});fs.mkdirSync(base,{recursive:true});
const files=[];const write=(name,content)=>{fs.writeFileSync(path.join(base,name),content);files.push(name)};
write('shapeKit.js',`// B"H
/** @file shapeKit.js @description Chapter 180: The Awtsmoos gives every visual pass one small hand. */
export function p(x,y,z){return{x,y,z}}
export function box(n,id,name,position,size,color,solid=false){n.Domem[id]={name,position,golem:{guf:{BoxGeometry:size},toyr:{MeshStandardMaterial:{color}}},isSolid:solid}}
export function tree(n,id,x,z,scale,preset='Oak Medium'){n.ProceduralTree[id]={name:id,preset,position:p(x,0,z),scale,isSolid:true,props:{height:7*scale,foliageRadius:2.2*scale,branchCount:9}}}
export function flower(n,id,x,z,radius,count,flowerType='daisy'){n.ProceduralFlowerPatch[id]={position:p(x,0.05,z),radius,count,flowerType}}
export function ringPoints(count,radius,ox=0,oz=0){return Array.from({length:count},(_,i)=>{const a=i/count*Math.PI*2;return{x:ox+Math.cos(a)*radius,z:oz+Math.sin(a)*radius,a}})}
`);
write('palette.js',`// B"H
/** @file palette.js @description Chapter 181: Color becomes meaning instead of noise. */
export const P=Object.freeze({wood:'#6d4424',darkWood:'#2b1b10',stone:'#8a8170',stone2:'#716858',gold:'#d8aa3d',blue:'#274f88',red:'#8c3329',green:'#2f7440',linen:'#f1e9cf',smoke:'#b8b8aa',water:'#2d9fc2',flower:'#e6d36a',root:'#4a2d18',leaf:'#2f6b35',light:'#ffd87a'});
export const BANNERS=Object.freeze(['#274f88','#8c3329','#3c6f43','#8a6b2f','#5a3e8e']);
`);
write('stats.js',`// B"H
/** @file stats.js @description Chapter 182: Every NPC carries a neighborhood soul. */
export const STAT_SETS=Object.freeze([{wisdom:22,kindness:18,courage:12,trade:8,growth:16,light:20},{wisdom:12,kindness:16,courage:18,trade:24,growth:10,light:13},{wisdom:14,kindness:23,courage:11,trade:9,growth:25,light:18},{wisdom:26,kindness:13,courage:19,trade:7,growth:12,light:24}]);
export function enrichNpc(npc,index){return{...npc,areaName:npc.areaName||'Emerald Entry Village',areaStats:npc.areaStats||STAT_SETS[index%STAT_SETS.length],areaNote:npc.areaNote||'These stats belong to the NPC and neighborhood you are standing in.'}}
`);
const passDefs=[
['entryTreePass.js','addEntryTree',`tree(n,'entry_giant_etz_chayim',0,-18,4.9,'Oak Large');ringPoints(16,8,0,-18).forEach((r,i)=>box(n,\`etz_root_radial_\${i}\`,'Etz Chayim exposed root',p(r.x*.62,.18,-18+(r.z+18)*.62),[3.6,.35,.55],P.root,true));for(let i=0;i<20;i++){const a=i/20*Math.PI*2;box(n,\`etz_lantern_\${i}\`,'Hanging golden lantern',p(Math.cos(a)*7.4,5.8+(i%5)*.45,-18+Math.sin(a)*7.4),[.32,.52,.32],P.light,false)}box(n,'etz_chayim_name_plaque','Etz Chayim Plaque',p(0,1.5,-9.6),[4.4,1.1,.18],P.gold,false)`],
['plazaPass.js','addPlaza',`box(n,'entry_circular_stone_plaza','Circular Entry Plaza',p(0,.05,-4),[36,.12,36],P.stone,true);ringPoints(32,18,0,-4).forEach((r,i)=>box(n,\`plaza_outer_cobble_\${i}\`,'Outer cobble',p(r.x,.16,r.z),[1.4,.22,.9],i%2?P.stone:P.stone2,true));ringPoints(20,9,0,-4).forEach((r,i)=>box(n,\`plaza_inner_cobble_\${i}\`,'Inner cobble',p(r.x,.18,r.z),[1.1,.2,.7],i%2?P.stone2:P.stone,true));flower(n,'entry_gold_white_flowers',0,5,12,360,'daisy')`],
['lightingPropPass.js','addLightingProps',`const lamp=(id,x,z,h=3.1)=>{box(n,\`\${id}_post\`,\`\${id} Post\`,p(x,h/2,z),[.22,h,.22],P.darkWood,true);box(n,\`\${id}_glass\`,\`\${id} Glass\`,p(x,h+.16,z),[.42,.36,.42],P.light,false)};[-12,-5,5,12].forEach((x,i)=>lamp(\`entry_lamp_\${i}\`,x,i%2?7:-10));ringPoints(12,15,0,-4).forEach((r,i)=>lamp(\`plaza_ring_lamp_\${i}\`,r.x,r.z,2.5))`],
['marketPass.js','addMarket',`const stall=(id,x,z,color)=>{box(n,\`\${id}_table\`,\`\${id} Table\`,p(x,.7,z),[3.2,.28,1.55],P.wood,true);box(n,\`\${id}_cloth\`,\`\${id} Cloth\`,p(x,1.75,z),[3.7,.16,1.9],color,false);for(let i=0;i<5;i++)box(n,\`\${id}_produce_\${i}\`,'Market produce',p(x-1.2+i*.6,1,z+.2*(i%2)),[.38,.28,.38],i%2?'#b83b27':'#d8a938',false)};stall('market_blue_awning',-15,8,P.blue);stall('market_red_awning',15,8,P.red);for(let i=0;i<18;i++)box(n,\`market_crate_\${i}\`,'Market crate',p(-22+i*2.6,.42,15+(i%4)),[.75,.84,.75],i%2?P.wood:P.darkWood,false)`],
['signagePass.js','addSigns',`const sign=(id,x,z,name)=>{box(n,\`\${id}_post\`,\`\${name} Post\`,p(x,.9,z),[.18,1.8,.18],P.darkWood,true);box(n,\`\${id}_board\`,name,p(x,1.55,z),[1.7,.55,.12],P.wood,false)};sign('guide_sign_levels',-5.5,-1.5,'Level Guide');sign('road_sign_beis',5.5,-1.5,'Beis Medrash');sign('market_sign',-15,5.8,'Market');sign('well_sign',-18,-2,'Village Well')`],
['waterPass.js','addWaterFeatures',`box(n,'entry_well_base','Stone village well',p(-18,.55,-6),[3.8,1.1,3.8],P.stone,true);box(n,'entry_well_water','Dark well water',p(-18,1.14,-6),[2.4,.08,2.4],'#1d5b72',false);box(n,'entry_well_roof','Small well roof',p(-18,3.05,-6),[4.6,.32,3.2],P.wood,true);box(n,'entry_fountain_basin','Low fountain basin',p(18,.35,-5),[5.2,.7,5.2],P.stone,true);box(n,'entry_fountain_water','Fountain water sheet',p(18,.78,-5),[4,.08,4],P.water,false);box(n,'entry_fountain_spark','Fountain sparkle',p(18,1.75,-5),[.52,1.8,.52],'#9fe9ff',false)`],
['depthTreePass.js','addDepthTrees',`for(let i=0;i<26;i++){const a=i/26*Math.PI*2;tree(n,\`foreground_depth_tree_\${i}\`,Math.cos(a)*96,Math.sin(a)*96,1.05+(i%5)*.16)}for(let i=0;i<20;i++)flower(n,\`depth_flower_bank_\${i}\`,Math.sin(i*2.1)*76,Math.cos(i*1.7)*76,5+i%4,100+i*8,i%2?'rose':'daisy')`],
['architecturePass.js','addArchitecture',`properties.slice(0,42).forEach((prop,i)=>{const x=prop.center.x,z=prop.center.z;box(n,\`\${prop.id}_banner\`,'Hanging house banner',p(x+5,4.5,z),[.4,2.2,.1],BANNERS[i%BANNERS.length]);box(n,\`\${prop.id}_roof_accent\`,'Painted roof accent',p(x,6.8,z),[4.5,.25,.4],BANNERS[(i+1)%BANNERS.length]);box(n,\`\${prop.id}_chimney\`,'Stone chimney',p(x+4,6,z+1),[.8,2.4,.8],'#75685d',true);if(i%2===0)box(n,\`\${prop.id}_porch\`,'Wooden porch',p(x,.3,z-8),[5.5,.6,2.5],P.wood,true);if(i%3===0)box(n,\`\${prop.id}_dormer\`,'Little dormer',p(x-2,5.8,z),[1.8,1.4,1.4],'#d9cfba',true)})`],
['houseMicroPass.js','addHouseMicro',`properties.slice(0,36).forEach((prop,index)=>{const x=prop.center.x,z=prop.center.z,front=z>=0?z-(prop.lot?.depth||40)/2-6:z+(prop.lot?.depth||40)/2+6,sg=z>=0?-1:1;box(n,\`\${prop.id}_painted_door\`,'Painted door accent',p(x,1.55,front),[2.2,3.1,.18],BANNERS[index%BANNERS.length]);box(n,\`\${prop.id}_left_shutter\`,'Left shutter',p(x-3.6,2.7,front),[.55,1.45,.16],P.darkWood);box(n,\`\${prop.id}_right_shutter\`,'Right shutter',p(x+3.6,2.7,front),[.55,1.45,.16],P.darkWood);box(n,\`\${prop.id}_awning\`,'Cloth awning',p(x,3.35,front+sg*.45),[5.8,.22,1.4],BANNERS[(index+2)%BANNERS.length]);box(n,\`\${prop.id}_smoke_a\`,'Chimney smoke',p(x+4.8,8.4,z+2.2),[.72,.55,.72],P.smoke,false);for(let i=0;i<4;i++)box(n,\`\${prop.id}_laundry_\${i}\`,'Hanging laundry',p(x-4.5+i*3,1.85,front+sg*2.4),[1.05,.85,.08],[P.linen,P.blue,P.red,P.green][(i+index)%4]);for(let i=0;i<3;i++)box(n,\`\${prop.id}_jar_\${i}\`,'Clay jar',p(x+8+i*.7,.45,front+sg),[.45,.9,.45],'#9a5f32')})`],
['roadEdgePass.js','addRoadEdges',`roads.slice(0,20).forEach((road,ri)=>(road.points||[]).slice(0,-1).forEach((pt,pi)=>{const nxp=road.points[pi+1],dx=nxp[0]-pt[0],dz=nxp[1]-pt[1],len=Math.hypot(dx,dz)||1,nx=-dz/len,nz=dx/len,steps=Math.min(12,Math.max(3,Math.floor(len/18)));for(let s=0;s<steps;s++){const t=(s+.5)/steps,cx=pt[0]+dx*t,cz=pt[1]+dz*t;[-1,1].forEach(side=>box(n,\`road_\${ri}_\${pi}_edge_\${s}_\${side}\`,'Road edge stone',p(cx+nx*side*(road.width*.58),.13,cz+nz*side*(road.width*.58)),[.75,.24,.55],side>0?'#756d61':'#8b8275',true))}}))`],
['benchPass.js','addBenches',`const bench=(id,x,z,rot=false)=>{box(n,\`\${id}_seat\`,'Bench seat',p(x,.55,z),rot?[.42,.18,2.5]:[2.5,.18,.42],P.wood,true);box(n,\`\${id}_back\`,'Bench back',p(x,.95,z),rot?[.18,.55,2.5]:[2.5,.55,.18],P.darkWood,true)};bench('entry_bench_left',-8,2);bench('entry_bench_right',8,2);ringPoints(8,11,0,-4).forEach((r,i)=>bench(\`plaza_bench_\${i}\`,r.x,r.z,i%2===0))`],
['crowdMarkerPass.js','addCrowdMarkers',`const colors=['#1b1b1b','#ffffff','#2f5f9f','#8c3329'];for(let i=0;i<28;i++){const x=-18+(i%14)*2.8,z=10+Math.floor(i/14)*4;box(n,\`ambient_crowd_marker_\${i}\`,'Ambient villager silhouette',p(x,.95,z),[.38,1.9,.38],colors[i%4],false)}`],
['vistaPass.js','addVista',`for(let i=0;i<9;i++)box(n,\`distant_mountain_\${i}\`,'Distant mountain silhouette',p(-240+i*60,45,-310-i%3*20),[80,90+i*8,18],'#53656a',false);for(let i=0;i<4;i++)box(n,\`distant_waterfall_\${i}\`,'Distant waterfall ribbon',p(-120+i*80,38,-298),[6,55,2],'#bfe7ff',false)`],
['sparklePass.js','addSparkles',`ringPoints(36,10,0,-18).forEach((r,i)=>box(n,\`etz_firefly_\${i}\`,'Etz Chayim firefly',p(r.x,2.2+(i%9)*.45,r.z),[.16,.16,.16],i%2?'#fff2a8':'#9fe9ff',false))`]
];
for(const [file,fn,body] of passDefs){const args=(fn==='addArchitecture'||fn==='addHouseMicro')?'n,properties':fn==='addRoadEdges'?'n,roads':'n';write(file,`// B"H
/** @file ${file} @description Chapter ${180+files.length}: ${fn} reveals one visual layer of Emerald Village. */
import{box,p,tree,flower,ringPoints}from'./shapeKit.js';import{P,BANNERS}from'./palette.js';
export function ${fn}(${args}){${body}}
`)}
let exports=[];for(const [file,fn] of passDefs){exports.push(`export{${fn}}from'./${file}';`)}exports.push("export{enrichNpc}from'./stats.js';");write('visualIndex.js',`// B"H
/** @file visualIndex.js @description Chapter 197: The whole beauty orchestra enters through one narrow gate. */
${exports.join('\n')}
`);
for(let i=1;i<=35;i++){const nn=String(i).padStart(2,'0'),hue=['#274f88','#8c3329','#3c6f43','#8a6b2f','#5a3e8e'][i%5];write(`districtAccent${nn}.js`,`// B"H
/** @file districtAccent${nn}.js @description Chapter ${197+i}: A small district motif reduces repetition. */
import{box,p}from'./shapeKit.js';
export function addDistrictAccent${nn}(n,properties){const prop=properties[${i}%properties.length];if(!prop)return;const x=prop.center.x,z=prop.center.z;box(n,'district_accent_${nn}_banner','District accent banner ${i}',p(x+${(i%7)-3},${2+(i%5)*.5},z+${(i%9)-4}),[.35,1.6,.12],'${hue}',false)}
`)}
write('districtAccents.js',`// B"H
/** @file districtAccents.js @description Chapter 233: Thirty-five tiny motifs make neighborhoods rememberable. */
${Array.from({length:35},(_,i)=>`import{addDistrictAccent${String(i+1).padStart(2,'0')}}from'./districtAccent${String(i+1).padStart(2,'0')}.js';`).join('\n')}
export function addDistrictAccents(n,properties){${Array.from({length:35},(_,i)=>`addDistrictAccent${String(i+1).padStart(2,'0')}(n,properties);`).join('')}}
`);
write('visualNarration.js',`// B"H
/** @file visualNarration.js @description Chapter 234: Human-readable labels for the current Emerald art target. */
export const VISUAL_TARGET=Object.freeze({centerpiece:'Etz Chayim with lanterns and roots',plaza:'radial stone plaza',village:'lived-in homes, banners, smoke, laundry',vista:'mountains and waterfalls',ui:'NPC stats and level select'});
`);
write('visualBudget.js',`// B"H
/** @file visualBudget.js @description Chapter 235: The mobile budget is guarded while detail increases. */
export const VISUAL_BUDGET=Object.freeze({maxDecoratedProperties:42,maxRoadsWithEdges:20,maxCrowdMarkers:28,maxDistrictAccents:35});
`);
console.log(JSON.stringify({count:files.length},null,2));
