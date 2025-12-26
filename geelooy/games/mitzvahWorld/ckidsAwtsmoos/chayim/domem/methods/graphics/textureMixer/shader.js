
// B"H
import * as THREE from '/games/scripts/build/three.module.js';

export const MAX_SEGMENTS_FOR_SHADER = 200;
export const TOTAL_VEC3_COUNT = MAX_SEGMENTS_FOR_SHADER * 2;

export function getShader(base, overlay, repeatX, repeatY, textureScale, usePathMixing, feather, intensity, lowHeight, highHeight, pathSegments, numActualSegments) {
    console.log("B\"H [TextureMixerShader] Generating shader with:", {
        repeatX, repeatY, textureScale, usePathMixing, numActualSegments
    });

    return {
        uniforms: {
            baseTexture: { value: base },
            overlayTexture: { value: overlay },
            repeatVector: { value: new THREE.Vector2(repeatX, repeatY) },
            textureScale: { value: textureScale },
            usePathMixing: { value: usePathMixing },
            feather: { value: feather },
            intensity: { value: intensity },
            lowHeight: { value: lowHeight },
            highHeight: { value: highHeight },
            pathSegments: { value: pathSegments },
            numPathSegments: { value: numActualSegments }
        },
        vertexShader: `
            varying vec3 vWorldPosition;
            #include <common>
            #include <uv_pars_vertex>
            #include <color_pars_vertex>
            #include <fog_pars_vertex>
            #include <morphtarget_pars_vertex>
            #include <skinning_pars_vertex>
            #include <logdepthbuf_pars_vertex>
            #include <clipping_planes_pars_vertex>

            void main() {
                #include <uv_vertex>
                #include <color_vertex>
                #include <morphcolor_vertex>
                #include <begin_vertex>
                #include <morphtarget_vertex>
                #include <skinning_vertex>
                #include <project_vertex>
                #include <logdepthbuf_vertex>
                #include <clipping_planes_vertex>
                
                vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                
                #include <worldpos_vertex>
                #include <envmap_vertex>
                #include <fog_vertex>
            }
        `,
        fragmentShader: `
            uniform vec3 diffuse;
            uniform float opacity;
            uniform sampler2D baseTexture;
            uniform sampler2D overlayTexture;
            uniform vec2 repeatVector;
            uniform float textureScale;
            uniform float feather;
            uniform float lowHeight;
            uniform float highHeight;
            uniform float intensity;
            uniform bool usePathMixing;
            uniform vec3 pathSegments[${TOTAL_VEC3_COUNT}];
            uniform int numPathSegments;
            
            varying vec3 vWorldPosition;
            #include <common>
            #include <packing>
            #include <dithering_pars_fragment>
            #include <color_pars_fragment>
            #include <uv_pars_fragment>
            #include <map_pars_fragment>
            #include <alphamap_pars_fragment>
            #include <alphatest_pars_fragment>
            #include <aomap_pars_fragment>
            #include <lightmap_pars_fragment>
            #include <emissivemap_pars_fragment>
            #include <envmap_common_pars_fragment>
            #include <envmap_pars_fragment>
            #include <cube_uv_reflection_fragment>
            #include <fog_pars_fragment>
            #include <bsdfs>
            #include <lights_pars_begin>
            #include <normal_pars_fragment>
            #include <lights_phong_pars_fragment>
            #include <shadowmap_pars_fragment>
            #include <bumpmap_pars_fragment>
            #include <normalmap_pars_fragment>
            #include <specularmap_pars_fragment>
            #include <logdepthbuf_pars_fragment>
            #include <clipping_planes_pars_fragment>

            float distanceToLineSegment(vec3 p, vec3 a, vec3 b) {
                vec2 p2 = p.xz;
                vec2 a2 = a.xz;
                vec2 b2 = b.xz;
                vec2 pa = p2 - a2, ba = b2 - a2;
                float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
                return length(pa - ba * h);
            }

            void main() {
                #include <clipping_planes_fragment>
                vec4 diffuseColor = vec4(diffuse, opacity);
                #include <logdepthbuf_fragment>
                #include <map_fragment>
                #include <color_fragment>
                #include <alphamap_fragment>
                #include <alphatest_fragment>
                #include <specularmap_fragment>
                #include <normal_fragment_begin>
                #include <normal_fragment_maps>
                #include <emissivemap_fragment>
                #include <lights_phong_fragment>
                #include <lights_fragment_begin>
                #include <lights_fragment_maps>
                #include <lights_fragment_end>
                #include <aomap_fragment>

                // Custom Texture Mixing Logic
                vec4 dirtColor = vec4(1.0);
                if(true) dirtColor = texture2D(baseTexture, (vWorldPosition.xz * textureScale) * repeatVector);
                
                vec4 grassColor = vec4(0.5, 0.8, 0.5, 1.0);
                if(true) grassColor = texture2D(overlayTexture, (vWorldPosition.xz * textureScale) * repeatVector);

                float mixFactor = 0.0;
                if (usePathMixing && numPathSegments > 0) {
                    float minDistance = 1e38;
                    for (int i = 0; i < ${MAX_SEGMENTS_FOR_SHADER}; ++i) {
                        if (i >= numPathSegments) break;
                        minDistance = min(minDistance, distanceToLineSegment(vWorldPosition, pathSegments[i * 2], pathSegments[i * 2 + 1]));
                    }
                    float smoothFactor = 1.0 - smoothstep(0.0, feather, minDistance);
                    mixFactor = pow(smoothFactor, 1.0 / intensity);
                } else {
                    mixFactor = smoothstep(lowHeight, highHeight, vWorldPosition.y);
                }
                
                vec4 mixedColor = mix(dirtColor, grassColor, mixFactor);
                outgoingLight *= mixedColor.rgb; // Modulate lighting result with texture mix

                #include <envmap_fragment>
                #include <output_fragment>
                #include <tonemapping_fragment>
                #include <encodings_fragment>
                #include <fog_fragment>
                #include <premultiplied_alpha_fragment>
                #include <dithering_fragment>
            }
        `
    };
}
