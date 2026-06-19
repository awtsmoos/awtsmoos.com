//B"H
import { AwtsmoosPrompt } from "./prompt.js";
import AwtsmoosGPTify from "./AwtsmoosGPTify.js";
import IndexedDBHandler from "./IndexedDBHandler.js";
import { makeOpenAICompatibleService } from "./openaiCompatible.js";
import { simpleGeminiResponse } from "./js/services/geminiApi.js";
import { makeChatGPTService } from "./js/services/chatgptService.js";
import { makeGeminiService } from "./js/services/geminiService.js";

export const DEFAULT_AI_SERVICE = "minimax";
export const ACTIVE_AI_SERVICE_STORAGE_KEY = "awtsmoosActiveAIService";

/**
 * B"H — MiniMax is the default gate. ChatGPT is only summoned when selected;
 * the other OpenAI-shaped vessels inherit the local Awtsmoos tunnel bridge.
 */
class AIServiceHandler {
  geminiChatCache = null;
  conversationLimit = 26;
  conversationOffset = 0;

  constructor() {
    this.dbHandler = new IndexedDBHandler("AIAppDB");
    this.chatgptMode = readStorage("awtsmoosChatGPTMode") || "regular";
    this.services = this.createServices();
    this.activeAIService = this.resolveService(readStorage(ACTIVE_AI_SERVICE_STORAGE_KEY));
  }

  async init() {
    await this.dbHandler.init();
    this.instance = new AwtsmoosGPTify();
    this.services = this.createServices();
    this.activeAIService = this.resolveService(this.activeAIService);
  }

  createServices() {
    return {
      chatgpt: makeChatGPTService(this),
      gemini: makeGeminiService(this),
      minimax: makeOpenAICompatibleService(this, "minimax"),
      openrouter: makeOpenAICompatibleService(this, "openrouter"),
      deepseek: makeOpenAICompatibleService(this, "deepseek"),
      groq: makeOpenAICompatibleService(this, "groq")
    };
  }

  resolveService(serviceId = "") {
    return this.services?.[serviceId] ? serviceId : DEFAULT_AI_SERVICE;
  }

  async newConversation() {
    this.geminiChatCache = null;
    this.instance = new AwtsmoosGPTify();
    this.services = this.createServices();
    this.activeAIService = this.resolveService(this.activeAIService);
  }

  setChatGPTMode(mode = "regular") {
    this.chatgptMode = mode;
    writeStorage("awtsmoosChatGPTMode", mode);
  }

  getChatGPTModePayload() {
    if (!this.isChatGPTSelected()) return {};
    if (this.chatgptMode !== "awtsmoos-vibe-coder") return {};
    return { conversation_mode: { kind: "gizmo_interaction", gizmo_id: "g-6a03feea8398819192067ae3dbfa449c" } };
  }

  switchService(newService) {
    if (!this.services[newService]) {
      console.log("Service not found!");
      return false;
    }
    this.activeAIService = newService;
    writeStorage(ACTIVE_AI_SERVICE_STORAGE_KEY, newService);
    console.log(`Switched to ${this.services[newService].name}`);
    return true;
  }

  isChatGPTSelected() {
    return this.activeAIService === "chatgpt" || this.activeAIService === "chatgpt-browser";
  }

  async getActiveService() { return this.services[this.activeAIService]; }

  async getKey() {
    let k = await this.dbHandler.get("apiKeys", "gemini");
    if (!k) {
      k = prompt("Enter your Gemini API key");
      if (k) await this.dbHandler.add("apiKeys", { service: "gemini", key: k });
    }
    return k;
  }

  async awtsmoosAi(options = {}) {
    try {
      const key = await this.getKey();
      const model = options.model || "gemini-2.0-flash";
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const prompt = new AwtsmoosPrompt({
        promptName: "legacy-gemini-direct",
        promptText: typeof options.prompt === "string" ? options.prompt : "",
        systemInstruction: options.systemInstruction,
        metadata: { source: "AIServiceHandler.awtsmoosAi" }
      });
      return await simpleGeminiResponse({ endpoint, prompt: prompt.promptText, systemInstruction: prompt.systemInstruction });
    } catch (err) { console.error(err); }
  }
}

function readStorage(key) {
  try { return typeof localStorage === "undefined" ? "" : localStorage.getItem(key); } catch { return ""; }
}
function writeStorage(key, value) {
  try { if (typeof localStorage !== "undefined") localStorage.setItem(key, value); } catch {}
}
export default AIServiceHandler;
