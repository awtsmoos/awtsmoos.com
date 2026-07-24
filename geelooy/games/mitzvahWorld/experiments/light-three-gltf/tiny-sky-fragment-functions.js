// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-sky-fragment-functions.js
 * @description Generates daylight scattering, soft clouds, sun disc, halo, and optical glow.
 * The Awtsmoos renews blue height and luminous source without a painted ceiling;
 * Awtsmoos.com evaluates one camera-centered atmosphere inside the shared WebGL program.
 */

export const skyFragmentFunctions = `
float skyCloudNoise(vec2 point){
	float broad=valueNoise(point);
	float medium=valueNoise(point*2.07+vec2(4.7,8.3));
	float fine=valueNoise(point*4.31+vec2(17.2,3.9));
	return broad*0.55+medium*0.30+fine*0.15;
}
vec3 skySurface(vec3 direction){
	vec3 view=normalize(direction);
	vec3 sun=normalize(uSunDirection);
	float elevation=clamp(view.y*0.5+0.5,0.0,1.0);
	float horizon=pow(1.0-clamp(view.y,0.0,1.0),2.2);
	vec3 zenith=vec3(0.035,0.19,0.48);
	vec3 middle=vec3(0.12,0.43,0.74);
	vec3 horizonColor=vec3(0.62,0.76,0.89);
	vec3 sky=mix(horizonColor,middle,smoothstep(0.0,0.42,elevation));
	sky=mix(sky,zenith,smoothstep(0.38,1.0,elevation));
	float sunDot=max(dot(view,sun),0.0);
	float disc=smoothstep(0.99945,0.99988,sunDot);
	float innerHalo=pow(sunDot,96.0);
	float outerHalo=pow(sunDot,18.0);
	float ring=smoothstep(0.985,0.993,sunDot)*(1.0-smoothstep(0.996,0.999,sunDot));
	vec3 sunlight=vec3(1.0,0.88,0.63);
	sky+=sunlight*(disc*8.5+innerHalo*2.8+outerHalo*0.36+ring*0.12);
	vec2 cloudUv=vec2(atan(view.z,view.x)*1.45,view.y*3.4);
	cloudUv+=vec2(uTime*0.0018,uTime*0.00025);
	float cloudBand=smoothstep(-0.02,0.22,view.y)*(1.0-smoothstep(0.58,0.88,view.y));
	float cloudField=skyCloudNoise(cloudUv*1.25);
	float cloud=smoothstep(0.57,0.76,cloudField)*cloudBand;
	float cloudLight=0.72+sunDot*0.42+skyCloudNoise(cloudUv*2.8)*0.18;
	sky=mix(sky,vec3(cloudLight),cloud*0.82);
	sky+=vec3(0.18,0.23,0.28)*horizon*0.18;
	return max(sky,vec3(0.0));
}
`;
