// B"H
export const skinTextureVertexShader = `
precision highp float;
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
attribute vec2 aUv;
attribute vec4 aJoints;
attribute vec4 aWeights;
uniform mat4 uMvp;
uniform mat4 uModel;
uniform sampler2D uJointTexture;
uniform float uJointTextureHeight;
uniform float uPointSize;
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vUv;
varying vec3 vWorld;
mat4 jointAt(float joint){
	float y=(joint+0.5)/uJointTextureHeight;
	return mat4(
		texture2D(uJointTexture,vec2(0.125,y)),
		texture2D(uJointTexture,vec2(0.375,y)),
		texture2D(uJointTexture,vec2(0.625,y)),
		texture2D(uJointTexture,vec2(0.875,y))
	);
}
void main(){
	vec4 weights=aWeights;
	float sum=weights.x+weights.y+weights.z+weights.w;
	if(sum>0.0)weights/=sum;
	mat4 skin=jointAt(aJoints.x)*weights.x
		+jointAt(aJoints.y)*weights.y
		+jointAt(aJoints.z)*weights.z
		+jointAt(aJoints.w)*weights.w;
	vec4 world=uModel*skin*vec4(aPosition,1.0);
	vWorld=world.xyz;
	vNormal=mat3(uModel*skin)*aNormal;
	vColor=aColor;
	vUv=aUv;
	gl_Position=uMvp*skin*vec4(aPosition,1.0);
	gl_PointSize=uPointSize;
}`;

export function uniformSkinVertexShader(maxJoints){
	return `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
attribute vec2 aUv;
attribute vec4 aJoints;
attribute vec4 aWeights;
uniform mat4 uMvp;
uniform mat4 uModel;
uniform mat4 uJointMatrices[${maxJoints}];
uniform float uPointSize;
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vUv;
varying vec3 vWorld;
void main(){
	vec4 weights=aWeights;
	float sum=weights.x+weights.y+weights.z+weights.w;
	if(sum>0.0)weights/=sum;
	mat4 skin=uJointMatrices[int(aJoints.x)]*weights.x
		+uJointMatrices[int(aJoints.y)]*weights.y
		+uJointMatrices[int(aJoints.z)]*weights.z
		+uJointMatrices[int(aJoints.w)]*weights.w;
	vec4 world=uModel*skin*vec4(aPosition,1.0);
	vWorld=world.xyz;
	vNormal=mat3(uModel*skin)*aNormal;
	vColor=aColor;
	vUv=aUv;
	gl_Position=uMvp*skin*vec4(aPosition,1.0);
	gl_PointSize=uPointSize;
}`;
}
