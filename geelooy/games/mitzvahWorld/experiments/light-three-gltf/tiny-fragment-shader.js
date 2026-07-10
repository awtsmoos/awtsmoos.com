// B"H
export const fragmentShader = `
precision highp float;
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vUv;
varying vec3 vWorld;
uniform vec4 uColor;
uniform float uAlphaCutoff;
uniform int uAlphaMode;
uniform int uLit;
uniform int uUseMap;
uniform sampler2D uMap;
uniform vec2 uMapRepeat;
uniform int uUseMixMap;
uniform sampler2D uMixMap;
uniform vec2 uMixRepeat;
uniform float uMixStrength;
uniform float uMixPatchScale;
uniform float uMixPatchSharpness;
vec2 mirrorRepeat(vec2 value){
	vec2 fraction=fract(value);
	vec2 odd=mod(floor(value),2.0);
	return mix(fraction,1.0-fraction,odd);
}
float hash21(vec2 point){
	point=fract(point*vec2(123.34,456.21));
	point+=dot(point,point+45.32);
	return fract(point.x*point.y);
}
float valueNoise(vec2 point){
	vec2 cell=floor(point);
	vec2 local=fract(point);
	local=local*local*(3.0-2.0*local);
	return mix(
		mix(hash21(cell),hash21(cell+vec2(1.0,0.0)),local.x),
		mix(hash21(cell+vec2(0.0,1.0)),hash21(cell+vec2(1.0,1.0)),local.x),
		local.y
	);
}
float patchMask(vec2 worldPosition){
	if(uMixPatchScale<=0.00001)return 1.0;
	float broad=valueNoise(worldPosition*uMixPatchScale);
	float detail=valueNoise(worldPosition*uMixPatchScale*2.17+vec2(7.3,3.1));
	float field=broad*0.78+detail*0.22;
	return smoothstep(uMixPatchSharpness,1.0,field);
}
void main(){
	vec4 texel=vec4(1.0);
	if(uUseMap==1){
		texel=texture2D(uMap,mirrorRepeat(vUv*uMapRepeat));
	}
	if(uUseMixMap==1&&uMixStrength>0.001){
		vec4 other=texture2D(uMixMap,mirrorRepeat(vUv*uMixRepeat));
		float amount=uMixStrength*patchMask(vWorld.xz);
		texel=mix(texel,other,amount);
	}
	vec4 mixedColor=uColor*vColor*texel;
	if(uAlphaMode==1&&mixedColor.a<uAlphaCutoff)discard;
	if(mixedColor.a<=0.003)discard;
	vec3 rgb=mixedColor.rgb;
	if(uLit==1){
		vec3 normal=normalize(vNormal);
		vec3 sun=normalize(vec3(-0.34,0.93,0.18));
		float key=max(dot(normal,sun),0.0);
		float sky=normal.y*0.5+0.5;
		rgb=rgb*(0.88+key*0.92+sky*0.20)+rgb*vec3(0.12,0.15,0.20)*sky;
	}
	gl_FragColor=vec4(min(rgb,vec3(1.0)),mixedColor.a);
}`;
