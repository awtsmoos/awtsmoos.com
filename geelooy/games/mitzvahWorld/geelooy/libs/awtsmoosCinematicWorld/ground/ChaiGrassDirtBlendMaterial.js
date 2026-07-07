// B"H
import { groundTextures } from "../assets/ChaiForestStaticAssets.js";
import { loadProgressiveTexture } from "../materials/ProgressiveTextureLoader.js";
export function createGrassDirtBlendMaterial(THREE, { half = true, repeat = 34, grassBias = 0.58 } = {}) {
  const urls = groundTextures(half);
  const grass = loadProgressiveTexture(THREE, urls.grass, { repeat: { x: repeat, y: repeat } });
  const dirt = loadProgressiveTexture(THREE, urls.dirt, { repeat: { x: repeat, y: repeat } });
  const importedNormal = loadProgressiveTexture(THREE, urls.importedDirtNormal, { srgb: false, repeat: { x: repeat, y: repeat } });
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: grass, normalMap: importedNormal, roughness: 0.94 });
  mat.userData.chaiForestGroundTextures = urls; mat.userData.loadsFastThenUpgrades = true;
  mat.onBeforeCompile = shader => {
    shader.uniforms.uChaiGrass = { value: grass }; shader.uniforms.uChaiDirt = { value: dirt }; shader.uniforms.uChaiGrassBias = { value: grassBias };
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform sampler2D uChaiGrass; uniform sampler2D uChaiDirt; uniform float uChaiGrassBias; float awtsHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}');
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', 'vec2 cuv=vMapUv; vec3 g=texture2D(uChaiGrass,cuv).rgb; vec3 d=texture2D(uChaiDirt,cuv).rgb; float n=smoothstep(.18,.88,awtsHash(floor(cuv*96.0))); diffuseColor.rgb*=mix(d,g,clamp(uChaiGrassBias+n*.25,0.0,1.0));');
  };
  return mat;
}
