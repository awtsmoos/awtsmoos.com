// B"H
/** Shader scrolls: raw WebGL, skinned chossid, and ping-pong textured Eretz. */
export const fragmentShader = `
precision mediump float;

varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vUv;

uniform vec4 uColor;
uniform float uAlphaCutoff;
uniform int uAlphaMode;
uniform int uLit;
uniform int uUseMap;
uniform sampler2D uMap;
uniform vec2 uMapRepeat;

vec2 mirrorRepeat(vec2 uv) {
  vec2 repeated = uv * uMapRepeat;
  vec2 doubled = mod(repeated, 2.0);
  return 1.0 - abs(doubled - 1.0);
}

void main() {
  vec4 texel = vec4(1.0);
  if (uUseMap == 1) {
    texel = texture2D(uMap, mirrorRepeat(vUv));
  }

  vec4 mixedColor = uColor * vColor * texel;

  if (uAlphaMode == 1 && mixedColor.a < uAlphaCutoff) discard;
  if (mixedColor.a <= 0.003) discard;

  vec3 rgb = mixedColor.rgb;

  if (uLit == 1) {
    vec3 normal = normalize(vNormal);
    vec3 key = normalize(vec3(-0.45, 0.82, 0.35));
    vec3 fillDirection = normalize(vec3(0.50, 0.25, -0.80));
    float keyLight = max(dot(normal, key), 0.0);
    float fillLight = max(dot(normal, fillDirection), 0.0) * 0.22;
    float rim = pow(1.0 - abs(normal.z), 2.0) * 0.45;
    float luminance = dot(rgb, vec3(0.299, 0.587, 0.114));
    vec3 blackClothFloor = vec3(0.045, 0.055, 0.070);
    vec3 lifted = mix(blackClothFloor, rgb, smoothstep(0.025, 0.25, luminance));
    rgb = lifted * (0.38 + keyLight * 0.78 + fillLight) + vec3(0.10, 0.16, 0.22) * rim;
  }

  gl_FragColor = vec4(rgb, mixedColor.a);
}
`;

export const rigidVertexShader = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
attribute vec2 aUv;

uniform mat4 uMvp;
uniform mat4 uModel;
uniform float uPointSize;

varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vUv;

void main() {
  vNormal = mat3(uModel) * aNormal;
  vColor = aColor;
  vUv = aUv;
  gl_Position = uMvp * vec4(aPosition, 1.0);
  gl_PointSize = uPointSize;
}
`;

export const skinTextureVertexShader = `
precision highp float;

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
attribute vec2 aUv;
attribute vec4 aJoints;
attribute vec4 aWeights;

uniform mat4 uMvp;
uniform mat4 uModel;
uniform sampler2D uJointTexture;
uniform float uJointTextureHeight;
uniform float uPointSize;

varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vUv;

mat4 jointAt(float jointIndex) {
  float y = (jointIndex + 0.5) / uJointTextureHeight;
  return mat4(
    texture2D(uJointTexture, vec2(0.125, y)),
    texture2D(uJointTexture, vec2(0.375, y)),
    texture2D(uJointTexture, vec2(0.625, y)),
    texture2D(uJointTexture, vec2(0.875, y))
  );
}

void main() {
  vec4 weights = aWeights;
  float weightSum = weights.x + weights.y + weights.z + weights.w;
  if (weightSum > 0.0) weights /= weightSum;
  mat4 skin = jointAt(aJoints.x) * weights.x + jointAt(aJoints.y) * weights.y + jointAt(aJoints.z) * weights.z + jointAt(aJoints.w) * weights.w;
  vNormal = mat3(uModel * skin) * aNormal;
  vColor = aColor;
  vUv = aUv;
  gl_Position = uMvp * skin * vec4(aPosition, 1.0);
  gl_PointSize = uPointSize;
}
`;

export function uniformSkinVertexShader(maxJoints) {
  return `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
attribute vec2 aUv;
attribute vec4 aJoints;
attribute vec4 aWeights;

uniform mat4 uMvp;
uniform mat4 uModel;
uniform mat4 uJointMatrices[${maxJoints}];
uniform float uPointSize;

varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vUv;

void main() {
  vec4 weights = aWeights;
  float weightSum = weights.x + weights.y + weights.z + weights.w;
  if (weightSum > 0.0) weights /= weightSum;
  mat4 skin = uJointMatrices[int(aJoints.x)] * weights.x + uJointMatrices[int(aJoints.y)] * weights.y + uJointMatrices[int(aJoints.z)] * weights.z + uJointMatrices[int(aJoints.w)] * weights.w;
  vNormal = mat3(uModel * skin) * aNormal;
  vColor = aColor;
  vUv = aUv;
  gl_Position = uMvp * skin * vec4(aPosition, 1.0);
  gl_PointSize = uPointSize;
}
`;
}
