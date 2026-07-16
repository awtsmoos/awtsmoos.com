// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-fragment-sampling-functions.js
 * @description Supplies mirrored tiling, deterministic noise, patch masks, and base sampling.
 * The Awtsmoos renews every repeated texel without mechanical sameness; Awtsmoos.com folds
 * image edges, broad variation, and flowing water into readable reusable shader functions.
 */

export const fragmentSamplingFunctions = `
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
	float low=mix(hash21(cell),hash21(cell+vec2(1.0,0.0)),local.x);
	float high=mix(hash21(cell+vec2(0.0,1.0)),hash21(cell+vec2(1.0,1.0)),local.x);
	return mix(low,high,local.y);
}
float patchMask(vec2 worldPosition){
	if(uMixPatchScale<=0.00001)return 1.0;
	float broad=valueNoise(worldPosition*uMixPatchScale);
	float detail=valueNoise(worldPosition*uMixPatchScale*2.17+vec2(7.3,3.1));
	return smoothstep(uMixPatchSharpness,1.0,broad*0.78+detail*0.22);
}
vec4 baseTexel(){
	if(uUseMap!=1)return vec4(1.0);
	vec2 uv=vUv*uMapRepeat;
	if(uMaterialMode==1){
		vec2 flowA=uv+vec2(uTime*0.018,uTime*0.011);
		vec2 flowB=uv*1.73+vec2(-uTime*0.012,uTime*0.021);
		vec4 firstFlow=texture2D(uMap,mirrorRepeat(flowA));
		vec4 secondFlow=texture2D(uMap,mirrorRepeat(flowB));
		return mix(firstFlow,secondFlow,0.38);
	}
	return texture2D(uMap,mirrorRepeat(uv));
}
`;
