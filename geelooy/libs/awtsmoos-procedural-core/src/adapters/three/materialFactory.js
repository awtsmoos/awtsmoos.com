/**
 * B"H
 * @file materialFactory.js
 * @description
 * Material creation helpers for generated Three.js meshes.
 */

/**
 * Creates a Three material from plain config or returns an existing material.
 *
 * @param {any} THREE
 * THREE namespace.
 *
 * @param {Object|any} [config={}]
 * Material, shader config, or simple material config.
 *
 * @returns {any}
 * THREE.Material.
 */
export function createAwtsmoosThreeMaterial(THREE, config = {}) {
  if (!THREE) throw new Error("B\"H | THREE namespace is required");

  if (config && config.isMaterial) return config;

  if (config?.shader) {
    return new THREE.ShaderMaterial({
      uniforms: config.shader.uniforms || {},
      vertexShader: config.shader.vertexShader,
      fragmentShader: config.shader.fragmentShader,
      transparent: Boolean(config.shader.transparent),
      side: config.shader.side ?? THREE.FrontSide,
      vertexColors: Boolean(config.shader.vertexColors)
    });
  }

  if (config?.vertexColors) {
    return new THREE.MeshLambertMaterial({
      color: config.color ?? 0xffffff,
      vertexColors: true,
      side: config.side ?? THREE.FrontSide,
      transparent: Boolean(config.transparent),
      opacity: config.opacity ?? 1
    });
  }

  const kind = config?.kind || config?.type || "lambert";
  const common = {
    color: config?.color ?? 0xffffff,
    side: config?.side ?? THREE.FrontSide,
    transparent: Boolean(config?.transparent),
    opacity: config?.opacity ?? 1
  };

  if (kind === "basic") return new THREE.MeshBasicMaterial(common);
  if (kind === "phong") return new THREE.MeshPhongMaterial(common);
  if (kind === "standard") return new THREE.MeshStandardMaterial(common);

  return new THREE.MeshLambertMaterial(common);
}

export default createAwtsmoosThreeMaterial;
