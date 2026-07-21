// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-fragment-lighting-functions.js
 * @description Reveals golden alpine light and variant-specific living water at bounded cost.
 * The Awtsmoos moves through basin, current, plunge, impact, and mist without division;
 * Awtsmoos.com lets each vessel refract sky, sun, depth, foam, and motion lawfully.
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
	float speed=uWaterMode==2?2.7:uWaterMode==3?6.8:1.25;
	float scale=uWaterMode==2?0.72:uWaterMode==3?1.35:0.31;
	float first=sin((vWorld.x+vWorld.z*0.54)*scale+uTime*speed);
	float second=cos((vWorld.z-vWorld.x*0.38)*scale*1.73-uTime*speed*0.81);
	if(uWaterMode==3){
		first=sin(vUv.x*34.0+vUv.y*9.0-uTime*8.4);
		second=cos(vUv.x*17.0-vUv.y*15.0+uTime*5.7);
	}
	float strength=uWaterMode==1?0.075:uWaterMode==2?0.12:uWaterMode==3?0.16:0.055;
	return normalize(normal+vec3(first*strength,0.34,second*strength));
}
float waterFoamMask(){
	float current=valueNoise(vWorld.xz*0.11+vec2(uTime*0.09,-uTime*0.04));
	if(uWaterMode==2){
		float bank=smoothstep(0.58,0.97,abs(vUv.y*2.0-1.0));
		return clamp(bank*0.82+smoothstep(0.76,0.98,current)*0.24,0.0,1.0);
	}
	if(uWaterMode==3){
		float crest=1.0-smoothstep(0.02,0.20,vUv.y);
		float impact=smoothstep(0.70,1.0,vUv.y);
		float streak=smoothstep(0.62,0.98,sin(vUv.x*29.0-vUv.y*11.0+uTime*7.2)*0.5+0.5);
		return clamp(crest*0.42+impact*0.78+streak*0.24,0.0,1.0);
	}
	if(uWaterMode==4)return 0.72+current*0.28;
	if(uWaterMode==5)return smoothstep(0.36,0.88,current)*(1.0-vUv.y*0.42);
	return smoothstep(0.82,0.99,current)*0.32;
}
vec3 waterSurface(vec3 albedo,vec3 normal){
	float foam=waterFoamMask();
	if(uWaterMode==5){
		vec3 mist=mix(vec3(0.42,0.66,0.72),vec3(0.88,0.94,0.91),foam);
		return mix(albedo*0.34,mist,0.72);
	}
	vec3 ripple=waterRippleNormal(normal);
	vec3 viewDirection=normalize(uCameraPosition-vWorld);
	float facing=max(dot(viewDirection,ripple),0.0);
	float fresnel=pow(1.0-facing,uWaterMode==3?2.1:3.2);
	vec3 reflectedDirection=reflect(-normalize(uSunDirection),ripple);
	float sparkleBase=max(dot(reflectedDirection,viewDirection),0.0);
	float sparkle2=sparkleBase*sparkleBase;
	float sparkle4=sparkle2*sparkle2;
	float sparkle8=sparkle4*sparkle4;
	float sparkle=sparkle8*sparkle8*sparkle8;
	float depth=valueNoise(vWorld.xz*0.021+vec2(4.1,8.7));
	vec3 deep=mix(vec3(0.008,0.055,0.085),vec3(0.018,0.19,0.23),depth);
	if(uWaterMode==3)deep=vec3(0.035,0.24,0.29);
	if(uWaterMode==4)deep=vec3(0.22,0.48,0.52);
	vec3 sourceTint=mix(deep,albedo*vec3(0.22,0.64,0.76),uWaterMode==3?0.72:0.58);
	vec3 sky=mix(vec3(0.24,0.43,0.61),uFogColor,0.38);
	vec3 glint=uSunColor*sparkle*(uWaterMode==3?1.9:1.45);
	vec3 foamTint=vec3(0.78,0.91,0.88)*foam*(uWaterMode==4?0.72:0.31);
	return mix(sourceTint,sky,0.14+fresnel*0.68)+glint+foamTint;
}
vec3 toneMap(vec3 color){
	vec3 exposed=max(color,vec3(0.0))*uExposure;
	vec3 mapped=(exposed*(2.51*exposed+0.03))/(exposed*(2.43*exposed+0.59)+0.14);
	return sqrt(clamp(mapped,0.0,1.0));
}
`;
