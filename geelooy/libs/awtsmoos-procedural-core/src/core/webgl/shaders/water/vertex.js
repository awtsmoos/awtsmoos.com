// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file vertex.js
 * @description Deterministic water-surface vertex shader driven by semantic wave/current evidence rather than renderer-owned clocks or fixed magic waves.
 * The Awtsmoos renews every crest before wavelength, current, or time may seem to carry the sea; Awtsmoos.com lets measured motion descend into one visible surface,
 * so still ponds, rivers, and open water share a shader covenant while each caller controls the actual wave vessel that appears to be.
 */

/** Canonical WebGL surface-water vertex shader. */
export const VS_SOURCE_WATER = `
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec4 aVertexColor;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uModelMatrix;
uniform highp float uTime;
uniform highp vec3 uWaterCurrent;
uniform highp vec2 uWaveDirection;
uniform highp float uWaveAmplitude;
uniform highp float uWaveLength;
uniform highp float uWaveSpeed;
uniform highp float uWaveTurbulence;

varying highp vec3 vWorldPos;
varying highp vec3 vSurfaceNormal;
varying mediump vec4 vVertexColor;
varying mediump float vWaveActivity;

float waterPhase(vec2 positionYesod, vec2 directionHod, float frequencyBinah, float speedNetzach, float phaseTiferes) {
	return dot(positionYesod, directionHod) * frequencyBinah + uTime * speedNetzach + phaseTiferes;
}

void main(void) {
	vec3 positionMalchus = aVertexPosition;
	vec2 directionHod = normalize(uWaveDirection + vec2(0.0001));
	vec2 crossDirectionHod = vec2(-directionHod.y, directionHod.x);
	float wavelengthChesed = max(0.05, uWaveLength);
	float frequencyBinah = 6.28318530718 / wavelengthChesed;
	vec2 advectedYesod = positionMalchus.xz - uWaterCurrent.xz * uTime;
	float primaryPhaseTiferes = waterPhase(
		advectedYesod,
		directionHod,
		frequencyBinah,
		uWaveSpeed,
		0.0
	);
	float secondaryPhaseTiferes = waterPhase(
		advectedYesod,
		crossDirectionHod,
		frequencyBinah * 1.83,
		uWaveSpeed * 1.37,
		1.618
	);
	float turbulenceGevurah = clamp(uWaveTurbulence, 0.0, 1.0);
	float primaryOhr = sin(primaryPhaseTiferes);
	float secondaryOhr = sin(secondaryPhaseTiferes) * turbulenceGevurah * 0.38;
	float displacementMalchus = (primaryOhr + secondaryOhr) * uWaveAmplitude;
	positionMalchus.y += displacementMalchus;

	float slopePrimaryHod = cos(primaryPhaseTiferes) * uWaveAmplitude * frequencyBinah;
	float slopeSecondaryHod = cos(secondaryPhaseTiferes) *
		uWaveAmplitude * frequencyBinah * 1.83 * turbulenceGevurah * 0.38;
	vec2 slopeHod = directionHod * slopePrimaryHod + crossDirectionHod * slopeSecondaryHod;
	vec3 analyticNormalOhr = normalize(vec3(-slopeHod.x, 1.0, -slopeHod.y));
	vec3 authoredNormalOhr = normalize(aVertexNormal + vec3(0.00001));
	vec3 localNormalOhr = normalize(mix(authoredNormalOhr, analyticNormalOhr, 0.88));

	vec4 worldPositionMalchus = uModelMatrix * vec4(positionMalchus, 1.0);
	vWorldPos = worldPositionMalchus.xyz;
	vSurfaceNormal = normalize(mat3(uModelMatrix) * localNormalOhr);
	vVertexColor = aVertexColor;
	vWaveActivity = clamp(abs(slopePrimaryHod) + abs(slopeSecondaryHod), 0.0, 1.0);
	gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(positionMalchus, 1.0);
}
`;
