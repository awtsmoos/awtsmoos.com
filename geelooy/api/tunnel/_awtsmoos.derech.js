// B"H
// /api/tunnel

module.exports = {
  dynamicRoutes: async info => {
    const { request, response, ws } = info;

    info.setHeader("Access-Control-Allow-Origin", "*");

    const getUrl = () => new URL(request.url, "https://awtsmoos.com");

    const sendJson = obj => ({
      mimeType: "application/json",
      response: JSON.stringify(obj, null, 2)
    });

    const parseBodyFromQuery = url => {
      const content64 = url.searchParams.get("content64");
      if (!content64) return "";
      return Buffer.from(content64, "base64").toString("utf8");
    };

    await info.use("status", async () => {
      return sendJson({
        BH: "B\"H",
        ok: true,
        tunnelSystem: true,
        connectedSockets: ws?.clients?.size || 0,
        tunnels: ws?.tunnels ? [...ws.tunnels.keys()] : []
      });
    });

    await info.use("clients", async () => {
      const clients = [];

      if (ws?.clients) {
        for (const client of ws.clients) {
          clients.push({
            id: client.id,
            aliasId: client.aliasId,
            tunnelName: client.tunnelName || null,
            isTunnel: !!client.isTunnel,
            isAlive: client.isAlive
          });
        }
      }

      return sendJson({
        BH: "B\"H",
        clients
      });
    });

    await info.use("request/:tunnelName", async vars => {
      try {
        const url = getUrl();
        const tunnelUrl = url.searchParams.get("url") || "/";

        const result = await ws.sendTunnelRequest(vars.tunnelName, {
          kind: "http",
          method: request.method,
          url: tunnelUrl,
          headers: request.headers,
          body: null
        });

        response.statusCode = result.status || 200;

        if (result.headers) {
          for (const [k, v] of Object.entries(result.headers)) {
            try {
              response.setHeader(k, v);
            } catch {}
          }
        }

        return {
          response: result.body
            ? Buffer.from(result.body, "base64")
            : ""
        };
      } catch (e) {
        return sendJson({
          error: e.message,
          stack: e.stack
        });
      }
    });

    await info.use("fs/:tunnelName", async vars => {
      try {
        const url = getUrl();

        const action = url.searchParams.get("action") || "list";
        const p = url.searchParams.get("p") || url.searchParams.get("path") || ".";
        const depth = Number(url.searchParams.get("depth") || 5);
        const limit = Number(url.searchParams.get("limit") || 500);
        const as = url.searchParams.get("as") || "";
        const token = url.searchParams.get("token") || "";

        let paths = [];

        const paths64 = url.searchParams.get("paths64");
        if (paths64) {
          try {
            paths = JSON.parse(Buffer.from(paths64, "base64").toString("utf8"));
          } catch {}
        }

        const result = await ws.sendTunnelRequest(vars.tunnelName, {
          kind: "fs",
          action,
          path: p,
          paths,
          depth,
          limit,
          as,
          token,
          content: parseBodyFromQuery(url)
        });

        if (result.mimeType) {
          try {
            response.setHeader("Content-Type", result.mimeType);
          } catch {}
        }

        if (result.status) response.statusCode = result.status;

        if (result.raw64) {
          return {
            response: Buffer.from(result.raw64, "base64")
          };
        }

        return sendJson(result);
      } catch (e) {
        return sendJson({
          error: e.message,
          stack: e.stack
        });
      }
    });
  }
};