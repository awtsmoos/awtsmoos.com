//B"H
/**
 * @file index.js
 * Medabeir (Speaker) - That which possesses the power of holy speech.
 * Purified of experimental extensions to ensure stable legacy support.
 */

import Chai from "../chai.js";
import * as AWTSMOOS from "../../awtsmoosCkidsGames.js";
import Utils from "../../utils.js";
import Lev from "../lev.js"; 

// Import Faculties
import dialogueMethods from "./methods/dialogue.js";
import stateMethods from "./methods/state.js";
import visualMethods from "./methods/visuals.js";
import lifecycleMethods from "./methods/lifecycle.js";

export default class Medabeir extends Chai {
    type = "medabeir";
    
    state = "idle";
    mood = "neutral";
    
    goof = null;
    goofOptions = null;
    
    // Dialogue State
    _messageTree = [];
    _messageTreeFunction = null;
    _tempTree = null;

    constructor(options, olam) {
        if(options.proximity === undefined) options.proximity = 3.0;

        super(options, olam);
        
        this.lev = new Lev(this);
        if(options.lev) Object.assign(this.lev.baseline, options.lev);
        
        if(options.dialogue) this.dialogue = options.dialogue;
        
        if (options.messageTree) {
            this.messageTree = options.messageTree;
        } else {
            this._messageTree = [];
        }

        this.goofOptions = options.goof;
        if(options.state) this.state = options.state;

        this.dialogueHandler = new AWTSMOOS.Dialogue(
            this, {
                approachShaym: "approach npc msg",
                npcMessageShaym: "msg npc",
                chossidMessageShaym: "msg chossid"
            }
        );
        
        this.on("sealayk", () => {
            if(this.dialogueHandler) this.dialogueHandler.sealayk(this);
        });

        this.on("nivraNeechnas", nivra => {
            this.dialogueHandler.nivraNeechnas(nivra);
            if(this.lev) this.lev.react("GREET", 0.1);
        });
        
        this.on("nivraYotsee", nivra => {
            this.dialogueHandler.nivraYotsee(nivra);
            this.resetDialogueState();
        });
		
        this.initShlichusChecker();
        
        this.on("heesHawvoos", (dt) => {
            if(this.lev) this.lev.update(dt);
        });
    }

    get messageTree() {
        if (this._tempTree) return this._tempTree;

        return typeof(this._messageTreeFunction) == "function" ? 
            this._messageTreeFunction(this) : this._messageTree;
    }
    
    set messageTree(v) {
        if(typeof(v) == "function") {
            this._messageTreeFunction = v;
            try { this._messageTree = this._messageTreeFunction(this); } catch(e) { this._messageTree = []; }
        } else {
            this._messageTreeFunction = null;
            this._messageTree = v;
        }
    }

    get currentMessage() {
        const tree = this.messageTree;
        if(!Array.isArray(tree) || tree.length === 0) return { message: "...", responses: [] };
        let idx = this.currentMessageIndex;
        if (this._tempTree && this._tempTree[idx]) return this._tempTree[idx];
        if (tree[idx]) return tree[idx];
        return tree[0]; 
    }
}

// B"H: Binding Faculties
Object.assign(Medabeir.prototype, dialogueMethods);
Object.assign(Medabeir.prototype, stateMethods);
Object.assign(Medabeir.prototype, visualMethods);
Object.assign(Medabeir.prototype, lifecycleMethods);
