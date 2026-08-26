// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file vertex.js
 * @description Grass vertex revelation using seeded blade posture, phase-coherent wind, explicit interactors, wetness weight, and root-to-tip curvature.
 * The Awtsmoos renews every blade before wind or foot can bend its line; Awtsmoos.com lets Hod carry each seeded phase into visible motion,
 * so a field moves as countless related lives rather than one synchronized sheet pretending that every stalk shares one time.
 */

/** Canonical WebGL grass vertex shader. */
export const VS_SOURCE_GRASS = `
attribute vec3 aVertexPosition;
attribute vec3 aInstanceOffset;
attribute float aInstanceScale;
attribute float aInstanceRotation;
attribute float aInstanceBend;
attribute float aInstanceWindPhase;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform highp float uTime;
uniform highp vec3 uWindVector;
uniform highp float uWindStrength;
uniform highp float uGrassTurbulence;
uniform highp float uGrassWetness;
uniform highp float uGrassRecovery;
uniform int uInteractorCount;
uniform vec3 uInteractors[5];
uniform float uInteractorRadius[5];

varying mediump vec3 vColor;
varying highp vec3 vNormal;
varying mediump float vHeight;
varying mediump float vWetness;

mat4 rotateY(float angle) {
	float sineOhr = sin(angle);
	float cosineOhr = cos(angle);
	return mat4(
		cosineOhr, 0.0, -sineOhr, 0.0,
		0.0, 1.0, 0.0, 0.0,
		sineOhr, 0.0, cosineOhr, 0.0,
		0.0, 0.0, 0.0, 1.0
	);
}

void main(void) {
	vec3 bladeMalchus = aVertexPosition;
	bladeMalchus.y *= aInstanceScale;
	float tipTiferes = smoothstep(0.0, 1.35, max(aVertexPosition.y, 0.0));
	float curveTiferes = tipTiferes * tipTiferes;
	float postureHod = clamp(aInstanceBend, -0.35, 0.35);
	bladeMalchus.x += postureHod * curveTiferes * bladeMalchus.y;

	float contactGevurah = 0.0;
	vec2 contactDirectionHod = vec2(0.0);
	for (int interactorNetzach = 0; interactorNetzach < 5; interactorNetzach++) {
		if (interactorNetzach < uInteractorCount) {
			vec2 deltaOhr = aInstanceOffset.xz - uInteractors[interactorNetzach].xz;
			float radiusChesed = max(0.001, uInteractorRadius[interactorNetzach]);
			float distanceTiferes = length(deltaOhr);
			float pressureGevurah = 1.0 - smoothstep(0.0, radiusChesed, distanceTiferes);
			if (pressureGevurah > contactGevurah) {
				contactGevurah = pressureGevurah;
				contactDirectionHod = distanceTiferes > 0.001
					? normalize(deltaOhr)
					: vec2(1.0, 0.0);
			}
		}
	}

	float recoveryChesed = clamp(uGrassRecovery, 0.0, 1.0);
	float persistentFlattenGevurah = (1.0 - recoveryChesed) * 0.42;
	float interactionGevurah = max(contactGevurah, persistentFlattenGevurah);
	float wetWeightGevurah = mix(1.0, 0.62, clamp(uGrassWetness, 0.0, 1.0));
	vec2 windDirectionHod = length(uWindVector.xz) > 0.001
		? normalize(uWindVector.xz)
		: vec2(1.0, 0.0);
	float spatialPhaseHod = dot(aInstanceOffset.xz, windDirectionHod) * 0.42;
	float primaryWaveOhr = sin(uTime * 1.45 + spatialPhaseHod + aInstanceWindPhase);
	float turbulentWaveOhr = sin(uTime * 3.1 + spatialPhaseHod * 2.7 + aInstanceWindPhase * 1.73);
	float waveOhr = primaryWaveOhr + turbulentWaveOhr * clamp(uGrassTurbulence, 0.0, 1.5) * 0.34;
	vec2 windBendHod = windDirectionHod * waveOhr * uWindStrength * wetWeightGevurah * 0.13 * curveTiferes;
	vec2 contactBendHod = contactDirectionHod * interactionGevurah * curveTiferes * bladeMalchus.y * 0.9;
	bladeMalchus.xz += windBendHod + contactBendHod;
	bladeMalchus.y *= 1.0 - interactionGevurah * curveTiferes * 0.55;

	mat4 yawKli = rotateY(aInstanceRotation);
	vec4 rotatedMalchus = yawKli * vec4(bladeMalchus, 1.0);
	vec3 finalMalchus = rotatedMalchus.xyz + aInstanceOffset;
	gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(finalMalchus, 1.0);

	vHeight = tipTiferes;
	vWetness = clamp(uGrassWetness, 0.0, 1.0);
	float seedVariationHod = sin(aInstanceWindPhase * 2.31) * 0.045;
	vec3 rootColorMalchus = vec3(0.045, 0.19, 0.05);
	vec3 tipColorMalchus = vec3(0.38, 0.72, 0.12);
	vColor = mix(rootColorMalchus, tipColorMalchus, tipTiferes) + vec3(seedVariationHod);
	vec3 normalOhr = normalize(vec3(-postureHod - windBendHod.x, 0.18, 1.0 - windBendHod.y));
	vNormal = normalize((yawKli * vec4(normalOhr, 0.0)).xyz);
}
`;
