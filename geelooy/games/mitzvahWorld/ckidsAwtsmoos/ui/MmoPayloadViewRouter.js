// B"H
/** @file MmoPayloadViewRouter.js @description Normalizes known UI event payloads into pure view models. */
import { farmPanelView } from "./farm/FarmPanelUI.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { separationPanelView } from "./halacha/SeparationPanelUI.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { mailboxView, bankView, deliveryView, lockStateView, tutorialHintView } from "./services/ServicePanelUI.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { collectToastView } from "./loot/CollectToastUI.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { seferReaderView, torahSpellbookView } from "./torah/TorahReaderUI.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { carcassPanelView, craftingView } from "./kosher/CarcassPanelUI.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const ROUTES = Object.freeze({ farmPanel:farmPanelView, separationPanel:separationPanelView, mailbox:mailboxView, bankPanel:bankView, delivery:deliveryView, lockState:lockStateView, tutorialHint:tutorialHintView, collect:collectToastView, seferReader:seferReaderView, torahSpellbook:torahSpellbookView, carcassPanel:carcassPanelView, crafting:craftingView });
export function uiPayloadView(eventName, payload = {}) { const fn = ROUTES[eventName]; return fn ? fn(payload) : { type:"UnknownPayloadUI", eventName, payload }; }
export function knownUiPayloads() { return Object.keys(ROUTES); }
export default { uiPayloadView, knownUiPayloads };
