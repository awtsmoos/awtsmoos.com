
// B"H
import Domem from "../chayim/domem.js";
import * as THREE from '/games/scripts/build/three.module.js';

const lavaVertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float uIntensity;

void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Bubbling effect
    float noise = sin(pos.x * 5.0 + uTime) * cos(pos.z * 4.0 + uTime * 0.8);
    pos.y += noise * 0.2 * uIntensity;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const lavaFragmentShader = `
uniform float uTime;
uniform vec3 uColor;
uniform float uIntensity;
varying vec2 vUv;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
    vec2 uv = vUv * 4.0;
    float n = noise(uv + uTime * 0.5);
    
    // Heat pulsing
    float pulse = sin(uTime * 2.0) * 0.1 + 0.9;
    
    vec3 brightColor = uColor + vec3(0.3, 0.3, 0.0);
    vec3 darkColor = uColor * 0.5;
    
    // Mix based on noise and intensity
    float mixFactor = smoothstep(0.3, 0.7, n * pulse * uIntensity);
    vec3 finalColor = mix(darkColor, brightColor, mixFactor);
    
    // Add glowing spots
    float glow = smoothstep(0.8, 1.0, n);
    finalColor += vec3(glow) * uIntensity;
    
    gl_FragColor = vec4(finalColor, 0.9);
}
`;

export default class Lava extends Domem {
    type = "lava";
    static itemName = "Bucket of Lava";
    static description = "A bubbling pool of molten earth. Careful!";
    static isBuildable = true;

    constructor(op, olam) {
        super(op, olam);
        this.heesHawveh = true;
        this.baseIntensity = op.intensity || 1.0;
        this.baseColor = op.color || "#ff4500";
        this.interactable = true; // Enable interaction for menu
    }

    async heescheel(olam) {
        this.olam = olam;
        
        const uniforms = {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(this.baseColor) },
            uIntensity: { value: this.baseIntensity }
        };

        const mat = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: lavaVertexShader,
            fragmentShader: lavaFragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        });

        const geo = new THREE.PlaneGeometry(5, 5, 20, 20); // Subdivided for vertex displacement
        
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.nivraAwtsmoos = this;
        this.mesh.userData.isSolid = false; // Not solid, can walk through (and burn?)
        
        // Add a point light
        this.light = new THREE.PointLight(this.baseColor, this.baseIntensity * 2, 8);
        this.light.position.y = 1.0;
        this.mesh.add(this.light);

        if(this.position) this.mesh.position.copy(this.position.vector3());
        
        await olam.hoyseef(this);
        
        // Setup interaction
        this.on("accepted interaction", (player) => {
            this.openMenu();
        });

        this.isReady = true;
    }

    heesHawvoos(dt) {
        if(this.mesh && this.mesh.material.uniforms) {
            this.mesh.material.uniforms.uTime.value += dt;
            
            // Flicker light
            if(this.light) {
                 this.light.intensity = this.baseIntensity * 2 + (Math.random() * 0.5);
            }
        }
    }

    updateProperties(data) {
        if(data.color) {
            this.baseColor = data.color;
            if(this.mesh) this.mesh.material.uniforms.uColor.value.set(data.color);
            if(this.light) this.light.color.set(data.color);
        }
        if(data.intensity !== undefined) {
            this.baseIntensity = parseFloat(data.intensity);
            if(this.mesh) this.mesh.material.uniforms.uIntensity.value = this.baseIntensity;
        }
    }

    openMenu() {
        this.olam.ayshPeula("ui event", "lavaMenu", {
            open: {
                id: this.name, // Use name or ID if available
                color: this.baseColor,
                intensity: this.baseIntensity
            }
        });
        
        // Close prompt
        this.olam.htmlAction({
             shaym: "approach npc msg",
             methods: { classList: { add: "hidden" } }
        });
    }
}
        