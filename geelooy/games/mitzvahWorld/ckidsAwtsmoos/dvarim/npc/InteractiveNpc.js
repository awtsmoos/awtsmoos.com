/**
 * B"H
 * @file InteractiveNpc.js
 * @description
 * 👤 THE SOULFUL MESSENGER — AN NPC THAT SPEAKS THE TRUTH 👤
 * 
 * Chapter 26: The Living Word
 * 
 * "And the L-rd G-d formed man... and breathed into his nostrils 
 * the breath of life; and man became a living soul." (Bereishis 2:7)
 * 
 * These NPCs are vessels of the Divine Speech, here to remind the 
 * soul of its source and its purpose. They do not exist in the 
 * static physical grid (Octree) to allow the soul to pass through 
 * them or interact without being blocked by dead matter.
 * 
 * FEATURES:
 *  - Random dialogue tree about the Awtsmoos.
 *  - Highlighting on approach and hover.
 *  - Click to interact.
 */

import Medabeir from "../../chayim/medabeir/index.js";
import * as THREE from '/games/scripts/build/three.module.js';
import AwtsmoosThreeManifestor from "../../utils/3d/procedural/AwtsmoosThreeManifestor.js";

const AWTSMOOS_DIALOGUES = [
    "B\"H! Did you know the Awtsmoos is creating you right now from nothing?",
    "Every instant is a new creation. The speech of the Creator never stops!",
    "The world is but a garment for the Essence. Look deeper!",
    "Moshiach is coming! All flesh will see the Awtsmoos!",
    "Each Mitzvah we do brings down the Infinite Light into this physical world.",
    "The rocks, the trees, even your own soul — all are but letters in the Divine Speech."
];

export default class InteractiveNpc extends Medabeir {
    type = "interactiveNpc";
    static itemName = "Messenger";
    static description = "A soulful resident of this world. Speak with them.";

    constructor(op, olam) {
        op.proximity = op.proximity || 4.5; 
        op.interactable = true;
        op.heesHawveh = true; // B"H: Activate the heartbeat for physics/gravity!
        
        // B"H: Share the same sacred garment as the Chossid player
        op.path = op.path || "https://models-3122d.web.app/chossid.glb?k=2";

        super(op, olam);
        this.options = op || {}; // B"H: Secure the options
        this.dialogues = this.options.dialogues || null; 
        this.interactKey = 'C';

        // B"H: The Vessel of Interaction - refined for precision
        this.radius = 0.5;
        this.height = 2.0;
        this.interactionMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.4, 2.2, 8),
            new THREE.MeshBasicMaterial({ 
                color: 0x00ff00, 
                transparent: true, 
                opacity: 0, 
                depthWrite: false 
            })
        );
        this.interactionMesh.name = "NPC_Interaction_Proxy";
        this.interactionMesh.nivraAwtsmoos = this;
        // B"H: The mesh will be added in heescheel() once it is manifest.

        this._setupMessageTree();
        this._setupEventHandlers();
    }

    /**
     * B"H
     * Prepares the message tree for the SiachManager.
     */
    _setupMessageTree() {
        const source = (this.dialogues && this.dialogues.length > 0) 
            ? this.dialogues 
            : AWTSMOOS_DIALOGUES;

        // B"H: Convert simple strings into a branching-ready message tree
        this.messageTree = source.map((msg, i) => ({
            message: msg,
            responses: [
                { text: "B\"H! Amen.", close: true },
                { text: "Tell me more...", nextMessageIndex: (i + 1) % source.length }
            ]
        }));
    }

    async heescheel(olam) {
        // B"H: The Decree of Manifestation
        await super.heescheel(olam);
        
        if (!this.mesh) {
            this.mesh = new THREE.Object3D();
        }

        this.mesh.nivraAwtsmoos = this;
        this.mesh.userData.isSolid = false;
        
        // B"H: Traverse all child meshes of the loaded model to allow raycasting selection
        this.mesh.traverse(child => {
            if (child.isMesh) {
                child.nivraAwtsmoos = this;
                child.userData.interactable = true;
            }
        });
        
        // B"H: Anchoring the Interaction Proxy
        if (this.interactionMesh) {
            this.interactionMesh.position.y = this.height / 2;
            this.interactionMesh.nivraAwtsmoos = this;
            this.mesh.add(this.interactionMesh);
        }

        // B"H: The Mark of the Shlichus (Mission)
        if (this.options && this.options.hasMission) {
            const markBlueprint = {
                type: "Group",
                children: [
                    {
                        type: "Mesh",
                        geometry: { type: "CylinderGeometry", args: [0.05, 0.05, 0.4, 8] },
                        material: { type: "MeshBasicMaterial", args: [{ color: 0xffff00 }] },
                        position: [0, this.height + 0.6, 0]
                    },
                    {
                        type: "Mesh",
                        geometry: { type: "SphereGeometry", args: [0.08, 8, 8] },
                        material: { type: "MeshBasicMaterial", args: [{ color: 0xffff00 }] },
                        position: [0, this.height + 0.2, 0]
                    }
                ]
            };
            
            this.missionMark = AwtsmoosThreeManifestor.emanate(markBlueprint);
            this.mesh.add(this.missionMark);
        }

        // B"H: Registration in the Sacred Ledger
        if (this.olam.interactableNivrayim && !this.olam.interactableNivrayim.includes(this)) {
            this.olam.interactableNivrayim.push(this);
        }
        
        this.isReady = true;
    }

    _setupEventHandlers() {
        this.on("nivraNeechnas", (player) => {
            if (player.type === 'chossid') {
                this._showInteractionPrompt();
            }
        });

        this.on("nivraYotsee", (player) => {
            if (player.type === 'chossid') {
                this._hideInteractionPrompt();
            }
        });

        this.on("accepted interaction", (player) => {
            if (this.options && this.options.hasMission && this.options.missionData) {
                const reqItem = this.options.missionData.requiredItem;
                const reqCount = this.options.missionData.count || 1;
                
                let hasItem = false;
                if (player.inventory) {
                    const invArrays = [player.inventory.actionSlots, player.inventory.pockets, player.inventory.backpack];
                    let totalFound = 0;
                    invArrays.forEach(arr => {
                        if(arr) arr.forEach(item => {
                            if (item && item.id === reqItem) totalFound += (item.amount || 1);
                        });
                    });
                    if (totalFound >= reqCount) hasItem = true;
                }

                if (hasItem) {
                    this.olam.ayshPeula("ui event", "toast", { message: this.options.missionData.successMsg || "Mission Complete! B\"H!" });
                    this.options.hasMission = false;
                    if (this.missionMark) {
                        this.missionMark.children.forEach(c => c.material.color.setHex(0x00ff00));
                        setTimeout(() => {
                            if (this.mesh && this.missionMark) this.mesh.remove(this.missionMark);
                            this.missionMark = null;
                        }, 2000);
                    }
                    return;
                }
            }

            // B"H: Distance check
            const chossid = this.olam.chossid;
            if (chossid && chossid.mesh && this.mesh) {
                const dist = chossid.mesh.position.distanceTo(this.mesh.position);
                if (dist > (this.options.proximity || 4.5)) {
                    this.olam.ayshPeula("ui event", "toast", { message: "B\"H! Too far away to speak.", type: "error" });
                    return;
                }
            }

            // B"H: Use the modern Siach (Dialogue) system
            if (typeof this.handleDialogue === 'function') {
                this.handleDialogue(player);
            } else {
                this.speak();
            }
        });

        this.on("mouseEnter", () => {
            this.olam.ayshPeula("set cursor", "pointer");
            this.olam.ayshPeula("ui event", "tooltip", { show: true, text: "Chat with NPC" });
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
        const source = (this.dialogues && this.dialogues.length > 0) 
            ? this.dialogues 
            : AWTSMOOS_DIALOGUES;
            
        const message = source[Math.floor(Math.random() * source.length)];
        this.olam.ayshPeula("ui event", "interaction-prompt", {
            showInteraction: {
                text: `: "${message}"`,
                key: this.interactKey,
                persists: true
            }
        });
        setTimeout(() => this._hideInteractionPrompt(), 5000);
    }

    _showInteractionPrompt() {
        this.olam.ayshPeula("ui event", "interaction-prompt", {
            showInteraction: {
                text: "to speak with the Messenger",
                key: this.interactKey
            }
        });
    }

    _hideInteractionPrompt() {
        this.olam.ayshPeula("ui event", "interaction-prompt", {
            hideInteraction: true
        });
    }

    heesHawvoos(dt) {
        if(this.missionMark) {
            this.missionMark.rotation.y += dt * 2.0;
            this.missionMark.position.y = (this.height + 0.6) + Math.sin(Date.now() * 0.005) * 0.1;
        }
        super.heesHawvoos(dt);
    }

    async ready() {
        await super.ready();
    }
}
