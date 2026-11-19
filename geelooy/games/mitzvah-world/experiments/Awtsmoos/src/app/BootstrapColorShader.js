// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapColorShader.js
 * @description Gives the ultra-light first renderer spatial material variation instead of flat-color placeholder surfaces.
 * The Awtsmoos reveals difference inside every finite patch of earth while one tiny shader keeps the frame free;
 * Awtsmoos.com turns color into textured-looking light without network images, material graphs, or heavyweight machinery.
 * Grain is smooth value noise (no checkerboard cells), contour variation lives at grass grade
 * (a few world units, never the old twenty-unit blobs), generated textures multiply the base
 * color when a material binds one, and distance fog settles far hills into atmospheric depth.
 * The skinning vertex shader shares the fragment shader and varyings, and reads
 * the same 4-wide RGBA float bone texture the rich renderer uploads, so the
 * first frame already wears the animated pose instead of the bind pose.
 */

export const BOOTSTRAP_VERTEX_SHADER = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
attribute vec2 aTexCoord;
uniform mat4 uProjectionView;
uniform mat4 uModel;
varying vec4 vColor;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vTexCoord;
void main() {
	vec4 worldPosition = uModel * vec4(aPosition, 1.0);
	vColor = aColor;
	vWorldPosition = worldPosition.xyz;
	vNormal = normalize(mat3(uModel) * aNormal);
	vTexCoord = aTexCoord;
	gl_Position = uProjectionView * worldPosition;
}
`;

export const BOOTSTRAP_SKIN_VERTEX_SHADER = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
attribute vec2 aTexCoord;
attribute vec4 aJoints;
attribute vec4 aWeights;
uniform mat4 uProjectionView;
uniform mat4 uModel;
uniform sampler2D uJointTexture;
uniform float uJointTextureHeight;
varying vec4 vColor;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vTexCoord;
mat4 jointAt(float joint) {
	float y = (joint + 0.5) / uJointTextureHeight;
	return mat4(
		texture2D(uJointTexture, vec2(0.125, y)),
		texture2D(uJointTexture, vec2(0.375, y)),
		texture2D(uJointTexture, vec2(0.625, y)),
		texture2D(uJointTexture, vec2(0.875, y))
	);
}
void main() {
	vec4 weights = normalize(aWeights);
	mat4 skin = jointAt(aJoints.x) * weights.x
		+ jointAt(aJoints.y) * weights.y
		+ jointAt(aJoints.z) * weights.z
		+ jointAt(aJoints.w) * weights.w;
	vec4 worldPosition = uModel * skin * vec4(aPosition, 1.0);
	vColor = aColor;
	vWorldPosition = worldPosition.xyz;
	vNormal = normalize(mat3(uModel) * (mat3(skin) * aNormal));
	vTexCoord = aTexCoord;
	gl_Position = uProjectionView * worldPosition;
}
`;

export const BOOTSTRAP_FRAGMENT_SHADER = `
precision mediump float;
uniform vec4 uColor;
uniform sampler2D uMap;
uniform float uUseMap;
uniform vec2 uMapRepeat;
uniform vec3 uCameraPos;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform vec3 uSunDirection;
varying vec4 vColor;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vTexCoord;
float awtsmoosHash(vec2 point) {
	return fract(sin(dot(point, vec2(12.9898, 78.233))) * 43758.5453);
}
void main() {
	vec4 texel = vec4(1.0);
	if (uUseMap > 0.5) {
		texel = texture2D(uMap, vTexCoord * uMapRepeat);
	}
	vec4 base = uColor * vColor * texel;
	vec2 samplePoint = vWorldPosition.xz * 0.72;
	vec2 cell = floor(samplePoint);
	vec2 fraction = fract(samplePoint);
	vec2 fade = fraction * fraction * (3.0 - 2.0 * fraction);
	float grain = mix(
		mix(awtsmoosHash(cell), awtsmoosHash(cell + vec2(1.0, 0.0)), fade.x),
		mix(awtsmoosHash(cell + vec2(0.0, 1.0)), awtsmoosHash(cell + vec2(1.0, 1.0)), fade.x),
		fade.y);
	float contour = 0.5
		+ 0.26 * sin(vWorldPosition.x * 1.7 + vWorldPosition.z * 1.31 + vWorldPosition.y * 0.9)
		+ 0.14 * sin(vWorldPosition.x * 3.83 - vWorldPosition.z * 2.57 + vWorldPosition.y * 1.7)
		+ 0.07 * sin(vWorldPosition.x * 7.31 + vWorldPosition.z * 6.17);
	contour = clamp(contour, 0.0, 1.0);
	float light = 0.82 + grain * 0.10 + contour * 0.10;
	// Directional sun: faces turned to the day sun read brighter, faces
	// turned away stay readable at 0.72, so the head gains form instead of
	// one flat pale sheet. Geometry without normals gets the constant up
	// vector from the buffer cache, which lands near 0.89 and stays flat.
	float lambert = 0.72 + 0.28 * clamp(dot(normalize(vNormal), normalize(uSunDirection)), 0.0, 1.0);
	vec3 cool = base.rgb * vec3(0.90, 0.98, 1.05);
	vec3 warm = base.rgb * vec3(1.08, 1.01, 0.88);
	vec3 varied = mix(cool, warm, contour) * light * lambert;
	float fogDistance = distance(vWorldPosition, uCameraPos);
	float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * fogDistance * fogDistance);
	vec3 fogged = mix(varied, uFogColor, clamp(fogFactor, 0.0, 1.0));
	gl_FragColor = vec4(fogged, base.a);
}
`;
