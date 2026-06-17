// B"H
export const SHADERS = Object.freeze({ basic:{ vertex:"void main(){gl_Position=vec4(position,1.0);}", fragment:"void main(){gl_FragColor=vec4(1.0);}" }, sunGlow:{ vertex:"void main(){gl_Position=vec4(position,1.0);}", fragment:"void main(){gl_FragColor=vec4(1.0,0.84,0.35,1.0);}" }, bark:{ vertex:"void main(){gl_Position=vec4(position,1.0);}", fragment:"void main(){gl_FragColor=vec4(0.32,0.18,0.08,1.0);}" } });
export function shaderByName(name = "basic") { return SHADERS[name] || SHADERS.basic; }
