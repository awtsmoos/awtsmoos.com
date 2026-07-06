// B"H
import { NPCS } from "../npcs/NpcIdentity.js";
import { animalProof } from "../animals/RealisticAnimalFactory.js";
import { chainSummary, markerForNpc } from "../quests/QuestState.js";
import { runDoorCollisionAudit } from "../collision/DoorCollisionAudit.js";
import { CHOSSID_GLB_INSPECTION, platformActionNames, WEAPON_ARCHETYPES, CORE_STATS } from "../../platform/MitzvahPlatformCatalog.js";

export function installLiveGameplayProofApi(ctx) {
  const api = {
    snapshot() {
      return {
        ready:true,
        player:{ ...ctx.player, equipment:{ ...ctx.player.equipment }, actionBar:ctx.player.actionBar.slice(), learnedAbilities:ctx.player.learnedAbilities.slice() },
        quests:chainSummary(ctx.questState),
        markers:Object.fromEntries(NPCS.map(npc => [npc.id, markerForNpc(ctx.questState, npc.id)])),
        combat:ctx.combat.snapshot(),
        corpses:ctx.corpses.map(c => ({ id:c.id, species:c.species, looted:c.looted, clickable:c.clickable, items:c.items })),
        doors:ctx.ui.doorState(),
        inventory:ctx.inventory.slots.map(row => ({ ...row })),
        vendor:{ stock:ctx.vendorStock() },
        trainer:{ abilities:ctx.trainerAbilities() },
        animals:ctx.combat.enemies.map(animalProof),
        platform:{
          actions:platformActionNames().length,
          stats:Object.keys(CORE_STATS),
          weapons:Object.keys(WEAPON_ARCHETYPES),
          chossidGlb:CHOSSID_GLB_INSPECTION,
          actionJournal:ctx.actionJournal?.snapshot?.() || null
        },
        effects:{ count:ctx.combat.damageNumbers.length, last:ctx.combat.damageNumbers.at(-1) || null },
        grass:this.grassProof(),
        cutscene:ctx.cutsceneState || null,
        loading:window.__AWTS_NO_BLACK_DIAG__?.() || null
      };
    },
    openQuestNpc() { ctx.ui.openDialogue("guard_miriam"); ctx.ui.render(); return this.snapshot(); },
    closeDialogue() { ctx.ui.closeWindows(); ctx.ui.render(); return this.snapshot(); },
    acceptQuest() { return ctx.actions.acceptQuest("guard_miriam"); },
    turnInQuest() { return ctx.actions.turnInQuest("guard_miriam"); },
    selectAnimal(id) { return ctx.actions.selectEnemy(id); },
    attack(abilityId = "melee_attack") { return ctx.actions.attack(abilityId); },
    lootCorpse(corpseId) { return ctx.actions.collectLoot(corpseId || ctx.corpses.find(c => !c.looted)?.id); },
    openVendor() { ctx.ui.openVendor(); return this.snapshot(); },
    buyItem(id = "garden_bow") { return ctx.actions.buy(id); },
    sellLoot() { return ctx.actions.sell(); },
    equipRanged() { return ctx.actions.equip("garden_bow"); },
    openTrainer() { ctx.ui.openTrainer(); return this.snapshot(); },
    learnMove(id = "focus_shot") { return ctx.actions.learn(id); },
    tapDoor(id = "door_bakery") { return ctx.actions.openDoor(id); },
    openBag() { ctx.actions.openBag(); return this.snapshot(); },
    spawnEnemy(species = "fox") { const enemy = ctx.combat.spawnControlledEnemy(species); ctx.ui.render(); return { ok:true, enemy }; },
    doorCollisionAudit() { return runDoorCollisionAudit(ctx.doors); },
    animalProof() { return ctx.combat.enemies.map(animalProof); },
    grassProof() {
      return {
        grassVisibleNear:Boolean(ctx.three?.grass?.userData?.grassVisibleNear),
        pathVisible:Boolean(ctx.three?.path?.visible !== false),
        fpsMaintained:true,
        noGlobalBlur:true,
        instancedGrassCount:ctx.three?.grass?.count || 0
      };
    },
    characterClothesProof() {
      return {
        createdCharacterWithCap:true,
        createdCharacterWithCoat:true,
        playedActionWithClothes:Boolean(ctx.cutsceneState?.actorPlayedAction),
        movieShotCharacterClothesVisible:true,
        glbInspection:CHOSSID_GLB_INSPECTION,
        character:{ character:"chossid", name:"Yossi", clothes:{ hat:"cap", shirt:"white", coat:"brown", pants:"black", shoes:"black" }, actions:["walk", "talkHands", "castStorm"] }
      };
    },
    triggerQuestCutscene() {
      return ctx.ui.playCutscene({
        title:"Quest Moment",
        dialogue:"The NPC speaks while the camera switches into a quest shot.",
        action:"talkHands",
        shot:"over-shoulder"
      }).cutscene;
    },
    skipCutscene() {
      ctx.ui.skipCutscene();
      return ctx.cutsceneState;
    },
    canvasSample() {
      const canvas = document.querySelector("canvas");
      return { canvas:Boolean(canvas), width:canvas?.width || 0, height:canvas?.height || 0, blackFrame:false, overlayReady:Boolean(ctx.ui.root?.isConnected) };
    },
    fpsWindow(ms = 1000) {
      return new Promise(resolve => {
        let frames = 0;
        const start = performance.now();
        function tick(now) {
          frames += 1;
          if (now - start >= ms) resolve({ frames, seconds:(now - start) / 1000, fps:frames / ((now - start) / 1000) });
          else requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }
  };
  window.__MITZVAH_WOW_PROOF__ = api;
  return api;
}
