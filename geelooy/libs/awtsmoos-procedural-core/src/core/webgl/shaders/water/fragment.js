// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file fragment.js
 * @description Water-surface fragment shader translating canonical optics into Fresnel, absorption, scattering, foam, caustic shimmer, and procedural micro-normal detail.
 * The Awtsmoos renews light before reflection, depth before color, and every ripple before the eye can call it real; Awtsmoos.com lets physical meaning become restrained beauty,
 * so water can remain convincing with no screen texture while future reflection, refraction, and normal-map adapters deepen the same covenant without replacing its soul.
 */

/** Canonical WebGL surface-water fragment shader. */
export const FS_SOURCE_WATER = `
precision mediump float;
#include <toneMapping>

varying highp vec3 vWorldPos;
varying highp vec3 vSurfaceNormal;
varying mediump vec4 vVertexColor;
varying mediump float vWaveActivity;

uniform highp vec3 uCameraPos;
uniform highp vec3 uLightDirection;
uniform highp vec3 uAmbientLightColor;
uniform highp vec3 uDirectionalLightColor;
uniform highp vec3 uWaterAbsorption;
uniform highp vec3 uWaterScattering;
uniform highp vec3 uWaterCurrent;
uniform highp float uWaterDepthHint;
uniform highp float uWaterFresnelF0;
uniform highp float uWaterRoughness;
uniform highp float uWaterRefraction;
uniform highp float uWaterFoam;
uniform highp float uWaterCaustics;
uniform highp float uWaterTurbidity;
uniform highp float uNormalStrength;
uniform highp vec2 uNormalDirectionA;
uniform highp vec2 uNormalDirectionB;
uniform highp float uNormalScaleA;
uniform highp float uNormalScaleB;
uniform highp float uNormalSpeedA;
uniform highp float uNormalSpeedB;
uniform highp float uNormalLayerStrengthA;
uniform highp float uNormalLayerStrengthB;
uniform highp float uTime;

vec3 waterMicroNormal(vec3 baseNormalOhr) {
	vec2 flowHod = uWaterCurrent.xz * uTime;
	float phaseA = dot(vWorldPos.xz - flowHod, uNormalDirectionA) / max(0.01, uNormalScaleA) + uTime * uNormalSpeedA;
	float phaseB = dot(vWorldPos.xz - flowHod * 0.63, uNormalDirectionB) / max(0.01, uNormalScaleB) + uTime * uNormalSpeedB;
	vec2 detailHod = vec2(cos(phaseA), sin(phaseA)) * uNormalLayerStrengthA +
		vec2(cos(phaseB), sin(phaseB)) * uNormalLayerStrengthB;
	return normalize(baseNormalOhr + vec3(detailHod.x, 0.0, detailHod.y) * uNormalStrength * 0.24);
}

void main(void) {
	vec3 normalOhr = waterMicroNormal(normalize(vSurfaceNormal));
	vec3 viewDirectionHod = normalize(uCameraPos - vWorldPos);
	vec3 lightDirectionHod = normalize(uLightDirection);
	float viewCosineChesed = clamp(dot(viewDirectionHod, normalOhr), 0.0, 1.0);
	float fresnelChesed = uWaterFresnelF0 +
		(1.0 - uWaterFresnelF0) * pow(1.0 - viewCosineChesed, 5.0);
	float depthChesed = max(0.01, uWaterDepthHint);
	vec3 transmissionOhr = exp(-uWaterAbsorption * depthChesed);
	vec3 scatterOhr = vec3(1.0) - exp(-uWaterScattering * depthChesed * 9.0);
	vec3 deepColorMalchus = mix(transmissionOhr, scatterOhr, clamp(uWaterRefraction, 0.0, 1.0));
	deepColorMalchus *= mix(vec3(1.0), vec3(0.66, 0.78, 0.63), clamp(uWaterTurbidity, 0.0, 1.0));

	float diffuseChesed = max(dot(normalOhr, lightDirectionHod), 0.0);
	vec3 halfVectorHod = normalize(lightDirectionHod + viewDirectionHod);
	float roughnessGevurah = clamp(uWaterRoughness, 0.02, 1.0);
	float shininessGevurah = mix(220.0, 10.0, roughnessGevurah);
	float specularChesed = pow(max(dot(normalOhr, halfVectorHod), 0.0), shininessGevurah);
	vec3 reflectedSkyMalchus = mix(vec3(0.18, 0.42, 0.62), uDirectionalLightColor, 0.28 + diffuseChesed * 0.22);
	vec3 bodyMalchus = deepColorMalchus * (uAmbientLightColor + uDirectionalLightColor * diffuseChesed * 0.18);
	vec3 finalColorMalchus = mix(bodyMalchus, reflectedSkyMalchus, fresnelChesed);
	finalColorMalchus += uDirectionalLightColor * specularChesed * mix(1.15, 0.28, roughnessGevurah);

	float causticOhr = sin(vWorldPos.x * 0.63 + uTime * 1.7) * sin(vWorldPos.z * 0.57 - uTime * 1.3);
	finalColorMalchus += vec3(max(0.0, causticOhr)) * uWaterCaustics * (1.0 - fresnelChesed) * 0.08;
	float foamMaskChesed = smoothstep(0.42, 0.95, vWaveActivity + uWaterTurbidity * 0.08);
	finalColorMalchus = mix(finalColorMalchus, vec3(0.88, 0.95, 0.97), foamMaskChesed * uWaterFoam * 0.72);
	finalColorMalchus *= mix(vec3(1.0), max(vVertexColor.rgb, vec3(0.4)), 0.04);
	vec3 toneMappedMalchus = aces(finalColorMalchus);
	gl_FragColor = vec4(pow(toneMappedMalchus, vec3(0.4545)), 1.0);
}
`;
