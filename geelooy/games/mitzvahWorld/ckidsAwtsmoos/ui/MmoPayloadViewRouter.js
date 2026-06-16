// B"H
/** @file MmoPayloadViewRouter.js @description Normalizes known UI event payloads into pure view models. */
import { farmPanelView } from "./farm/FarmPanelUI.js";
import { separationPanelView } from "./halacha/SeparationPanelUI.js";
import { mailboxView, bankView, deliveryView, lockStateView, tutorialHintView } from "./services/ServicePanelUI.js";
import { collectToastView } from "./loot/CollectToastUI.js";
import { seferReaderView, torahSpellbookView } from "./torah/TorahReaderUI.js";
import { carcassPanelView, craftingView } from "./kosher/CarcassPanelUI.js";
const ROUTES = Object.freeze({ farmPanel:farmPanelView, separationPanel:separationPanelView, mailbox:mailboxView, bankPanel:bankView, delivery:deliveryView, lockState:lockStateView, tutorialHint:tutorialHintView, collect:collectToastView, seferReader:seferReaderView, torahSpellbook:torahSpellbookView, carcassPanel:carcassPanelView, crafting:craftingView });
export function uiPayloadView(eventName, payload = {}) { const fn = ROUTES[eventName]; return fn ? fn(payload) : { type:"UnknownPayloadUI", eventName, payload }; }
export function knownUiPayloads() { return Object.keys(ROUTES); }
export default { uiPayloadView, knownUiPayloads };
