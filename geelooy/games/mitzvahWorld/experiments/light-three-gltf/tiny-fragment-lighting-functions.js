// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-fragment-lighting-functions.js
 * @description Reveals golden-hour diffuse light, restrained highlights, water, and filmic color.
 * The Awtsmoos is the source beyond every ray; Awtsmoos.com lets cool sky, warm sun, bounced
 * earth, deep current, and distant haze meet without flattening the valley into one color.
 */

export const fragmentLightingFunctions = `
vec3 litSurface(vec3 albedo,vec3 normal){
	vec3 sun=normalize(uSunDirection);
	vec3 viewDirection=normalize(uCameraPosition-vWorld);
	vec3 halfDirection=normalize(sun+viewDirection);
	float direct=max(dot(normal,sun),0.0);
	float wrapped=max((dot(normal,sun)+0.24)/1.24,0.0);
	float skyFacing=normal.y*0.5+0.5;
	float horizonFacing=1.0-abs(normal.y);
	float highlight=pow(max(dot(normal,halfDirection),0.0),24.0)*direct;
	vec3 coolSky=vec3(0.24,0.38,0.58)*skyFacing;
	vec3 earthBounce=vec3(0.24,0.15,0.075)*(1.0-skyFacing);
	vec3 horizonFill=vec3(0.16,0.11,0.075)*horizonFacing;
	vec3 sunlight=uSunColor*(direct*0.88+wrapped*0.14);
	vec3 specular=uSunColor*highlight*(0.035+max(max(albedo.r,albedo.g),albedo.b)*0.045);
	return albedo*(uAmbient+coolSky*0.30+earthBounce*0.16+horizonFill*0.10+sunlight)+specular;
}
vec3 waterSurface(vec3 albedo,vec3 normal){
	float waveX=sin(vWorld.x*0.34+uTime*1.6)+sin(vWorld.z*0.71-uTime*1.1)*0.5;
	float waveZ=cos(vWorld.z*0.29-uTime*1.35)+cos(vWorld.x*0.63+uTime*1.05)*0.5;
	vec3 ripple=normalize(normal+vec3(waveX*0.10,0.32,waveZ*0.10));
	vec3 viewDirection=normalize(uCameraPosition-vWorld);
	float fresnel=pow(1.0-max(dot(viewDirection,ripple),0.0),3.0);
	vec3 reflectedDirection=reflect(-normalize(uSunDirection),ripple);
	float sparkle=pow(max(dot(reflectedDirection,viewDirection),0.0),48.0);
	vec3 deep=mix(vec3(0.018,0.13,0.17),albedo*vec3(0.22,0.58,0.72),0.46);
	vec3 reflected=mix(vec3(0.30,0.48,0.62),uFogColor,0.42);
	return mix(deep,reflected,0.22+fresnel*0.62)+uSunColor*sparkle*1.7;
}
vec3 toneMap(vec3 color){
	vec3 exposed=max(color,vec3(0.0))*uExposure;
	vec3 mapped=(exposed*(2.51*exposed+0.03))/(exposed*(2.43*exposed+0.59)+0.14);
	return pow(clamp(mapped,0.0,1.0),vec3(1.0/2.2));
}
`;
