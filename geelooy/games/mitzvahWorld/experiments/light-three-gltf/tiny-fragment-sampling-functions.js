// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-fragment-sampling-functions.js
 * @description Supplies mirrored tiling, noise, patch masks, and dual-source flowing water.
 * The Awtsmoos renews every repeated texel without mechanical sameness; Awtsmoos.com folds
 * canonical image edges and lets lake depth meet stream detail through two moving source maps.
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
vec4 waterTexel(){
	vec2 primaryUv=vUv*uMapRepeat;
	vec2 flowA=primaryUv+vec2(uTime*0.018,uTime*0.011);
	vec2 flowB=primaryUv*1.73+vec2(-uTime*0.012,uTime*0.021);
	vec4 primaryA=uUseMap==1?texture2D(uMap,mirrorRepeat(flowA)):vec4(1.0);
	vec4 primaryB=uUseMap==1?texture2D(uMap,mirrorRepeat(flowB)):primaryA;
	vec4 primary=mix(primaryA,primaryB,0.38);
	if(uUseMixMap!=1)return primary;
	vec2 detailUv=vUv*uMixRepeat;
	vec4 detailA=texture2D(uMixMap,mirrorRepeat(detailUv+vec2(-uTime*0.027,uTime*0.016)));
	vec4 detailB=texture2D(uMixMap,mirrorRepeat(detailUv*1.41+vec2(uTime*0.013,-uTime*0.022)));
	float current=valueNoise(vWorld.xz*0.055+vec2(uTime*0.04,0.0));
	return mix(primary,mix(detailA,detailB,0.46),uMixStrength*(0.42+current*0.36));
}
vec4 baseTexel(){
	if(uMaterialMode==1)return waterTexel();
	if(uUseMap!=1)return vec4(1.0);
	return texture2D(uMap,mirrorRepeat(vUv*uMapRepeat));
}
`;
