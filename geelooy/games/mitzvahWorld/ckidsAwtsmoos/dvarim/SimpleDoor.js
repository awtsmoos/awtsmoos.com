// B"H
/**
 * @file SimpleDoor.js
 * @description
 * Lord of JSDoc, Chapter Six: The Mezuzah Links Reward to the One Purse.
 *
 * This door does not mint a private currency. It does not whisper only to the
 * HUD. When the player completes the perutah-and-tzedakah gate, the reward
 * enters the neutral PersonalPerutaWallet, the same bridge the shop now uses.
 *
 * Thus a door, a merchant, a HUD panel, inventory mirrors, and localStorage all
 * hear one breath. The Awtsmoos is not divided between reward and spending;
 * the same spark that opens the next world also settles into the player's bag.
 */
import Domem from "../chayim/domem/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { awardMoney } from "../systems/economy/wallet/PersonalPerutaWallet.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { logEightStep } from "../systems/debug/ViralGameplayLog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const READY_COLORS = Object.freeze({
  waiting: 0x00ffe8,
  coins: 0x3cff86,
  blessed: 0xffd54a
});

const routeKeys = [
  "next",
  "target",
  "targetPath",
  "destination",
  "levelId",
  "id"
];

const makeMat = (color, options = {}) => new THREE.MeshBasicMaterial({
  color,
  ...options
});

function normalizeRoute(op = {}) {
  const raw = routeKeys
    .map(key => op[key])
    .find(value => typeof value === "string" && value.trim());

  return raw ? raw.trim().replace(/\.js$/i, ".json") : null;
}

function levelCoinGoal(olam) {
  const fromWorld = Number(olam?.requiredPerutos);
  if (fromWorld > 0) return fromWorld;

  const coins = Array.isArray(olam?.nivrayim)
    ? olam.nivrayim.filter(nivra => nivra?.type === "coin")
    : [];

  return coins.reduce((sum, coin) => sum + (Number(coin?.value) || 0), 0) || 9;
}

function addBox(root, owner, name, pos, size, mat) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);

  mesh.name = `${owner.name || "DoorMezuzah"}_${name}`;
  mesh.position.set(...pos);
  mesh.userData.addToOctree = false;
  mesh.userData.skipRaycast = false;
  mesh.nivraAwtsmoos = owner;

  root.add(mesh);

  return mesh;
}

function addMem(root, owner, mat) {
  addBox(root, owner, "mem_left", [-0.17, 0.06, -0.33], [0.07, 0.56, 0.07], mat);
  addBox(root, owner, "mem_right", [0.17, 0.06, -0.33], [0.07, 0.56, 0.07], mat);
  addBox(root, owner, "mem_roof", [0, 0.32, -0.33], [0.42, 0.07, 0.07], mat);
  addBox(root, owner, "mem_floor", [0.03, -0.22, -0.33], [0.32, 0.07, 0.07], mat);
}

export default class SimpleDoor extends Domem {
  type = "interactiveDoor";
  heesHawveh = true;
  static itemName = "Clickable Mezuzah";

  constructor(op = {}, olam) {
    super({
      ...op,
      golem: null,
      isSolid: false,
      interactable: true
    }, olam);

    this.options = op;
    this.next = normalizeRoute(op);
    this.label = op.label || op.name || "Clickable Mezuzah";
    this.requiresAllCoins = op.requiresAllCoins !== false;
    this.requiresTzedakah = op.requiresTzedakah !== false;
    this.requiredPerutos = Number(op.requiredPerutos || 0);
    this._navigated = false;
    this._readyColor = 0;
    this._lastSayAt = 0;
  }

  async heescheel(olam) {
    this.olam = olam;
    this.mesh = this.buildMezuzahTrigger();
    this.mesh.position.copy(this.position.vector3());
    this.mesh.userData.skipRaycast = false;
    this.mesh.userData.addToOctree = false;

    await olam.hoyseef(this);

    this.isReady = true;
    this.registerMezuzahVessel();
  }

  buildMezuzahTrigger() {
    const root = new THREE.Group();

    root.name = `${this.name || "Door"}_VISIBLE_CLICKABLE_MEZUZAH`;
    root.nivraAwtsmoos = this;

    this.caseMaterial = makeMat(READY_COLORS.waiting);
    this.scrollMaterial = makeMat(0x102d2c);
    this.glowMaterial = makeMat(READY_COLORS.waiting, {
      transparent: true,
      opacity: 0.48,
      depthWrite: false
    });
    this.memMaterial = makeMat(0xffffff);

    addBox(root, this, "outer_case", [0, 0, -0.18], [0.46, 1.85, 0.24], this.caseMaterial);
    addBox(root, this, "scroll", [0, 0, -0.33], [0.16, 1.18, 0.07], this.scrollMaterial);
    addBox(root, this, "click_aura", [0, 0, -0.42], [0.94, 2.35, 0.12], this.glowMaterial);
    addMem(root, this, this.memMaterial);

    root.rotation.z = -0.18;
    root.traverse(child => {
      child.nivraAwtsmoos = this;
      child.userData.skipRaycast = false;
      child.userData.addToOctree = false;
      child.frustumCulled = false;
    });

    return root;
  }

  registerMezuzahVessel() {
    const list = this.olam.__insideRightPostMezuzahs || [];

    if (!list.includes(this)) {
      list.push(this);
    }

    this.olam.__insideRightPostMezuzahs = list;
  }

  heesHawvoos() {
    const color = this.canOpen()
      ? READY_COLORS.blessed
      : this.hasAllCoins()
        ? READY_COLORS.coins
        : READY_COLORS.waiting;

    if (this.caseMaterial && color !== this._readyColor) {
      this.awakenColor(color);
    }

    if (!this.mesh) return;

    this.mesh.rotation.z = -0.18 + (this.canOpen() ? Math.sin(Date.now() / 180) * 0.04 : 0);
    this.mesh.visible = true;
    this.mesh.traverse?.(child => {
      child.visible = true;
    });
  }

  awakenColor(color) {
    this._readyColor = color;
    this.caseMaterial?.color?.setHex(color);
    this.glowMaterial?.color?.setHex(color);
  }

  requiredGoal() {
    return this.requiredPerutos > 0 ? this.requiredPerutos : levelCoinGoal(this.olam);
  }

  collectedCount() {
    return Number(this.olam?.__levelPerutosCollected || 0);
  }

  hasAllCoins() {
    return !this.requiresAllCoins || (
      this.requiredGoal() > 0 && this.collectedCount() >= this.requiredGoal()
    );
  }

  hasTzedakahBlessing() {
    return !this.requiresTzedakah || this.olam?.__tzedakahBlessed === true;
  }

  canOpen() {
    return this.hasAllCoins() && this.hasTzedakahBlessing();
  }

  ayshPeula(peula, actor) {
    if (peula !== "accepted interaction") {
      return super.ayshPeula?.(peula, actor);
    }

    if (!this.hasAllCoins()) {
      return this.say(`Collect all perutos first (${this.collectedCount()}/${this.requiredGoal()})`, "#72fff4");
    }

    if (!this.hasTzedakahBlessing()) {
      return this.say("Put tzedakah in the pushkuh first.", "#3cff86");
    }

    logEightStep(this.olam, 4, "door", "accepted-interaction", { label:this.label, next:this.next, collected:this.collectedCount(), required:this.requiredGoal() });
    this.openNextLevel(actor);

    return true;
  }

  say(text, color) {
    const now = Date.now();

    if (now - this._lastSayAt < 700 && this._lastText === text) {
      return false;
    }

    this._lastSayAt = now;
    this._lastText = text;

    this.olam?.ayshPeula?.("ui event", "effectsOverlay", {
      text,
      color,
      replace: true,
      bilingual: true
    });

    return false;
  }

  rewardReceiver(actor) {
    const candidate = actor || this.olam?.chossid || this.olam?.player || null;

    if (candidate && !candidate.olam) {
      candidate.olam = this.olam;
    }

    return candidate;
  }

  rewardPersonalPerutas(actor) {
    if (this.olam.__personalRewardPaid) return 0;

    const donation = Number(this.olam.__tzedakahDonation || this.collectedCount() || 0);
    const reward = Math.max(0, donation * 2);

    this.olam.__personalRewardPaid = true;

    if (reward > 0) {
      awardMoney(this.rewardReceiver(actor), reward, "double tzedakah reward");
    }

    return reward;
  }

  openNextLevel(actor) {
    if (!this.next || this._navigated) return;

    this._navigated = true;

    const reward = this.rewardPersonalPerutas(actor);
    const payload = {
      next: this.next,
      target: this.next,
      targetPath: this.next,
      levelId: this.next,
      id: this.next,
      label: this.label,
      source: "inside-right-post-mezuzah",
      reward
    };

    logEightStep(this.olam, 4, "door", "open-next-level", payload);
    this.say(`Mezuzah opened. Personal reward: +${reward}.`, "#ffd54a");
    this.olam?.ayshPeula?.("ui event", "navigateLevel", payload);
    this.olam?.ayshPeula?.("navigateLevel", payload);
    this.olam?.ayshPeula?.("load level", this.next);
    globalThis.dispatchEvent?.(new CustomEvent("awtsmoos:navigateLevel", {
      detail: payload
    }));
    actor?.ayshPeula?.("entered next level", payload);
  }
}
