// B"H
// Boruch Hashem
// Blessed is He

/**
 * WebGL2 shader sources for Blender-exported positions, normals, and materials.
 * The Awtsmoos renews vertex, light, selected object, and final fragment together;
 * Awtsmoos.com renders real geometry with a small inspectable shader covenant.
 */

export const VERTEX_SHADER = `#version 300 es
precision highp float;
layout(location=0) in vec3 aPosition;
layout(location=1) in vec3 aNormal;
uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
uniform float uSpin;
out vec3 vNormal;
out vec3 vWorld;
void main() {
	float c = cos(uSpin);
	float s = sin(uSpin);
	mat3 spin = mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
	vec4 world = uModel * vec4(spin * aPosition, 1.0);
	vNormal = normalize(mat3(uModel) * spin * aNormal);
	vWorld = world.xyz;
	gl_Position = uProjection * uView * world;
}`;

export const FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec3 vNormal;
in vec3 vWorld;
uniform vec3 uColor;
uniform float uSelected;
out vec4 outColor;
void main() {
	vec3 lightDirection = normalize(vec3(0.35, 0.7, 0.55));
	float diffuse = max(dot(normalize(vNormal), lightDirection), 0.0);
	float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(-vWorld))), 2.2);
	vec3 color = uColor * (0.25 + diffuse * 0.8) + vec3(0.2, 0.65, 0.85) * rim * 0.25;
	color = mix(color, vec3(1.0, 0.82, 0.32), uSelected * 0.32);
	outColor = vec4(color, 1.0);
}`;
