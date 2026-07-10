// B"H

/**
 * A fence is assembled from explicit open segments. Every post and rail still
 * measures the actual ground, while omitted segments become honest gates rather
 * than invisible collision walls across the entrance path.
 */
export function createFenceAlongPath({id,path,segments,groundSampler,postSpacing=4,height=1.45,railCount=3,material={}}){
  if(!groundSampler?.heightAt)throw new TypeError('groundSampler is required');
  const sourceSegments=segments||closedSegments(path||[]);
  const vertices=[],faces=[],uvs=[],allPosts=[],postSize=.24,railSize=.14;
  sourceSegments.forEach((segment,index)=>{
    const posts=resampleOpenSegment(segment,postSpacing).map(point=>{
      const sample=groundSampler.heightAt(point.x,point.z);
      return{...point,groundY:sample.y,sample,segment:index};
    });
    allPosts.push(...posts);
    for(const post of posts)addBox(vertices,faces,uvs,post.x,post.groundY+height/2,post.z,postSize,height,postSize);
    for(let i=0;i<posts.length-1;i++){
      const a=posts[i],b=posts[i+1];
      for(let rail=1;rail<=railCount;rail++)addRail(vertices,faces,uvs,a,b,height*rail/(railCount+1),railSize);
    }
  });
  return[{
    id,shape:'manual',solid:true,walkable:false,noEdge:true,...material,
    position:{x:0,y:0,z:0},rotation:{y:0},vertices,faces,uvs,
    userData:{AwtsmoosFence:{posts:allPosts.length,segments:sourceSegments.length,railCount,collisionMode:'raw-merged-fence-octree',hasGate:!!segments,groundSources:[...new Set(allPosts.map(p=>p.sample.source))]}}
  }];
}

function closedSegments(path){
  const out=[];
  for(let i=0;i<path.length;i++)out.push([path[i],path[(i+1)%path.length]]);
  return out;
}

function resampleOpenSegment(segment,spacing){
  const[a,b]=segment,length=Math.hypot(b.x-a.x,b.z-a.z),count=Math.max(1,Math.ceil(length/spacing)),out=[];
  for(let i=0;i<=count;i++){
    const t=i/count;
    out.push({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t});
  }
  return out;
}

function addRail(vertices,faces,uvs,a,b,aboveGround,size){
  const dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz),yaw=Math.atan2(dx,dz);
  const x=(a.x+b.x)/2,z=(a.z+b.z)/2,y=((a.groundY+aboveGround)+(b.groundY+aboveGround))/2;
  addBox(vertices,faces,uvs,x,y,z,size,size,length+.08,yaw);
}

function addBox(vertices,faces,uvs,x,y,z,sx,sy,sz,yaw=0){
  const hx=sx/2,hy=sy/2,hz=sz/2,c=Math.cos(yaw),s=Math.sin(yaw);
  const rotate=([px,py,pz])=>[x+px*c+pz*s,y+py,z-px*s+pz*c];
  const sides=[
    [[-hx,-hy,hz],[hx,-hy,hz],[hx,hy,hz],[-hx,hy,hz]],[[hx,-hy,-hz],[-hx,-hy,-hz],[-hx,hy,-hz],[hx,hy,-hz]],
    [[-hx,-hy,-hz],[-hx,-hy,hz],[-hx,hy,hz],[-hx,hy,-hz]],[[hx,-hy,hz],[hx,-hy,-hz],[hx,hy,-hz],[hx,hy,hz]],
    [[-hx,hy,hz],[hx,hy,hz],[hx,hy,-hz],[-hx,hy,-hz]],[[-hx,-hy,-hz],[hx,-hy,-hz],[hx,-hy,hz],[-hx,-hy,hz]]
  ];
  for(const side of sides)addFace(vertices,faces,uvs,side.map(rotate));
}

function addFace(vertices,faces,uvs,points){
  const offset=vertices.length;
  vertices.push(...points);faces.push([offset,offset+1,offset+2,offset+3]);
  const edgeA=Math.hypot(points[1][0]-points[0][0],points[1][1]-points[0][1],points[1][2]-points[0][2]);
  const edgeB=Math.hypot(points[3][0]-points[0][0],points[3][1]-points[0][1],points[3][2]-points[0][2]);
  uvs.push(0,0,edgeA/2,0,edgeA/2,edgeB/2,0,edgeB/2);
}
