// B"H
/** Grass-only fast path: high precision mirrored sampling without world-noise work. */
export const fragmentShader=`
precision highp float;
varying vec3 vNormal; varying vec4 vColor; varying vec2 vUv; varying vec3 vWorld;
uniform vec4 uColor; uniform float uAlphaCutoff; uniform int uAlphaMode; uniform int uLit;
uniform int uUseMap; uniform sampler2D uMap; uniform vec2 uMapRepeat;
uniform int uUseMixMap; uniform sampler2D uMixMap; uniform vec2 uMixRepeat; uniform float uMixStrength;
vec2 mirrorRepeat(vec2 x){vec2 f=fract(x);vec2 odd=mod(floor(x),2.0);return mix(f,1.0-f,odd);}
void main(){
  vec4 texel=vec4(1.0);
  if(uUseMap==1)texel=texture2D(uMap,mirrorRepeat(vUv*uMapRepeat));
  if(uUseMixMap==1&&uMixStrength>0.001){vec4 other=texture2D(uMixMap,mirrorRepeat(vUv*uMixRepeat));texel=mix(texel,other,uMixStrength);}
  vec4 mixedColor=uColor*vColor*texel;
  if(uAlphaMode==1&&mixedColor.a<uAlphaCutoff)discard;
  if(mixedColor.a<=.003)discard;
  vec3 rgb=mixedColor.rgb;
  if(uLit==1){vec3 normal=normalize(vNormal),sun=normalize(vec3(-.34,.93,.18));float key=max(dot(normal,sun),0.0),sky=normal.y*.5+.5;rgb=rgb*(.88+key*.92+sky*.20)+rgb*vec3(.12,.15,.20)*sky;}
  gl_FragColor=vec4(min(rgb,vec3(1.0)),mixedColor.a);
}`;
export const rigidVertexShader=`
attribute vec3 aPosition; attribute vec3 aNormal; attribute vec4 aColor; attribute vec2 aUv;
uniform mat4 uMvp; uniform mat4 uModel; uniform float uPointSize;
varying vec3 vNormal; varying vec4 vColor; varying vec2 vUv; varying vec3 vWorld;
void main(){vec4 world=uModel*vec4(aPosition,1.0);vWorld=world.xyz;vNormal=mat3(uModel)*aNormal;vColor=aColor;vUv=aUv;gl_Position=uMvp*vec4(aPosition,1.0);gl_PointSize=uPointSize;}`;
export const skinTextureVertexShader=`
precision highp float;
attribute vec3 aPosition; attribute vec3 aNormal; attribute vec4 aColor; attribute vec2 aUv; attribute vec4 aJoints; attribute vec4 aWeights;
uniform mat4 uMvp; uniform mat4 uModel; uniform sampler2D uJointTexture; uniform float uJointTextureHeight; uniform float uPointSize;
varying vec3 vNormal; varying vec4 vColor; varying vec2 vUv; varying vec3 vWorld;
mat4 jointAt(float j){float y=(j+.5)/uJointTextureHeight;return mat4(texture2D(uJointTexture,vec2(.125,y)),texture2D(uJointTexture,vec2(.375,y)),texture2D(uJointTexture,vec2(.625,y)),texture2D(uJointTexture,vec2(.875,y)));}
void main(){vec4 w=aWeights;float s=w.x+w.y+w.z+w.w;if(s>0.0)w/=s;mat4 skin=jointAt(aJoints.x)*w.x+jointAt(aJoints.y)*w.y+jointAt(aJoints.z)*w.z+jointAt(aJoints.w)*w.w;vec4 world=uModel*skin*vec4(aPosition,1.0);vWorld=world.xyz;vNormal=mat3(uModel*skin)*aNormal;vColor=aColor;vUv=aUv;gl_Position=uMvp*skin*vec4(aPosition,1.0);gl_PointSize=uPointSize;}`;
export function uniformSkinVertexShader(maxJoints){return`
attribute vec3 aPosition; attribute vec3 aNormal; attribute vec4 aColor; attribute vec2 aUv; attribute vec4 aJoints; attribute vec4 aWeights;
uniform mat4 uMvp; uniform mat4 uModel; uniform mat4 uJointMatrices[${maxJoints}]; uniform float uPointSize;
varying vec3 vNormal; varying vec4 vColor; varying vec2 vUv; varying vec3 vWorld;
void main(){vec4 w=aWeights;float s=w.x+w.y+w.z+w.w;if(s>0.0)w/=s;mat4 skin=uJointMatrices[int(aJoints.x)]*w.x+uJointMatrices[int(aJoints.y)]*w.y+uJointMatrices[int(aJoints.z)]*w.z+uJointMatrices[int(aJoints.w)]*w.w;vec4 world=uModel*skin*vec4(aPosition,1.0);vWorld=world.xyz;vNormal=mat3(uModel*skin)*aNormal;vColor=aColor;vUv=aUv;gl_Position=uMvp*skin*vec4(aPosition,1.0);gl_PointSize=uPointSize;}`;}
