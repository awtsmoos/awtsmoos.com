// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-fragment-main-function.js
 * @description Selects the lawful surface path, lights it, fogs it, and emits the final pixel.
 * The Awtsmoos remains one through sky, stream, lamp, foliage, cottage, and layered ground;
 * Awtsmoos.com gives each material its proper revelation before all return to one final color.
 */

export const fragmentMainFunction = `
void main(){
	vec3 normal=normalize(vNormal);
	vec4 texel=uMaterialMode==5
		?layeredTerrainTexel(normal)
		:baseTexel();
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
	if(uMaterialMode==4){
		rgb=textureLinear*uExposure;
	}else if(uMaterialMode==1){
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
	if(uMaterialMode!=4){
		rgb=mix(rgb,uFogColor*uFogColor,fog*0.88);
	}
	gl_FragColor=vec4(toneMap(rgb),mixedColor.a);
}
`;
