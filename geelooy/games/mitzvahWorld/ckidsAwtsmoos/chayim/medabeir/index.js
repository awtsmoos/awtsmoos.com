/**
 * B"H
 * 
 * Medabeir, that which speaks, is
 * a class representing NPCs in the game
 * that the player can have a dialogue with.
 */

import Chai from "../chai.js";
import * as AWTSMOOS from "../../awtsmoosCkidsGames.js";
import ChasveiAwtsmoos from '../../utils/ChasveiAwtsmoos.js';

// Import Faculties
import dialogueMethods from "./methods/dialogue.js";
import stateMethods from "./methods/state.js";
import visualMethods from "./methods/visuals.js";
import lifecycleMethods from "./methods/lifecycle.js";
import FloatingIcon from "../../Olam/uiManager/ui/FloatingIcon.js";
import wanderingAI from "../../systems/WanderingAI.js";

export default class Medabeir extends Chai {
    type = "medabeir";
    state = "idle";
    mood = "neural";
    goof = null;
    goofOptions = null;
    startTime = 0;
    currentTime = 0;
    nivraTalkingTo = null;
    currentMessageIndex = 0;
    currentSelectedMsgIndex = 0;
    siach = null;
    _messageTree = [];
    _messageTreeFunction = null;
    _tempTree = null;

    constructor(options, olam) {
        if(options.proximity === undefined) options.proximity = 3.0;
        super(options, olam);
        
        this.floatingIcon = new FloatingIcon(this);
        
        if(options.dialogue) this.dialogue = options.dialogue;
        if (options.messageTree) this.messageTree = options.messageTree;
        else this._messageTree = [];

        this.goofOptions = options.goof;
        if(options.state) this.state = options.state;

        this.initShlichusChecker();
        
        this.on("sealayk", () => {
            this.resetDialogueState();
        });

        this.on("nivraYotsee", nivra => {
            this.resetDialogueState();
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
        if (this.currentMessageIndex >= tree.length) this.currentMessageIndex = 0;
        return tree[this.currentMessageIndex||0]; 
    }

    async madeAll() {
        if (super.madeAll) await super.madeAll();
        if (this.floatingIcon) {
            this.floatingIcon.refresh();
        }
        if (this.initWandering) {
            this.initWandering();
        }
    }

    heesHawvoos(dt) {
        if (super.heesHawvoos) super.heesHawvoos(dt);
        if (this.floatingIcon) {
            this.floatingIcon.update(dt);
        }
        if (this.updateWandering) {
            this.updateWandering(dt);
        }
    }
}

ChasveiAwtsmoos.emanate(Medabeir.prototype, [
    dialogueMethods,
    stateMethods,
    visualMethods,
    lifecycleMethods,
    wanderingAI
]);
