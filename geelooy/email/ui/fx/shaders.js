
// B"H
export const SHADERS = {
    VS: `
        attribute vec2 a_position;
        attribute float a_size;
        attribute float a_alpha;
        attribute float a_type; // 0=rain, 1=sonar, 2=explosion
        
        uniform vec2 u_resolution;
        uniform float u_scroll;
        
        varying float v_alpha;
        varying float v_type;
        
        void main() {
            vec2 pos = a_position;
            if(a_type < 0.5) { // Rain parallax
                pos.y = mod(pos.y - u_scroll * 0.5, u_resolution.y);
            }
            
            // Convert to Clip Space
            vec2 zeroToOne = pos / u_resolution;
            vec2 zeroToTwo = zeroToOne * 2.0;
            vec2 clipSpace = zeroToTwo - 1.0;
            
            gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
            gl_PointSize = a_size;
            
            v_alpha = a_alpha;
            v_type = a_type;
        }
    `,
    FS: `
        precision mediump float;
        varying float v_alpha;
        varying float v_type;
        
        void main() {
            vec2 coord = gl_PointCoord - vec2(0.5);
            float dist = length(coord);
            
            if (v_type < 0.5) { 
                // Type 0: Rain (Soft Glow)
                if(dist > 0.5) discard;
                float glow = 1.0 - (dist * 2.0);
                gl_FragColor = vec4(0.02, 0.7, 0.8, v_alpha * glow);
                
            } else if (v_type < 1.5) {
                // Type 1: Sonar (Ring)
                float ring = smoothstep(0.4, 0.45, dist) - smoothstep(0.45, 0.5, dist);
                gl_FragColor = vec4(0.02, 0.7, 0.8, v_alpha * ring);
                
            } else {
                // Type 2: Explosion (Spark)
                if(dist > 0.5) discard;
                gl_FragColor = vec4(1.0, 1.0, 1.0, v_alpha);
            }
        }
    `
};
