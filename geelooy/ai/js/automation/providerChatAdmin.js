//B"H
import IndexedDBHandler from "../../IndexedDBHandler.js";
import { ProviderChatStore } from "../../central/providerChatStore.js";
import { listProviders } from "../../central/providers.js";
import { downloadTextFile } from "./messageArchive.js";

/**
 * B"H
 * Chapter 150: The Provider Archives Became Selectable Scrolls.
 *
 * The settings drawer can export, import, clear all, or clear selected chats for
 * MiniMax, OpenRouter, and Groq. It uses the same IndexedDB store as live
 * provider conversations so the list is not ceremonial; it edits reality.
 */
export class ProviderChatAdmin {
  constructor() {
    this.db = new IndexedDBHandler("AIAppDB");
  }

  async init() {
    await this.db.init();
    return this;
  }

  async lists() {
    const out = [];
    for (const provider of listProviders()) {
      const store = new ProviderChatStore(this.db, provider.id);
      const list = await store.list({ offset: 0, limit: 200 });
      out.push({ provider, chats: list.items });
    }
    return out;
  }

  async exportSelected(ids = []) {
    const grouped = await this.collect(ids);
    downloadTextFile(`BH_provider_chats_${stamp()}.json`, JSON.stringify(grouped, null, 2), "application/json");
    return grouped.count;
  }

  async clearSelected(ids = []) {
    const wanted = new Set(ids);
    for (const provider of listProviders()) {
      const store = new ProviderChatStore(this.db, provider.id);
      const list = await store.list({ offset: 0, limit: 1000 });
      await store.remove(list.items.filter(chat => wanted.has(chat.id)).map(chat => chat.id));
    }
    return ids.length;
  }

  async clearAll() {
    let count = 0;
    for (const provider of listProviders()) {
      const store = new ProviderChatStore(this.db, provider.id);
      const list = await store.list({ offset: 0, limit: 1000 });
      await store.remove(list.items.map(chat => chat.id));
      count += list.items.length;
    }
    return count;
  }

  async importJson(file) {
    const payload = JSON.parse(await file.text());
    const bundles = Array.isArray(payload?.bundles) ? payload.bundles : [payload];
    let count = 0;
    for (const bundle of bundles) {
      const providerId = bundle.providerId || bundle.chats?.[0]?.providerId;
      const provider = listProviders().find(item => item.id === providerId);
      if (!provider) continue;
      count += await new ProviderChatStore(this.db, provider.id).import(bundle);
    }
    return count;
  }

  async collect(ids = []) {
    const wanted = new Set(ids);
    const bundles = [];
    let count = 0;
    for (const provider of listProviders()) {
      const bundle = await new ProviderChatStore(this.db, provider.id).export([...wanted]);
      if (bundle.chats.length) { bundles.push(bundle); count += bundle.chats.length; }
    }
    return { kind: "awtsmoos-all-provider-chats", exportedAt: new Date().toISOString(), count, bundles };
  }
}

export async function createProviderChatAdmin() {
  return await new ProviderChatAdmin().init();
}

function stamp() { return new Date().toISOString().replace(/[:.]/g, "-"); }
