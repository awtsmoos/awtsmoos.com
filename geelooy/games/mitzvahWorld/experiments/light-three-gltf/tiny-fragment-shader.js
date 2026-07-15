// B"H
/** Lightweight material-aware valley shader for standard, water, foliage, emissive, and sky surfaces. */
export const fragmentShader = `
precision highp float;
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vUv;
varying vec3 vWorld;
uniform vec4 uColor;
uniform float uAlphaCutoff;
uniform int uAlphaMode;
uniform int uLit;
uniform int uUseMap;
uniform sampler2D uMap;
uniform vec2 uMapRepeat;
uniform int uUseMixMap;
uniform sampler2D uMixMap;
uniform vec2 uMixRepeat;
uniform float uMixStrength;
uniform float uMixPatchScale;
uniform float uMixPatchSharpness;
uniform int uMaterialMode;
uniform float uEmissiveStrength;
uniform float uTime;
uniform vec3 uAmbient;
uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform vec3 uCameraPosition;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
uniform float uExposure;

vec2 mirrorRepeat(vec2 value){
	vec2 fraction=fract(value);
	vec2 odd=mod(floor(value),2.0);
	return mix(fraction,1.0-fraction,odd);
}
float hash21(vec2 point){
	point=fract(point*vec2(123.34,456.21));
	point+=dot(point,point+45.32);
	return fract(point.x*point.y);
}
float valueNoise(vec2 point){
	vec2 cell=floor(point);
	vec2 local=fract(point);
	local=local*local*(3.0-2.0*local);
	return mix(
		mix(hash21(cell),hash21(cell+vec2(1.0,0.0)),local.x),
		mix(hash21(cell+vec2(0.0,1.0)),hash21(cell+vec2(1.0,1.0)),local.x),
		local.y
	);
}
float patchMask(vec2 worldPosition){
	if(uMixPatchScale<=0.00001)return 1.0;
	float broad=valueNoise(worldPosition*uMixPatchScale);
	float detail=valueNoise(worldPosition*uMixPatchScale*2.17+vec2(7.3,3.1));
	return smoothstep(uMixPatchSharpness,1.0,broad*0.78+detail*0.22);
}
vec4 baseTexel(){
	if(uUseMap!=1)return vec4(1.0);
	vec2 uv=vUv*uMapRepeat;
	if(uMaterialMode==1){
		vec2 flowA=uv+vec2(uTime*0.018,uTime*0.011);
		vec2 flowB=uv*1.73+vec2(-uTime*0.012,uTime*0.021);
		return mix(texture2D(uMap,mirrorRepeat(flowA)),texture2D(uMap,mirrorRepeat(flowB)),0.38);
	}
	return texture2D(uMap,mirrorRepeat(uv));
}
vec3 litSurface(vec3 albedo,vec3 normal){
	vec3 sun=normalize(uSunDirection);
	float key=max(dot(normal,sun),0.0);
	float wrap=max((dot(normal,sun)+0.28)/1.28,0.0);
	float sky=normal.y*0.5+0.5;
	vec3 coolSky=vec3(0.30,0.42,0.58)*sky;
	vec3 bounced=vec3(0.20,0.16,0.11)*(1.0-sky);
	return albedo*(uAmbient+coolSky*0.34+bounced*0.18+uSunColor*(key*0.84+wrap*0.18));
}
vec3 waterSurface(vec3 albedo,vec3 normal){
	float waveX=sin(vWorld.x*0.34+uTime*1.6)+sin(vWorld.z*0.71-uTime*1.1)*0.5;
	float waveZ=cos(vWorld.z*0.29-uTime*1.35)+cos(vWorld.x*0.63+uTime*1.05)*0.5;
	vec3 rippleNormal=normalize(normal+vec3(waveX*0.10,0.32,waveZ*0.10));
	vec3 viewDirection=normalize(uCameraPosition-vWorld);
	float fresnel=pow(1.0-max(dot(viewDirection,rippleNormal),0.0),3.0);
	float sparkle=pow(max(dot(reflect(-normalize(uSunDirection),rippleNormal),viewDirection),0.0),48.0);
	vec3 deep=mix(vec3(0.018,0.13,0.17),albedo*vec3(0.22,0.58,0.72),0.46);
	vec3 reflected=mix(vec3(0.30,0.48,0.62),uFogColor,0.42);
	return mix(deep,reflected,0.22+fresnel*0.62)+uSunColor*sparkle*1.7;
}
vec3 toneMap(vec3 color){
	color=vec3(1.0)-exp(-max(color,vec3(0.0))*uExposure);
	return pow(color,vec3(1.0/2.2));
}
void main(){
	vec4 texel=baseTexel();
	if(uUseMixMap==1&&uMixStrength>0.001&&uMaterialMode!=1){
		vec4 other=texture2D(uMixMap,mirrorRepeat(vUv*uMixRepeat));
		texel=mix(texel,other,uMixStrength*patchMask(vWorld.xz));
	}
	vec4 mixedColor=uColor*vColor*texel;
	if(uAlphaMode==1&&mixedColor.a<uAlphaCutoff)discard;
	if(mixedColor.a<=0.003)discard;
	vec3 textureLinear=pow(max(mixedColor.rgb,vec3(0.0)),vec3(2.2));
	vec3 normal=normalize(vNormal);
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
	float distanceToCamera=distance(uCameraPosition,vWorld);
	float fog=smoothstep(uFogNear,uFogFar,distanceToCamera);
	if(uMaterialMode!=4)rgb=mix(rgb,pow(uFogColor,vec3(2.2)),fog*0.88);
	gl_FragColor=vec4(toneMap(rgb),mixedColor.a);
}`;
