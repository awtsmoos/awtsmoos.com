// B"H
import { NPCS } from "../npcs/NpcIdentity.js";
import { markerForNpc, questTrackerRows } from "../quests/QuestState.js";
import { listVendor } from "../vendors/VendorRuntime.js";
import { listTrainerAbilities } from "../trainers/TrainerRuntime.js";
import { doorState } from "../doors/DoorInteractionRuntime.js";

export function createWowHudRuntime(ctx) {
  const root = document.createElement("div");
  root.id = "awtsWowSlice";
  root.dataset.awtsWowSlice = "true";
  root.innerHTML = `
    <style>
      #awtsWowSlice{position:fixed;inset:0;z-index:2147483000;pointer-events:none;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#fff}
      #awtsWowSlice button{font:700 11px/1 system-ui;border:1px solid rgba(255,217,102,.55);border-radius:7px;background:rgba(17,26,40,.88);color:#fff3c4;padding:7px 9px;pointer-events:auto}
      .aws-panel{background:rgba(10,14,24,.84);border:1px solid rgba(255,217,102,.35);border-radius:8px;box-shadow:0 8px 18px rgba(0,0,0,.35);pointer-events:auto}
      .aws-top{position:absolute;left:max(8px,env(safe-area-inset-left));top:max(8px,env(safe-area-inset-top));display:grid;gap:6px;width:min(310px,72vw)}
      .aws-player{padding:8px;font-size:11px}.aws-bars{display:grid;gap:4px}.aws-bar{height:9px;border-radius:999px;background:#1b2638;overflow:hidden}.aws-fill{height:100%;background:#52d66b}.aws-xp .aws-fill{background:#65a7ff}.aws-stam .aws-fill{background:#ffd966}
      .aws-target{position:absolute;right:max(8px,env(safe-area-inset-right));top:max(8px,env(safe-area-inset-top));width:min(260px,60vw);padding:8px;font-size:11px}
      .aws-tracker{padding:8px;font-size:11px}.aws-tracker b{color:#ffd966}.aws-rows{display:grid;gap:4px;margin-top:4px}
      .aws-world{position:absolute;inset:0;pointer-events:none}.aws-obj{position:absolute;transform:translate(-50%,-50%);pointer-events:auto;text-align:center}.aws-marker{font-size:25px;font-weight:1000;color:#ffd966;text-shadow:0 2px 5px #000}.aws-label{font-size:10px;padding:2px 5px;background:rgba(0,0,0,.58);border-radius:999px;white-space:nowrap}
      .aws-animal button,.aws-door button,.aws-npc button{min-width:48px;min-height:34px}.aws-corpse button{border-color:#c6f46d;background:rgba(45,58,18,.9)}
      .aws-action{position:absolute;left:50%;bottom:max(10px,env(safe-area-inset-bottom));transform:translateX(-50%);display:flex;gap:6px;max-width:96vw;overflow:hidden;padding:6px;z-index:2147483001;pointer-events:auto}
      .aws-slot{width:48px;height:46px;border-radius:8px;display:grid;place-items:center;background:linear-gradient(180deg,#2b3952,#111827);border:1px solid rgba(255,217,102,.4);font-size:10px;font-weight:900;color:#fff3c4}
      .aws-window{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(360px,92vw);max-height:min(520px,72vh);overflow:auto;padding:10px;display:none}
      .aws-window.open{display:block}.aws-window h3{margin:0 0 8px;font-size:15px;color:#ffd966}.aws-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(54px,1fr));gap:6px}.aws-item{min-height:48px;border:1px solid rgba(255,255,255,.2);border-radius:7px;background:rgba(255,255,255,.08);font-size:10px;display:grid;place-items:center;text-align:center;padding:4px}
      .aws-cutscene{position:absolute;inset:0;display:none;place-items:center;background:linear-gradient(180deg,rgba(0,0,0,.88) 0 13%,rgba(0,0,0,.15) 13% 87%,rgba(0,0,0,.88) 87%);pointer-events:auto;z-index:2147483002}
      .aws-cutscene.open{display:grid}.aws-shot{width:min(560px,92vw);padding:12px;border:1px solid rgba(255,217,102,.45);border-radius:8px;background:rgba(10,14,24,.82);font-size:13px}.aws-shot b{color:#ffd966}.aws-shot button{float:right}
      .aws-float{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);font-weight:1000;color:#ffef7b;text-shadow:0 2px 5px #000;pointer-events:none}
      @media(max-width:680px){.aws-target{top:74px;width:160px}.aws-top{width:190px}.aws-slot{width:42px;height:42px}.aws-action{gap:4px;padding:4px}.aws-window{top:46%}}
    </style>
    <div class="aws-world" data-proof="world-layer"></div>
    <div class="aws-top"><div class="aws-player aws-panel" data-proof="player-frame"></div><div class="aws-tracker aws-panel" data-proof="quest-tracker"></div></div>
    <div class="aws-target aws-panel" data-proof="target-frame"></div>
    <div class="aws-action aws-panel" data-proof="action-bar"></div>
    <div class="aws-window aws-panel" data-window="dialogue"></div>
    <div class="aws-window aws-panel" data-window="loot"></div>
    <div class="aws-window aws-panel" data-window="vendor"></div>
    <div class="aws-window aws-panel" data-window="trainer"></div>
    <div class="aws-window aws-panel" data-window="bag"></div>
    <div class="aws-cutscene" data-proof="cutscene-layer"></div>
    <div class="aws-float" data-proof="floating-combat-text"></div>
  `;
  document.body.appendChild(root);

  const q = selector => root.querySelector(selector);
  const world = q(".aws-world");
  const windows = Object.fromEntries([...root.querySelectorAll(".aws-window")].map(el => [el.dataset.window, el]));
  const cutscene = q(".aws-cutscene");

  function closeWindows() {
    Object.values(windows).forEach(el => el.classList.remove("open"));
  }

  function skipCutscene() {
    cutscene.classList.remove("open");
    ctx.cutsceneState = {
      ...(ctx.cutsceneState || {}),
      skipWorked:true,
      returnedToGameplay:true,
      active:false
    };
    publishDebug();
  }

  function playCutscene(input = {}) {
    closeWindows();
    ctx.cutsceneState = {
      questTriggeredCutscene:true,
      cameraSwitched:true,
      actorPlayedAction:input.action || "acceptQuest",
      dialogueShown:true,
      skipWorked:false,
      returnedToGameplay:false,
      active:true,
      shot:input.shot || "medium",
      mobileSafeUi:true
    };
    cutscene.innerHTML = `<div class="aws-shot"><button data-action="skip-cutscene">Skip</button><b>${input.title || "Quest Moment"}</b><p>${input.dialogue || "The village notices your mitzvah."}</p><small>Camera: ${ctx.cutsceneState.shot} · Actor action: ${ctx.cutsceneState.actorPlayedAction}</small></div>`;
    cutscene.classList.add("open");
    publishDebug();
    clearTimeout(playCutscene.timer);
    playCutscene.timer = setTimeout(skipCutscene, 1800);
    return { ok:true, cutscene:ctx.cutsceneState };
  }

  function renderWorld() {
    world.innerHTML = "";
    for (const npc of NPCS) {
      const marker = markerForNpc(ctx.questState, npc.id) || npc.marker;
      world.appendChild(objectNode("npc", npc.x, npc.y, `<div class="aws-marker">${marker}</div><button data-action="npc" data-id="${npc.id}">${npc.name.split(" ")[0]}</button><div class="aws-label">${npc.role}</div>`));
    }
    for (const enemy of ctx.combat.enemies) {
      const corpse = enemy.dead ? ctx.corpses.find(row => row.id === enemy.corpseId) : null;
      if (enemy.dead && corpse?.looted) continue;
      const cls = enemy.dead ? "corpse" : "animal";
      const text = enemy.dead ? "Corpse" : `${enemy.name}<br>${enemy.hp}/${enemy.maxHp}`;
      world.appendChild(objectNode(cls, enemy.x, enemy.y, `<button data-action="${enemy.dead ? "corpse" : "enemy"}" data-id="${enemy.dead ? enemy.corpseId : enemy.id}">${text}</button>`));
    }
    for (const door of ctx.doors) {
      world.appendChild(objectNode("door", door.x, door.y, `<div class="aws-marker">${door.open ? "open" : "door"}</div><button data-action="door" data-id="${door.id}">${door.name}</button>`));
    }
  }

  function objectNode(kind, x, y, html) {
    const node = document.createElement("div");
    node.className = `aws-obj aws-${kind}`;
    node.style.left = `${x}%`;
    node.style.top = `${y}%`;
    node.innerHTML = html;
    return node;
  }

  function renderFrames() {
    q(".aws-player").innerHTML = `
      <b>Level ${ctx.player.level}</b> Coins ${ctx.player.coins}<div class="aws-bars">
      <div>Health ${ctx.player.health}/${ctx.player.maxHealth}</div><div class="aws-bar"><div class="aws-fill" style="width:${100 * ctx.player.health / ctx.player.maxHealth}%"></div></div>
      <div>Stamina ${ctx.player.stamina}/${ctx.player.maxStamina}</div><div class="aws-bar aws-stam"><div class="aws-fill" style="width:${100 * ctx.player.stamina / ctx.player.maxStamina}%"></div></div>
      <div>XP ${ctx.player.xp}/${ctx.player.xpToLevel}</div><div class="aws-bar aws-xp"><div class="aws-fill" style="width:${100 * ctx.player.xp / ctx.player.xpToLevel}%"></div></div></div>`;
    const target = ctx.combat.enemies.find(row => row.id === ctx.selectedEnemyId);
    q(".aws-target").innerHTML = target ? `<b>${target.name}</b><div>${target.dead ? "Dead" : `${target.hp}/${target.maxHp} HP`}</div><div class="aws-bar"><div class="aws-fill" style="width:${100 * target.hp / target.maxHp}%"></div></div>` : "No target";
    const rows = questTrackerRows(ctx.questState);
    q(".aws-tracker").innerHTML = `<b>Quest Tracker</b><div class="aws-rows">${rows.map(row => `<div>${row.complete ? "Ready" : "Active"}: ${row.text}</div>`).join("") || "<div>No active quest</div>"}</div>`;
    q(".aws-action").innerHTML = ctx.player.actionBar.map(id => {
      const action = id === "bag" ? "bag" : id === "interact" ? "interact" : "ability";
      return `<button class="aws-slot" data-action="${action}" data-id="${id}">${id.replace(/_/g, "<br>")}</button>`;
    }).join("");
    q(".aws-action").querySelectorAll("button").forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        ctx.actions.handleUiAction(button.dataset.action, button.dataset.id);
      });
    });
  }

  function renderBag() {
    windows.bag.innerHTML = `<h3>Bag</h3><div class="aws-grid">${ctx.inventory.slots.map(slot => `<div class="aws-item" data-item="${slot.id}"><b>${slot.icon || "?"}</b><span>${slot.name}</span><small>x${slot.qty}</small></div>`).join("")}</div>`;
  }

  function openDialogue(npcId) {
    const npc = NPCS.find(row => row.id === npcId);
    closeWindows();
    windows.dialogue.innerHTML = `<h3>${npc.name}</h3><p>${npc.role}</p><button data-action="accept-quest" data-id="${npc.id}">Accept Quest</button><button data-action="turnin-quest" data-id="${npc.id}">Turn In Quest</button><button data-action="close-window">Close</button>`;
    windows.dialogue.classList.add("open");
  }

  function openLoot(corpseId) {
    const corpse = ctx.corpses.find(row => row.id === corpseId);
    closeWindows();
    windows.loot.innerHTML = `<h3>Loot</h3>${corpse ? corpse.items.map(item => `<div>${item.id} x${item.qty}</div>`).join("") : "No loot"}<button data-action="collect-loot" data-id="${corpseId}">Collect All</button>`;
    windows.loot.classList.add("open");
  }

  function openVendor() {
    closeWindows();
    windows.vendor.innerHTML = `<h3>Vendor</h3>${listVendor("shop_yosef").map(item => `<button data-action="buy" data-id="${item.id}">${item.name} - ${item.price}</button>`).join("")}<button data-action="sell">Sell Loot</button>`;
    windows.vendor.classList.add("open");
  }

  function openTrainer() {
    closeWindows();
    windows.trainer.innerHTML = `<h3>Trainer</h3>${listTrainerAbilities("trainer_devora", ctx.player).map(a => `<button data-action="learn" data-id="${a.id}">${a.name} - ${a.learned ? "known" : `${a.cost} coins`}</button>`).join("")}`;
    windows.trainer.classList.add("open");
  }

  function floatText(text) {
    const el = q(".aws-float");
    el.textContent = text;
    clearTimeout(floatText.timer);
    floatText.timer = setTimeout(() => { el.textContent = ""; }, 900);
  }

  function publishDebug() {
    root.dataset.selectedEnemyId = ctx.selectedEnemyId || "";
    root.dataset.lastAction = ctx.lastActionResult?.action || "";
    root.dataset.lastActionId = ctx.lastActionResult?.id || "";
    try {
      root.dataset.lastActionResult = JSON.stringify(ctx.lastActionResult?.result || null);
      root.dataset.cutsceneState = JSON.stringify(ctx.cutsceneState || null);
    } catch {
      root.dataset.lastActionResult = "{\"ok\":false,\"reason\":\"unserializable\"}";
    }
  }

  root.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "skip-cutscene") {
      skipCutscene();
      return;
    }
    const id = button.dataset.id;
    ctx.actions.handleUiAction(action, id);
  });

  function render() {
    renderWorld();
    renderFrames();
    renderBag();
    publishDebug();
  }

  return { root, windows, closeWindows, render, openDialogue, openLoot, openVendor, openTrainer, renderBag, floatText, playCutscene, skipCutscene, publishDebug, doorState:() => doorState(ctx.doors) };
}
