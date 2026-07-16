// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-unified-shaders.js
 * @description One lossless vertex garment for rigid plants, stones, and animated Chassidim.
 * The Awtsmoos is not divided by stillness or motion; Awtsmoos.com keeps both revelations
 * inside one linked program so the driver need not cross an artificial boundary each frame.
 */

const declarations = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
attribute vec2 aUv;
attribute vec4 aJoints;
attribute vec4 aWeights;
uniform mat4 uMvp;
uniform mat4 uModel;
uniform float uPointSize;
uniform int uUseSkin;
uniform int uGrassReactive;
uniform int uWindMode;
uniform vec3 uInteractor;
uniform float uGrassRadius;
uniform float uGrassWindStrength;
uniform float uTime;
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vUv;
varying vec3 vWorld;
`;

const mainFunction = `
void main(){
	mat4 skin=mat4(1.0);
	if(uUseSkin==1){
		vec4 weights=aWeights;
		float sum=weights.x+weights.y+weights.z+weights.w;
		if(sum>0.0)weights/=sum;
		skin=jointAt(aJoints.x)*weights.x
			+jointAt(aJoints.y)*weights.y
			+jointAt(aJoints.z)*weights.z
			+jointAt(aJoints.w)*weights.w;
	}
	vec3 localPosition=aPosition;
	vec4 baseWorld=uModel*vec4(aPosition,1.0);
	float heightFactor=clamp(aUv.y,0.0,1.0);
	if(uUseSkin==0&&uGrassReactive==1){
		vec2 difference=baseWorld.xz-uInteractor.xz;
		float distanceToPlayer=length(difference);
		vec2 away=distanceToPlayer>0.001?difference/distanceToPlayer:vec2(1.0,0.0);
		float influence=1.0-smoothstep(0.0,uGrassRadius,distanceToPlayer);
		localPosition.xz+=away*influence*heightFactor*0.72;
	}
	if(uUseSkin==0&&(uGrassReactive==1||uWindMode==1)){
		float phase=baseWorld.x*0.31+baseWorld.z*0.23+aPosition.y*0.17;
		float wind=sin(uTime*1.35+phase)+sin(uTime*0.71+phase*1.83)*0.36;
		float strength=uGrassReactive==1?uGrassWindStrength:0.055;
		localPosition.x+=wind*strength*(0.32+heightFactor*heightFactor);
		localPosition.z+=wind*strength*0.34*(0.25+heightFactor);
	}
	vec4 local=skin*vec4(localPosition,1.0);
	vec4 world=uModel*local;
	vWorld=world.xyz;
	vNormal=mat3(uModel*skin)*aNormal;
	vColor=aColor;
	vUv=aUv;
	gl_Position=uMvp*local;
	gl_PointSize=uPointSize;
}`;

export function unifiedUniformVertexShader(maxJoints) {
	return `${declarations}
uniform mat4 uJointMatrices[${maxJoints}];
mat4 jointAt(float joint){return uJointMatrices[int(joint)];}
${mainFunction}`;
}

export const unifiedTextureVertexShader = `${declarations}
precision highp float;
uniform sampler2D uJointTexture;
uniform float uJointTextureHeight;
mat4 jointAt(float joint){
	float y=(joint+0.5)/uJointTextureHeight;
	return mat4(
		texture2D(uJointTexture,vec2(0.125,y)),
		texture2D(uJointTexture,vec2(0.375,y)),
		texture2D(uJointTexture,vec2(0.625,y)),
		texture2D(uJointTexture,vec2(0.875,y))
	);
}
${mainFunction}`;
