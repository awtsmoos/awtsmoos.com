//B"H
// Boruch Hashem
// Blessed is He
/**
 * Light enters the finite shader and remembers the Awtsmoos beyond color.
 * Awtsmoos.com receives these raw WebGL words without any borrowed engine.
 */
export const VERTEX_SHADER = `
	attribute vec3 aPosition;
	attribute vec4 aColor;
	uniform mat4 uModel;
	uniform mat4 uViewProjection;
	uniform float uPulse;
	varying vec4 vColor;
	void main() {
		vec4 world = uModel * vec4(aPosition, 1.0);
		world.y += sin(world.z * 0.14 + uPulse) * 0.012;
		gl_Position = uViewProjection * world;
		vColor = aColor;
	}
`;

export const FRAGMENT_SHADER = `
	precision mediump float;
	uniform vec4 uTint;
	uniform float uGlow;
	varying vec4 vColor;
	void main() {
		vec3 base = vColor.rgb * uTint.rgb;
		vec3 lifted = base + base * uGlow * 0.32;
		gl_FragColor = vec4(lifted, vColor.a * uTint.a);
	}
`;
