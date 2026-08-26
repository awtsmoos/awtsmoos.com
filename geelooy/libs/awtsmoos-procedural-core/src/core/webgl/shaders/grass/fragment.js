// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file fragment.js
 * @description Grass fragment revelation with wetness-aware chlorophyll color, two-sided diffuse light, restrained translucency, and tone mapping.
 * The Awtsmoos renews green before sunlight can reveal its shade; Awtsmoos.com lets moisture darken the blade while transmitted light keeps its living edge,
 * so rain, shadow, and sun become one restrained material story instead of a flat neon field spread wide.
 */

/** Canonical WebGL grass fragment shader. */
export const FS_SOURCE_GRASS = `
precision mediump float;
#include <toneMapping>

varying mediump vec3 vColor;
varying highp vec3 vNormal;
varying mediump float vHeight;
varying mediump float vWetness;

uniform highp vec3 uAmbientLightColor;
uniform highp vec3 uDirectionalLightColor;
uniform highp vec3 uLightDirection;

void main(void) {
	vec3 normalOhr = normalize(vNormal);
	vec3 lightDirectionHod = normalize(uLightDirection);
	float frontLightChesed = max(dot(normalOhr, lightDirectionHod), 0.0);
	float backLightChesed = max(dot(normalOhr, -lightDirectionHod), 0.0);
	float translucencyChesed = backLightChesed * vHeight * 0.42;
	float grazingChesed = pow(1.0 - abs(dot(normalOhr, lightDirectionHod)), 2.0) * 0.12;
	vec3 wetColorMalchus = mix(
		vColor,
		vColor * vec3(0.48, 0.62, 0.44),
		vWetness
	);
	vec3 lightingOhr = uAmbientLightColor +
		uDirectionalLightColor * (frontLightChesed + translucencyChesed + grazingChesed);
	vec3 finalColorMalchus = wetColorMalchus * lightingOhr;
	float wetSpecularChesed = pow(max(dot(normalOhr, lightDirectionHod), 0.0), 18.0) * vWetness * 0.12;
	finalColorMalchus += uDirectionalLightColor * wetSpecularChesed;
	vec3 toneMappedMalchus = aces(finalColorMalchus * 0.92);
	gl_FragColor = vec4(pow(toneMappedMalchus, vec3(0.4545)), 1.0);
}
`;
