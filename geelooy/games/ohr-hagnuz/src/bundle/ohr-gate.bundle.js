var l=class{constructor(e){this.connection=e}attackVeilWisp(){return this.connection.attack("veil-wisp")}};var V="ohr-hagnuz-reconnect-v1:",d=class{constructor(e=D()){this.storage=e}get(e){try{return this.storage?.getItem(v(e))||null}catch{return null}}set(e,t){try{t&&this.storage?.setItem(v(e),t)}catch{return!1}return!0}clear(e){try{this.storage?.removeItem(v(e))}catch{return!1}return!0}};function v(r){return`${V}${String(r||"primary")}`}function D(){try{return globalThis.sessionStorage}catch{return null}}var u=class{constructor(e=globalThis.fetch?.bind(globalThis)){this.fetchFunction=e}async issue(e,t=globalThis.location){if(!this.fetchFunction)throw new Error("Authenticated ticket transport is unavailable.");let o=new URLSearchParams({protocolVersion:"1",slot:e}),n=await this.fetchFunction(`/api/ohr-hagnuz/realtime-ticket?${o}`,{cache:"no-store",credentials:"same-origin",headers:{Accept:"application/json"}}),i=await n.json().catch(()=>({}));if(!n.ok||!i.ok||!i.ticket)throw new Error(W(i,n.status));return{expiresAt:i.expiresAt,origin:t?.origin||"",protocolVersion:i.protocolVersion,slot:i.slot,ticket:i.ticket}}};function W(r,e){return r?.error==="not_authenticated"?"Sign in to Awtsmoos.com before entering Shared Journey.":r?.error?`Shared Journey ticket rejected: ${r.error}`:`Shared Journey ticket request failed (${e}).`}var _="ohr-hagnuz",k="awtsmoos.realtime";var a=Object.freeze({ATTACK:"journey.attack",INTERACT:"journey.interact",JOIN:"journey.join",LEAVE:"journey.leave",MOVE:"journey.move",RESUME:"journey.resume",SNAPSHOT:"journey.snapshot"});function C(r,e,t,o){return{application:_,payload:e,protocol:k,requestId:o,sequence:t,type:r,version:1}}function E(r){let e=typeof r=="string"?JSON.parse(r):r;return!e||e.protocol!==k||e.application!==_?null:e}function j(r=globalThis.location){return`${r?.protocol==="https:"?"wss:":"ws:"}//${r?.host||"localhost"}`}var h=class{constructor(e){this.connection=e}async connect(e,t=j()){let o=this.connection,n=++o.connectionGeneration;o.lifecycle.close(!1),o.profile={...e,slot:e.slot||"primary"},o.url=t,o.shouldReconnect=!0,o.store.setConnection("connecting");let i=o.tokenStore.get(o.profile.slot);if(i){o.isCurrentGeneration(n)&&o.lifecycle.open(a.RESUME,{reconnectToken:i,slot:o.profile.slot});return}let s=await o.ticketClient.issue(o.profile.slot);o.isCurrentGeneration(n)&&o.lifecycle.open(a.JOIN,{...o.profile,origin:s.origin,ticket:s.ticket})}restartWithoutReconnectToken(){let e=this.connection;!e.profile||!e.shouldReconnect||this.connect({...e.profile},e.url).catch(t=>e.fail(t))}};var Y=1,p=class{constructor(e){this.connection=e}move(e,t){return this.connection.movementSequence+=1,this.send(a.MOVE,{dx:e,dy:t,movementSequence:this.connection.movementSequence})}attack(e="veil-wisp"){return this.connection.attackSequence+=1,this.send(a.ATTACK,{attackSequence:this.connection.attackSequence,targetId:e})}interact(){return this.send(a.INTERACT,{targetId:"road-lamp"})}requestSnapshot(){return this.send(a.SNAPSHOT,{})}send(e,t){let o=this.connection;if(!o.socket||o.socket.readyState!==Y)return!1;o.sequence+=1;let n=`journey-${Date.now()}-${o.sequence}`;return o.socket.send(JSON.stringify(C(e,t,o.sequence,n))),!0}};var m=class{constructor(e){this.connection=e}receive(e){try{let t=E(e);if(!t)return;if(z(t)==="INVALID_RECONNECT_TOKEN"){this.rejectReconnect();return}this.rememberSession(t),this.connection.store.applyMessage(t)}catch(t){this.connection.fail(t)}}rememberSession(e){let t=this.connection,o=e.payload||{};o.reconnectToken&&t.profile?.slot&&t.tokenStore.set(t.profile.slot,o.reconnectToken);let n=o.road?.players?.find(i=>i.id===o.playerId);n&&(t.movementSequence=n.movementSequence||0,t.attackSequence=n.attackSequence||0)}rejectReconnect(){let e=this.connection;e.tokenStore.clear(e.profile?.slot),e.restartWithoutReconnectToken()}};function z(r){return r?.payload?.code||r?.error?.code||null}var f=class{constructor(e,t={}){this.connection=e,this.socketFactory=t.socketFactory||(o=>new WebSocket(o)),this.setTimeout=t.setTimeout||globalThis.setTimeout.bind(globalThis),this.ignoredSockets=new WeakSet}open(e,t){let o=this.connection,n=this.socketFactory(o.url);o.socket=n,n.addEventListener("open",()=>{o.socket===n&&(o.reconnectAttempts=0,o.store.setConnection("connected"),o.send(e,t))}),n.addEventListener("message",i=>{o.socket===n&&o.receive(i.data)}),n.addEventListener("error",()=>{o.socket===n&&o.store.setConnection("error","Shared road unavailable.")}),n.addEventListener("close",()=>this.handleClose(n))}close(e){let t=this.connection,o=t.socket;o&&(e&&o.readyState===1&&t.send(t.types.LEAVE,{}),this.ignoredSockets.add(o),t.socket=null,o.close())}handleClose(e){if(this.ignoredSockets.has(e)){this.ignoredSockets.delete(e);return}let t=this.connection;if(t.socket!==e)return;if(t.socket=null,!t.shouldReconnect||!t.profile){t.store.setConnection("offline");return}t.reconnectAttempts+=1,t.store.setConnection("reconnecting");let o=t.connectionGeneration;this.setTimeout(()=>{t.isCurrentGeneration(o)&&t.connect(t.profile,t.url).catch(n=>t.fail(n))},Math.min(150*t.reconnectAttempts,1200))}};var y=class{constructor(e,t={}){let o=typeof t=="function"?{socketFactory:t}:t;this.store=e,this.ticketClient=o.ticketClient||new u,this.tokenStore=o.tokenStore||new d,this.lifecycle=new f(this,o),this.admission=new h(this),this.commands=new p(this),this.receiver=new m(this),this.types=a,this.socket=null,this.profile=null,this.url=null,this.sequence=0,this.movementSequence=0,this.attackSequence=0,this.reconnectAttempts=0,this.connectionGeneration=0,this.shouldReconnect=!1}connect(e,t){return this.admission.connect(e,t)}isCurrentGeneration(e){return this.shouldReconnect&&!!this.profile&&e===this.connectionGeneration}restartWithoutReconnectToken(){this.admission.restartWithoutReconnectToken()}move(e,t){return this.commands.move(e,t)}attack(e){return this.commands.attack(e)}interact(){return this.commands.interact()}requestSnapshot(){return this.commands.requestSnapshot()}send(e,t){return this.commands.send(e,t)}receive(e){this.receiver.receive(e)}disconnect(e=!0){this.connectionGeneration+=1,this.shouldReconnect=!1,this.profile=null,this.lifecycle.close(e)}fail(e){this.store.setConnection("error",e?.message||"Shared Journey failed.")}};var b=class{constructor(){this.listeners=new Set,this.state=R(),this.publish()}subscribe(e){return this.listeners.add(e),e(this.snapshot()),()=>this.listeners.delete(e)}setConnection(e,t=null){this.state={...this.state,connection:e,error:t},this.emit()}applyMessage(e){let t=e?.payload||{};this.state={...this.state,combat:t.combat||this.state.combat,error:e?.error?.message||null,lastMessageType:e?.type||null,playerId:t.playerId||this.state.playerId,road:t.road||this.state.road},this.emit()}reset(){this.state=R(),this.emit()}snapshot(){return structuredClone(this.state)}emit(){let e=this.snapshot();this.publish(e);for(let t of this.listeners)t(e)}publish(e=this.snapshot()){globalThis.__OHR_HAGNUZ_SHARED_JOURNEY__=e}};function R(){return{combat:null,connection:"offline",error:null,lastMessageType:null,playerId:null,road:null}}var g=class{constructor(e,t){this.malchusRoot=e,this.keserController=t,this.abortController=null}bind(){return this.destroy(),this.abortController=new AbortController,this.malchusRoot.addEventListener("click",e=>{this.route(e)},{signal:this.abortController.signal}),this}route(e){let t=e.target instanceof Element?e.target.closest("button"):null;if(!t||!this.malchusRoot.contains(t))return;let o=t.dataset.action;if(o==="solo"&&this.keserController.chooseSolo(),o==="shared"&&this.keserController.showShared(),o==="connect"&&this.keserController.connect(),o==="lamp"&&this.keserController.connection.interact(),o==="attack"&&this.keserController.combat.attackVeilWisp(),t.dataset.move){let[n,i]=t.dataset.move.split(",").map(Number);this.keserController.connection.move(n,i)}}destroy(){this.abortController?.abort(),this.abortController=null}};var x=class{constructor({malchusView:e,hodStore:t,yesodConnection:o,gevurahCombat:n}){this.malchusView=e,this.store=t,this.connection=o,this.combat=n,this.committedMode=null,this.resolveChoice=null,this.choicePromise=new Promise(i=>{this.resolveChoice=i})}whenChosen(){return this.choicePromise}chooseSolo(){this.committedMode||(this.connection.disconnect(),this.store.reset(),this.commit("solo"))}show(){this.committedMode||this.malchusView.showChoices()}showShared(){this.committedMode||this.malchusView.showShared()}async connect(){if(this.committedMode)return;let{displayName:e,slot:t}=this.malchusView.readSharedCredentials();if(!e||!t){this.store.setConnection("error","Enter a safe traveler name and character slot.");return}try{await this.connection.connect({displayName:e,glyph:"\u05D0",slot:t}),this.commit("shared")}catch(o){this.store.setConnection("error",o.message)}}snapshot(){return Object.freeze({mode:this.committedMode,committed:!!this.committedMode})}commit(e){this.committedMode||(this.committedMode=e,this.malchusView.hide(),this.resolveChoice(e))}};function T(r=document){let e=r.createElement("div");e.className="shared-road-grid",e.setAttribute("role","grid"),e.setAttribute("aria-label","Bent Reeds shared road");for(let t=0;t<9;t+=1)for(let o=0;o<13;o+=1){let n=r.createElement("div");n.className="shared-road-cell",n.dataset.x=String(o),n.dataset.y=String(t),n.setAttribute("role","gridcell"),e.append(n)}return e}function O(r,e,t){return r?.querySelector(`.shared-road-cell[data-x="${Number(e)}"][data-y="${Number(t)}"]`)||null}function N(r,e){if(r.replaceChildren(),!e.road){r.textContent="Awaiting an authoritative road snapshot.";return}let t=T(r.ownerDocument);r.append(t),w(t,e.road.lamp,{className:e.road.lamp?.lit?"road-lamp road-lamp--lit":"road-lamp",label:e.road.lamp?.lit?"Shared lamp burning":"Shared lamp waiting",text:e.road.lamp?.lit?"\u{1F525}":"\u{1F56F}\uFE0F"}),w(t,e.road.encounter,{className:e.road.encounter?.defeated?"veil-wisp veil-wisp--defeated":"veil-wisp",label:H(e.road.encounter),text:e.road.encounter?.defeated?"\u2726":"\u25C9"});for(let o of e.road.players||[])U(t,o,o.id===e.playerId)}function U(r,e,t){let o=w(r,e,{className:t?"road-traveler road-traveler--self":"road-traveler",label:`${e.displayName}, health ${e.health} of ${e.maxHealth}`,text:e.glyph});if(!o)return;let n=r.ownerDocument.createElement("small");n.textContent=t?`${e.displayName} \xB7 you`:e.displayName,o.append(n)}function w(r,e,t){if(!e)return null;let o=O(r,e.x,e.y);if(!o)return null;let n=r.ownerDocument.createElement("span");n.className=t.className,n.setAttribute("role","img"),n.setAttribute("aria-label",t.label);let i=r.ownerDocument.createElement("b");return i.textContent=t.text,n.append(i),o.append(n),n}function H(r){return r?r.defeated?"Veil Wisp dispersed":`Veil Wisp, health ${r.health} of ${r.maxHealth}`:"No encounter"}function A(r,e){let t=r.querySelector('[data-output="status"]'),o=r.querySelector('[data-output="road"]'),n=r.querySelector('[data-output="grid"]'),i=r.querySelector('[data-output="combat"]'),s=r.querySelector("[data-controls]"),c=r.querySelector('[data-action="attack"]');t.textContent=P(e),s.hidden=!e.road,c.disabled=!e.road||!!e.road.encounter?.defeated,N(n,e),G(o,e),F(i,e)}function P(r){return r.error?r.error:{connected:"Authenticated socket open. Attaching character\u2026",connecting:"Requesting one-use journey proof\u2026",error:"The shared world is unavailable.",offline:"Offline",reconnecting:"Connection dropped. Rotating reconnect proof\u2026"}[r.connection]||r.connection}function G(r,e){if(r.replaceChildren(),!e.road){r.textContent="No authoritative road snapshot received yet.";return}let t=document.createElement("p");t.textContent=e.road.lamp?.lit?"The shared lamp is burning.":"The shared lamp waits at tile 8, 4.",r.append(t);let o=document.createElement("ul");for(let n of e.road.players||[]){let i=document.createElement("li"),s=n.id===e.playerId?" \u2014 you":"";i.textContent=`${n.glyph} ${n.displayName}${s}: tile ${n.x}, ${n.y}; health ${n.health}/${n.maxHealth}; light ${n.sharedLight}; passage shards ${n.passageShards}`,o.append(i)}r.append(o)}function F(r,e){let t=e.road?.encounter;if(!t){r.textContent="";return}r.textContent=t.defeated?"The cooperative Veil Wisp is dispersed. Contributors received one passage shard.":`Veil Wisp health: ${t.health}/${t.maxHealth}. Stand beside it and strike together.`}var q=`
	.journey-mode button {
		min-height: 48px;
		padding: 12px;
		border: 1px solid rgba(231, 198, 110, .45);
		border-radius: 12px;
		background: #182139;
		color: #fff;
		cursor: pointer;
	}
	.journey-mode button:hover,
	.journey-mode button:focus-visible {
		border-color: #f3d887;
		background: #24304d;
		outline: none;
	}
	.journey-mode__choices button {
		display: grid;
		gap: 5px;
		text-align: left;
	}
	.journey-mode button span {
		color: #c8cfdd;
		font-size: .85rem;
	}
	.journey-mode__shared {
		margin-top: 18px;
	}
	.journey-mode label {
		display: grid;
		gap: 6px;
	}
	.journey-mode input {
		min-height: 44px;
		padding: 0 12px;
		border: 1px solid #6d7590;
		border-radius: 10px;
		background: #080d18;
		color: #fff;
	}
	.journey-mode__actions,
	.journey-mode__controls {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 12px;
	}
	.journey-mode__status {
		color: #f3d887;
	}
	.journey-mode__road {
		min-height: 76px;
		padding: 12px;
		border-radius: 12px;
		background: #080d18;
		color: #dce2ee;
	}
	.journey-mode__controls button {
		min-width: 52px;
	}
	@media (max-width: 560px) {
		.journey-mode__controls {
			justify-content: center;
		}
	}
`;var M=`
	.journey-mode-root {
		position: fixed;
		inset: 0;
		z-index: 5000;
		display: grid;
		place-items: center;
		padding: 18px;
		background: rgba(5, 8, 18, .82);
		backdrop-filter: blur(9px);
	}
	.journey-mode-root[hidden] {
		display: none;
	}
	.journey-mode {
		width: min(620px, 100%);
		max-height: 92vh;
		overflow: auto;
		padding: 24px;
		border: 1px solid rgba(236, 201, 119, .55);
		border-radius: 20px;
		background: linear-gradient(145deg, #11182a, #070b14);
		color: #f8efd9;
		box-shadow: 0 28px 80px #000;
	}
	.journey-mode header {
		display: flex;
		gap: 16px;
		align-items: center;
	}
	.journey-mode h1 {
		margin: 0;
		font-size: clamp(1.55rem, 5vw, 2.5rem);
	}
	.journey-mode__mark {
		display: grid;
		place-items: center;
		width: 58px;
		height: 58px;
		border-radius: 50%;
		background: #e7c66e;
		color: #12101a;
		font-size: 2rem;
	}
	.journey-mode__eyebrow {
		margin: 0;
		color: #e7c66e;
		text-transform: uppercase;
		letter-spacing: .16em;
		font-size: .72rem;
	}
	.journey-mode__choices {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
		margin-top: 20px;
	}
	@media (max-width: 560px) {
		.journey-mode-root {
			padding: 10px;
		}
		.journey-mode {
			padding: 18px;
			border-radius: 16px;
		}
		.journey-mode__choices {
			grid-template-columns: 1fr;
		}
	}
`;var J=`
	.journey-mode__identity-fields {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px;
	}
	.journey-mode__auth-note {
		color: #aeb8cc;
		font-size: .82rem;
	}
	.journey-mode__world {
		margin-top: 12px;
		overflow: auto;
		border: 1px solid rgba(231, 198, 110, .35);
		border-radius: 14px;
		background: radial-gradient(circle at 60% 45%, #24314b, #080d18 72%);
	}
	.shared-road-grid {
		display: grid;
		grid-template-columns: repeat(13, minmax(34px, 1fr));
		width: max(100%, 520px);
		aspect-ratio: 13 / 9;
		padding: 8px;
	}
	.shared-road-cell {
		position: relative;
		display: grid;
		place-items: center;
		min-height: 34px;
		border: 1px solid rgba(255, 255, 255, .045);
		background: rgba(31, 43, 62, .38);
	}
	.road-traveler,
	.road-lamp,
	.veil-wisp {
		position: absolute;
		z-index: 2;
		display: grid;
		place-items: center;
		min-width: 28px;
		min-height: 28px;
		border-radius: 50%;
		filter: drop-shadow(0 4px 6px #000);
	}
	.road-traveler {
		background: #324565;
		border: 1px solid #93a8cb;
		color: #fff;
	}
	.road-traveler--self {
		background: #d8ba64;
		border-color: #fff0ac;
		color: #15111d;
	}
	.road-traveler small {
		position: absolute;
		top: 29px;
		width: max-content;
		max-width: 86px;
		overflow: hidden;
		color: #eef2fa;
		font-size: 8px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.road-lamp--lit {
		box-shadow: 0 0 18px #ffcf62;
	}
	.veil-wisp {
		background: #47245f;
		border: 1px solid #c18de5;
		color: #f2d8ff;
	}
	.veil-wisp--defeated {
		opacity: .48;
	}
	.journey-mode__combat {
		min-height: 24px;
		color: #e8cf8a;
	}
	@media (max-width: 560px) {
		.journey-mode__identity-fields {
			grid-template-columns: 1fr;
		}
		.shared-road-grid {
			grid-template-columns: repeat(13, 34px);
		}
	}
`;function L(r=document){if(r.getElementById("journey-mode-styles"))return;let e=r.createElement("style");e.id="journey-mode-styles",e.textContent=[M,q,J].join(`
`),r.head.append(e)}function $(){return`
		<section class="journey-mode" role="dialog" aria-modal="true" aria-labelledby="journey-mode-title">
			<header>
				<span class="journey-mode__mark" aria-hidden="true">\u05D0</span>
				<div>
					<p class="journey-mode__eyebrow">The Concealed Frontier</p>
					<h1 id="journey-mode-title">Choose Your Journey</h1>
				</div>
			</header>
			<p>Walk privately with local saves, or enter a persistent authenticated shared world.</p>
			<div class="journey-mode__choices" data-view="choices">
				<button type="button" data-action="solo">
					<strong>Solo Journey</strong>
					<span>Offline-capable. No account or socket required.</span>
				</button>
				<button type="button" data-action="shared">
					<strong>Shared Journey</strong>
					<span>Persistent character, remote travelers, cooperative battle.</span>
				</button>
			</div>
			<div class="journey-mode__shared" data-view="shared" hidden>
				<div class="journey-mode__identity-fields">
					<label>Traveler name <input data-field="name" maxlength="24" value="Neriah"></label>
					<label>Character slot <input data-field="slot" maxlength="32" value="primary"></label>
				</div>
				<p class="journey-mode__auth-note">Shared Journey uses your signed-in Awtsmoos.com session. Reconnect proof remains only in this browser session.</p>
				<div class="journey-mode__actions">
					<button type="button" data-action="connect">Enter Persistent Road</button>
					<button type="button" data-action="solo">Return to Solo</button>
				</div>
				<p class="journey-mode__status" data-output="status" aria-live="polite">Offline</p>
				<div class="journey-mode__world" data-output="grid"></div>
				<div class="journey-mode__road" data-output="road"></div>
				<p class="journey-mode__combat" data-output="combat" aria-live="polite"></p>
				<div class="journey-mode__controls" data-controls hidden>
					<button type="button" data-move="0,-1" aria-label="Move north">\u2191</button>
					<button type="button" data-move="-1,0" aria-label="Move west">\u2190</button>
					<button type="button" data-action="lamp">Light</button>
					<button type="button" data-action="attack">Strike Wisp</button>
					<button type="button" data-move="1,0" aria-label="Move east">\u2192</button>
					<button type="button" data-move="0,1" aria-label="Move south">\u2193</button>
				</div>
			</div>
		</section>`}var S=class{constructor(e=document){this.documentObject=e,this.root=this.createRoot()}createRoot(){let e=this.documentObject.createElement("div");return e.id="journey-mode-root",e.className="journey-mode-root",e.innerHTML=$(),this.documentObject.body.append(e),e}existingController(){return this.root.journeyController||null}attachController(e){this.root.journeyController=e}showChoices(){this.root.hidden=!1,this.root.querySelector('[data-view="choices"]').hidden=!1,this.root.querySelector('[data-view="shared"]').hidden=!0}showShared(){this.root.hidden=!1,this.root.querySelector('[data-view="choices"]').hidden=!0,this.root.querySelector('[data-view="shared"]').hidden=!1,this.root.querySelector('[data-field="name"]')?.focus()}hide(){this.root.hidden=!0}readSharedCredentials(){return Object.freeze({displayName:this.fieldValue("name"),slot:B(this.fieldValue("slot"))})}fieldValue(e){return this.root.querySelector(`[data-field="${e}"]`)?.value.trim()||""}};function B(r){let e=r.toLowerCase();return/^[a-z0-9-]{1,32}$/.test(e)?e:""}function We(r=document,e={}){let t=r.getElementById("journey-mode-root");if(t?.journeyController)return t.journeyController;L(r);let o=e.store||new b,n=e.connection||new y(o,e.connectionOptions||{}),i=e.combat||new l(n),s=new S(r),c=new x({malchusView:s,hodStore:o,yesodConnection:n,gevurahCombat:i});return s.attachController(c),o.subscribe(I=>{A(s.root,I)}),new g(s.root,c).bind(),c}export{We as mountJourneyModeGate};
