// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

export function createAwtsmoosThreeMaterial(THREE, config = {}) {
	if (!THREE) {
		throw new Error('B"H | THREE namespace is required.');
	}
	if (config?.isMaterial) {
		return config;
	}
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
	const common = createCommonMaterialOptions(THREE, config);
	const kind = config.kind || config.type || "lambert";

	if (kind === "basic") {
		return new THREE.MeshBasicMaterial(common);
	}
	if (kind === "phong") {
		return new THREE.MeshPhongMaterial({
			...common,
			shininess: config.shininess ?? 30,
			specular: config.specular ?? 0x111111
		});
	}
	if (kind === "standard" || kind === "principled") {
		return new THREE.MeshStandardMaterial({
			...common,
			roughness: config.roughness ?? 0.8,
			metalness: config.metalness ?? config.metallic ?? 0,
			roughnessMap: config.roughnessMap || null,
			metalnessMap: config.metalnessMap || null,
			normalMap: config.normalMap || null,
			alphaMap: config.alphaMap || null,
			aoMap: config.aoMap || null,
			emissive: config.emissive ?? 0x000000,
			emissiveMap: config.emissiveMap || null
		});
	}
	return new THREE.MeshLambertMaterial(common);
}

function createCommonMaterialOptions(THREE, config) {
	return {
		color: config.color ?? 0xffffff,
		map: config.map || null,
		side: config.side ?? THREE.FrontSide,
		transparent: Boolean(config.transparent),
		opacity: config.opacity ?? 1,
		alphaTest: config.alphaTest ?? 0,
		depthWrite: config.depthWrite !== false,
		vertexColors: Boolean(config.vertexColors),
		wireframe: Boolean(config.wireframe)
	};
}

export default createAwtsmoosThreeMaterial;
