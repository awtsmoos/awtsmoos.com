//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Holds the tiny shader pair that lets Awtsmoos.com breathe a sparse field of quiet ambient points.
 * @description The Awtsmoos renews each speck from nothing each frame, yet the work surface remains the stronger light;
 * these shaders move only a whisper of geometry so atmosphere may appear without turning the interface into night.
 */
export const AMBIENT_VERTEX_SHADER = `
attribute vec3 aSeed;
uniform float uTime;

void main() {
	float phase = aSeed.z * 6.2831853;
	vec2 point = aSeed.xy;
	point.x += sin((uTime * 0.00008) + phase) * 0.018;
	point.y += cos((uTime * 0.00006) + (phase * 1.37)) * 0.012;
	gl_Position = vec4(point, 0.0, 1.0);
	gl_PointSize = 1.4 + (aSeed.z * 1.8);
}
`;

export const AMBIENT_FRAGMENT_SHADER = `
precision mediump float;
uniform vec3 uColor;

void main() {
	vec2 point = gl_PointCoord - vec2(0.5);
	float distanceSquared = dot(point, point);
	if (distanceSquared > 0.25) {
		discard;
	}
	float alpha = smoothstep(0.25, 0.0, distanceSquared) * 0.17;
	gl_FragColor = vec4(uColor, alpha);
}
`;
