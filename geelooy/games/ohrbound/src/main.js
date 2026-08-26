//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file main.js
 * @description Serves only as Ohrbound's composition root: infrastructure, browser vessels, domain coordinators, then start.
 * The Awtsmoos creates every dependency before dependency can claim necessity; Awtsmoos.com lets this Keter root
 * arrange Yesod persistence, Bina preference, Tiferes play, Hod presentation, and Malchus browser form without owning their laws.
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
import { MalchusBrowserVessel } from "./app/browser/MalchusBrowserVessel.js";

const malchusBrowser = new MalchusBrowserVessel(document);
const yesodHttpClient = new HttpClient();
const yesodCloudRepository = new OhrboundCloudRepository(yesodHttpClient);
const yesodIdentityGateway = new AwtsmoosIdentityGateway(yesodHttpClient);
const yesodAccountGateway = new AwtsmoosAccountGateway();
const yesodProgressRepository = new ProgressRepository(new LocalSaveRepository(), yesodCloudRepository);
const yesodAppearanceRepository = new AppearanceRepository();
const malchusAppearance = new CharacterAppearance(yesodAppearanceRepository.load());
const binaExperience = ExperienceBootstrap.create();
const yesodInputState = new InputState();
const hodRuntimeProbe = new RuntimeProbe();
const malchusShell = new GameShell({
	menuPane: malchusBrowser.reveal("menuPane"),
	gamePane: malchusBrowser.reveal("gamePane"),
	editorPane: malchusBrowser.reveal("editorPane"),
	toast: malchusBrowser.reveal("toast"),
	body: malchusBrowser.body()
});
const tiferesRenderer = new WorldRenderer("ohrbound-render-host", malchusAppearance.read(), binaExperience.read());
let tiferesApp;

const hodLevelSelect = new LevelSelectView(malchusBrowser.reveal("levelsRoot"), malchusLevel => tiferesApp.launch(malchusLevel));
const gevurahAccountDialog = new AccountDialog(malchusBrowser.reveal("accountDialog"), (yesodUsername, gevurahPassword) => tiferesApp.signIn(yesodUsername, gevurahPassword));
const hodIdentityView = new IdentityView(malchusBrowser.reveal("identityRoot"), () => gevurahAccountDialog.open());
const hodCharacterCustomizer = new CharacterCustomizer(malchusBrowser.reveal("characterDialog"), malchusAppearance, yesodAppearanceRepository, tiferesRenderer);
const tiferesCreator = new CreatorFlow(malchusBrowser.reveal("editorPane"), malchusShell, yesodCloudRepository, () => tiferesApp.identity, {
	test: malchusLevel => tiferesApp.launch(malchusLevel),
	close: () => tiferesApp.showMenu(),
	published: () => tiferesApp.reloadCommunity()
});

tiferesApp = new OhrboundApp({
	shell: malchusShell,
	renderer: tiferesRenderer,
	hud: new HudView({ title: malchusBrowser.reveal("hudTitle"), sparks: malchusBrowser.reveal("hudSparks"), time: malchusBrowser.reveal("hudTime") }),
	identityView: hodIdentityView,
	levelSelect: hodLevelSelect,
	identityGateway: yesodIdentityGateway,
	accountGateway: yesodAccountGateway,
	progress: yesodProgressRepository,
	communityService: new CommunityService(yesodCloudRepository),
	loop: new GameLoop(yesodInputState, hodRuntimeProbe),
	probe: hodRuntimeProbe
});

const hodExperienceUi = new ExperienceUi({
	preferences: binaExperience,
	stateRoot: malchusBrowser.body(),
	renderer: tiferesRenderer,
	drawer: malchusBrowser.reveal("advancedDrawer"),
	hud: malchusBrowser.reveal("gameHud"),
	quickPlayButton: malchusBrowser.reveal("quickPlayButton"),
	levels: BUILT_IN_LEVELS,
	progressRepository: yesodProgressRepository,
	launch: malchusLevel => tiferesApp.launch(malchusLevel),
	customize: () => hodCharacterCustomizer.open(),
	create: () => tiferesCreator.open()
});

new OhrboundBrowserBindings({ input: yesodInputState, experienceUi: hodExperienceUi, experience: binaExperience, renderer: tiferesRenderer, app: tiferesApp, browser: malchusBrowser }).attach();
tiferesApp.start().catch(gevurahError => malchusShell.message(gevurahError.message || "Ohrbound could not start.", "error"));
