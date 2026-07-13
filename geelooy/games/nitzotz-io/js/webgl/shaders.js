// B"H
// Boruch Hashem
// Blessed is He

export const VS = `
attribute vec3 aPos;
attribute vec3 aNormal;
attribute vec4 aColor;
uniform mat4 uVP;
uniform vec3 uPos;
uniform vec3 uScale;
uniform vec3 uCamera;
uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform vec3 uAmbientColor;
uniform float uRot;
uniform float uTilt;
varying vec3 vColor;
varying float vFog;
varying float vHeight;
varying float vAlpha;

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
	float facing = max(dot(n, normalize(uSunDirection)), 0.0);
	float wrapped = max(facing * 0.78 + 0.22, 0.0);
	vColor = aColor.rgb * (uAmbientColor + uSunColor * wrapped);
	vFog = distance(p, uCamera);
	vHeight = p.y;
	vAlpha = aColor.a;
	gl_Position = uVP * vec4(p, 1.0);
}
`;

export const FS = `
precision mediump float;
uniform vec3 uColor;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
uniform float uHazeHeight;
uniform float uHazeStrength;
uniform float uAlpha;
uniform float uGlow;
varying vec3 vColor;
varying float vFog;
varying float vHeight;
varying float vAlpha;

void main() {
	vec3 color = vColor * uColor + vec3(uGlow * 0.18);
	float distanceFog = clamp((vFog - uFogNear) / max(1.0, uFogFar - uFogNear), 0.0, 1.0);
	float lowAltitude = clamp((uHazeHeight - vHeight) / max(1.0, uHazeHeight + 24.0), 0.0, 1.0);
	float haze = min(0.86, distanceFog * (0.56 + lowAltitude * uHazeStrength));
	gl_FragColor = vec4(mix(color, uFogColor, haze), uAlpha * vAlpha);
}
`;
