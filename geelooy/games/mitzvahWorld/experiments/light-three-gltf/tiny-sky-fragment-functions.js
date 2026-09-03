// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-sky-fragment-functions.js
 * @description Renders a vivid layered atmosphere with warm horizon, deep zenith, sun corona, cloud banks, cirrus, and aerial haze.
 * The Awtsmoos renews light above every blade without a painted ceiling or distant dependency;
 * Awtsmoos.com gives children a sky with depth, weathered motion, radiant edges, and a horizon that feels alive.
 */

export const skyFragmentFunctions = `
float skyCloudNoise(vec2 point){
	float broad=valueNoise(point);
	float medium=valueNoise(point*2.07+vec2(4.7,8.3));
	float fine=valueNoise(point*4.31+vec2(17.2,3.9));
	float lace=valueNoise(point*8.73+vec2(2.1,13.7));
	return broad*0.46+medium*0.29+fine*0.17+lace*0.08;
}
vec3 skySurface(vec3 direction){
	vec3 view=normalize(direction);
	vec3 authoredSun=normalize(uSunDirection);
	vec3 heroSun=normalize(vec3(-0.42,0.52,0.74));
	vec3 sun=normalize(mix(authoredSun,heroSun,0.72));
	float elevation=clamp(view.y*0.5+0.5,0.0,1.0);
	float upper=clamp(view.y,0.0,1.0);
	float horizon=pow(1.0-upper,3.2);
	vec3 zenith=vec3(0.008,0.045,0.25);
	vec3 highSky=vec3(0.018,0.24,0.72);
	vec3 middle=vec3(0.08,0.55,0.98);
	vec3 horizonColor=vec3(1.04,0.72,0.40);
	vec3 sky=mix(horizonColor,middle,smoothstep(0.0,0.28,elevation));
	sky=mix(sky,highSky,smoothstep(0.24,0.66,elevation));
	sky=mix(sky,zenith,smoothstep(0.64,1.0,elevation));
	float sunDot=max(dot(view,sun),0.0);
	float disc=smoothstep(0.9972,0.9995,sunDot);
	float core=smoothstep(0.99915,0.99988,sunDot);
	float innerHalo=pow(sunDot,48.0);
	float outerHalo=pow(sunDot,7.0);
	float corona=smoothstep(0.965,0.992,sunDot)*(1.0-smoothstep(0.998,0.9997,sunDot));
	vec3 sunlight=vec3(1.08,0.86,0.45);
	sky+=sunlight*(core*12.0+disc*5.8+innerHalo*2.7+outerHalo*0.72+corona*0.42);
	vec2 cloudUv=vec2(atan(view.z,view.x)*1.32,view.y*3.1);
	cloudUv+=vec2(uTime*0.0024,uTime*0.00042);
	float cloudBand=smoothstep(-0.10,0.08,view.y)*(1.0-smoothstep(0.62,0.90,view.y));
	float cloudField=skyCloudNoise(cloudUv*1.16);
	float cloud=smoothstep(0.47,0.67,cloudField)*cloudBand;
	float cloudEdge=smoothstep(0.40,0.56,cloudField)*cloudBand;
	float cloudShadow=smoothstep(0.54,0.72,cloudField)*cloudBand*(1.0-sunDot*0.35);
	vec3 cloudColor=mix(vec3(0.54,0.65,0.78),vec3(1.12,1.07,0.98),0.62+sunDot*0.38);
	sky=mix(sky,cloudColor,cloud*0.90);
	sky*=1.0-cloudShadow*0.10;
	sky+=sunlight*cloudEdge*pow(sunDot,11.0)*0.92;
	float cirrusNoise=skyCloudNoise(cloudUv*3.8+vec2(8.0,2.0));
	float cirrus=smoothstep(0.63,0.78,cirrusNoise)*smoothstep(0.34,0.56,view.y)*(1.0-smoothstep(0.80,0.96,view.y));
	sky=mix(sky,vec3(0.88,0.94,1.04),cirrus*0.34);
	sky+=vec3(0.68,0.30,0.10)*horizon*0.34;
	float aerial=smoothstep(-0.10,0.12,view.y)*(1.0-smoothstep(0.15,0.43,view.y));
	sky=mix(sky,vec3(0.68,0.84,0.98),aerial*0.22);
	return max(sky,vec3(0.0));
}
`;
