//B"H
// Boruch Hashem
// Blessed is He
/**
 * Light enters the finite shader and remembers the Awtsmoos beyond color.
 * Awtsmoos.com receives these raw WebGL words without any borrowed engine.
 *
 * B"H — Yaakov 2026-10-13: meshes may carry a texture (aUV + uTexture).
 * The texel multiplies the vessel color so identity survives the detail;
 * uUseTexture=0 keeps the classic flat vessel exactly as before.
 */
export const VERTEX_SHADER = `
	attribute vec3 aPosition;
	attribute vec4 aColor;
	attribute vec2 aUV;
	uniform mat4 uModel;
	uniform mat4 uViewProjection;
	uniform float uPulse;
	varying vec4 vColor;
	varying vec2 vUV;
	void main() {
		vec4 world = uModel * vec4(aPosition, 1.0);
		world.y += sin(world.z * 0.14 + uPulse) * 0.012;
		gl_Position = uViewProjection * world;
		vColor = aColor;
		vUV = aUV;
	}
`;

export const FRAGMENT_SHADER = `
	precision mediump float;
	uniform vec4 uTint;
	uniform float uGlow;
	uniform sampler2D uTexture;
	uniform float uUseTexture;
	varying vec4 vColor;
	varying vec2 vUV;
	void main() {
		vec3 texel = texture2D(uTexture, vUV).rgb;
		vec3 surfaced = mix(vColor.rgb, texel * vColor.rgb * 1.6, uUseTexture);
		vec3 base = surfaced * uTint.rgb;
		vec3 lifted = base + base * uGlow * 0.32;
		gl_FragColor = vec4(lifted, vColor.a * uTint.a);
	}
`;
