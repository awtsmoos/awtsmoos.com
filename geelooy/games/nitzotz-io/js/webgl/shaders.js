// B"H

export const VS = `
attribute vec3 aPos;
attribute vec3 aNormal;
attribute vec4 aColor;
uniform mat4 uVP;
uniform vec3 uPos;
uniform vec3 uScale;
uniform vec3 uCamera;
uniform float uRot;
uniform float uTilt;
varying float vLight;
varying float vDistance;
varying vec4 vMaterial;

void main() {
	float c = cos(uRot);
	float s = sin(uRot);
	float tc = cos(uTilt);
	float ts = sin(uTilt);
	vec3 p = aPos * uScale;
	p = vec3(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
	p = vec3(p.x, p.y * tc - p.z * ts, p.y * ts + p.z * tc) + uPos;
	vec3 n = normalize(vec3(aNormal.x * c - aNormal.z * s, aNormal.y, aNormal.x * s + aNormal.z * c));
	n = normalize(vec3(n.x, n.y * tc - n.z * ts, n.y * ts + n.z * tc));
	vLight = 0.72 + max(dot(n, normalize(vec3(-0.35, 0.82, 0.45))), 0.0) * 0.78;
	vDistance = distance(p, uCamera);
	vMaterial = aColor;
	gl_Position = uVP * vec4(p, 1.0);
}
`;

export const FS = `
precision mediump float;
uniform vec3 uColor;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
uniform float uAlpha;
uniform float uGlow;
uniform float uTime;
varying float vLight;
varying float vDistance;
varying vec4 vMaterial;

void main() {
	vec3 color = vMaterial.rgb * uColor * (vLight + uGlow * 0.58);
	color = pow(color, vec3(0.9));
	color += color * max(0.0, sin(uTime * 2.0)) * uGlow * 0.05;
	float fog = smoothstep(uFogNear, uFogFar, vDistance);
	color = mix(color, uFogColor, fog * 0.6);
	gl_FragColor = vec4(color, uAlpha * vMaterial.a);
}
`;
