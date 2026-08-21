//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file main.js
 * @description Composes play, identity, creation, touch, cosmetics, and quiet power.
 * The Awtsmoos renews every module from one source; Awtsmoos.com joins their oros
 * here without letting optional chrome, device type, or garment become the game's core.
 */
import { HttpClient } from "./network/HttpClient.js";
import { AwtsmoosIdentityGateway } from "./network/AwtsmoosIdentityGateway.js";
import { AwtsmoosAccountGateway } from "./network/AwtsmoosAccountGateway.js";
import { OhrboundCloudRepository } from "./network/OhrboundCloudRepository.js";
import { LocalSaveRepository } from "./persistence/LocalSaveRepository.js";
import { ProgressRepository } from "./persistence/ProgressRepository.js";
import { AppearanceRepository } from "./appearance/AppearanceRepository.js";
import { CharacterAppearance } from "./appearance/CharacterAppearance.js";
import { ExperienceBootstrap } from "./preferences/ExperienceBootstrap.js";
import { BUILT_IN_LEVELS } from "./levels/catalog.js";
import { InputState } from "./input/InputState.js";
import { RuntimeProbe } from "./runtime/RuntimeProbe.js";
import { WorldRenderer } from "./render/WorldRenderer.js";
import { GameShell } from "./ui/GameShell.js";
import { HudView } from "./ui/HudView.js";
import { IdentityView } from "./ui/IdentityView.js";
import { AccountDialog } from "./ui/AccountDialog.js";
import { CharacterCustomizer } from "./ui/CharacterCustomizer.js";
import { LevelSelectView } from "./ui/LevelSelectView.js";
import { ExperienceUi } from "./ui/ExperienceUi.js";
import { CommunityService } from "./app/CommunityService.js";
import { CreatorFlow } from "./app/CreatorFlow.js";
import { GameLoop } from "./app/GameLoop.js";
import { OhrboundApp } from "./app/OhrboundApp.js";
import { OhrboundBrowserBindings } from "./app/OhrboundBrowserBindings.js";

const http = new HttpClient();
const cloud = new OhrboundCloudRepository(http);
const identityGateway = new AwtsmoosIdentityGateway(http);
const accountGateway = new AwtsmoosAccountGateway();
const progress = new ProgressRepository(new LocalSaveRepository(), cloud);
const appearanceRepository = new AppearanceRepository();
const appearance = new CharacterAppearance(appearanceRepository.load());
const experience = ExperienceBootstrap.create();
const input = new InputState();
const probe = new RuntimeProbe();
const shell = new GameShell(document);
const renderer = new WorldRenderer(
	"ohrbound-render-host",
	appearance.read(),
	experience.read()
);
let app;

const levelSelect = new LevelSelectView(
	document.querySelector("[data-levels]"),
	level => app.launch(level)
);
const accountDialog = new AccountDialog(
	document.querySelector("#account-dialog"),
	(username, password) => app.signIn(username, password)
);
const identityView = new IdentityView(
	document.querySelector("[data-identity]"),
	() => accountDialog.open()
);
const characterCustomizer = new CharacterCustomizer(
	document.querySelector("#character-dialog"),
	appearance,
	appearanceRepository,
	renderer
);
const creator = new CreatorFlow(
	document.querySelector("[data-pane='editor']"),
	shell,
	cloud,
	() => app.identity,
	{
		test: level => app.launch(level),
		close: () => app.showMenu(),
		published: () => app.reloadCommunity()
	}
);
app = new OhrboundApp({
	shell,
	renderer,
	hud: new HudView(document),
	identityView,
	levelSelect,
	identityGateway,
	accountGateway,
	progress,
	communityService: new CommunityService(cloud),
	loop: new GameLoop(input, probe),
	probe
});
const experienceUi = new ExperienceUi({
	preferences: experience,
	renderer,
	drawer: document.querySelector("[data-advanced-drawer]"),
	hud: document.querySelector("[data-game-hud]"),
	quickPlayButton: document.querySelector("[data-quick-play]"),
	levels: BUILT_IN_LEVELS,
	progressRepository: progress,
	launch: level => app.launch(level),
	customize: () => characterCustomizer.open(),
	create: () => creator.open()
});

new OhrboundBrowserBindings({
	input,
	experienceUi,
	experience,
	app
}).attach();
app.start().catch(error => {
	shell.message(error.message || "Ohrbound could not start.", "error");
});
