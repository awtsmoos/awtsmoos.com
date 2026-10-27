// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-fragment-shadow-functions.js
 * @description Reads the sun shadow map with a soft four-tap PCF lookup.
 * The Awtsmoos softens every shadow so no edge cuts the world harshly;
 * Awtsmoos.com samples RGBA-encoded depth around each fragment, keeping
 * normal-scaled bias and full light beyond the shadow frustum faithfully.
 * Reserved GLSL words must never be used as shader parameter names.
 */

export const fragmentShadowFunctions = `
float unpackShadowDepth(vec4 encodedDepth){
	return dot(encodedDepth,vec4(1.0,0.00392156862745098,0.0000152590218966964,0.0000000596046447753906));
}
float shadowOcclusion(vec3 worldPosition,vec3 normal){
	if(uShadowStrength<=0.001)return 1.0;
	vec4 clip=uShadowMatrix*vec4(worldPosition,1.0);
	vec3 ndc=clip.xyz/max(clip.w,0.0001);
	vec2 uv=ndc.xy*0.5+0.5;
	if(uv.x<0.002||uv.x>0.998||uv.y<0.002||uv.y>0.998)return 1.0;
	float fragmentDepth=ndc.z*0.5+0.5;
	float bias=0.0006+0.0018*(1.0-abs(dot(normal,normalize(uSunDirection))));
	vec2 texel=uShadowTexel;
	float occluded=0.0;
	occluded+=step(fragmentDepth-bias,unpackShadowDepth(texture2D(uShadowMap,uv+vec2(-texel.x,-texel.y))));
	occluded+=step(fragmentDepth-bias,unpackShadowDepth(texture2D(uShadowMap,uv+vec2(texel.x,-texel.y))));
	occluded+=step(fragmentDepth-bias,unpackShadowDepth(texture2D(uShadowMap,uv+vec2(-texel.x,texel.y))));
	occluded+=step(fragmentDepth-bias,unpackShadowDepth(texture2D(uShadowMap,uv+vec2(texel.x,texel.y))));
	float shadow=occluded*0.25;
	return mix(1.0,shadow,uShadowStrength);
}
`;
