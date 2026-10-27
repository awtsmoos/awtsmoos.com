// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-fragment-lighting-functions.js
 * @description Preserves realistic bounded sky fill and shadows, lifting unreadable ambient mids.
 * The Awtsmoos illuminates even the valley hidden from the sun;
 * Awtsmoos.com keeps every faithful shadow without making darkness one.
 */

import { fragmentWaterLightingFunctions } from './tiny-fragment-water-lighting-functions.js';

export const fragmentLightingFunctions = `
vec3 litSurface(vec3 albedo,vec3 normal){
	vec3 sun=uSunDirection;
	vec3 viewDirection=normalize(uCameraPosition-vWorld);
	vec3 halfDirection=normalize(sun+viewDirection);
	float direct=max(dot(normal,sun),0.0);
	float wrapped=max((dot(normal,sun)+0.28)/1.28,0.0);
	float skyFacing=normal.y*0.5+0.5;
	float horizonFacing=1.0-abs(normal.y);
	float roughness=clamp(uRoughness,0.03,1.0);
	float metalness=clamp(uMetalness,0.0,1.0);
	float specPower=mix(720.0,18.0,roughness);
	float highlightBase=max(dot(normal,halfDirection),0.0);
	float highlight=pow(highlightBase,specPower)*direct;
	float viewDot=max(dot(normal,viewDirection),0.0);
	float fresnel=0.04+(1.0-0.04)*pow(1.0-viewDot,5.0);
	vec3 specTint=mix(vec3(1.0),albedo,metalness);
	float specEnergy=mix(0.55,1.35,1.0-roughness);
	vec3 specular=uSunColor*highlight*fresnel*specEnergy*specTint;
	vec3 diffuseAlbedo=mix(albedo,vec3(0.0),metalness);
	vec3 coolSky=vec3(0.27,0.42,0.62)*skyFacing;
	vec3 earthBounce=vec3(0.30,0.19,0.09)*(1.0-skyFacing);
	vec3 horizonFill=vec3(0.20,0.14,0.09)*horizonFacing;
	float shadow=shadowOcclusion(vWorld,normal);
	vec3 sunlight=uSunColor*(direct*0.96+wrapped*0.18)*shadow;
	specular*=shadow;
	/* Shadowed ground gets readable ambient fill; direct sun still casts shadows. */
	vec3 daylightAmbient=max(uAmbient,vec3(0.28,0.30,0.32));
	vec3 diffuse=diffuseAlbedo*(daylightAmbient+coolSky*0.40+earthBounce*0.22+horizonFill*0.15+sunlight);
	vec3 environment=vec3(0.0);
	float envStrength=(1.0-roughness)*(1.0-roughness);
	if(envStrength>0.01){
		vec3 reflectDirection=reflect(-viewDirection,normal);
		environment=skySurface(reflectDirection)*envStrength*fresnel*mix(0.35,1.0,metalness);
	}
	return diffuse+specular+environment;
}
${fragmentWaterLightingFunctions}
vec3 toneMap(vec3 color){
	vec3 exposed=max(color,vec3(0.0))*uExposure;
	vec3 mapped=(exposed*(2.51*exposed+0.03))/(exposed*(2.43*exposed+0.59)+0.14);
	return sqrt(clamp(mapped,0.0,1.0));
}
`;
