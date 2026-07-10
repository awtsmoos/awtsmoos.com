// B"H
/** Shader scrolls: skinned chossid plus obvious grass/dirt mix() patches. */
export const fragmentShader = `
precision mediump float;
varying vec3 vNormal; varying vec4 vColor; varying vec2 vUv; varying vec3 vWorld;
uniform vec4 uColor; uniform float uAlphaCutoff; uniform int uAlphaMode; uniform int uLit;
uniform int uUseMap; uniform sampler2D uMap; uniform vec2 uMapRepeat;
uniform int uUseMixMap; uniform sampler2D uMixMap; uniform vec2 uMixRepeat; uniform float uMixStrength;
vec2 mirrorRepeat(vec2 uv, vec2 rep){ vec2 d=mod(uv*rep,2.0); return 1.0-abs(d-1.0); }
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y); }
void main(){
  vec4 texel=vec4(1.0); if(uUseMap==1) texel=texture2D(uMap,mirrorRepeat(vUv,uMapRepeat));
  if(uUseMixMap==1){
    vec4 dirt=texture2D(uMixMap,mirrorRepeat(vUv,uMixRepeat));
    float broad=noise(vWorld.xz*.045+vec2(9.0,2.0));
    float mid=noise(vWorld.xz*.115+vec2(1.7,8.3));
    float speck=noise(vWorld.xz*.55+vec2(4.0,4.0));
    float slope=1.0-clamp(normalize(vNormal).y,0.0,1.0);
    float trail=1.0-smoothstep(.16,.58,abs(sin(vWorld.x*.095+noise(vWorld.xz*.08)*2.2)+cos(vWorld.z*.075)*.28));
    float mask=smoothstep(.44,.64,broad*.58+mid*.32+speck*.10+slope*.35+trail*.23);
    vec3 earth=mix(dirt.rgb,vec3(.43,.31,.18),.18);
    texel.rgb=mix(texel.rgb,earth,clamp(mask*uMixStrength,0.0,.88));
    texel.a*=dirt.a;
  }
  vec4 mixedColor=uColor*vColor*texel; if(uAlphaMode==1&&mixedColor.a<uAlphaCutoff)discard; if(mixedColor.a<=.003)discard;
  vec3 rgb=mixedColor.rgb; if(uLit==1){ vec3 normal=normalize(vNormal); vec3 key=normalize(vec3(-.45,.82,.35)); vec3 fill=normalize(vec3(.50,.25,-.80)); float k=max(dot(normal,key),0.0), f=max(dot(normal,fill),0.0)*.22, rim=pow(1.0-abs(normal.z),2.0)*.45; float lum=dot(rgb,vec3(.299,.587,.114)); vec3 lifted=mix(vec3(.045,.055,.070),rgb,smoothstep(.025,.25,lum)); rgb=lifted*(.38+k*.78+f)+vec3(.10,.16,.22)*rim; }
  gl_FragColor=vec4(rgb,mixedColor.a);
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
