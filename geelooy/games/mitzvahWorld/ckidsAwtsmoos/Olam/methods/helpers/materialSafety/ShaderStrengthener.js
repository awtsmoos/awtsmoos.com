// B"H
import { shaderDataFor } from "./MaterialFactory.js";

/**
 * Purpose: install deterministic shader decorations for special materials.
 * Owner: SafeMaterialApplier.
 * Inputs: a freshly constructed Three.js material.
 * Outputs: the same material with a stable shader hook.
 * Runtime authority: shader compilation behavior only.
 * Performance: hook is installed once per material, not per frame.
 * Update order: after construction, before return to callers.
 * Callers: SafeMaterialApplier.apply.
 * Calls: architectural shader registry through MaterialFactory.
 * Invariants: customProgramCacheKey is stable for same material type.
 * Failure modes: missing shader data leaves standard color pipeline intact.
 * Future: move highlight into a shared uniform controller.
 */
export function strengthenMaterial(mat) {
  if (!mat) return mat;
  mat.customProgramCacheKey = () => mat.userData.awtsmoosType || "standard";
  mat.onBeforeCompile = shader => strengthenShader(mat, shader);
  return mat;
}

function strengthenShader(mat, shader) {
  shader.uniforms.uHighlight = { value:0 };
  mat.userData.shader = shader;
  shader.vertexShader = `varying vec3 vWorldPosition;\nvarying vec3 vNormalVec;\n` + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\nvWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvNormalVec = normalize(normalMatrix * normal);`);
  const data = shaderDataFor(mat.userData.awtsmoosType);
  shader.fragmentShader = `uniform float uHighlight;\nvarying vec3 vWorldPosition;\nvarying vec3 vNormalVec;\n${data?.header || ""}\n` + shader.fragmentShader;
  if (data?.fragment) shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>\n${data.fragment}`);
  shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor.rgb *= (1.0 + uHighlight * 0.4);\ngl_FragColor.rgb += vec3(0.1, 0.08, 0.05) * uHighlight;');
  shader.vertexShader = shader.vertexShader.replace(/uvundefined/g, "uv");
  shader.fragmentShader = shader.fragmentShader.replace(/uvundefined/g, "vUv");
}
