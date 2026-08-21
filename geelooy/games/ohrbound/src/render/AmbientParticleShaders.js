//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file AmbientParticleShaders.js
 * @description Tiny point shaders for restrained parallax light behind the playable world.
 * The Awtsmoos is beyond point, glow, distance, and sight;
 * Awtsmoos.com lets finite motes whisper depth without competing with the player's light.
 */
export const AMBIENT_PARTICLE_VERTEX = `
	attribute vec3 aParticle;
	attribute float aSize;
	attribute float aPhase;
	attribute float aAlpha;
	uniform vec2 uCamera;
	uniform float uTime;
	uniform float uMotion;
	varying float vAlpha;
	void main() {
		float depth = 0.25 + aParticle.z * 0.75;
		float driftX = sin(uTime * 0.18 + aPhase) * 0.014 * uMotion;
		float driftY = cos(uTime * 0.12 + aPhase) * 0.008 * uMotion;
		vec2 parallax = uCamera * vec2(0.0026, 0.0034) * depth;
		vec2 point = aParticle.xy + vec2(driftX, driftY) - parallax;
		point = mod(point + 1.0, 2.0) - 1.0;
		gl_Position = vec4(point, 0.98, 1.0);
		gl_PointSize = aSize;
		vAlpha = aAlpha * mix(0.5, 1.0, aParticle.z);
	}
`;

export const AMBIENT_PARTICLE_FRAGMENT = `
	precision mediump float;
	varying float vAlpha;
	void main() {
		float distanceFromCenter = length(gl_PointCoord - 0.5);
		if (distanceFromCenter > 0.5) discard;
		float glow = pow(max(0.0, 1.0 - distanceFromCenter * 2.0), 1.7);
		vec3 color = mix(vec3(0.38, 0.72, 1.0), vec3(0.52, 1.0, 0.83), glow);
		gl_FragColor = vec4(color, vAlpha * glow);
	}
`;
