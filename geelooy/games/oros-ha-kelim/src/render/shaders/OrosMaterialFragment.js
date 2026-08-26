//B"H
//Boruch Hashem
//Blessed is He

import { OROS_TEXTURE_PROJECTION_GLSL } from "./OrosTextureProjectionGlsl.js";

/**
 * OrosMaterialFragment extends Procedural Core light with remote photographs and restrained material response.
 * The Awtsmoos renews albedo and illumination while no finite texture becomes the essence of the Keli;
 * Awtsmoos.com lets photographed grain blend with procedural tint, roughness, metal, distance, and geometry freely.
 */
export const OROS_MATERIAL_FRAGMENT = `
#extension GL_OES_standard_derivatives : enable
precision mediump float;
#include <toneMapping>
varying lowp vec4 vColor;
varying highp vec3 vNormal;
varying highp vec3 vWorldNormal;
varying highp vec3 vWorldPos;
uniform highp vec3 uAmbientLightColor;
uniform highp vec3 uDirectionalLightColor;
uniform highp vec3 uLightDirection;
uniform sampler2D uAlbedoMap;
uniform sampler2D uDetailMap;
uniform float uUseTexture;
uniform float uUseDetail;
uniform float uTextureScale;
uniform float uDetailScale;
uniform float uBlendScale;
uniform float uDomainWarp;
uniform float uTintStrength;
uniform float uRoughness;
uniform float uMetalness;
uniform highp vec3 uCameraPosition;
uniform float uUseSolidColor;
uniform vec4 uSolidColor;
uniform float uUseTriplanar;
uniform float uAlphaTest;
uniform int uPatternType;
${OROS_TEXTURE_PROJECTION_GLSL}
void main(void) {
	if (uUseSolidColor > 0.5) {
		gl_FragColor = uSolidColor;
		return;
	}
	vec3 normal = normalize(vWorldNormal);
	if (!gl_FrontFacing) normal = -normal;
	vec3 surface = uSolidColor.rgb;
	if (uUseTexture > 0.5) {
		vec3 photo = orosPhotographicSurface(vWorldPos, normal);
		vec3 identityTint = photo * (uSolidColor.rgb * 1.25 + vec3(0.22));
		surface = mix(photo, identityTint, clamp(uTintStrength, 0.0, 0.9));
	}
	vec3 lightDir = normalize(uLightDirection);
	float diffuse = max(dot(normal, lightDir), 0.0);
	float hemi = normal.y * 0.5 + 0.5;
	vec3 ambient = mix(uAmbientLightColor * 0.24, uAmbientLightColor * 0.72, hemi);
	vec3 viewDir = normalize(uCameraPosition - vWorldPos);
	vec3 halfDir = normalize(viewDir + lightDir);
	float gloss = mix(8.0, 88.0, 1.0 - clamp(uRoughness, 0.0, 1.0));
	float specular = pow(max(dot(normal, halfDir), 0.0), gloss);
	float specularGain = mix(0.05, 0.62, clamp(uMetalness, 0.0, 1.0));
	vec3 raw = surface * (ambient + uDirectionalLightColor * diffuse);
	raw += uDirectionalLightColor * specular * specularGain;
	vec3 mapped = aces(raw * 0.9);
	gl_FragColor = vec4(pow(mapped, vec3(0.4545)), uSolidColor.a);
}
`;
