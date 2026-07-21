// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-fragment-sampling-functions.js
 * @description Supplies mirrored tiling, noise, patches, and two-fetch variant water flow.
 * The Awtsmoos renews every texel without multiplying debt; Awtsmoos.com lets lake,
 * river, waterfall, foam, and mist move intensely through at most two image samples.
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
vec2 primaryWaterFlow(){
	vec2 uv=vUv*uMapRepeat;
	if(uWaterMode==2)return uv+vec2(-uTime*0.34,sin(uTime*0.43)*0.035);
	if(uWaterMode==3)return uv+vec2(sin(vUv.y*8.0+uTime)*0.08,-uTime*1.18);
	if(uWaterMode==4)return uv+vec2(-uTime*0.48,uTime*0.07);
	if(uWaterMode==5)return uv+vec2(uTime*0.05,-uTime*0.24);
	return uv+vec2(uTime*0.022,uTime*0.014);
}
vec2 detailWaterFlow(){
	vec2 uv=vUv*uMixRepeat;
	if(uWaterMode==2)return uv*1.37+vec2(-uTime*0.57,-uTime*0.045);
	if(uWaterMode==3)return uv*1.61+vec2(-uTime*0.09,-uTime*1.83);
	if(uWaterMode==4)return uv*1.42+vec2(-uTime*0.71,uTime*0.11);
	if(uWaterMode==5)return uv*1.28+vec2(-uTime*0.04,-uTime*0.37);
	return uv*1.53+vec2(-uTime*0.016,uTime*0.025);
}
vec4 waterTexel(){
	vec4 primary=uUseMap==1?texture2D(uMap,mirrorRepeat(primaryWaterFlow())):vec4(1.0);
	if(uUseMixMap!=1)return primary;
	vec4 detail=texture2D(uMixMap,mirrorRepeat(detailWaterFlow()));
	float current=valueNoise(vWorld.xz*0.055+vec2(uTime*0.04,0.0));
	float strength=clamp(uMixStrength*(0.56+current*0.28),0.0,0.72);
	return mix(primary,detail,strength);
}
vec4 baseTexel(){
	if(uMaterialMode==1)return waterTexel();
	if(uUseMap!=1)return vec4(1.0);
	return texture2D(uMap,mirrorRepeat(vUv*uMapRepeat));
}
`;
