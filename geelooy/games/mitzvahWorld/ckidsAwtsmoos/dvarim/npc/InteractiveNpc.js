// B"H
/**
 * @file InteractiveNpc.js
 * @description
 * Chapter 629: the guide becomes a small conductor. Every heavy faculty has
 * moved into a named vessel, leaving this file readable, spacious, and ready to
 * receive the player: target first, then right-click or second tap when close.
 */
import Medabeir from "../../chayim/medabeir/index.js?v=no-auto-dialogue-20260602-bh9";
import {
  DEFAULT_DIALOGUES,
  DEFAULT_SHOP,
  DEFAULT_STATS
} from "./interactive/InteractiveNpcConstants.js?v=npc-split-20260628-bh1";
import { makeRayProxy } from "./interactive/InteractiveNpcGeometry.js?v=npc-split-20260628-bh1";
import { fallbackRig } from "./interactive/InteractiveNpcVisuals.js?v=npc-split-20260628-bh1";
import { cleanInteractiveNpcOptions } from "./interactive/InteractiveNpcOptions.js?v=npc-split-20260628-bh1";
import { npcOverlayPayload } from "./interactive/InteractiveNpcPayload.js?v=npc-split-20260628-bh1";
import { readyNpcVisuals, prepareNpcMesh, resolveVisualBody } from "./interactive/InteractiveNpcSetup.js?v=full-revamp-npc-target-talk-20260704-bh1";
import { setStandingPose, tickNpcAnimation } from "./interactive/InteractiveNpcAnimation.js?v=npc-split-20260628-bh1";
import {
  findTalker,
  faceTalker,
  handleNpcExplicitTap,
  isExplicitInteraction,
  openGuideMenu
} from "./interactive/InteractiveNpcTalk.js?v=full-revamp-npc-target-talk-20260704-bh1";

export default class InteractiveNpc extends Medabeir {
  type = "interactiveNpc";
  static itemName = "Village Guide";
  static description = "A target-first level guide with MMO portrait dialogue.";

  constructor(options = {}, olam) {
    const clean = cleanInteractiveNpcOptions(options);
    super(clean, olam);
    this.configureInteractiveNpc(options, clean);
    this.bindExplicitNpcEvents();
  }

  configureInteractiveNpc(options, clean) {
    this.realModelRequested = options.useRealNpcModel === true;
    this.options = { ...options, path: clean.path };
    this.dialogues = options.dialogues || options.dialogue || DEFAULT_DIALOGUES;
    this.shopInventory = options.shopInventory || DEFAULT_SHOP;
    this.areaStats = options.areaStats || options.npcStats || DEFAULT_STATS;
    this.visualRig = fallbackRig(options);
    this.height = clean.visualHeight;
    this.talkDistance = clean.talkDistance;
    this.interactionMesh = makeRayProxy(this);
    this.raycastMesh = this.interactionMesh;
    this.__standingClipName = null;
    this.__lastNpcAnimationTick = 0;
    this.__lastTapEventAt = 0;
    this.__targetedAt = 0;
  }

  bindExplicitNpcEvents() {
    this.on("pointerdown", context => this.handleExplicitTap(context));
    this.on("pointerup", context => this.handleExplicitTap(context));
    this.on("click", context => this.handleExplicitTap(context));
  }

  async heescheel(olam) {
    await super.heescheel(olam);
    prepareNpcMesh(this, olam);
  }

  async ready() {
    await super.ready();
    readyNpcVisuals(this);
  }

  ayshPeula(peula, actor) {
    if (["pointerdown", "pointerup", "click", "contextmenu"].includes(peula)) {
      return this.handleExplicitTap(actor);
    }
    if (peula === "accepted interaction") {
      return isExplicitInteraction(actor) ? this.handleExplicitTap(actor) : false;
    }
    return super.ayshPeula?.(peula, actor);
  }

  resolveVisualBody() {
    return resolveVisualBody(this);
  }

  findTalker(actor) {
    return findTalker(this, actor);
  }

  faceTalker(actor) {
    return faceTalker(this, actor);
  }

  payload(player) {
    return npcOverlayPayload(this, player);
  }

  handleExplicitTap(actor) {
    return handleNpcExplicitTap(this, actor);
  }

  openGuideMenu(actor, explicitOpen = false) {
    return openGuideMenu(this, actor, explicitOpen);
  }

  setStandingPose(force = false) {
    setStandingPose(this, force);
  }

  heesHawvoos(delta = 1 / 60) {
    tickNpcAnimation(this, delta);
  }
}
