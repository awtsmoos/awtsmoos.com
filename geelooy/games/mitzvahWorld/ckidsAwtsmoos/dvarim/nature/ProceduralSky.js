// B"H
/**
 * @file ProceduralSky.js
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE DOME OF HEAVEN — PROCEDURAL DAY/NIGHT & WEATHER                             ║
 * ║                                                                                  ║
 * ║  "Let there be a firmament in the midst of the waters..." (Bereishis 1:6)        ║
 * ║  Implements a dynamic gradient sky, moving sun/moon, and ambient light shifting. ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */
import Tzomayach from "../../chayim/tzomayach.js";
import * as THREE from '/games/scripts/build/three.module.js';

export default class ProceduralSky extends Tzomayach {
    type = "ProceduralSky";

    constructor(op, olam) {
        super(op, olam);
        this.timeMultiplier = op.timeMultiplier || 1.0;
        this.timeOfDay = op.timeOfDay || 8.0; // Starts at 8 AM
        this.dayOfWeek = op.dayOfWeek || 0; // Starts on Sunday (0)
        this.isShabbos = false;
    }

    async heescheel(olam) {
        this.olam = olam;

        // The Void Dome
        const skyGeo = new THREE.SphereGeometry(1000, 32, 15);
        this.skyMat = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0077ff) },
                bottomColor: { value: new THREE.Color(0xffffff) },
                offset: { value: 33 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });

        this.mesh = new THREE.Mesh(skyGeo, this.skyMat);
        
        // The Sun
        this.sunLight = new THREE.DirectionalLight(0xffeedd, 1.5);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 1500;
        this.sunLight.shadow.camera.left = -200;
        this.sunLight.shadow.camera.right = 200;
        this.sunLight.shadow.camera.top = 200;
        this.sunLight.shadow.camera.bottom = -200;
        
        this.mesh.add(this.sunLight);

        // Ambient
        this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        this.mesh.add(this.hemiLight);

        await olam.hoyseef(this);
        this.isReady = true;
    }

    heesHawvoos(dt) {
        this.timeOfDay += (dt * 0.05 * this.timeMultiplier);
        if (this.timeOfDay > 24) {
            this.timeOfDay = 0;
            this.dayOfWeek++;
            if (this.dayOfWeek > 6) this.dayOfWeek = 0;
        }

        // Shabbos Mode Check (Friday 18:00 to Saturday 19:00)
        const currentlyShabbos = (this.dayOfWeek === 5 && this.timeOfDay >= 18.0) || (this.dayOfWeek === 6 && this.timeOfDay < 19.0);
        
        if (currentlyShabbos && !this.isShabbos) {
            this.isShabbos = true;
            if(this.olam) this.olam.ayshPeula("ui event", "effectsOverlay", { text: "B\"H! Shabbos has entered. The Village rests.", color: "#ffffff" });
        } else if (!currentlyShabbos && this.isShabbos) {
            this.isShabbos = false;
            if(this.olam) this.olam.ayshPeula("ui event", "effectsOverlay", { text: "B\"H! Gut Voch! A new week begins.", color: "#aaffaa" });
        }

        const theta = (this.timeOfDay / 24) * Math.PI * 2 - (Math.PI / 2);
        
        const sunX = Math.cos(theta) * 800;
        const sunY = Math.sin(theta) * 800;
        
        this.sunLight.position.set(sunX, sunY, 0);

        // Shift colors based on day/night
        if (sunY > 0) {
            // Day
            this.skyMat.uniforms.topColor.value.setHex(0x0077ff);
            this.skyMat.uniforms.bottomColor.value.setHex(0xffffff);
            this.sunLight.intensity = 1.5;
        } else {
            // Night
            this.skyMat.uniforms.topColor.value.setHex(0x000000);
            this.skyMat.uniforms.bottomColor.value.setHex(0x000022);
            this.sunLight.intensity = 0.0; // Moon could be added
        }
    }
}
