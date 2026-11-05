// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-fragment-water-lighting-functions.js
 * @description Gives stream, waterfall, foam, mist, and lake physically distinct ripple, bank-depth, foam, and reflection response.
 * The Awtsmoos carries one water from shallow bank through dark thalweg and white cascade; Awtsmoos.com
 * reads the river's actual cross-section UV so depth is no longer a random color field detached from the channel below.
 */

export const fragmentWaterLightingFunctions = `
vec3 waterRippleNormal(vec3 normal){
	float flowSpeed=max(0.45,(length(uWaterFlowA)+length(uWaterFlowB))*28.0);
	float scale=max(0.12,uWaterWaveProfile.x*6.0+uWaterWaveProfile.y*10.0);
	float first=sin((vWorld.x+vWorld.z*0.54)*scale+uTime*flowSpeed);
	float second=cos((vWorld.z-vWorld.x*0.38)*scale*1.73-uTime*flowSpeed*0.81);
	if(uWaterMode==3){
		first=sin(vUv.x*34.0+vUv.y*9.0-uTime*flowSpeed*2.1);
		second=cos(vUv.x*17.0-vUv.y*15.0+uTime*flowSpeed*1.45);
	}
	float strength=clamp(uWaterWaveProfile.x*0.72+uWaterWaveProfile.y*1.8,0.03,0.18);
	return normalize(normal+vec3(first*strength,0.34,second*strength));
}
float waterFoamMask(){
	float noiseScale=max(0.012,uWaterFoamProfile.y);
	float current=valueNoise(vWorld.xz*noiseScale+uWaterFlowD*uTime*4.0);
	float threshold=clamp(uWaterFoamProfile.z,0.02,0.96);
	float band=max(0.025,uWaterFoamProfile.x*0.18);
	float procedural=smoothstep(threshold,min(0.999,threshold+band),current);
	if(uWaterMode==2){
		float bank=smoothstep(0.56,0.98,abs(vUv.y*2.0-1.0));
		float streak=smoothstep(0.62,0.94,valueNoise(vec2(vUv.x*0.9-uTime*0.7,vUv.y*8.0)));
		return clamp(bank*uWaterFoamProfile.x+procedural*0.24+streak*bank*0.18,0.0,1.0);
	}
	if(uWaterMode==3){
		float crest=1.0-smoothstep(0.02,0.20,vUv.y);
		float impact=smoothstep(0.70,1.0,vUv.y);
		float streak=smoothstep(0.62,0.98,sin(vUv.x*29.0-vUv.y*11.0+uTime*7.2)*0.5+0.5);
		return clamp(crest*0.36+impact*uWaterFoamProfile.x+streak*0.18,0.0,1.0);
	}
	if(uWaterMode==4)return clamp(0.46+current*0.34,0.0,1.0);
	if(uWaterMode==5)return smoothstep(0.40,0.90,current)*(1.0-vUv.y*0.48);
	return procedural*uWaterFoamProfile.x;
}
float waterShallowMix(){
	float noise=valueNoise(vWorld.xz*0.021+vec2(4.1,8.7));
	if(uWaterMode==2){
		float bank=clamp(abs(vUv.y*2.0-1.0),0.0,1.0);
		float shelf=smoothstep(0.34,0.92,bank);
		return clamp(shelf*(0.72+uWaterWaveProfile.z*0.24)+noise*0.12,0.0,1.0);
	}
	return clamp(noise*uWaterWaveProfile.z,0.0,1.0);
}
vec3 waterSurface(vec3 albedo,vec3 normal){
	float foam=waterFoamMask();
	if(uWaterMode==5){
		vec3 mist=mix(uWaterDeepColor,uWaterShallowColor,foam);
		return mix(albedo*0.34,mist,0.68);
	}
	vec3 ripple=waterRippleNormal(normal);
	vec3 viewDirection=normalize(uCameraPosition-vWorld);
	float facing=max(dot(viewDirection,ripple),0.0);
	float fresnelExponent=mix(4.2,1.8,clamp(uWaterReflectionProfile.x,0.0,1.0));
	float fresnel=pow(1.0-facing,fresnelExponent)*uWaterReflectionProfile.x;
	vec3 reflectedDirection=reflect(-normalize(uSunDirection),ripple);
	float sparkleBase=max(dot(reflectedDirection,viewDirection),0.0);
	float sparkle2=sparkleBase*sparkleBase;
	float sparkle4=sparkle2*sparkle2;
	float sparkle8=sparkle4*sparkle4;
	float sparkle=sparkle8*sparkle8*sparkle8;
	vec3 deep=mix(uWaterDeepColor,uWaterShallowColor,waterShallowMix());
	vec3 refractedAlbedo=albedo*mix(uWaterShallowColor,vec3(1.0),0.34);
	float sourceShare=clamp(uWaterWaveProfile.w+0.18,0.18,0.72);
	vec3 sourceTint=mix(deep,refractedAlbedo,sourceShare);
	vec3 sky=mix(vec3(0.28,0.48,0.66),uFogColor,0.34);
	float skyStrength=clamp(uWaterReflectionProfile.y,0.0,1.0);
	vec3 glint=uSunColor*sparkle*uWaterReflectionProfile.z*0.72;
	vec3 foamTint=vec3(0.84,0.93,0.88)*foam*(uWaterMode==4?0.60:0.28);
	return mix(sourceTint,sky,0.18+fresnel*skyStrength*0.52)+glint+foamTint;
}
`;
