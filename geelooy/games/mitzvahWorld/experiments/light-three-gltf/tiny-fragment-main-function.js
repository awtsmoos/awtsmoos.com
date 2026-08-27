// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-fragment-main-function.js
 * @description Selects atmospheric, terrain, water, emissive, foliage, or ordinary surface law.
 * The Awtsmoos remains one through every visible category; Awtsmoos.com lets sky bypass
 * ordinary texture darkness and fog while all earthly surfaces retain measured lighting.
 */

export const fragmentMainFunction = `
void main(){
	if(uMaterialMode==4){
		vec3 direction=normalize(vWorld-uCameraPosition);
		gl_FragColor=vec4(toneMap(skySurface(direction)),1.0);
		return;
	}
	vec3 normal=normalize(vNormal);
	vec4 texel=uMaterialMode==5?layeredTerrainTexel(normal):baseTexel();
	if(uMaterialMode!=5&&uUseMixMap==1&&uMixStrength>0.001&&uMaterialMode!=1){
		vec4 other=texture2D(uMixMap,mirrorRepeat(vUv*uMixRepeat));
		texel=mix(texel,other,uMixStrength*patchMask(vWorld.xz));
	}
	vec4 mixedColor=uColor*vColor*texel;
	if(uAlphaMode==1&&mixedColor.a<uAlphaCutoff)discard;
	if(mixedColor.a<=0.003)discard;
	vec3 encoded=max(mixedColor.rgb,vec3(0.0));
	vec3 textureLinear=encoded*encoded;
	vec3 rgb=textureLinear;
	if(uMaterialMode==1){
		rgb=waterSurface(textureLinear,normal);
	}else if(uMaterialMode==3){
		rgb=litSurface(textureLinear,normal)+textureLinear*uEmissiveStrength;
	}else if(uLit==1){
		rgb=litSurface(textureLinear,normal);
		if(uMaterialMode==2){
			float back=max(dot(-normal,normalize(uSunDirection)),0.0);
			rgb+=textureLinear*uSunColor*back*0.22;
		}
	}
	vec3 cameraDelta=uCameraPosition-vWorld;
	float distanceSquared=dot(cameraDelta,cameraDelta);
	float fog=smoothstep(uFogNear*uFogNear,uFogFar*uFogFar,distanceSquared);
	rgb=mix(rgb,uFogColor*uFogColor,fog*0.88);
	gl_FragColor=vec4(toneMap(rgb),mixedColor.a);
}
`;
