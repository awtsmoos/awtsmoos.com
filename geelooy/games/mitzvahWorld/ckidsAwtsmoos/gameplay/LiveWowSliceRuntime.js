// B"H
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { createPlayerState } from "./player/PlayerState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createInventoryState, equipItem } from "./inventory/InventoryState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createQuestState, acceptNextQuest, turnInReadyQuest } from "./quests/QuestState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createCombatRuntime } from "./combat/CombatRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { collectCorpse } from "./loot/CorpseLootRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { buyVendorItem, listVendor, sellVendorLoot } from "./vendors/VendorRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { listTrainerAbilities, learnAbility } from "./trainers/TrainerRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createDoorRegistry } from "./doors/DoorRegistry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { openDoor } from "./doors/DoorInteractionRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createWowHudRuntime } from "./ui/WowHudRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createRealisticAnimalMesh } from "./animals/RealisticAnimalFactory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { installLiveGameplayProofApi } from "./proof/LiveGameplayProofApi.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createRuntimeActionJournal } from "../platform/RuntimeActionJournal.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { normalizePlatformActionName } from "../platform/MitzvahPlatformCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

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
  ground.name = "lush_ground_variation";
  scene.add(ground);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(7.2, .72, 1, 1), new THREE.MeshLambertMaterial({ color:0x8a6f49, transparent:true, opacity:.72 }));
  path.name = "packed_dirt_path";
  path.rotation.x = -Math.PI / 2;
  path.rotation.z = -.08;
  path.position.set(.25, -.012, 1.1);
  scene.add(path);
  const bladeGeom = new THREE.ConeGeometry(.018, .24, 4);
  const bladeMat = new THREE.MeshLambertMaterial({ color:0x4fb651 });
  const grass = new THREE.InstancedMesh(bladeGeom, bladeMat, 180);
  grass.name = "near_camera_grass_clumps";
  const dummy = new THREE.Object3D();
  for (let i = 0; i < grass.count; i++) {
    const ring = Math.sqrt((i * 9301 % 1000) / 1000) * 4.1;
    const angle = i * 2.399963;
    const x = Math.cos(angle) * ring;
    const z = Math.sin(angle) * ring;
    if (Math.abs(z - 1.1) < .42) dummy.scale.set(.001, .001, .001);
    else dummy.scale.set(.65 + (i % 5) * .12, .8 + (i % 7) * .08, .65 + (i % 3) * .1);
    dummy.position.set(x, .08, z);
    dummy.rotation.set((i % 4) * .05, angle, (i % 6 - 3) * .08);
    dummy.updateMatrix();
    grass.setMatrixAt(i, dummy.matrix);
  }
  grass.userData = { grassVisibleNear:true, lodFade:true, highFpsInstanced:true };
  scene.add(grass);
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
  return { renderer, scene, camera, canvas, grass, path };
}

function creditExistingQuestProgress(ctx, accepted) {
  const quest = accepted?.quest;
  const row = quest ? ctx.questState.active[quest.id] : null;
  if (!quest || !row) return accepted;
  if (quest.objective.type === "kill") {
    const count = ctx.combat.enemies.filter(enemy => enemy.dead && quest.objective.target.includes(enemy.species)).length;
    row.progress = Math.min(quest.objective.count, Math.max(row.progress, count));
  }
  if (quest.objective.type === "collect") {
    const count = ctx.inventory.slots
      .filter(slot => quest.objective.target.includes(slot.id))
      .reduce((sum, slot) => sum + (Number(slot.qty) || 0), 0);
    row.progress = Math.min(quest.objective.count, Math.max(row.progress, count));
  }
  accepted.progress = row.progress;
  return accepted;
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
    actionJournal:createRuntimeActionJournal(),
    actions:null,
    ui:null,
    lastActionResult:null,
    vendorStock:() => listVendor("shop_yosef"),
    trainerAbilities:() => listTrainerAbilities("trainer_devora", ctx.player)
  };
  ctx.combat = createCombatRuntime(ctx);
  ctx.actions = {
    handleUiAction(action, id) {
      let result = null;
      if (action === "npc") result = id === "shop_yosef" ? ctx.ui.openVendor() : id === "trainer_devora" ? ctx.ui.openTrainer() : ctx.ui.openDialogue(id);
      else if (action === "enemy") result = ctx.actions.selectEnemy(id);
      else if (action === "corpse") result = ctx.ui.openLoot(id);
      else if (action === "door") result = ctx.actions.openDoor(id);
      else if (action === "ability") result = ctx.actions.attack(id);
      else if (action === "accept-quest") result = ctx.actions.acceptQuest(id);
      else if (action === "turnin-quest") result = ctx.actions.turnInQuest(id);
      else if (action === "collect-loot") result = ctx.actions.collectLoot(id);
      else if (action === "buy") result = ctx.actions.buy(id);
      else if (action === "sell") result = ctx.actions.sell();
      else if (action === "learn") result = ctx.actions.learn(id);
      else if (action === "close-window") { ctx.ui.closeWindows(); result = { ok:true, action }; }
      else if (action === "bag") result = ctx.actions.openBag();
      ctx.actionJournal.record(actionToRuntimeAction(action, id), { id, uiAction:action, ok:result?.ok !== false });
      ctx.lastActionResult = { action, id, result, at:Date.now() };
      ctx.ui?.publishDebug?.();
      return result;
    },
    selectEnemy(id) { const result = ctx.combat.selectEnemy(id); ctx.actionJournal.record("look", { targetId:id, ok:result.ok }); ctx.ui.render(); return result; },
    attack(id) { const ability = id === "focus_shot" ? "focus_shot" : id === "quick_strike" ? "quick_strike" : id === "castStorm" ? "castStorm" : "melee_attack"; const result = ctx.combat.attack(ability); ctx.actionJournal.record(abilityToRuntimeAction(ability, result.mode), { abilityId:ability, targetId:result.targetId, ok:result.ok, damage:result.damage }); if (result.ok) ctx.ui.floatText(`${result.mode} -${result.damage}${result.retaliation ? ` / hit back ${result.retaliation.damage}` : ""}`); ctx.ui.render(); return result; },
    acceptQuest(npcId) { const result = creditExistingQuestProgress(ctx, acceptNextQuest(ctx.questState, npcId)); ctx.actionJournal.record("acceptQuest", { targetId:npcId, ok:result.ok }); ctx.ui.render(); return result; },
    turnInQuest(npcId) {
      const result = turnInReadyQuest(ctx.questState, npcId, ctx.player, ctx.inventory);
      ctx.actionJournal.record("giveItem", { targetId:npcId, ok:result.ok });
      ctx.ui.render();
      if (result.ok) {
        const finalQuest = result.quest?.id === "brave_the_guardian";
        ctx.ui.playCutscene({
          title: result.quest?.title || "Quest Complete",
          dialogue: finalQuest
            ? "The village gate is safe again. Take this charm and carry the mitzvah forward."
            : "Good work. The village path is clearer, and the next task is ready.",
          action: finalQuest ? "giveItem" : "acceptQuest",
          shot: finalQuest ? "closeup" : "medium"
        });
      }
      return result;
    },
    collectLoot(corpseId) { const corpse = ctx.corpses.find(row => row.id === corpseId) || ctx.corpses.find(row => !row.looted); const result = collectCorpse(corpse, ctx.player, ctx.inventory, ctx.questState); ctx.actionJournal.record("loot", { targetId:corpse?.id, ok:result.ok }); ctx.ui.closeWindows(); ctx.ui.render(); return result; },
    buy(id) { const result = buyVendorItem("shop_yosef", id, ctx.player, ctx.inventory); ctx.actionJournal.record("pickup", { id, shopId:"shop_yosef", ok:result.ok }); ctx.ui.render(); return result; },
    sell() { const result = sellVendorLoot(ctx.player, ctx.inventory); ctx.actionJournal.record("drop", { ok:result.ok, sold:result.sold }); ctx.ui.render(); return result; },
    learn(id) { const result = learnAbility("trainer_devora", id, ctx.player); ctx.actionJournal.record("bless", { id, trainerId:"trainer_devora", ok:result.ok }); ctx.ui.render(); return result; },
    equip(id) { const result = equipItem(ctx.inventory, ctx.player, id); ctx.actionJournal.record("carry", { id, slot:result.slot, ok:result.ok }); ctx.ui.render(); return result; },
    openDoor(id) { const result = openDoor(ctx.doors, id); ctx.actionJournal.record("openDoor", { targetId:id, ok:result.ok }); ctx.ui.floatText("Door opened"); ctx.ui.render(); return result; },
    openBag() { ctx.actionJournal.record("look", { id:"bag", ok:true }); ctx.ui.closeWindows(); ctx.ui.renderBag(); ctx.ui.windows.bag.classList.add("open"); return { ok:true }; }
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

function abilityToRuntimeAction(ability, mode) {
  if (ability === "focus_shot") return "bowRelease";
  if (ability === "castStorm" || mode === "magic") return "castStorm";
  if (mode === "staff") return "staffStrike";
  if (ability === "quick_strike") return "punch";
  return "knifeSlash";
}

function actionToRuntimeAction(action, id) {
  if (action === "door") return "openDoor";
  if (action === "corpse" || action === "collect-loot") return "loot";
  if (action === "enemy") return "look";
  if (action === "ability") return abilityToRuntimeAction(id);
  if (action === "npc") return "talk";
  if (action === "bag") return "look";
  return normalizePlatformActionName(action);
}
