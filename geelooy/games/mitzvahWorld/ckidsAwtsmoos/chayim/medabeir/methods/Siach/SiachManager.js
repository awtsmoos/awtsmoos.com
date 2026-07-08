// B"H
/**
 * @file SiachManager.js
 * @description Chapter 445: when speech opens, the rest of the HUD bows. When
 * speech closes, the meadow returns. The Awtsmoos makes conversation a bridge,
 * not a curtain over the world.
 */
import { DialogueUI } from "./DialogueUI.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
function setDialogueOpen(open) { globalThis.document?.body?.classList?.toggle("awtsmoos-dialogue-open", Boolean(open)); }
export default class SiachManager {
  constructor(nivra, olam) { this.nivra = nivra; this.olam = olam; this.activeConversation = null; }
  begin(chossid) {
    const tree = this.nivra.messageTree;
    if (!Array.isArray(tree) || tree.length === 0) return;
    this.activeConversation = { chossid, currentNodeIndex:0, startTime:Date.now() };
    setDialogueOpen(true);
    this.olam.ayshPeula("dialogueStarted", { npc:this.nivra, chossid });
    this.render();
  }
  choose(index) {
    if (!this.activeConversation) return;
    const node = this.getCurrentNode(), responses = Array.isArray(node?.responses) ? node.responses : [], response = responses[index];
    if (!response) return;
    if (typeof response.action === "function") response.action(this.nivra, this.activeConversation.chossid);
    else if (typeof response.action === "string") this.handleStringAction(response.action, response, this.activeConversation.chossid);
    if (response.nextMessageIndex !== undefined || response.next !== undefined) {
      this.activeConversation.currentNodeIndex = response.nextMessageIndex !== undefined ? response.nextMessageIndex : response.next;
      this.render();
    } else if (response.close || response.type === "close") this.end();
  }
  handleStringAction(actionName, response, chossid) {
    if (!chossid) return;
    if (actionName === "studyPasuk" && response.pasukId) {
      const result = chossid.studyManager.study(response.pasukId);
      this.olam.ayshPeula("ui event", "toast", { message:result.message, type:result.success ? "success" : "warning" });
    }
    if (actionName === "openShop") this.nivra.handleDialogue(chossid);
    if (actionName === "acceptMission" && response.missionId && chossid.shlichusBook) chossid.shlichusBook.acceptMission(response.missionId);
  }
  getCurrentNode() { return this.nivra.messageTree[this.activeConversation.currentNodeIndex]; }
  render() {
    const node = this.getCurrentNode();
    if (!node) { this.end(); return; }
    setDialogueOpen(true);
    this.olam.htmlAction(DialogueUI.generate({ npcName:this.nivra.name || "A Messenger", message:node.message, responses:node.responses, onChoice:index => this.choose(index) }));
  }
  end() {
    if (this.activeConversation) { this.olam.ayshPeula("dialogueEnded", this.nivra); this.activeConversation = null; }
    setDialogueOpen(false);
    this.olam.htmlAction({ shaym:"dialogue-vessel", methods:{ classList:{ add:"hidden" } } });
  }
}
