//B"H
import { AwtsmoosPrompt } from "./prompt.js";
import AwtsmoosGPTify from "./AwtsmoosGPTify.js";
import IndexedDBHandler from "./IndexedDBHandler.js";
import { makeOpenAICompatibleService } from "./openaiCompatible.js";
import { simpleGeminiResponse } from "./js/services/geminiApi.js";
import { makeChatGPTService } from "./js/services/chatgptService.js";
import { makeGeminiService } from "./js/services/geminiService.js";

/**
 * B"H — Thin AI service registry.
 *
 * Provider behavior lives in small provider modules. Provider key prompts now
 * remain provider key prompts; they do not summon the ChatGPT extension gate.
 */
class AIServiceHandler {
  geminiChatCache = null;
  conversationLimit = 26;
  conversationOffset = 0;

  constructor() {
    this.dbHandler = new IndexedDBHandler("AIAppDB");
    this.activeAIService = "chatgpt";
    this.chatgptMode = localStorage.getItem("awtsmoosChatGPTMode") || "regular";
    this.services = this.createServices();
  }

  async init() {
    await this.dbHandler.init();
    this.instance = new AwtsmoosGPTify();
    this.services = this.createServices();
  }

  createServices() {
    return {
      chatgpt: makeChatGPTService(this),
      gemini: makeGeminiService(this),
      minimax: makeOpenAICompatibleService(this, "minimax"),
      openrouter: makeOpenAICompatibleService(this, "openrouter"),
      groq: makeOpenAICompatibleService(this, "groq")
    };
  }

  async newConversation() {
    this.geminiChatCache = null;
    this.instance = new AwtsmoosGPTify();
    this.services = this.createServices();
  }

  setChatGPTMode(mode = "regular") {
    this.chatgptMode = mode;
    localStorage.setItem("awtsmoosChatGPTMode", mode);
  }

  getChatGPTModePayload() {
    if (this.chatgptMode !== "awtsmoos-vibe-coder") return {};
    return { conversation_mode: { kind: "gizmo_interaction", gizmo_id: "g-6a03feea8398819192067ae3dbfa449c" } };
  }

  switchService(newService) {
    if (!this.services[newService]) return console.log("Service not found!");
    this.activeAIService = newService;
    console.log(`Switched to ${this.services[newService].name}`);
  }

  async getActiveService() {
    return this.services[this.activeAIService];
  }

  async getKey() {
    if (!this.dbHandler.db) await this.dbHandler.init();
    let key = await this.dbHandler.read("api-keys", "gemini");
    window.geminiApiKey = key;
    if (!window.geminiApiKey) {
      window.geminiApiKey = await AwtsmoosPrompt.go({
        title: "B\"H — Gemini API Key",
        headerTxt: "What's your <a href='https://aistudio.google.com/apikey' target='_blank' rel='noreferrer'>Gemini API key</a>?",
        placeholderTxt: "Gemini API key",
        showExtensionActions: false,
        okText: "Save key"
      });
      await this.dbHandler.write("api-keys", "gemini", window.geminiApiKey);
    }
    return window.geminiApiKey;
  }

  async awtsmoosAi(options = {}) {
    const params = typeof options === "string" ? { prompt: options } : (options || {});
    const apiKey = await this.getKey();
    const raw = await simpleGeminiResponse({ ...params, apiKey });
    const json = JSON.parse(raw);
    const text = json.map(item => item.candidates.map(candidate => candidate.content.parts[0].text).join("")).join("").trim();
    return params.full ? { text, json } : text;
  }
}

export default AIServiceHandler;
