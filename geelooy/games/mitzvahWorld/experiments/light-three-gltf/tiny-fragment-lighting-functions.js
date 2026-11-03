// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-fragment-lighting-functions.js
 * @description Physically motivated daylight, sky/earth bounce, and contrast-preserving filmic exposure.
 * The Awtsmoos reveals a coat in shade beneath a shining sky;
 * Awtsmoos.com lets reflected daylight reach its fabric, so its folds do not die.
 * These lights illuminate real albedo and roughness; they never make surfaces emissive.
 */

import { fragmentWaterLightingFunctions } from './tiny-fragment-water-lighting-functions.js';

export const fragmentLightingFunctions = `
vec3 litSurface(vec3 albedo,vec3 normal){
	vec3 sun=normalize(uSunDirection);
	vec3 viewDirection=normalize(uCameraPosition-vWorld);
	vec3 halfDirection=normalize(sun+viewDirection);
	float sunFacing=dot(normal,sun);
	float direct=max(sunFacing,0.0);
	float wrapped=max((sunFacing+0.28)/1.28,0.0);
	float skyFacing=clamp(normal.y*0.5+0.5,0.0,1.0);
	float horizonFacing=1.0-abs(normal.y);
	float roughness=clamp(uRoughness,0.03,1.0);
	float metalness=clamp(uMetalness,0.0,1.0);
	float specPower=mix(720.0,18.0,roughness);
	float highlightBase=max(dot(normal,halfDirection),0.0);
	float highlight=pow(highlightBase,specPower)*direct;
	float viewDot=max(dot(normal,viewDirection),0.0);
	float fresnel=0.04+0.96*pow(1.0-viewDot,5.0);
	vec3 specTint=mix(vec3(1.0),albedo,metalness);
	float specEnergy=mix(0.55,1.35,1.0-roughness);
	float shadow=shadowOcclusion(vWorld,normal);
	vec3 sunlight=uSunColor*(direct*1.04+wrapped*0.22)*shadow;
	vec3 directSpecular=uSunColor*highlight*fresnel*specEnergy*specTint*shadow;
	vec3 diffuseAlbedo=mix(albedo,vec3(0.0),metalness);
	/* An open blue sky still illuminates clothing and terrain when they face away from the sun. */
	vec3 coolSky=vec3(0.39,0.54,0.76)*skyFacing;
	vec3 earthBounce=vec3(0.43,0.31,0.19)*(1.0-skyFacing);
	vec3 horizonFill=vec3(0.31,0.27,0.23)*horizonFacing;
	vec3 daylightAmbient=max(uAmbient,vec3(0.66,0.72,0.80));
	vec3 irradiance=daylightAmbient+coolSky*0.72+earthBounce*0.43+horizonFill*0.34+sunlight;
	vec3 diffuse=diffuseAlbedo*irradiance;
	/* Rough black fabric reflects some sky light as a dielectric, not as emissive color. */
	vec3 skyReflection=vec3(0.34,0.46,0.61)*mix(0.10,0.30,1.0-roughness)*fresnel;
	vec3 environment=skyReflection*specTint;
	float envStrength=(1.0-roughness)*(1.0-roughness);
	if(envStrength>0.01){
		vec3 reflectDirection=reflect(-viewDirection,normal);
		environment+=skySurface(reflectDirection)*envStrength*fresnel*mix(0.35,1.0,metalness);
	}
	return diffuse+directSpecular+environment;
}
${fragmentWaterLightingFunctions}
vec3 toneMap(vec3 color){
	vec3 exposed=max(color,vec3(0.0))*uExposure;
	vec3 mapped=(exposed*(2.51*exposed+0.03))/(exposed*(2.43*exposed+0.59)+0.14);
	return sqrt(clamp(mapped,0.0,1.0));
}
`;
