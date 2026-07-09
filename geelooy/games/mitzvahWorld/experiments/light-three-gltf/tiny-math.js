// B"H
/**
 * Awtsmoos math: tiny column-major vessels where points awaken from nothing.
 * The order is GLTF/THREE-like: local = T * R * S, world = parent * local.
 */
export const EPSILON = 1e-8;

export function identity(){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);}
export function copyMat4(a){return new Float32Array(a || identity());}
export function mat4FromArray(a, offset=0){const m=new Float32Array(16);for(let i=0;i<16;i++)m[i]=Number(a?.[offset+i] ?? (i%5===0?1:0));return m;}
export function multiply(a,b){const o=new Float32Array(16);for(let r=0;r<4;r++)for(let c=0;c<4;c++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o;}

export function inverse(a){
  const o=new Float32Array(16),a00=a[0],a01=a[1],a02=a[2],a03=a[3],a10=a[4],a11=a[5],a12=a[6],a13=a[7],a20=a[8],a21=a[9],a22=a[10],a23=a[11],a30=a[12],a31=a[13],a32=a[14],a33=a[15];
  const b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10,b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12,b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30,b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32;
  let det=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;if(Math.abs(det)<EPSILON)return identity();det=1/det;
  o[0]=(a11*b11-a12*b10+a13*b09)*det;o[1]=(-a01*b11+a02*b10-a03*b09)*det;o[2]=(a31*b05-a32*b04+a33*b03)*det;o[3]=(-a21*b05+a22*b04-a23*b03)*det;
  o[4]=(-a10*b11+a12*b08-a13*b07)*det;o[5]=(a00*b11-a02*b08+a03*b07)*det;o[6]=(-a30*b05+a32*b02-a33*b01)*det;o[7]=(a20*b05-a22*b02+a23*b01)*det;
  o[8]=(a10*b10-a11*b08+a13*b06)*det;o[9]=(-a00*b10+a01*b08-a03*b06)*det;o[10]=(a30*b04-a31*b02+a33*b00)*det;o[11]=(-a20*b04+a21*b02-a23*b00)*det;
  o[12]=(-a10*b09+a11*b07-a12*b06)*det;o[13]=(a00*b09-a01*b07+a02*b06)*det;o[14]=(-a30*b03+a31*b01-a32*b00)*det;o[15]=(a20*b03-a21*b01+a22*b00)*det;return o;
}

export function translate(x=0,y=0,z=0){const m=identity();m[12]=x;m[13]=y;m[14]=z;return m;}
export function scale(x=1,y=1,z=1){const m=identity();m[0]=x;m[5]=y;m[10]=z;return m;}
export function quatNormalize(q){let x=q?.[0]||0,y=q?.[1]||0,z=q?.[2]||0,w=q?.[3]??1,l=Math.hypot(x,y,z,w)||1;return [x/l,y/l,z/l,w/l];}
export function quatMatrix(q=[0,0,0,1]){const [x,y,z,w]=quatNormalize(q),x2=x+x,y2=y+y,z2=z+z,xx=x*x2,xy=x*y2,xz=x*z2,yy=y*y2,yz=y*z2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2,m=identity();m[0]=1-(yy+zz);m[1]=xy+wz;m[2]=xz-wy;m[4]=xy-wz;m[5]=1-(xx+zz);m[6]=yz+wx;m[8]=xz+wy;m[9]=yz-wx;m[10]=1-(xx+yy);return m;}
export function composeTRS(position, quaternion, scl){return multiply(multiply(translate(position.x,position.y,position.z),quatMatrix(quaternion.toArray ? quaternion.toArray() : quaternion)),scale(scl.x,scl.y,scl.z));}

export function perspective(fovDeg,aspect,near,far){const f=1/Math.tan(fovDeg*Math.PI/360),nf=1/(near-far),m=new Float32Array(16);m[0]=f/aspect;m[5]=f;m[10]=(far+near)*nf;m[11]=-1;m[14]=2*far*near*nf;return m;}
export function lookAt(eye,target,up=[0,1,0]){let zx=eye[0]-target[0],zy=eye[1]-target[1],zz=eye[2]-target[2],zl=1/(Math.hypot(zx,zy,zz)||1);zx*=zl;zy*=zl;zz*=zl;let xx=up[1]*zz-up[2]*zy,xy=up[2]*zx-up[0]*zz,xz=up[0]*zy-up[1]*zx,xl=1/(Math.hypot(xx,xy,xz)||1);xx*=xl;xy*=xl;xz*=xl;const yx=zy*xz-zz*xy,yy=zz*xx-zx*xz,yz=zx*xy-zy*xx,m=identity();m[0]=xx;m[1]=yx;m[2]=zx;m[4]=xy;m[5]=yy;m[6]=zy;m[8]=xz;m[9]=yz;m[10]=zz;m[12]=-(xx*eye[0]+xy*eye[1]+xz*eye[2]);m[13]=-(yx*eye[0]+yy*eye[1]+yz*eye[2]);m[14]=-(zx*eye[0]+zy*eye[1]+zz*eye[2]);return m;}
export function transformPoint(m,x,y,z){return [m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]];}
export function quatSlerp(a,b,t){let ax=a[0],ay=a[1],az=a[2],aw=a[3],bx=b[0],by=b[1],bz=b[2],bw=b[3],cos=ax*bx+ay*by+az*bz+aw*bw;if(cos<0){bx=-bx;by=-by;bz=-bz;bw=-bw;cos=-cos;}if(cos>0.9995)return quatNormalize([ax+(bx-ax)*t,ay+(by-ay)*t,az+(bz-az)*t,aw+(bw-aw)*t]);const th=Math.acos(Math.min(1,Math.max(-1,cos))),s=Math.sin(th),s0=Math.sin((1-t)*th)/s,s1=Math.sin(t*th)/s;return [ax*s0+bx*s1,ay*s0+by*s1,az*s0+bz*s1,aw*s0+bw*s1];}
export function lerpArray(a,b,t){const o=new Array(a.length);for(let i=0;i<a.length;i++)o[i]=a[i]+(b[i]-a[i])*t;return o;}
