// B"H
/**
 * @file wind.js
 * @module WindInjectionLogic
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE BREATH OF THE CREATOR — Wind Injection Logic                                ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

export default function getWindInjection() {
    return {
        uniforms: {
            uTime:          { value: 0 },
            uPlayerPos:     { x: 0, y: 0, z: 0 },
            uPlayerRadius:  { value: 3.0 }
        },
        vertex: {
            head: `
                uniform float uTime;
                uniform vec3  uPlayerPos;
                uniform float uPlayerRadius;
            `,
            main: `
                vec4 instanceWorldPos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);

                float h = position.y;
                float phase = instanceWorldPos.x * 1.1 + instanceWorldPos.z * 0.8;
                float wind  = sin(uTime * 1.3 + phase) * 0.12 * h;

                // Player proximity ripple
                float playerDist = length(instanceWorldPos.xz - uPlayerPos.xz);
                float prox = 1.0 - smoothstep(0.0, uPlayerRadius, playerDist);
                float ripple = sin(uTime * 7.0 - playerDist * 2.0) * prox * 0.2 * h;

                transformed.x += wind + ripple;
            `
        }
    };
}
