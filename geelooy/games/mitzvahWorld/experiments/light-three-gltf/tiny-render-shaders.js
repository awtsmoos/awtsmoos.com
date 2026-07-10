// B"H
/** Shader scrolls: mix first, mirror-repeat after; one draw, high precision, no stretched chessboard. */
export const fragmentShader = `
precision highp float;
varying vec3 vNormal; varying vec4 vColor; varying vec2 vUv; varying vec3 vWorld;
uniform vec4 uColor; uniform float uAlphaCutoff; uniform int uAlphaMode; uniform int uLit;
uniform int uUseMap; uniform sampler2D uMap; uniform vec2 uMapRepeat;
uniform int uUseMixMap; uniform sampler2D uMixMap; uniform vec2 uMixRepeat; uniform float uMixStrength;
vec2 mirrorRepeat(vec2 x){ vec2 f=fract(x); vec2 k=mod(floor(x),2.0); return mix(f,1.0-f,k); }
vec2 repeatUv(vec2 uv, vec2 rep){ return mirrorRepeat(uv*rep); }
float hash(vec2 p){ return fract(sin(dot(p,vec2(41.1,289.7)))*21543.5453); }
float noise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y); }
float blob(vec2 p, vec2 c, float r){ return 1.0-smoothstep(r*.10,r,length(p-c)); }
float dirtMask(vec2 p){
  float m=0.0;
  m=max(m,blob(p,vec2(-22.0,22.0),58.0));
  m=max(m,blob(p,vec2(42.0,-36.0),74.0));
  m=max(m,blob(p,vec2(-85.0,-70.0),88.0));
  m=max(m,blob(p,vec2(95.0,64.0),76.0));
  m=max(m,blob(p,vec2(0.0,0.0),45.0));
  m=max(m,blob(p,vec2(-145.0,112.0),95.0));
  m=max(m,blob(p,vec2(152.0,-122.0),92.0));
  m=max(m,blob(p,vec2(-65.0,48.0),48.0));
  m=max(m,blob(p,vec2(71.0,8.0),52.0));
  return m;
}
void main(){
  vec4 texel=vec4(1.0);
  if(uUseMap==1) texel=texture2D(uMap,repeatUv(vUv,uMapRepeat));
  if(uUseMixMap==1 && uMixStrength>0.001){
    vec4 dirt=texture2D(uMixMap,repeatUv(vUv,uMixRepeat));
    float n=noise(vWorld.xz*.016+vec2(7.0,3.0));
    float fine=noise(vWorld.xz*.049+vec2(2.0,11.0));
    float m=clamp(dirtMask(vWorld.xz)*.66 + smoothstep(.37,.72,n)*.22 + smoothstep(.60,.87,fine)*.08,0.0,1.0);
    texel.rgb=mix(texel.rgb,dirt.rgb,clamp(m*uMixStrength,0.0,.82));
  }
  vec4 mixedColor=uColor*vColor*texel;
  if(uAlphaMode==1&&mixedColor.a<uAlphaCutoff)discard;
  if(mixedColor.a<=.003)discard;
  vec3 rgb=mixedColor.rgb;
  if(uLit==1){
    vec3 normal=normalize(vNormal); vec3 sun=normalize(vec3(-.34,.93,.18));
    float key=max(dot(normal,sun),0.0); float sky=normal.y*.5+.5;
    rgb=rgb*(.90+key*1.10+sky*.25)+rgb*vec3(.16,.20,.28)*sky;
    rgb=mix(rgb,sqrt(max(rgb,vec3(0.0))),.08);
  }
  gl_FragColor=vec4(min(rgb,vec3(1.0)),mixedColor.a);
}`;
export const rigidVertexShader = `
attribute vec3 aPosition; attribute vec3 aNormal; attribute vec4 aColor; attribute vec2 aUv;
uniform mat4 uMvp; uniform mat4 uModel; uniform float uPointSize;
varying vec3 vNormal; varying vec4 vColor; varying vec2 vUv; varying vec3 vWorld;
void main(){ vec4 world=uModel*vec4(aPosition,1.0); vWorld=world.xyz; vNormal=mat3(uModel)*aNormal; vColor=aColor; vUv=aUv; gl_Position=uMvp*vec4(aPosition,1.0); gl_PointSize=uPointSize; }`;
export const skinTextureVertexShader = `
precision highp float;
attribute vec3 aPosition; attribute vec3 aNormal; attribute vec4 aColor; attribute vec2 aUv; attribute vec4 aJoints; attribute vec4 aWeights;
uniform mat4 uMvp; uniform mat4 uModel; uniform sampler2D uJointTexture; uniform float uJointTextureHeight; uniform float uPointSize;
varying vec3 vNormal; varying vec4 vColor; varying vec2 vUv; varying vec3 vWorld;
mat4 jointAt(float j){ float y=(j+.5)/uJointTextureHeight; return mat4(texture2D(uJointTexture,vec2(.125,y)),texture2D(uJointTexture,vec2(.375,y)),texture2D(uJointTexture,vec2(.625,y)),texture2D(uJointTexture,vec2(.875,y))); }
void main(){ vec4 w=aWeights; float s=w.x+w.y+w.z+w.w; if(s>0.0)w/=s; mat4 skin=jointAt(aJoints.x)*w.x+jointAt(aJoints.y)*w.y+jointAt(aJoints.z)*w.z+jointAt(aJoints.w)*w.w; vec4 world=uModel*skin*vec4(aPosition,1.0); vWorld=world.xyz; vNormal=mat3(uModel*skin)*aNormal; vColor=aColor; vUv=aUv; gl_Position=uMvp*skin*vec4(aPosition,1.0); gl_PointSize=uPointSize; }`;
export function uniformSkinVertexShader(maxJoints){ return `
attribute vec3 aPosition; attribute vec3 aNormal; attribute vec4 aColor; attribute vec2 aUv; attribute vec4 aJoints; attribute vec4 aWeights;
uniform mat4 uMvp; uniform mat4 uModel; uniform mat4 uJointMatrices[${maxJoints}]; uniform float uPointSize;
varying vec3 vNormal; varying vec4 vColor; varying vec2 vUv; varying vec3 vWorld;
void main(){ vec4 w=aWeights; float s=w.x+w.y+w.z+w.w; if(s>0.0)w/=s; mat4 skin=uJointMatrices[int(aJoints.x)]*w.x+uJointMatrices[int(aJoints.y)]*w.y+uJointMatrices[int(aJoints.z)]*w.z+uJointMatrices[int(aJoints.w)]*w.w; vec4 world=uModel*skin*vec4(aPosition,1.0); vWorld=world.xyz; vNormal=mat3(uModel*skin)*aNormal; vColor=aColor; vUv=aUv; gl_Position=uMvp*skin*vec4(aPosition,1.0); gl_PointSize=uPointSize; }`; }
