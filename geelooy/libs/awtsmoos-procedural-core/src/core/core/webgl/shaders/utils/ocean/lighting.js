
// B"H
export const FS_OCEAN_LIGHTING = `
vec3 ap_lgt(vec3 n, vec3 v, vec3 r, vec2 p, float wh, float sh) {
    vec3 l=normalize(uLightDirection);
    vec3 h=normalize(l+v);
    
    float nh=max(dot(n,h),0.0);
    float sm=pow(nh,1024.0)*1.5;
    float ss=pow(nh,128.0)*0.4;
    float sg=pow(max(0.0,dot(r,l)),4096.0)*2.5;

    float fs=clamp(sm+ss+sg,0.0,10.0)*max(uSunIntensity,0.1);
    return uDirectionalLightColor*fs;
}
`;
