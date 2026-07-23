// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-fragment-sampling-functions.js
 * @description Supplies mirrored tiling, noise, patches, and recipe-driven four-flow water.
 * The Awtsmoos renews every texel without multiplying debt; Awtsmoos.com lets five water
 * vessels move through four authored currents while preserving the two-fetch ceiling.
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
vec2 waterWarp(vec2 flow,float phase){
	float ripple=sin(dot(vWorld.xz,vec2(0.031,0.027))*7.0+uTime*phase);
	return flow*ripple*(uWaterWaveProfile.x*0.75+uWaterWaveProfile.y*2.4);
}
vec2 primaryWaterFlow(){
	vec2 uv=vUv*uMapRepeat;
	if(uWaterMode==2)return uv+uWaterFlowA*uTime*8.0+waterWarp(uWaterFlowC,1.7);
	if(uWaterMode==3)return uv+vec2(uWaterFlowA.x*3.0,-abs(uWaterFlowA.y)*42.0)*uTime+waterWarp(uWaterFlowC,5.4);
	if(uWaterMode==4)return uv+uWaterFlowB*uTime*14.0+waterWarp(uWaterFlowD,4.1);
	if(uWaterMode==5)return uv+uWaterFlowD*uTime*6.0+waterWarp(uWaterFlowC,2.3);
	return uv+uWaterFlowA*uTime*2.0+waterWarp(uWaterFlowC,0.8);
}
vec2 detailWaterFlow(){
	vec2 uv=vUv*uMixRepeat;
	if(uWaterMode==2)return uv*1.37+uWaterFlowB*uTime*10.0+waterWarp(uWaterFlowD,2.4);
	if(uWaterMode==3)return uv*1.61+vec2(uWaterFlowB.x*5.0,-abs(uWaterFlowB.y)*46.0)*uTime+waterWarp(uWaterFlowD,6.1);
	if(uWaterMode==4)return uv*1.42+uWaterFlowC*uTime*15.0+waterWarp(uWaterFlowA,4.8);
	if(uWaterMode==5)return uv*1.28+uWaterFlowC*uTime*7.0+waterWarp(uWaterFlowB,2.9);
	return uv*1.53+uWaterFlowB*uTime*2.4+waterWarp(uWaterFlowD,1.1);
}
vec4 waterTexel(){
	vec4 primary=uUseMap==1?texture2D(uMap,mirrorRepeat(primaryWaterFlow())):vec4(1.0);
	if(uUseMixMap!=1)return primary;
	vec4 detail=texture2D(uMixMap,mirrorRepeat(detailWaterFlow()));
	float noiseScale=max(0.012,uWaterFoamProfile.y*0.5);
	float current=valueNoise(vWorld.xz*noiseScale+uWaterFlowC*uTime*3.0);
	float strength=clamp(uMixStrength*(0.48+current*(0.24+uWaterWaveProfile.y*2.0)),0.0,0.72);
	return mix(primary,detail,strength);
}
vec4 baseTexel(){
	if(uMaterialMode==1)return waterTexel();
	if(uUseMap!=1)return vec4(1.0);
	return texture2D(uMap,mirrorRepeat(vUv*uMapRepeat));
}
`;
