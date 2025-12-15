
// B"H
// js/ui.js

import { triggerShake } from './render.js';
import * as Renderers from './ui/renderers.js';

export function initUI(sendToWorker) {
    const screens = {
        'main-menu': document.getElementById('main-menu'),
        'gameMenu': document.getElementById('gameMenu'),
        'battle': document.getElementById('battle-screen'),
        'inventory-screen': document.getElementById('inventory-screen'),
        'quest-log-screen': document.getElementById('quest-log-screen'),
        'shem-screen': document.getElementById('shem-screen'),
        'crafting-screen': document.getElementById('crafting-screen'),
        'bestiary-screen': document.getElementById('bestiary-screen'),
        'mitzvah-screen': document.getElementById('mitzvah-screen'),
        'gemach-screen': document.getElementById('gemach-screen'),
        'gates-screen': document.getElementById('gates-screen'),
        'gates37-screen': document.getElementById('gates37-screen'),
        'dreidel-screen': document.getElementById('dreidel-screen'),
        'otzar-screen': document.getElementById('otzar-screen'),
        'player-quest-screen': document.getElementById('player-quest-screen'),
        'features-screen': document.getElementById('features-screen'),
        'game': document.getElementById('gameCanvas')
    };
    const dialogueBox = document.getElementById('dialogue-box');
    const chatBox = document.getElementById('global-chat-box');
    const chatContainer = document.getElementById('chat-messages');
    
    // Chat Toggle Logic
    const chatHeader = document.getElementById('chat-header');
    const chatToggle = document.getElementById('chat-toggle');
    if(chatHeader) {
        chatHeader.addEventListener('click', () => {
            chatBox.classList.toggle('minimized');
            chatToggle.textContent = chatBox.classList.contains('minimized') ? '[+]' : '[-]';
        });
    }

    // Create dynamic screens
    ['bestiary-screen', 'mitzvah-screen', 'gates-screen', 'gates37-screen', 'dreidel-screen', 'otzar-screen', 'player-quest-screen', 'features-screen'].forEach(id => {
        if(!document.getElementById(id)) {
            const screen = document.createElement('div');
            screen.id = id;
            screen.className = 'menu-screen';
            document.getElementById('gameContainer').appendChild(screen);
            screens[id] = screen;
        }
    });

    if(!document.getElementById('shem-screen')) {
        const s = document.createElement('div'); s.id = 'shem-screen'; s.className = 'menu-screen';
        document.getElementById('gameContainer').appendChild(s); screens['shem-screen'] = s;
    }
    if(!document.getElementById('crafting-screen')) {
        const c = document.createElement('div'); c.id = 'crafting-screen'; c.className = 'menu-screen';
        document.getElementById('gameContainer').appendChild(c); screens['crafting-screen'] = c;
    }

    const gameMenu = document.getElementById('gameMenu');
    if (gameMenu && !document.querySelector('[data-action="gates37-screen"]')) {
        const btn = document.createElement('button');
        btn.className = 'menu-button';
        btn.dataset.action = 'gates37-screen';
        btn.textContent = '37 Gates of Wisdom';
        btn.style.color = '#00ffff';
        btn.style.borderColor = '#00ffff';
        gameMenu.insertBefore(btn, gameMenu.lastElementChild);
    }

    document.body.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (button) { 
            e.preventDefault(); 
            const action = button.dataset.action;
            const value = button.dataset.value;
            // Generalized delegation
            if (action.startsWith('gemach') || action === 'craft' || action === 'toggleGate' || action === 'spinDreidel' || action === 'use_item' || action === 'swapOtzar' || action === 'unlockGate37' || action === 'useOverworldItem') {
                const payload = { action, ...button.dataset };
                // Specific data parsing
                if (action === 'gemachAction' || action === 'spinDreidel') payload.amount = parseInt(value) || parseInt(button.dataset.amount);
                if (action === 'spinDreidel') payload.bet = parseInt(value);
                sendToWorker('uiAction', payload);
            } else if (action === 'create_quest') {
                const type = document.getElementById('quest-type-select').value;
                const target = document.getElementById('quest-target-input').value; 
                const rewardType = document.getElementById('quest-reward-select').value;
                const rewardAmount = parseInt(document.getElementById('quest-reward-amount').value || 1);
                sendToWorker('create_quest', { type, targetId: target, rewardId: rewardType, rewardAmount });
            } else {
                sendToWorker('uiAction', { action }); 
            }
        }
        
        const choice = e.target.closest('.dialogue-choice');
        if (choice && choice.dataset.choiceIndex) { e.preventDefault(); sendToWorker('dialogueChoice', { index: parseInt(choice.dataset.choiceIndex) }); }
        
        const battleBtn = e.target.closest('.battle-button');
        if (battleBtn) { e.preventDefault(); sendToWorker('battleAction', { ...battleBtn.dataset }); }
    });

    function showScreen(screenName) {
        Object.values(screens).forEach(s => { if(s) s.style.display = 'none' });
        if (screens[screenName]) {
            const display = screenName === 'game' ? 'block' : 'flex';
            screens[screenName].style.display = display;
        } else {
             screens['game'].style.display = 'block';
        }
    }
    
    function update(payload) {
        if(payload.screen) showScreen(payload.screen);
        if('dialogue' in payload) updateDialogue(payload.dialogue);
        if(payload.battle) updateBattleUI(payload.battle);
        
        if(payload.inventory) {
            document.getElementById('inventory-list').innerHTML = Renderers.renderInventory(payload.inventory.items);
            document.getElementById('player-money-display').innerHTML = `<strong>Wealth:</strong> ${payload.inventory.money}`;
        }
        
        if(payload.questLog) {
            document.getElementById('quest-log-list').innerHTML = Renderers.renderQuestLog(payload.questLog.quests);
        }
        
        if(payload.gates37) {
            document.getElementById('gates37-screen').innerHTML = Renderers.renderGates37(payload.gates37);
        }

        if(payload.shem) updateShemScreen(payload.shem);
        if(payload.crafting) updateCraftingScreen(payload.crafting);
        if(payload.bestiary) updateBestiaryScreen(payload.bestiary);
        if(payload.mitzvahs) updateMitzvahScreen(payload.mitzvahs);
        if(payload.gemach) updateGemachScreen(payload.gemach);
        if(payload.gates) updateGatesScreen(payload.gates);
        if(payload.dreidel) updateDreidelScreen(payload.dreidel);
        if(payload.otzar) updateOtzarScreen(payload.otzar);
        if(payload.playerQuests) updatePlayerQuestScreen(payload.playerQuests, payload.inventory);
        if(payload.features) updateFeaturesScreen(payload.features);
        
        if(payload.moonPhase) updateMoonUI(payload.moonPhase);
        if(payload.chat) updateChat(payload.chat);
        
        if(payload.fx) {
            if(payload.fx.type === 'shake') {
                const container = document.getElementById('gameContainer');
                container.classList.remove('screen-shake');
                void container.offsetWidth;
                container.classList.add('screen-shake');
                triggerShake(30); 
            }
            if(payload.fx.type === 'levelup') showToast("LEVEL UP! ASCENSION!", "success");
            if(payload.fx.type === 'floatingText') showFloatingText(payload.fx.text, payload.fx.style, payload.fx.x, payload.fx.y);
        }
    }

    // --- UPDATERS ---
    function updateBattleUI(state) { 
        document.getElementById('player-name').textContent = state.player.name; 
        document.getElementById('player-level').textContent = `Lv ${state.player.level}`; 
        document.getElementById('player-emoji').textContent = state.player.emoji; 
        document.getElementById('player-hp-bar').style.width = `${state.player.hpPercent}%`; 
        document.getElementById('player-kavanah-bar').style.width = `${state.player.kavanahPercent}%`; 
        document.getElementById('opponent-name').textContent = state.opponent.name; 
        document.getElementById('opponent-level').textContent = `Lv ${state.opponent.level}`; 
        document.getElementById('opponent-emoji').textContent = state.opponent.emoji; 
        document.getElementById('opponent-hp-bar').style.width = `${state.opponent.hpPercent}%`;
        
        const battleLog = document.getElementById('battle-log'); 
        const battleMenu = document.getElementById('battle-menu-container'); 
        const continueIndicator = document.getElementById('battle-log-continue-indicator'); 
        
        if (state.log) { 
            battleLog.innerHTML = state.log; 
            battleLog.style.display = 'block'; 
            battleMenu.style.display = 'none'; 
            continueIndicator.style.display = state.awaitingConfirm ? 'block' : 'none'; 
        } else if (state.menu) { 
            battleLog.style.display = 'none'; 
            battleMenu.style.display = 'grid'; 
            battleMenu.style.gridTemplateColumns = "1fr 1fr";
            battleMenu.style.gap = "10px";
            continueIndicator.style.display = 'none'; 
            battleMenu.innerHTML = state.menu.buttons.map(btn => `<button class="battle-button" data-action="${btn.action}" data-value="${btn.value || ''}" ${btn.disabled ? 'disabled' : ''}>${btn.text}</button>`).join(''); 
        } 
    }

    function updateDialogue(state) { 
        if (!state.active) { dialogueBox.style.display = 'none'; return; } 
        dialogueBox.style.display = 'flex'; 
        document.getElementById('dialogue-text').innerHTML = state.text; 
        const choicesEl = document.getElementById('dialogue-choices'); 
        choicesEl.innerHTML = ''; 
        if (state.choices && state.choices.length > 0) { 
            document.getElementById('dialogue-continue-indicator').style.display = 'none'; 
            state.choices.forEach((choice, index) => { 
                const choiceEl = document.createElement('div'); 
                choiceEl.className = `dialogue-choice ${choice.disabled ? 'disabled-choice' : ''}`; 
                choiceEl.innerHTML = choice.text; 
                choiceEl.dataset.choiceIndex = index; 
                choicesEl.appendChild(choiceEl); 
            }); 
        } else { 
            document.getElementById('dialogue-continue-indicator').style.display = 'block'; 
        } 
    }

    function updateGemachScreen(data) { document.getElementById('gemach-player-money').textContent = data.playerMoney; document.getElementById('gemach-balance').textContent = data.balance; }
    
    function updateMoonUI(phase) { let m=document.getElementById('moon-display'); if(!m){ m=document.createElement('div'); m.id='moon-display'; m.style.cssText="position:absolute;top:15px;right:15px;font-size:2.5em;pointer-events:none;z-index:50;text-shadow:0 0 10px white;"; document.getElementById('gameContainer').appendChild(m); } m.textContent = phase.icon; }

    // ANTI-FLICKER CHAT
    let lastChatTimestamp = 0;
    function updateChat(messages) { 
        if (!chatContainer || !messages || messages.length === 0) return;
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.id === lastChatTimestamp) return; // No new messages
        
        lastChatTimestamp = lastMsg.id;
        chatContainer.innerHTML = ''; 
        
        messages.forEach(msg => { 
            const el = document.createElement('div'); 
            el.className = `chat-message chat-channel-${msg.type}`; 
            const guildSpan = msg.guild ? `<span class="chat-guild-tag">${msg.guild}</span> ` : ''; 
            el.innerHTML = `[${msg.type.toUpperCase()}] ${guildSpan}<strong>${msg.sender}:</strong> ${msg.message}`; 
            chatContainer.appendChild(el); 
        }); 
        chatContainer.scrollTop = chatContainer.scrollHeight; 
    }

    function showFloatingText(text, style, x, y) { const el = document.createElement('div'); el.className = `floating-text ${style}`; el.textContent = text; const container = document.getElementById('gameContainer'); let left = '50%'; let top = '50%'; if (x === 'player') { left = '70%'; top = '60%'; } else if (x === 'opponent') { left = '30%'; top = '60%'; } else { left = `${50 + (Math.random()-0.5)*20}%`; top = `${50 + (Math.random()-0.5)*20}%`; } el.style.left = left; el.style.top = top; container.appendChild(el); setTimeout(() => el.remove(), 800); }

    function showToast(message, type = 'info') { const container = document.getElementById('toast-container'); const toast = document.createElement('div'); toast.className = `toast toast-${type}`; toast.textContent = message; container.appendChild(toast); setTimeout(() => toast.remove(), 3000); }

    // Helpers
    function updateFeaturesScreen(data) { document.getElementById('features-screen').innerHTML = `<div class="modal-content" style="max-width:700px;"><h3>The 666 Features</h3><div style="max-height:60vh;overflow-y:auto;">${data.list.map(f=>`<div style="padding:5px;border-bottom:1px solid #333;"><strong style="color:${f.active?'#0f0':'#888'}">${f.name}</strong><br><span style="font-size:0.8em;color:#ccc;">${f.desc}</span></div>`).join('')}</div><button class="modal-action-button" data-action="close-features">Close</button></div>`; }
    function updateOtzarScreen(data) { document.getElementById('otzar-screen').innerHTML = `<div class="modal-content" style="max-width:800px;width:95%;"><h3>Otzar HaNefashot</h3><div style="display:flex;gap:20px;"><div style="flex:1;border:1px solid #555;padding:5px;"><h4>Current Shem</h4>${data.team.map((m,i)=>`<div style="padding:5px;border-bottom:1px solid #333;display:flex;justify-content:space-between;"><span>${m.emoji} ${m.name} (Lv ${m.level})</span><button class="menu-button" style="font-size:0.7em;padding:2px 5px;" data-action="swapOtzar" data-from="team" data-index="${i}">Deposit</button></div>`).join('')}</div><div style="flex:1;border:1px solid #555;padding:5px;"><h4>Storage</h4><div style="max-height:40vh;overflow-y:auto;">${data.storage.length===0?'<div>Empty</div>':data.storage.map((m,i)=>`<div style="padding:5px;border-bottom:1px solid #333;display:flex;justify-content:space-between;"><span>${m.emoji} ${m.name} (Lv ${m.level})</span><button class="menu-button" style="font-size:0.7em;padding:2px 5px;" data-action="swapOtzar" data-from="storage" data-index="${i}">Withdraw</button></div>`).join('')}</div></div></div><button class="modal-action-button" data-action="close-otzar">Close</button></div>`; }
    function updateDreidelScreen(data) { document.getElementById('dreidel-screen').innerHTML = `<div class="modal-content" style="max-width:500px;text-align:center;"><h3>High Stakes Dreidel</h3><div style="font-size:3em;margin:20px;">${data.lastResult?data.lastResult.letter:'🥯'}</div><div style="margin-bottom:20px;">${data.lastResult?data.lastResult.outcome:'Spin to play!'}</div><div class="gemach-balance-box"><div>Pot: <span style="color:gold">${data.pot}</span>p</div><div>Pockets: <span>${data.playerMoney}</span>p</div></div><div style="display:flex;justify-content:center;gap:10px;margin-bottom:20px;"><button class="menu-button" data-action="spinDreidel" data-value="10">Bet 10</button><button class="menu-button" data-action="spinDreidel" data-value="50">Bet 50</button></div><button class="modal-action-button" data-action="close-dreidel">Leave</button></div>`; }
    function updateGatesScreen(data) { document.getElementById('gates-screen').innerHTML = `<div class="modal-content" style="max-width:800px;"><h3>50 Gates of Binah</h3><div class="gates-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;max-height:60vh;overflow-y:auto;">${data.list.map(g=>`<div class="gate-entry" style="background:${g.isActive?'rgba(0,255,0,0.2)':'rgba(255,255,255,0.05)'};padding:10px;border-radius:5px;border:1px solid ${g.isUnlocked?(g.isActive?'#0f0':'#888'):'#440000'};opacity:${g.isUnlocked?1:0.5};cursor:pointer;"><div style="font-weight:bold;">${g.name}</div><div style="font-size:0.7em;">${g.isUnlocked?g.desc:'Locked'}</div>${g.isUnlocked?`<button class="menu-button" style="font-size:0.7em;margin-top:5px;width:100%;" data-action="toggleGate" data-value="${g.id}">${g.isActive?'Disable':'Enable'}</button>`:''}</div>`).join('')}</div><button class="modal-action-button" data-action="close-gates">Close</button></div>`; }
    function updateBestiaryScreen(data) { document.getElementById('bestiary-screen').innerHTML = `<div class="modal-content" style="max-width:700px;"><h3>Sefer HaYetzira</h3><div class="bestiary-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:10px;max-height:60vh;overflow-y:auto;">${data.entries.map(e=>`<div class="bestiary-entry" style="background:${e.seen?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.5)'};padding:5px;border-radius:5px;text-align:center;border:1px solid ${e.caught?'gold':'#555'};opacity:${e.seen?1:0.5};"><div style="font-size:2em;">${e.seen?e.emoji:'❓'}</div><div style="font-size:0.7em;">${e.seen?e.name:'Unknown'}</div></div>`).join('')}</div><div style="margin-top:10px;">Seen: ${data.seenCount}</div><button class="modal-action-button" data-action="close-bestiary">Close</button></div>`; }
    function updateMitzvahScreen(data) { document.getElementById('mitzvah-screen').innerHTML = `<div class="modal-content" style="max-width:600px;"><h3>Mitzvah Tank</h3><div style="max-height:60vh;overflow-y:auto;text-align:left;">${data.list.map(m=>`<div style="padding:10px;margin-bottom:5px;background:${m.completed?'rgba(0,255,0,0.1)':'rgba(255,255,255,0.05)'};border-left:4px solid ${m.completed?'#4CAF50':'#888'};"><div style="font-weight:bold;">${m.name} ${m.completed?'✅':''}</div><div style="font-size:0.8em;color:#ccc;">${m.desc}</div></div>`).join('')}</div><button class="modal-action-button" data-action="close-mitzvah">Close</button></div>`; }
    function updateCraftingScreen(data) { document.getElementById('crafting-screen').innerHTML = `<div class="modal-content" style="max-width:700px;"><h3>Tikkun Kelim</h3><div style="max-height:60vh;overflow-y:auto;">${data.recipes.map(r=>`<div style="background:rgba(255,255,255,0.05);padding:10px;margin-bottom:5px;display:flex;justify-content:space-between;align-items:center;"><div><strong>${r.name}</strong><br><span style="font-size:0.8em;color:#ccc;">${r.description}</span><br><div style="font-size:0.8em;color:#aaa;">${r.ingredients.map(i=>`${i.name}(${i.has}/${i.needed})`).join(', ')}</div></div><button class="menu-button" data-action="craftAction" data-recipe-id="${r.id}" ${!r.canCraft?'disabled':''}>Craft</button></div>`).join('')}</div><button class="modal-action-button" data-action="close-crafting">Close</button></div>`; }
    function updateShemScreen(data) { document.getElementById('shem-screen').innerHTML = `<div class="modal-content"><h3>Your Shem</h3><div id="shem-list">${data.team.map(m=>`<div style="margin-bottom:20px;border-bottom:1px solid #444;"><div style="display:flex;align-items:center;gap:15px;"><span class="musag-emoji">${m.emoji}</span><div><div style="font-weight:bold;">${m.name}</div><div>Lv ${m.level}</div></div></div></div>`).join('')}</div><button class="modal-action-button" data-action="close-shem">Close</button></div>`; }
    function updatePlayerQuestScreen(quests, inventory) { document.getElementById('player-quest-screen').innerHTML = `<div class="modal-content" style="max-width:600px;"><h3>Your Quest Board</h3><div style="border:1px solid #555;padding:10px;"><h4>Post New Quest</h4><select id="quest-type-select" class="menu-button"><option value="fetch">Fetch Item</option><option value="kill">Defeat Monster</option></select><select id="quest-target-input" class="menu-button"><option value="wheat_bundle">Wheat</option><option value="clay_golem">Golem</option></select><select id="quest-reward-select" class="menu-button"><option value="money">Perutah</option>${inventory.map(i=>`<option value="${i.id}">${i.name}</option>`).join('')}</select><input id="quest-reward-amount" type="number" value="10" style="width:50px;background:#333;color:white;"><button class="menu-button" data-action="create_quest">Post</button></div><div><h4>Active Posts</h4>${quests.map(q=>`<div>${q.type.toUpperCase()} ${q.targetId} - Status: ${q.status}</div>`).join('')}</div><button class="modal-action-button" data-action="close-player-quests">Close</button></div>`; }

    return { update, showToast };
}
