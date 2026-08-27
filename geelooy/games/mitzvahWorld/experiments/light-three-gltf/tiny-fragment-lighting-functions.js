// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-fragment-lighting-functions.js
 * @description Reveals golden alpine light and recipe-driven living water at bounded cost.
 * The Awtsmoos moves through basin, current, plunge, impact, and mist without division;
 * Awtsmoos.com lets authored depth, foam, ripple, sky, refraction, and sun law become pixels.
 */

export const fragmentLightingFunctions = `
vec3 litSurface(vec3 albedo,vec3 normal){
	vec3 sun=uSunDirection;
	vec3 viewDirection=normalize(uCameraPosition-vWorld);
	vec3 halfDirection=normalize(sun+viewDirection);
	float direct=max(dot(normal,sun),0.0);
	float wrapped=max((dot(normal,sun)+0.24)/1.24,0.0);
	float skyFacing=normal.y*0.5+0.5;
	float horizonFacing=1.0-abs(normal.y);
	float highlightBase=max(dot(normal,halfDirection),0.0);
	float highlight2=highlightBase*highlightBase;
	float highlight4=highlight2*highlight2;
	float highlight8=highlight4*highlight4;
	float highlight=highlight8*highlight8*highlight8*direct;
	vec3 coolSky=vec3(0.24,0.38,0.58)*skyFacing;
	vec3 earthBounce=vec3(0.24,0.15,0.075)*(1.0-skyFacing);
	vec3 horizonFill=vec3(0.16,0.11,0.075)*horizonFacing;
	vec3 sunlight=uSunColor*(direct*0.88+wrapped*0.14);
	vec3 specular=uSunColor*highlight*(0.035+max(max(albedo.r,albedo.g),albedo.b)*0.045);
	return albedo*(uAmbient+coolSky*0.30+earthBounce*0.16+horizonFill*0.10+sunlight)+specular;
}
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
		float bank=smoothstep(0.58,0.97,abs(vUv.y*2.0-1.0));
		return clamp(bank*uWaterFoamProfile.x+procedural*0.36,0.0,1.0);
	}
	if(uWaterMode==3){
		float crest=1.0-smoothstep(0.02,0.20,vUv.y);
		float impact=smoothstep(0.70,1.0,vUv.y);
		float streak=smoothstep(0.62,0.98,sin(vUv.x*29.0-vUv.y*11.0+uTime*7.2)*0.5+0.5);
		return clamp(crest*0.42+impact*uWaterFoamProfile.x+streak*0.24,0.0,1.0);
	}
	if(uWaterMode==4)return clamp(0.58+current*0.42,0.0,1.0);
	if(uWaterMode==5)return smoothstep(0.36,0.88,current)*(1.0-vUv.y*0.42);
	return procedural*uWaterFoamProfile.x;
}
vec3 waterSurface(vec3 albedo,vec3 normal){
	float foam=waterFoamMask();
	if(uWaterMode==5){
		vec3 mist=mix(uWaterDeepColor,uWaterShallowColor,foam);
		return mix(albedo*0.28,mist,0.76);
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
	float depthNoise=valueNoise(vWorld.xz*0.021+vec2(4.1,8.7));
	float depthMix=clamp(depthNoise*uWaterWaveProfile.z,0.0,1.0);
	vec3 deep=mix(uWaterDeepColor,uWaterShallowColor,depthMix);
	vec3 refractedAlbedo=albedo*mix(uWaterShallowColor,vec3(1.0),0.28);
	vec3 sourceTint=mix(deep,refractedAlbedo,clamp(uWaterWaveProfile.w,0.0,0.88));
	vec3 sky=mix(vec3(0.24,0.43,0.61),uFogColor,0.38);
	float skyStrength=clamp(uWaterReflectionProfile.y,0.0,1.0);
	vec3 glint=uSunColor*sparkle*uWaterReflectionProfile.z;
	vec3 foamTint=vec3(0.82,0.94,0.91)*foam*(uWaterMode==4?0.78:0.34);
	return mix(sourceTint,sky,0.08+fresnel*skyStrength*0.78)+glint+foamTint;
}
vec3 toneMap(vec3 color){
	vec3 exposed=max(color,vec3(0.0))*uExposure;
	vec3 mapped=(exposed*(2.51*exposed+0.03))/(exposed*(2.43*exposed+0.59)+0.14);
	return sqrt(clamp(mapped,0.0,1.0));
}
`;
