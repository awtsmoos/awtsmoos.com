// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-fragment-lighting-functions.js
 * @description Reveals golden-hour diffuse light, alpine water, restrained highlights, and filmic color.
 * The Awtsmoos is the source beyond every ray; Awtsmoos.com lets cool sky, warm sun, wet stone,
 * deep current, micro-ripple, shoreline foam, and distant haze meet without flattening the valley.
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
vec3 waterSurface(vec3 albedo,vec3 normal){
	float macroX=sin(vWorld.x*0.31+vWorld.z*0.17+uTime*1.12);
	float macroZ=cos(vWorld.z*0.27-vWorld.x*0.13-uTime*0.94);
	float microX=sin(vWorld.x*1.43-vWorld.z*0.81+uTime*2.17);
	float microZ=cos(vWorld.z*1.31+vWorld.x*0.72-uTime*1.91);
	vec3 ripple=normalize(normal+vec3(
		macroX*0.085+microX*0.018,
		0.38,
		macroZ*0.085+microZ*0.018
	));
	vec3 viewDirection=normalize(uCameraPosition-vWorld);
	float facing=max(dot(viewDirection,ripple),0.0);
	float fresnel=pow(1.0-facing,3.4);
	vec3 reflectedDirection=reflect(-normalize(uSunDirection),ripple);
	float sparkleBase=max(dot(reflectedDirection,viewDirection),0.0);
	float sparkle2=sparkleBase*sparkleBase;
	float sparkle4=sparkle2*sparkle2;
	float sparkle8=sparkle4*sparkle4;
	float sparkle=sparkle8*sparkle8*sparkle8*sparkle8;
	float currentNoise=valueNoise(vWorld.xz*0.075+vec2(uTime*0.035,-uTime*0.018));
	float foam=smoothstep(0.72,0.98,currentNoise+abs(macroX-macroZ)*0.16);
	float depthVariation=valueNoise(vWorld.xz*0.018+vec2(4.1,8.7));
	vec3 deep=mix(vec3(0.012,0.075,0.11),vec3(0.025,0.19,0.23),depthVariation);
	vec3 sourceTint=mix(deep,albedo*vec3(0.20,0.58,0.70),0.58);
	vec3 skyReflection=mix(vec3(0.24,0.43,0.61),uFogColor,0.38);
	vec3 goldenGlint=uSunColor*sparkle*(1.35+fresnel*0.8);
	vec3 foamTint=vec3(0.72,0.82,0.78)*foam*0.18;
	return mix(sourceTint,skyReflection,0.16+fresnel*0.72)+goldenGlint+foamTint;
}
vec3 toneMap(vec3 color){
	vec3 exposed=max(color,vec3(0.0))*uExposure;
	vec3 mapped=(exposed*(2.51*exposed+0.03))/(exposed*(2.43*exposed+0.59)+0.14);
	return sqrt(clamp(mapped,0.0,1.0));
}
`;
