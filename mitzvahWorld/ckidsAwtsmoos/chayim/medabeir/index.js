

/**
 * B"H
 * 
 * Medabeir, that which speaks, is
 * a class representing NPCs in the game
 * that the player can have a dialogue with.
 * 
 * It aggregates functionality from modular methods.
 */

import Chai from "../chai.js";
import * as AWTSMOOS from "../../awtsmoosCkidsGames.js";
import Utils from "../../utils.js";

// Import Faculties
import dialogueMethods from "./methods/dialogue.js";
import stateMethods from "./methods/state.js";
import visualMethods from "./methods/visuals.js";
import lifecycleMethods from "./methods/lifecycle.js";

export default class Medabeir extends Chai {
    type = "medabeir";
    
    // Properties
    state = "idle";
    mood = "neural";
    
    goof = null;
    goofOptions = null;

    startTime = 0;
    currentTime = 0;

    nivraTalkingTo = null;
    currentMessageIndex = 0;
    currentSelectedMsgIndex = 0;
    dialogueHandler = null;
    
    // Dialogue State
    _messageTree = [];
    _messageTreeFunction = null;
    _tempTree = null;

    constructor(options, olam) {
        // B"H: Default Proximity for all Medabeir (Speakers)
        if(options.proximity === undefined) options.proximity = 3.0;

        super(options, olam);
        
        // B"H: 1. Initialize Options FIRST
        if(options.dialogue) {
            this.dialogue = options.dialogue;
        }
        
        if (options.messageTree) {
            this.messageTree = options.messageTree;
        } else {
            // Default empty tree to prevent crashes
            this._messageTree = [];
        }

        this.goofOptions = options.goof;

        if(options.state) {
            this.state = options.state;
        }

        // B"H: 2. Initialize Dialogue Handler SECOND (now that data is ready)
        this.dialogueHandler = new AWTSMOOS.Dialogue(
            this, {
                approachShaym: "approach npc msg",
                npcMessageShaym: "msg npc",
                chossidMessageShaym: "msg chossid"
            }
        );
        
        this.on("sealayk", () => {
            if(this.dialogueHandler)
                this.dialogueHandler.sealayk(this);
        });

        // Event Listeners for interaction
        this.on("nivraNeechnas", nivra => {
            this.dialogueHandler.nivraNeechnas(nivra);
        })
        this.on("nivraYotsee", nivra => {
            this.dialogueHandler.nivraYotsee(nivra);
            this.resetDialogueState();
        });
		
		this.on("change transformation", ({ position, rotation }) => {
            // Hook for future logic
		});

        // Initialize state checkers (e.g. Shlichus availability)
        this.initShlichusChecker();
    }

    get messageTree() {
        if (this._tempTree) return this._tempTree;

        return typeof(this._messageTreeFunction) == "function" ? 
            this._messageTreeFunction(this) : this._messageTree;
    }

    set messageTree(v) {
        if(typeof(v) == "function") {
            this._messageTreeFunction = v;
            try {
                // Initialize initial state if possible
                this._messageTree = this._messageTreeFunction(this);
            } catch(e) {
                this._messageTree = [];
            }
        } else {
            this._messageTreeFunction = null;
            this._messageTree = v;
        }
    }

    get currentMessage() {
        const tree = this.messageTree;
        // Defensive check
        if(!Array.isArray(tree) || tree.length === 0) return { message: "...", responses: [] };
        
        // Ensure index is valid
        if (this.currentMessageIndex >= tree.length) this.currentMessageIndex = 0;
        
        return tree[this.currentMessageIndex||0]; 
    }
}

// B"H - Aggregating the Faculties
Object.assign(Medabeir.prototype, dialogueMethods);
Object.assign(Medabeir.prototype, stateMethods);
Object.assign(Medabeir.prototype, visualMethods);
Object.assign(Medabeir.prototype, lifecycleMethods);
