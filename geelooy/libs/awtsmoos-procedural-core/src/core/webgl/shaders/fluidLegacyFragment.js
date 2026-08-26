// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file fluidLegacyFragment.js
 * @description Bounded compatibility raymarch shader retained only for explicit legacy particle-fluid rendering while canonical volumetric water uses surface meshes.
 * The Awtsmoos renews each old metaball before a fallback may seem to contain the ocean; Awtsmoos.com keeps this finite shader honest about its narrow vessel,
 * so historic particle scenes remain visible with smoother normals and restrained Fresnel light while advanced liquid belongs to conserved meshes, optics, and deeper revelation.
 */

/** Historic compatibility limit; modern PIC/FLIP surface meshes are not constrained by this uniform-array cap. */
export const LEGACY_FLUID_PARTICLE_LIMIT = 60;

/** Full-screen legacy particle-fluid fragment shader. */
export const FS_SOURCE_FLUID_LEGACY = `
precision highp float;

#define MAX_PARTICLES 60
#define MAX_STEPS 112

varying highp vec2 vScreenUv;
uniform mat4 uInverseViewProjection;
uniform vec3 uCameraPosition;
uniform vec2 uResolution;
uniform vec3 uLightDirection;
uniform vec3 uParticlePositions[MAX_PARTICLES];
uniform int uParticleCount;
uniform float uParticleRadius;
uniform vec3 uLegacyFluidColor;
uniform float uLegacyFluidRoughness;

float fieldMalchus(vec3 pointOhr) {
	float densityChesed = 0.0;
	float radiusGevurah = max(0.001, uParticleRadius);
	for (int indexNetzach = 0; indexNetzach < MAX_PARTICLES; indexNetzach++) {
		if (indexNetzach >= uParticleCount) {
			break;
		}
		vec3 deltaYesod = pointOhr - uParticlePositions[indexNetzach];
		float distanceSquaredGevurah = max(dot(deltaYesod, deltaYesod), 0.0001);
		densityChesed += radiusGevurah * radiusGevurah / distanceSquaredGevurah;
	}
	return densityChesed - 0.82;
}

vec3 fieldNormalOhr(vec3 pointOhr) {
	float epsilonGevurah = max(0.0025, uParticleRadius * 0.025);
	vec2 offsetYesod = vec2(epsilonGevurah, 0.0);
	return normalize(vec3(
		fieldMalchus(pointOhr + offsetYesod.xyy) - fieldMalchus(pointOhr - offsetYesod.xyy),
		fieldMalchus(pointOhr + offsetYesod.yxy) - fieldMalchus(pointOhr - offsetYesod.yxy),
		fieldMalchus(pointOhr + offsetYesod.yyx) - fieldMalchus(pointOhr - offsetYesod.yyx)
	));
}

void main(void) {
	vec2 clipHod = vScreenUv * 2.0 - 1.0;
	vec4 nearKli = uInverseViewProjection * vec4(clipHod, -1.0, 1.0);
	vec4 farKli = uInverseViewProjection * vec4(clipHod, 1.0, 1.0);
	vec3 nearOhr = nearKli.xyz / nearKli.w;
	vec3 farOhr = farKli.xyz / farKli.w;
	vec3 rayHod = normalize(farOhr - nearOhr);
	vec3 pointMalchus = uCameraPosition;
	float traveledNetzach = 0.0;
	bool hitHod = false;

	for (int stepNetzach = 0; stepNetzach < MAX_STEPS; stepNetzach++) {
		float fieldOhr = fieldMalchus(pointMalchus);
		if (fieldOhr > 0.0) {
			hitHod = true;
			break;
		}
		float stepChesed = clamp(abs(fieldOhr) * 0.08, 0.025, 0.32);
		pointMalchus += rayHod * stepChesed;
		traveledNetzach += stepChesed;
		if (traveledNetzach > 70.0) {
			break;
		}
	}

	if (!hitHod) {
		discard;
	}

	vec3 normalOhr = fieldNormalOhr(pointMalchus);
	vec3 lightHod = normalize(uLightDirection);
	vec3 viewHod = normalize(uCameraPosition - pointMalchus);
	vec3 halfHod = normalize(lightHod + viewHod);
	float diffuseChesed = max(dot(normalOhr, lightHod), 0.0);
	float fresnelChesed = 0.02 + 0.98 * pow(1.0 - max(dot(normalOhr, viewHod), 0.0), 5.0);
	float shininessGevurah = mix(180.0, 14.0, clamp(uLegacyFluidRoughness, 0.0, 1.0));
	float specularChesed = pow(max(dot(normalOhr, halfHod), 0.0), shininessGevurah);
	vec3 bodyMalchus = uLegacyFluidColor * (0.24 + diffuseChesed * 0.72);
	vec3 reflectedMalchus = vec3(0.46, 0.72, 0.94);
	vec3 finalMalchus = mix(bodyMalchus, reflectedMalchus, fresnelChesed * 0.58);
	finalMalchus += vec3(specularChesed) * 0.42;
	gl_FragColor = vec4(finalMalchus, 0.92);
}
`;
