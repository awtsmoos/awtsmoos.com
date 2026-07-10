// B"H
/** Shader scrolls: bright sun, visible multi-dirt mix(), mirror repeat, and softened shade. */
export const fragmentShader = `
precision mediump float;
varying vec3 vNormal; varying vec4 vColor; varying vec2 vUv; varying vec3 vWorld;
uniform vec4 uColor; uniform float uAlphaCutoff; uniform int uAlphaMode; uniform int uLit;
uniform int uUseMap; uniform sampler2D uMap; uniform vec2 uMapRepeat;
uniform int uUseMixMap; uniform sampler2D uMixMap; uniform vec2 uMixRepeat; uniform float uMixStrength;
vec2 repeatUv(vec2 uv, vec2 rep){ return fract(uv*rep); }
vec2 mirrorUv(vec2 uv, vec2 rep){ vec2 q=fract(uv*rep*.5)*2.0; return 1.0-abs(q-1.0); }
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y); }
float blob(vec2 p, vec2 c, float r){ return 1.0-smoothstep(r*.25,r,length(p-c)); }
float terrainPointMask(vec2 p){
  float m=0.0;
  m=max(m,blob(p,vec2(19.0,-13.9),8.5)); m=max(m,blob(p,vec2(5.0,-4.5),5.6)); m=max(m,blob(p,vec2(-5.5,-20.6),5.6));
  m=max(m,blob(p,vec2(-9.5,6.5),4.7)); m=max(m,blob(p,vec2(8.0,6.6),4.9)); m=max(m,blob(p,vec2(-16.0,-8.0),6.5));
  m=max(m,blob(p,vec2(18.0,10.5),7.0)); m=max(m,blob(p,vec2(-24.0,22.0),8.0)); m=max(m,blob(p,vec2(27.0,-25.0),8.0));
  return m;
}
void main(){
  vec4 texel=vec4(1.0); if(uUseMap==1) texel=texture2D(uMap,repeatUv(vUv,uMapRepeat));
  if(uUseMixMap==1 && uMixStrength>0.001){
    vec4 dirt=texture2D(uMixMap,mirrorUv(vUv,uMixRepeat));
    float broad=noise(vWorld.xz*.045+vec2(3.0,8.0)); float clump=noise(vWorld.xz*.14+vec2(13.0,2.0)); float fine=noise(vWorld.xz*.42+vec2(9.0,31.0));
    float pointMask=terrainPointMask(vWorld.xz); float slope=1.0-clamp(normalize(vNormal).y,0.0,1.0);
    float veins=smoothstep(.35,.80,abs(sin(vWorld.x*.11+noise(vWorld.xz*.05)*4.5)+cos(vWorld.z*.13))*.45+fine*.35);
    float mask=clamp(.18 + pointMask*.74 + smoothstep(.42,.70,broad*.34+clump*.36+veins*.28+slope*.32),0.0,1.0);
    vec3 earthy=mix(dirt.rgb,vec3(.38,.27,.15),.10);
    texel.rgb=mix(texel.rgb,earthy,clamp(mask*uMixStrength,0.0,.98));
  }
  vec4 mixedColor=uColor*vColor*texel; if(uAlphaMode==1&&mixedColor.a<uAlphaCutoff)discard; if(mixedColor.a<=.003)discard;
  vec3 rgb=mixedColor.rgb; if(uLit==1){
    vec3 normal=normalize(vNormal); vec3 sun=normalize(vec3(-.38,.91,.26)); vec3 fill=normalize(vec3(.55,.42,-.72));
    float key=max(dot(normal,sun),0.0), f=max(dot(normal,fill),0.0), sky=normal.y*.5+.5;
    vec3 warmSun=vec3(1.18,1.09,.86), coolSky=vec3(.60,.75,1.00);
    rgb = rgb*(.86 + key*1.18)*mix(vec3(1.0),warmSun,key*.42) + rgb*(f*.30 + sky*.24)*coolSky;
    rgb = mix(rgb, sqrt(max(rgb, vec3(0.0))), .22);
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
