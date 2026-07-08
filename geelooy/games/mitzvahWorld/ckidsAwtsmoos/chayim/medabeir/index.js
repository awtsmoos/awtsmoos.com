// B"H
/**
 * @file index.js
 * @description
 * Chapter 9: Medabeir imports sealed faculties. The Awtsmoos prevents stale
 * auto-dialogue lifecycle code from opening shops during village creation.
 */
import Chai from "../chai.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import ChasveiAwtsmoos from '../../utils/ChasveiAwtsmoos.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import dialogueMethods from "./methods/dialogue.js?compact=true&v=no-empty-actor-20260602-bh6";
import stateMethods from "./methods/state.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import visualMethods from "./methods/visuals.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import lifecycleMethods from "./methods/lifecycle.js?compact=true&v=no-auto-dialogue-20260602-bh7";
import FloatingIcon from "../../Olam/uiManager/ui/FloatingIcon.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import wanderingAI from "../../systems/WanderingAI.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

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

  constructor(options = {}, olam) {
    if (options.proximity === undefined) options.proximity = 3.0;
    super(options, olam);
    this.floatingIcon = new FloatingIcon(this);
    if (options.dialogue) this.dialogue = options.dialogue;
    if (options.messageTree) this.messageTree = options.messageTree;
    else this._messageTree = [];
    this.goofOptions = options.goof;
    if (options.state) this.state = options.state;
    this.initShlichusChecker();
    this.on("sealayk", () => this.resetDialogueState());
    this.on("nivraYotsee", () => this.resetDialogueState());
  }

  get messageTree() {
    if (this._tempTree) return this._tempTree;
    return typeof this._messageTreeFunction === "function" ? this._messageTreeFunction(this) : this._messageTree;
  }

  set messageTree(v) {
    if (typeof v === "function") {
      this._messageTreeFunction = v;
      try { this._messageTree = this._messageTreeFunction(this); } catch { this._messageTree = []; }
    } else {
      this._messageTreeFunction = null;
      this._messageTree = v;
    }
  }

  get currentMessage() {
    const tree = this.messageTree;
    if (!Array.isArray(tree) || tree.length === 0) return { message: "...", responses: [] };
    if (this.currentMessageIndex >= tree.length) this.currentMessageIndex = 0;
    return tree[this.currentMessageIndex || 0];
  }

  async madeAll() {
    if (super.madeAll) await super.madeAll();
    this.floatingIcon?.refresh?.();
    this.initWandering?.();
  }

  heesHawvoos(dt) {
    if (super.heesHawvoos) super.heesHawvoos(dt);
    this.floatingIcon?.update?.(dt);
    this.updateWandering?.(dt);
  }
}

ChasveiAwtsmoos.emanate(Medabeir.prototype, [dialogueMethods, stateMethods, visualMethods, lifecycleMethods, wanderingAI]);
