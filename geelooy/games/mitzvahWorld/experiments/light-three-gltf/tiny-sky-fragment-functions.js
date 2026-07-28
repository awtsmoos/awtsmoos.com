// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-sky-fragment-functions.js
 * @description Generates deep atmosphere, a mobile-readable sun, halo, haze, and bright clouds.
 * The Awtsmoos renews height, warmth, luminous source, and moving vapor without a painted ceiling;
 * Awtsmoos.com gives the phone a visibly structured heaven instead of one flat field of blue.
 */

export const skyFragmentFunctions = `
float skyCloudNoise(vec2 point){
	float broad=valueNoise(point);
	float medium=valueNoise(point*2.07+vec2(4.7,8.3));
	float fine=valueNoise(point*4.31+vec2(17.2,3.9));
	return broad*0.52+medium*0.31+fine*0.17;
}
vec3 skySurface(vec3 direction){
	vec3 view=normalize(direction);
	vec3 authoredSun=normalize(uSunDirection);
	vec3 heroSun=normalize(vec3(-0.42,0.52,0.74));
	vec3 sun=normalize(mix(authoredSun,heroSun,0.72));
	float elevation=clamp(view.y*0.5+0.5,0.0,1.0);
	float upper=clamp(view.y,0.0,1.0);
	float horizon=pow(1.0-upper,3.1);
	vec3 zenith=vec3(0.012,0.075,0.30);
	vec3 highSky=vec3(0.025,0.28,0.70);
	vec3 middle=vec3(0.12,0.58,0.92);
	vec3 horizonColor=vec3(0.96,0.70,0.42);
	vec3 sky=mix(horizonColor,middle,smoothstep(0.0,0.30,elevation));
	sky=mix(sky,highSky,smoothstep(0.26,0.68,elevation));
	sky=mix(sky,zenith,smoothstep(0.66,1.0,elevation));
	float sunDot=max(dot(view,sun),0.0);
	float disc=smoothstep(0.9976,0.99945,sunDot);
	float core=smoothstep(0.99925,0.99986,sunDot);
	float innerHalo=pow(sunDot,54.0);
	float outerHalo=pow(sunDot,8.0);
	float corona=smoothstep(0.972,0.992,sunDot)*(1.0-smoothstep(0.998,0.9996,sunDot));
	vec3 sunlight=vec3(1.0,0.86,0.50);
	sky+=sunlight*(core*11.0+disc*5.2+innerHalo*2.4+outerHalo*0.58+corona*0.34);
	vec2 cloudUv=vec2(atan(view.z,view.x)*1.35,view.y*3.0);
	cloudUv+=vec2(uTime*0.0022,uTime*0.00035);
	float cloudBand=smoothstep(-0.12,0.10,view.y)*(1.0-smoothstep(0.64,0.90,view.y));
	float cloudField=skyCloudNoise(cloudUv*1.18);
	float cloud=smoothstep(0.49,0.68,cloudField)*cloudBand;
	float cloudEdge=smoothstep(0.43,0.58,cloudField)*cloudBand;
	float cloudLight=0.84+sunDot*0.62+skyCloudNoise(cloudUv*2.7)*0.16;
	vec3 cloudColor=mix(vec3(0.62,0.70,0.78),vec3(1.08,1.04,0.96),cloudLight);
	sky=mix(sky,cloudColor,cloud*0.88);
	sky+=sunlight*cloudEdge*pow(sunDot,12.0)*0.78;
	sky+=vec3(0.62,0.30,0.12)*horizon*0.28;
	float aerial=smoothstep(-0.08,0.16,view.y)*(1.0-smoothstep(0.16,0.42,view.y));
	sky=mix(sky,vec3(0.72,0.84,0.94),aerial*0.16);
	return max(sky,vec3(0.0));
}
`;
