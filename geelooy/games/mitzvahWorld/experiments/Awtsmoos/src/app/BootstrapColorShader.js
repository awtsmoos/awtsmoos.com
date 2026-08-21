// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapColorShader.js
 * @description Gives the ultra-light first renderer spatial material variation instead of flat-color placeholder surfaces.
 * The Awtsmoos reveals difference inside every finite patch of earth while one tiny shader keeps the frame free;
 * Awtsmoos.com turns color into textured-looking light without network images, material graphs, or heavyweight machinery.
 */

export const BOOTSTRAP_VERTEX_SHADER = `
attribute vec3 aPosition;
attribute vec4 aColor;
uniform mat4 uProjectionView;
uniform mat4 uModel;
varying vec4 vColor;
varying vec3 vWorldPosition;
void main() {
	vec4 worldPosition = uModel * vec4(aPosition, 1.0);
	vColor = aColor;
	vWorldPosition = worldPosition.xyz;
	gl_Position = uProjectionView * worldPosition;
}
`;

export const BOOTSTRAP_FRAGMENT_SHADER = `
precision mediump float;
uniform vec4 uColor;
varying vec4 vColor;
varying vec3 vWorldPosition;
float awtsmoosHash(vec2 point) {
	return fract(sin(dot(point, vec2(12.9898, 78.233))) * 43758.5453);
}
void main() {
	vec4 base = uColor * vColor;
	vec2 cell = floor(vWorldPosition.xz * 0.72);
	float grain = awtsmoosHash(cell);
	float contour = 0.5 + 0.5 * sin(vWorldPosition.x * 0.29 + vWorldPosition.z * 0.23 + vWorldPosition.y * 0.41);
	float light = 0.79 + grain * 0.13 + contour * 0.12;
	vec3 cool = base.rgb * vec3(0.90, 0.98, 1.05);
	vec3 warm = base.rgb * vec3(1.08, 1.01, 0.88);
	vec3 varied = mix(cool, warm, contour) * light;
	gl_FragColor = vec4(varied, base.a);
}
`;
