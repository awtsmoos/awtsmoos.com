// B"H
import { normalizeVirtualFsAction } from "../actions.js";
import { normalizeVirtualPath } from "../path.js";
import { failResult } from "../result.js";
import { capabilityReport } from "../capabilities.js";

/**
 * B"H
 * Chapter 45: Hosted Awtsmoos API became an adapter, not a special exception.
 */
export class HostedAwtsmoosFsAdapter {
  constructor({ fetchImpl, origin = "", vesselName = "awtsmoos-os", ensureSession = null } = {}) {
    this.fetchImpl = fetchImpl || globalThis.fetch;
    this.origin = String(origin || "").replace(/\/+$/, "");
    this.vesselName = vesselName;
    this.ensureSession = ensureSession;
  }

  capabilities() { return capabilityReport("hostedAwtsmoos", { vesselName: this.vesselName }); }

  buildUrl(payload = {}) {
    const action = normalizeVirtualFsAction(payload.action || "list");
    const query = new URLSearchParams();
    const packed = { ...payload, action, path: normalizeVirtualPath(payload.path || payload.p || ".") };
    for (const [key, value] of Object.entries(packed)) {
      if (value === undefined || value === null) continue;
      if (key === "content") query.set("content64", b64(String(value)));
      else if (typeof value === "object") query.set(key, JSON.stringify(value));
      else query.set(key, String(value));
    }
    return `${this.origin}/api/tunnel/control/fs/${encodeURIComponent(this.vesselName)}?${query.toString()}`;
  }

  async run(payload = {}) {
    const action = normalizeVirtualFsAction(payload.action || "list");
    try {
      if (this.ensureSession) {
        const session = await this.ensureSession();
        if (session?.ok === false) throw new Error("Awtsmoos login required.");
      }
      const res = await this.fetchImpl(this.buildUrl({ ...payload, action }), { method: "GET", credentials: "include" });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.error || data.message || `Hosted Awtsmoos API error: ${res.status}`);
      return data;
    } catch (error) {
      return failResult(action, error);
    }
  }
}

function b64(text) {
  if (typeof Buffer !== "undefined") return Buffer.from(text, "utf8").toString("base64");
  return btoa(unescape(encodeURIComponent(text)));
}
