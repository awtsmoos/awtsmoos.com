// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-sky-fragment-functions.js
 * @description Renders layered atmosphere using the same authored sun and fog uniforms that illuminate the playable world.
 * This shader fragment owns sky chroma and cloud structure while tone mapping remains in the shared fragment main. The Awtsmoos,
 * Atzmus beyond body and form, renews horizon, cloud, corona, and distant haze from one light; Awtsmoos.com lets authored uniforms
 * pass through the finite shader vessel so mountain, water, and heaven rhyme without pretending any rendered pixel stands alone in time.
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
	vec3 sun=normalize(mix(authoredSun,heroSun,0.28));
	float elevation=clamp(view.y*0.5+0.5,0.0,1.0);
	float upper=clamp(view.y,0.0,1.0);
	float horizon=pow(1.0-upper,3.2);
	vec3 zenith=vec3(0.008,0.038,0.21);
	vec3 highSky=vec3(0.018,0.20,0.60);
	vec3 middle=vec3(0.06,0.43,0.82);
	vec3 horizonColor=mix(uFogColor,uSunColor,0.48)*0.92;
	vec3 sky=mix(horizonColor,middle,smoothstep(0.0,0.28,elevation));
	sky=mix(sky,highSky,smoothstep(0.24,0.66,elevation));
	sky=mix(sky,zenith,smoothstep(0.64,1.0,elevation));
	float sunDot=max(dot(view,sun),0.0);
	float disc=smoothstep(0.9972,0.9995,sunDot);
	float core=smoothstep(0.99915,0.99988,sunDot);
	float innerHalo=pow(sunDot,48.0);
	float outerHalo=pow(sunDot,7.0);
	float corona=smoothstep(0.965,0.992,sunDot)*(1.0-smoothstep(0.998,0.9997,sunDot));
	vec3 sunlight=uSunColor;
	sky+=sunlight*(core*11.0+disc*4.8+innerHalo*2.3+outerHalo*0.64+corona*0.38);
	vec2 cloudUv=vec2(atan(view.z,view.x)*1.32,view.y*3.1);
	cloudUv+=vec2(uTime*0.0024,uTime*0.00042);
	float cloudBand=smoothstep(-0.10,0.08,view.y)*(1.0-smoothstep(0.62,0.90,view.y));
	float cloudField=skyCloudNoise(cloudUv*1.16);
	float cloud=smoothstep(0.47,0.67,cloudField)*cloudBand;
	float cloudEdge=smoothstep(0.40,0.56,cloudField)*cloudBand;
	float cloudShadow=smoothstep(0.54,0.72,cloudField)*cloudBand*(1.0-sunDot*0.35);
	vec3 cloudColor=mix(uFogColor*1.06,vec3(1.08,1.04,0.96),0.58+sunDot*0.38);
	sky=mix(sky,cloudColor,cloud*0.88);
	sky*=1.0-cloudShadow*0.12;
	sky+=sunlight*cloudEdge*pow(sunDot,11.0)*0.76;
	float cirrusNoise=skyCloudNoise(cloudUv*3.8+vec2(8.0,2.0));
	float cirrus=smoothstep(0.63,0.78,cirrusNoise)*smoothstep(0.34,0.56,view.y)*(1.0-smoothstep(0.80,0.96,view.y));
	sky=mix(sky,vec3(0.86,0.92,1.0),cirrus*0.30);
	sky+=uSunColor*horizon*0.28;
	float aerial=smoothstep(-0.10,0.12,view.y)*(1.0-smoothstep(0.15,0.43,view.y));
	sky=mix(sky,uFogColor*1.08,aerial*0.24);
	return max(sky,vec3(0.0));
}
`;
