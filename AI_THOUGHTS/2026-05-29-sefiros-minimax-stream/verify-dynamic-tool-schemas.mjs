//B"H
import { BrowserLocalTunnelBridge } from "../../geelooy/ai/central/browserLocalTunnelBridge.js";
import { makeBridgeToolSchemas, normalizeActionCatalog } from "../../geelooy/ai/central/toolSchemas.js";

const richCatalog = normalizeActionCatalog({
  actions: ["read", "write", "simulateRuntime"],
  schemas: {
    read: {
      description: "Dynamic read from tunnel API",
      parameters: {
        type: "object",
        additionalProperties: false,
        required: ["p"],
        properties: {
          p: { type: "string", description: "Path to read." },
          maxChars: { type: "integer" }
        }
      }
    },
    simulateRuntime: {
      description: "Dynamic runtime simulator",
      schema: {
        type: "object",
        required: ["html"],
        properties: {
          html: { type: "string" },
          runtime: { type: "string", enum: ["browser", "node"] }
        }
      }
    }
  }
});
const direct = makeBridgeToolSchemas(["read", "simulateRuntime"], richCatalog);
const readSchema = direct.find(tool => tool.function?.name === "read");
const runtimeSchema = direct.find(tool => tool.function?.name === "simulateRuntime");
console.log(JSON.stringify({ readSchema, runtimeSchema }, null, 2));
if (readSchema.function.description !== "Dynamic read from tunnel API") throw new Error("read did not use dynamic description");
if (!readSchema.function.parameters.required.includes("p")) throw new Error("read did not use dynamic required args");
if (!runtimeSchema.function.parameters.properties.runtime.enum.includes("node")) throw new Error("simulateRuntime dynamic enum missing");

const calls = [];
const fetchImpl = async (url, init = {}) => {
  calls.push(url);
  if (url.endsWith("/actions")) return ok({ actions: ["read", "simulateRuntime", "write"] });
  if (url.endsWith("/tools")) return ok({ tools: [{ name: "read", description: "Tool endpoint read", parameters: { type: "object", required: ["path"], properties: { path: { type: "string" } } } }] });
  if (url.endsWith("/schemas")) return ok({ schemas: { simulateRuntime: { description: "Schema endpoint simulator", parameters: { type: "object", required: ["scriptText"], properties: { scriptText: { type: "string" } } } } } });
  if (url.endsWith("/manifest")) return { ok: false, status: 404, json: async () => ({}) };
  throw new Error(url);
};
const bridge = await new BrowserLocalTunnelBridge({ fetchImpl }).init();
const schemas = bridge.schemas();
const details = bridge.toolDetails({ names: ["read", "simulateRuntime"] });
const directRead = schemas.find(tool => tool.function?.name === "read");
const directRuntime = schemas.find(tool => tool.function?.name === "simulateRuntime");
console.log(JSON.stringify({ calls, directRead, directRuntime, details }, null, 2));
if (!calls.some(url => url.endsWith("/tools")) || !calls.some(url => url.endsWith("/schemas"))) throw new Error("schema endpoints were not probed");
if (directRead.function.description !== "Tool endpoint read") throw new Error("direct read did not use richer /tools schema");
if (!directRuntime.function.parameters.required.includes("scriptText")) throw new Error("direct simulateRuntime did not use /schemas schema");
if (!details.details.find(item => item.name === "simulateRuntime")?.parameters?.properties?.scriptText) throw new Error("tool details did not expose dynamic schema");

function ok(json) { return { ok: true, json: async () => json }; }
