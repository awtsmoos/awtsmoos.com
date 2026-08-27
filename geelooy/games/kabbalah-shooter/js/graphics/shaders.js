//B"H
export const VS_SOURCE = `
  precision mediump float; 
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  attribute vec4 a_color;

  uniform vec2 u_resolution;
  uniform vec2 u_camera;
  uniform float u_time;
  uniform float u_world; 
  uniform float u_shake;
  uniform float u_aberration;
  uniform float u_underwater;

  varying vec2 v_texCoord;
  varying vec4 v_color;
  varying vec2 v_pos;
  varying vec2 v_screenPos;

  void main() {
    vec2 pos = a_position - u_camera;
    
    // SHAKE
    pos += vec2(sin(u_time*50.0), cos(u_time*43.0)) * u_shake;

    // WORLD 2: YETZIRAH (Fluid)
    if(u_world > 0.5 && u_world < 1.5) {
        pos.x += sin(pos.y * 0.01 + u_time * 3.0) * 5.0;
    }
    
    // WORLD 3: BERIAH (Geometric Glitch)
    if(u_world > 1.5 && u_world < 2.5) {
        float glitch = step(0.98, sin(u_time * 20.0 + pos.y * 0.1));
        pos.x += glitch * 20.0;
        pos.y += glitch * -10.0;
    }

    // WORLD 4: ATZILUS (Divine Light)
    if(u_world > 2.5 && u_world < 3.5) {
        float breath = 1.0 + sin(u_time) * 0.05;
        pos *= breath;
    }
    
    // TVIAH (Underwater)
    if(u_underwater > 0.0) {
        pos.x += sin(pos.y * 0.05 + u_time * 2.0) * 10.0 * u_underwater;
        pos.y += cos(pos.x * 0.05 + u_time * 2.5) * 5.0 * u_underwater;
    }

    vec2 zeroToOne = pos / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    v_texCoord = a_texCoord;
    v_color = a_color;
    v_pos = pos;
    v_screenPos = zeroToOne;
  }
`;

export const FS_SOURCE = `
  precision mediump float;
  varying vec2 v_texCoord;
  varying vec4 v_color;
  varying vec2 v_pos;
  varying vec2 v_screenPos;
  
  uniform sampler2D u_image;
  uniform float u_time;
  uniform float u_world;
  uniform float u_aberration;
  uniform float u_luminosity;
  uniform float u_underwater; 
  uniform float u_lens;

  float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  float noise(vec2 p) {
      vec2 ip = floor(p);
      vec2 u = fract(p);
      u = u*u*(3.0-2.0*u);
      float res = mix(
          mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
          mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y);
      return res*res;
  }

  void main() {
    vec4 baseColor = texture2D(u_image, v_texCoord);
    
    // Klippot Distortion (Aberration)
    if(u_aberration > 0.0) {
        float shift = u_aberration * 0.005;
        float r = texture2D(u_image, v_texCoord + vec2(shift, 0.0)).r;
        float b = texture2D(u_image, v_texCoord - vec2(shift, 0.0)).b;
        baseColor.r = r;
        baseColor.b = b;
    }

    // --- DIVINE VOID BACKGROUND ---
    // If the texture alpha is near zero, we render the procedural background
    if (baseColor.a < 0.1) { 
        float n = noise(v_screenPos * 5.0 + vec2(0.0, u_time * 0.2));
        float n2 = noise(v_screenPos * 10.0 - vec2(u_time * 0.1, 0.0));
        
        float fog = n * n2 * 0.5 + 0.2; 
        
        fog += u_luminosity * 0.2;

        vec3 fogColor = vec3(0.1, 0.1, 0.2); 
        
        if(u_underwater > 0.0) {
            fogColor = mix(fogColor, vec3(0.0, 0.4, 0.6), u_underwater * 0.6);
            fog += u_underwater * 0.2;
        }

        gl_FragColor = vec4(fogColor * fog, 1.0);
        return;
    }
    
    // --- GAME OBJECTS ---
    
    // 1. Daat Elyon Lens (Reveal Invisible)
    if(u_lens > 0.0 && baseColor.a < 0.5 && baseColor.a > 0.01) {
        baseColor.a = 1.0;
        baseColor.rgb = vec3(0.5, 0.8, 1.0); 
    }

    // 2. Luminosity & Effects
    baseColor.rgb += u_luminosity * 0.15;
    
    if(u_underwater > 0.0) {
        float caustic = noise(v_pos * 0.02 + u_time);
        baseColor.rgb += vec3(0.1, 0.2, 0.3) * caustic * u_underwater;
    }

    vec4 finalColor = baseColor * v_color;

    // 3. BRIGHTNESS BOOST (The "Way Brighter" Fix)
    // We apply a gamma correction (pow) to brighten midtones, then a linear multiplier.
    // We ignore low alpha to avoid outlining artifacts.
    if(finalColor.a > 0.1) {
        finalColor.rgb = pow(finalColor.rgb, vec3(0.8)); // Brighten midtones
        finalColor.rgb *= 1.8; // Linear boost
        finalColor.rgb += 0.1; // Floor brightness
    }

    gl_FragColor = finalColor;
  }
`;