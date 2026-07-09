// B"H
/** @file treeGeometryBuilder.js @description Two-buffer builder: bark tubes and transparent leaf planes. */
function rgba(value) {
  if (Array.isArray(value)) return [value[0] ?? 1, value[1] ?? 1, value[2] ?? 1, value[3] ?? 1];
  if (Number.isFinite(Number(value))) return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255, 1];
  return [1, 1, 1, 1];
}
export class TreeGeometryBuilder {
  constructor() { this.verts=[]; this.normals=[]; this.uvs=[]; this.indices=[]; this.leafVerts=[]; this.leafNorms=[]; this.leafUVs=[]; this.leafIndices=[]; this.leafColors=[]; this.vertOffset=0; this.leafOffset=0; }
  basis(q){ const [x,y,z,w]=q, x2=x+x, y2=y+y, z2=z+z, xx=x*x2, xy=x*y2, xz=x*z2, yy=y*y2, yz=y*z2, zz=z*z2, wx=w*x2, wy=w*y2, wz=w*z2; return { r:[1-(yy+zz),xy+wz,xz-wy], f:[xz+wy,yz-wx,1-(xx+yy)], u:[x*y2-w*z2,1-(xx+zz),yz+wx] }; }
  addBranchSection(center, orientation, radius, segments, vCoord){ const start=this.vertOffset, b=this.basis(orientation); for(let i=0;i<=segments;i++){ const u=i/segments,t=u*Math.PI*2,c=Math.cos(t),s=Math.sin(t),nx=b.r[0]*c+b.f[0]*s,ny=b.r[1]*c+b.f[1]*s,nz=b.r[2]*c+b.f[2]*s; this.verts.push(center[0]+nx*radius,center[1]+ny*radius,center[2]+nz*radius); this.normals.push(nx,ny,nz); this.uvs.push(u,vCoord); this.vertOffset++; } return start; }
  stitch(a,b,segments){ for(let i=0;i<segments;i++) this.indices.push(a+i,b+i,a+i+1,b+i,b+i+1,a+i+1); }
  addCap(center, orientation, ringStart, segments, vCoord){ const tip=this.vertOffset,u=this.basis(orientation).u; this.verts.push(...center); this.normals.push(...u); this.uvs.push(.5,vCoord+.1); this.vertOffset++; for(let i=0;i<segments;i++) this.indices.push(ringStart+i,ringStart+i+1,tip); }
  rotEuler(v,r){ let [x,y,z]=v; const cx=Math.cos(r[0]),sx=Math.sin(r[0]),cy=Math.cos(r[1]),sy=Math.sin(r[1]),cz=Math.cos(r[2]),sz=Math.sin(r[2]); let nx=x*cz-y*sz,ny=x*sz+y*cz,nz=z; x=nx; y=ny; nx=x*cy+z*sy; nz=-x*sy+z*cy; x=nx; z=nz; ny=y*cx-z*sx; nz=y*sx+z*cx; return [x,ny,nz]; }
  normalFromRotation(rotation){ const n=this.rotEuler([0,0,1],rotation); const l=Math.hypot(n[0],n[1],n[2])||1; return [n[0]/l,n[1]/l,n[2]/l]; }
  addLeafPlane(pos, size, rotation, color, aspect=1){ const idx=this.leafOffset, tint=rgba(color), w=size*.5*aspect, h=size, n=this.normalFromRotation(rotation); const local=[[-w,0,0],[w,0,0],[w,h,0],[-w,h,0]], uv=[[0,0],[1,0],[1,1],[0,1]]; for(let i=0;i<4;i++){ const v=this.rotEuler(local[i],rotation); this.leafVerts.push(pos[0]+v[0],pos[1]+v[1],pos[2]+v[2]); this.leafNorms.push(...n); this.leafUVs.push(...uv[i]); this.leafColors.push(...tint); } this.leafIndices.push(idx,idx+1,idx+2,idx,idx+2,idx+3); this.leafOffset+=4; }
  addLeaf(pos, size, rotation, color, options={}){ const aspect=options.aspect || .72; this.addLeafPlane(pos,size,rotation,color,aspect); if (String(options.billboard||"double").toLowerCase()==="double") this.addLeafPlane(pos,size,[rotation[0],rotation[1]+Math.PI/2,rotation[2]],color,aspect); }
}
export default TreeGeometryBuilder;
