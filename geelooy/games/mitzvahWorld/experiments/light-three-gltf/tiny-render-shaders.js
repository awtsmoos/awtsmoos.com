// B"H
/** Shader scrolls: bright sun, readable textures, and real grass/dirt-grass-3 mix(). */
export const fragmentShader = `
precision mediump float;
varying vec3 vNormal; varying vec4 vColor; varying vec2 vUv; varying vec3 vWorld;
uniform vec4 uColor; uniform float uAlphaCutoff; uniform int uAlphaMode; uniform int uLit;
uniform int uUseMap; uniform sampler2D uMap; uniform vec2 uMapRepeat;
uniform int uUseMixMap; uniform sampler2D uMixMap; uniform vec2 uMixRepeat; uniform float uMixStrength;
vec2 repeatUv(vec2 uv, vec2 rep){ return fract(uv*rep); }
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y); }
float blob(vec2 p, vec2 c, float r){ return 1.0-smoothstep(r*.35,r,length(p-c)); }
float terrainPointMask(vec2 p){
  float m=0.0;
  m=max(m,blob(p,vec2(18.0,-14.7),7.5));
  m=max(m,blob(p,vec2(4.0,-5.0),5.5));
  m=max(m,blob(p,vec2(-5.5,-20.6),4.8));
  m=max(m,blob(p,vec2(-3.6,6.4),4.0));
  m=max(m,blob(p,vec2(8.0,6.6),4.0));
  return m;
}
void main(){
  vec4 texel=vec4(1.0); if(uUseMap==1) texel=texture2D(uMap,repeatUv(vUv,uMapRepeat));
  if(uUseMixMap==1 && uMixStrength>0.001){
    vec4 dirt=texture2D(uMixMap,repeatUv(vUv,uMixRepeat));
    float broad=noise(vWorld.xz*.060+vec2(3.0,8.0));
    float clump=noise(vWorld.xz*.165+vec2(13.0,2.0));
    float roadish=1.0-smoothstep(.20,.62,abs(sin(vWorld.x*.14+noise(vWorld.xz*.05)*3.0)+cos(vWorld.z*.11)*.42));
    float pointMask=terrainPointMask(vWorld.xz);
    float slope=1.0-clamp(normalize(vNormal).y,0.0,1.0);
    float mask=clamp(.10 + pointMask*.72 + smoothstep(.46,.62,broad*.36+clump*.30+roadish*.20+slope*.30),0.0,1.0);
    vec3 earthy=mix(dirt.rgb,vec3(.36,.25,.14),.08);
    texel.rgb=mix(texel.rgb,earthy,clamp(mask*uMixStrength,0.0,.96));
  }
  vec4 mixedColor=uColor*vColor*texel; if(uAlphaMode==1&&mixedColor.a<uAlphaCutoff)discard; if(mixedColor.a<=.003)discard;
  vec3 rgb=mixedColor.rgb; if(uLit==1){
    vec3 normal=normalize(vNormal);
    vec3 sun=normalize(vec3(-.38,.91,.26)); vec3 fill=normalize(vec3(.55,.38,-.72));
    float key=max(dot(normal,sun),0.0), f=max(dot(normal,fill),0.0), sky=normal.y*.5+.5;
    vec3 warmSun=vec3(1.10,1.04,.86), coolSky=vec3(.55,.72,1.00);
    rgb = rgb*(.72 + key*1.05)*mix(vec3(1.0),warmSun,key*.36) + rgb*(f*.24 + sky*.20)*coolSky;
    rgb = mix(rgb, sqrt(max(rgb, vec3(0.0))), .16);
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
