// B"H

/**
 * The visible fence may be rich, but collision must be merciful to a phone.
 * Posts still sample real ground. The visual is one merged non-solid mesh;
 * four measured boundary boxes provide cheap, reliable collision.
 */
export function createFenceAlongPath({id,path,groundSampler,postSpacing=4,height=1.45,railCount=3,material={}}){
  if(!groundSampler?.heightAt)throw new TypeError('groundSampler is required');
  const posts=resampleClosedPath(path,postSpacing).map(point=>{const sample=groundSampler.heightAt(point.x,point.z);return{...point,groundY:sample.y,sample};});
  const vertices=[],faces=[],uvs=[],postSize=.24,railSize=.14;
  for(const post of posts)addBox(vertices,faces,uvs,post.x,post.groundY+height/2,post.z,postSize,height,postSize);
  for(let i=0;i<posts.length;i++){const a=posts[i],b=posts[(i+1)%posts.length];for(let rail=1;rail<=railCount;rail++)addRail(vertices,faces,uvs,a,b,height*rail/(railCount+1),railSize);}
  const visual={id,shape:'manual',solid:false,walkable:false,noEdge:true,...material,position:{x:0,y:0,z:0},rotation:{y:0},vertices,faces,uvs,userData:{AwtsmoosFence:{posts:posts.length,railCount,collisionMode:'four-boundary-boxes',groundSources:[...new Set(posts.map(p=>p.sample.source))]}}};
  return[visual,...boundaryColliders(id,path,groundSampler,height)];
}
function boundaryColliders(id,path,sampler,height){return path.map((a,i)=>{const b=path[(i+1)%path.length],dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz),x=(a.x+b.x)/2,z=(a.z+b.z)/2,ay=sampler.heightAt(a.x,a.z).y,by=sampler.heightAt(b.x,b.z).y;return{id:`${id}-collision-${i+1}`,shape:'box',solid:true,walkable:false,noEdge:true,color:'#000000',visible:false,position:{x,y:(ay+by)/2+height*.46,z},size:{x:.28,y:height*.92,z:length+.25},rotation:{y:Math.atan2(dx,dz)}};});}
function resampleClosedPath(path,spacing){const out=[];for(let i=0;i<path.length;i++){const a=path[i],b=path[(i+1)%path.length],length=Math.hypot(b.x-a.x,b.z-a.z),count=Math.max(1,Math.ceil(length/spacing));for(let j=0;j<count;j++){const t=j/count;out.push({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t});}}return out;}
function addRail(vertices,faces,uvs,a,b,aboveGround,size){const dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz),yaw=Math.atan2(dx,dz),x=(a.x+b.x)/2,z=(a.z+b.z)/2,y=((a.groundY+aboveGround)+(b.groundY+aboveGround))/2;addBox(vertices,faces,uvs,x,y,z,size,size,length+.08,yaw);}
function addBox(vertices,faces,uvs,x,y,z,sx,sy,sz,yaw=0){const hx=sx/2,hy=sy/2,hz=sz/2,c=Math.cos(yaw),s=Math.sin(yaw),rotate=([px,py,pz])=>[x+px*c+pz*s,y+py,z-px*s+pz*c],sides=[
[[-hx,-hy,hz],[hx,-hy,hz],[hx,hy,hz],[-hx,hy,hz]],[[hx,-hy,-hz],[-hx,-hy,-hz],[-hx,hy,-hz],[hx,hy,-hz]],
[[-hx,-hy,-hz],[-hx,-hy,hz],[-hx,hy,hz],[-hx,hy,-hz]],[[hx,-hy,hz],[hx,-hy,-hz],[hx,hy,-hz],[hx,hy,hz]],
[[-hx,hy,hz],[hx,hy,hz],[hx,hy,-hz],[-hx,hy,-hz]],[[-hx,-hy,-hz],[hx,-hy,-hz],[hx,-hy,hz],[-hx,-hy,hz]]];
  for(const side of sides)addFace(vertices,faces,uvs,side.map(rotate));
}
function addFace(vertices,faces,uvs,points){const offset=vertices.length;vertices.push(...points);faces.push([offset,offset+1,offset+2,offset+3]);const edgeA=Math.hypot(points[1][0]-points[0][0],points[1][1]-points[0][1],points[1][2]-points[0][2]),edgeB=Math.hypot(points[3][0]-points[0][0],points[3][1]-points[0][1],points[3][2]-points[0][2]);uvs.push(0,0,edgeA/2,0,edgeA/2,edgeB/2,0,edgeB/2);}
