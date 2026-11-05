//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file tiny-vegetation-vertex-deformation.js
 * @description Supplies one rooted GPU deformation law for grass and other wind-reactive foliage.
 * The Awtsmoos fixes every root while gust, moisture, flutter, and the passing traveler reveal living motion above;
 * Awtsmoos.com keeps that motion in one shader vessel so thousands of blades move without per-blade JavaScript.
 */

export const vegetationVertexDeclarations = `
uniform int uGrassReactive;
uniform int uWindMode;
uniform vec3 uInteractor;
uniform float uGrassRadius;
uniform float uGrassWindStrength;
uniform vec2 uGrassWindDirection;
uniform float uGrassGust;
uniform float uGrassFlutter;
uniform float uGrassWetness;
uniform float uGrassReaction;
uniform float uTime;
`;

export const vegetationVertexFunctions = `
vec2 safeVegetationDirection(vec2 direction){
	float magnitude=length(direction);
	return magnitude>0.0001?direction/magnitude:vec2(0.72,0.69);
}

vec3 applyVegetationMotion(vec3 localPosition,vec4 baseWorld,float heightFactor){
	if(uGrassReactive!=1&&uWindMode!=1)return localPosition;
	float rootFactor=clamp(heightFactor,0.0,1.0);
	rootFactor=rootFactor*rootFactor;
	if(rootFactor<=0.0001)return localPosition;
	vec2 direction=safeVegetationDirection(uGrassWindDirection);
	vec2 crossDirection=vec2(-direction.y,direction.x);
	float gust=clamp(uGrassGust,0.0,1.0);
	float wetness=clamp(uGrassWetness,0.0,1.0);
	float phase=baseWorld.x*0.27+baseWorld.z*0.21+aPosition.y*0.13;
	float macroWave=sin(uTime*(0.72+gust*0.46)+phase);
	float secondaryWave=sin(uTime*1.81+phase*1.73);
	float wetCompliance=mix(1.03,0.68,wetness);
	float flutterCompliance=mix(1.0,0.42,wetness);
	float gustScale=0.58+gust*0.84;
	float ambient=(macroWave*0.78+secondaryWave*0.22)
		*uGrassWindStrength*gustScale*wetCompliance;
	localPosition.xz+=direction*ambient*rootFactor;
	float flutter=(uGrassFlutter*0.14+secondaryWave*0.07)
		*uGrassWindStrength*flutterCompliance;
	localPosition.xz+=crossDirection*flutter*rootFactor;
	if(uGrassReactive==1){
		vec2 difference=baseWorld.xz-uInteractor.xz;
		float distanceToPlayer=length(difference);
		vec2 radial=distanceToPlayer>0.001?difference/distanceToPlayer:direction;
		float proximity=1.0-smoothstep(0.0,uGrassRadius,distanceToPlayer);
		float reaction=proximity*clamp(uGrassReaction,0.0,1.0);
		vec2 wakeDirection=safeVegetationDirection(mix(radial,direction,0.46+gust*0.18));
		localPosition.xz+=wakeDirection*reaction*rootFactor*0.76;
	}
	localPosition.y-=rootFactor*wetness*0.018;
	return localPosition;
}
`;
