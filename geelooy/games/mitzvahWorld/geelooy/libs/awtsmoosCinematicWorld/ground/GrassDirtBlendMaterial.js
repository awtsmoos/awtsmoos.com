// B"H
import { groundTextures } from "../assets/EzTreeStaticAssets.js";
import { loadEzTexture } from "../materials/EzTreeTextureLoader.js";
/** Ground material that merges hosted EZ Tree grass into dirt with shader noise. */
export function createGrassDirtBlendMaterial(THREE, { half = true, repeat = 36, grassBias = 0.56 } = {}) {
  const urls = groundTextures(half);
  const grass = loadEzTexture(THREE, urls.grass, { srgb: true, repeat: { x: repeat, y: repeat } });
  const dirt = loadEzTexture(THREE, urls.dirt, { srgb: true, repeat: { x: repeat, y: repeat } });
  const normal = loadEzTexture(THREE, urls.dirtNormal, { repeat: { x: repeat, y: repeat } });
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: grass, roughness: 0.92, normalMap: normal });
  mat.userData.ezTreeGroundTextures = urls;
  mat.userData.awtsmoosGrassDirtBlend = true;
  mat.onBeforeCompile = shader => {
    shader.uniforms.uEzGrassMap = { value: grass };
    shader.uniforms.uEzDirtMap = { value: dirt };
    shader.uniforms.uEzGrassBias = { value: grassBias };
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      "#include <common>\nuniform sampler2D uEzGrassMap; uniform sampler2D uEzDirtMap; uniform float uEzGrassBias; float awtsHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}"
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      "vec2 ezUv = vMapUv; vec3 ezGrass = texture2D(uEzGrassMap, ezUv).rgb; vec3 ezDirt = texture2D(uEzDirtMap, ezUv).rgb; float ezNoise = smoothstep(0.25,0.85,awtsHash(floor(ezUv*80.0))); diffuseColor.rgb *= mix(ezDirt, ezGrass, clamp(uEzGrassBias + ezNoise*0.28,0.0,1.0));"
    );
  };
  return mat;
}
