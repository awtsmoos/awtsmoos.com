
/**
 * B"H
 * @file InteractiveNpc.js
 * @description
 * 👤 THE SOULFUL MESSENGER — AN NPC THAT SPEAKS THE TRUTH 👤
 */

import Medabeir from "../../chayim/medabeir/index.js";
import * as THREE from '/games/scripts/build/three.module.js';
import AwtsmoosThreeManifestor from "../../utils/3d/procedural/AwtsmoosThreeManifestor.js";

const AWTSMOOS_DIALOGUES = [
    "B\"H! Did you know the Awtsmoos is creating you right now from nothing?",
    "Every instant is a new creation. The speech of the Creator never stops!",
    "The world is but a garment for the Essence. Look deeper!",
    "Moshiach is coming! All flesh will see the Awtsmoos!"
];

export default class InteractiveNpc extends Medabeir {
    type = "interactiveNpc";
    static itemName = "Messenger";
    static description = "A soulful resident of this world. Speak with them.";

    constructor(op, olam) {
        op.proximity = op.proximity || 4.5; 
        op.interactable = true;
        op.heesHawveh = true;
        op.visualHeight = op.visualHeight || 2.0;
        
        if (op.simpleGuide) {
            op.golem = op.golem || {
                guf: { CylinderGeometry: [0.35, 0.35, 1.8, 10] },
                toyr: { MeshLambertMaterial: { color: 0xffd166, emissive: 0x442200 } }
            };
            op.path = null;
        } else {
            // B"H: Share the same sacred garment as the Chossid player
            op.path = op.path || "https://models-3122d.web.app/chossid.glb?k=2";
        }

        super(op, olam);
        this.options = op || {}; 
        this.dialogues = this.options.dialogues || this.options.dialog || null; 
        this.interactKey = 'C';

        this.radius = 0.5;
        this.height = 2.0;
        this.interactionMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.4, 2.2, 8),
            new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0, depthWrite: false })
        );
        this.interactionMesh.name = "NPC_Interaction_Proxy";
        this.interactionMesh.nivraAwtsmoos = this;

        this._setupMessageTree();
        this._setupEventHandlers();
    }

    _setupMessageTree() {
        const source = (this.dialogues && this.dialogues.length > 0) ? this.dialogues : AWTSMOOS_DIALOGUES;

        this.messageTree = source.map((msg, i) => ({
            message: msg,
            responses: [
                { text: "B\"H! Amen.", close: true },
                { text: "Tell me more...", nextMessageIndex: (i + 1) % source.length }
            ]
        }));
    }

    async heescheel(olam) {
        await super.heescheel(olam);
        
        if (!this.mesh) this.mesh = new THREE.Object3D();

        this.mesh.nivraAwtsmoos = this;
        this.mesh.userData.isSolid = false;
        
        this.mesh.traverse(child => {
            if (child.isMesh) {
                child.nivraAwtsmoos = this;
                child.userData.interactable = true;
            }
        });

        // B"H: If explicit clothes aren't defined, randomize it!
        if (this.options && this.options.clothes) {
            if (typeof this.updateAppearance === 'function') this.updateAppearance();
        } else {
            if (typeof this.randomizeAppearance === 'function') this.randomizeAppearance();
        }
        
        if (this.interactionMesh) {
            this.interactionMesh.position.y = this.height / 2;
            this.interactionMesh.nivraAwtsmoos = this;
            this.mesh.add(this.interactionMesh);
        }

        if (this.options && (this.options.hasMission || this.options.missionId)) {
            this._addMissionMark(0xffff00);
        } else if (this.options && this.options.canDebate) {
            this._addMissionMark(0xff0000); 
        } else if (this.options && this.options.hasShop) {
            this._addMissionMark(0x00ff00); 
        }

        if (this.olam.interactableNivrayim && !this.olam.interactableNivrayim.includes(this)) {
            this.olam.interactableNivrayim.push(this);
        }
        
        this.isReady = true;
    }

    _addMissionMark(color) {
        const markBlueprint = {
            type: "Group",
            children: [
                {
                    type: "Mesh",
                    geometry: { type: "CylinderGeometry", args: [0.05, 0.05, 0.4, 8] },
                    material: { type: "MeshBasicMaterial", args: [{ color }] },
                    position: [0, this.height + 0.6, 0]
                },
                {
                    type: "Mesh",
                    geometry: { type: "SphereGeometry", args: [0.08, 8, 8] },
                    material: { type: "MeshBasicMaterial", args: [{ color }] },
                    position: [0, this.height + 0.2, 0]
                }
            ]
        };
        this.missionMark = AwtsmoosThreeManifestor.emanate(markBlueprint);
        this.mesh.add(this.missionMark);
    }

    _setupEventHandlers() {
        this.on("accepted interaction", (player) => {
            if (this.options && this.options.canDebate) {
                this.olam.ayshPeula("start battle", { opponent: this });
                return;
            }
            if (this.options && this.options.hasShop) {
                this.olam.ayshPeula("ui event", "openShop", { inventory: this.options.shopInventory || [] });
                return;
            }
            if (typeof this.handleDialogue === 'function') {
                this.handleDialogue(player);
            } else {
                this.speak();
            }
        });
        
        this.on("mouseEnter", () => {
            this.olam.ayshPeula("set cursor", "pointer");
            const txt = this.options.canDebate ? "Challenge to Debate" : (this.options.hasShop ? "Trade with Merchant" : "Chat with NPC");
            this.olam.ayshPeula("ui event", "tooltip", { show: true, text: txt });
        });

        this.on("mouseLeave", () => {
            this.olam.ayshPeula("set cursor", "default");
            this.olam.ayshPeula("ui event", "tooltip", { show: false });
        });
        this.on("pointerdown", () => {
            this.emit("accepted interaction", this.olam.chossid);
        });
    }

    speak() {
        const source = (this.dialogues && this.dialogues.length > 0) ? this.dialogues : AWTSMOOS_DIALOGUES;
        const message = source[Math.floor(Math.random() * source.length)];
        this.olam.ayshPeula("ui event", "interaction-prompt", {
            showInteraction: { text: `: "${message}"`, key: this.interactKey, persists: true }
        });
        setTimeout(() => this._hideInteractionPrompt(), 5000);
    }

    _showInteractionPrompt() {
        this.olam.ayshPeula("ui event", "interaction-prompt", {
            showInteraction: { text: "to speak with the Messenger", key: this.interactKey }
        });
    }

    _hideInteractionPrompt() {
        this.olam.ayshPeula("ui event", "interaction-prompt", { hideInteraction: true });
    }

    heesHawvoos(dt) {
        if(this.missionMark) {
            this.missionMark.rotation.y += dt * 2.0;
            this.missionMark.position.y = (this.height + 0.6) + Math.sin(Date.now() * 0.005) * 0.1;
        }
        super.heesHawvoos(dt);
    }
}
