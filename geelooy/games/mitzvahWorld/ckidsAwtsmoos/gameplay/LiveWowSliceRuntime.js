// B"H
import * as THREE from "/games/scripts/build/three.module.js";
import { createPlayerState } from "./player/PlayerState.js";
import { createInventoryState, equipItem } from "./inventory/InventoryState.js";
import { createQuestState, acceptNextQuest, turnInReadyQuest } from "./quests/QuestState.js";
import { createCombatRuntime } from "./combat/CombatRuntime.js";
import { collectCorpse } from "./loot/CorpseLootRuntime.js";
import { buyVendorItem, listVendor, sellVendorLoot } from "./vendors/VendorRuntime.js";
import { listTrainerAbilities, learnAbility } from "./trainers/TrainerRuntime.js";
import { createDoorRegistry } from "./doors/DoorRegistry.js";
import { openDoor } from "./doors/DoorInteractionRuntime.js";
import { createWowHudRuntime } from "./ui/WowHudRuntime.js";
import { createRealisticAnimalMesh } from "./animals/RealisticAnimalFactory.js";
import { installLiveGameplayProofApi } from "./proof/LiveGameplayProofApi.js";

function shouldInstall() {
  const params = new URLSearchParams(location.search);
  return params.get("awtsFix") === "wowLikeLiveGameplay" || params.get("awtsProof") === "everything";
}

function waitForPlayable() {
  return new Promise(resolve => {
    const start = Date.now();
    const timer = setInterval(() => {
      const canvas = document.querySelector("canvas");
      if (window.__AWTSMOOS_BOOT_LOADED__ || window.__AWTSMOOS_LOADING_FINAL_READY__ || canvas || Date.now() - start > 6000) {
        clearInterval(timer);
        resolve();
      }
    }, 100);
  });
}

function installThreeSlice(ctx) {
  const canvas = document.createElement("canvas");
  canvas.id = "awtsWowSliceCanvas";
  canvas.style.cssText = "position:fixed;inset:0;z-index:9550;pointer-events:none;width:100vw;height:100vh";
  document.body.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 5.8, 8.8);
  camera.lookAt(0, 0.8, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x304820, 1.8));
  const sun = new THREE.DirectionalLight(0xfff0cb, 1.8);
  sun.position.set(3, 7, 4);
  scene.add(sun);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(4.6, 48), new THREE.MeshLambertMaterial({ color:0x3a9b42, transparent:true, opacity:0.5 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  scene.add(ground);
  const xPositions = [-2.1, -0.7, 0.7, 2.1];
  ctx.combat.enemies.forEach((enemy, index) => {
    const mesh = createRealisticAnimalMesh(enemy.species);
    mesh.position.set(xPositions[index] || 0, 0, 0);
    mesh.rotation.y = -0.45;
    enemy.mesh = mesh;
    enemy.anatomicalParts = mesh.userData.anatomyParts || [];
    scene.add(mesh);
  });
  function resize() {
    const width = innerWidth;
    const height = innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();
  function frame(now) {
    ctx.combat.enemies.forEach((enemy, index) => {
      if (!enemy.mesh) return;
      enemy.mesh.visible = true;
      enemy.mesh.rotation.z = enemy.dead ? Math.PI / 2 : 0;
      enemy.mesh.position.y = enemy.dead ? 0.06 : Math.sin(now / 450 + index) * 0.035;
      const proxy = enemy.mesh.getObjectByName("selection_proxy");
      if (proxy) proxy.visible = enemy.selected || enemy.dead;
      enemy.mesh.traverse(child => {
        if (child.material?.emissive && enemy.effects) child.material.emissive.setHex(enemy.selected ? 0x222000 : 0x000000);
      });
    });
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return { renderer, scene, camera, canvas };
}

export async function installLiveWowSliceRuntime() {
  if (!shouldInstall() || window.__MITZVAH_WOW_SLICE_INSTALLED__) return null;
  window.__MITZVAH_WOW_SLICE_INSTALLED__ = true;
  await waitForPlayable();
  document.documentElement.classList.add("awtsmoos-gameplay-dom-quiet");
  const ctx = {
    player:createPlayerState(),
    inventory:createInventoryState(),
    questState:createQuestState(),
    corpses:[],
    doors:createDoorRegistry(),
    selectedEnemyId:null,
    blocking:false,
    actions:null,
    ui:null,
    vendorStock:() => listVendor("shop_yosef"),
    trainerAbilities:() => listTrainerAbilities("trainer_devora", ctx.player)
  };
  ctx.combat = createCombatRuntime(ctx);
  ctx.actions = {
    handleUiAction(action, id) {
      if (action === "npc") return id === "shop_yosef" ? ctx.ui.openVendor() : id === "trainer_devora" ? ctx.ui.openTrainer() : ctx.ui.openDialogue(id);
      if (action === "enemy") return this.selectEnemy(id);
      if (action === "corpse") return ctx.ui.openLoot(id);
      if (action === "door") return this.openDoor(id);
      if (action === "ability") return this.attack(id);
      if (action === "accept-quest") return this.acceptQuest(id);
      if (action === "turnin-quest") return this.turnInQuest(id);
      if (action === "collect-loot") return this.collectLoot(id);
      if (action === "buy") return this.buy(id);
      if (action === "sell") return this.sell();
      if (action === "learn") return this.learn(id);
      if (action === "close-window") return ctx.ui.closeWindows();
      if (action === "bag") return this.openBag();
      return null;
    },
    selectEnemy(id) { const result = ctx.combat.selectEnemy(id); ctx.ui.render(); return result; },
    attack(id) { const ability = id === "focus_shot" ? "focus_shot" : id === "quick_strike" ? "quick_strike" : "melee_attack"; const result = ctx.combat.attack(ability); if (result.ok) ctx.ui.floatText(`${result.mode} -${result.damage}${result.retaliation ? ` / hit back ${result.retaliation.damage}` : ""}`); ctx.ui.render(); return result; },
    acceptQuest(npcId) { const result = acceptNextQuest(ctx.questState, npcId); ctx.ui.render(); return result; },
    turnInQuest(npcId) { const result = turnInReadyQuest(ctx.questState, npcId, ctx.player, ctx.inventory); ctx.ui.render(); return result; },
    collectLoot(corpseId) { const corpse = ctx.corpses.find(row => row.id === corpseId) || ctx.corpses.find(row => !row.looted); const result = collectCorpse(corpse, ctx.player, ctx.inventory, ctx.questState); ctx.ui.closeWindows(); ctx.ui.render(); return result; },
    buy(id) { const result = buyVendorItem("shop_yosef", id, ctx.player, ctx.inventory); ctx.ui.render(); return result; },
    sell() { const result = sellVendorLoot(ctx.player, ctx.inventory); ctx.ui.render(); return result; },
    learn(id) { const result = learnAbility("trainer_devora", id, ctx.player); ctx.ui.render(); return result; },
    equip(id) { const result = equipItem(ctx.inventory, ctx.player, id); ctx.ui.render(); return result; },
    openDoor(id) { const result = openDoor(ctx.doors, id); ctx.ui.floatText("Door opened"); ctx.ui.render(); return result; },
    openBag() { ctx.ui.closeWindows(); ctx.ui.renderBag(); ctx.ui.windows.bag.classList.add("open"); return { ok:true }; }
  };
  ctx.ui = createWowHudRuntime(ctx);
  ctx.three = installThreeSlice(ctx);
  ctx.ui.render();
  const api = installLiveGameplayProofApi(ctx);
  window.dispatchEvent(new CustomEvent("awtsmoos-game-ready", { detail:{ phase:"wow-like-live-gameplay-ready", verticalSlice:true } }));
  console.info("B'H wow-like live gameplay slice ready", api.snapshot());
  return ctx;
}

installLiveWowSliceRuntime();
