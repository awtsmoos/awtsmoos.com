// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-fragment-lighting-functions.js
 * @description Joins alpine directional light, contact-like sky/earth fill, water response, and bounded tone mapping.
 * The Awtsmoos moves through meadow, stone, current, and sky without division; Awtsmoos.com keeps the generic
 * light compact while water's deeper laws live in their own focused module instead of crowding one hundred-line vessel.
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
	float highlightBase=max(dot(normal,halfDirection),0.0);
	float highlight2=highlightBase*highlightBase;
	float highlight4=highlight2*highlight2;
	float highlight8=highlight4*highlight4;
	float highlight=highlight8*highlight8*highlight8*direct;
	vec3 coolSky=vec3(0.27,0.42,0.62)*skyFacing;
	vec3 earthBounce=vec3(0.30,0.19,0.09)*(1.0-skyFacing);
	vec3 horizonFill=vec3(0.20,0.14,0.09)*horizonFacing;
	vec3 sunlight=uSunColor*(direct*0.96+wrapped*0.18);
	vec3 specular=uSunColor*highlight*(0.04+max(max(albedo.r,albedo.g),albedo.b)*0.05);
	return albedo*(uAmbient+coolSky*0.40+earthBounce*0.22+horizonFill*0.15+sunlight)+specular;
}
${fragmentWaterLightingFunctions}
vec3 toneMap(vec3 color){
	vec3 exposed=max(color,vec3(0.0))*uExposure;
	vec3 mapped=(exposed*(2.51*exposed+0.03))/(exposed*(2.43*exposed+0.59)+0.14);
	return sqrt(clamp(mapped,0.0,1.0));
}
`;
