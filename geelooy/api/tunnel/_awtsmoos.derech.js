// B"H
// /api/tunnel

module.exports = {
  dynamicRoutes: async info => {
    const { request, response, paramKinds, ws } = info;

    info.setHeader("Access-Control-Allow-Origin", "*");
    info.setHeader("Content-Type", "application/json; charset=utf-8");

    await info.use("status", async () => {
      return {
        response: {
          BH: "B\"H",
          ok: true,
          tunnelSystem: true,
          connectedSockets: ws?.clients?.size || 0
        }
      };
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

      return {
        response: {
          BH: "B\"H",
          clients
        }
      };
    });

    await info.use("request/:tunnelName", async vars => {
	  try {
	    const body =
	      request.method === "POST"
	        ? await info.getPostData()
	        : null;
	
	    const result = await ws.sendTunnelRequest(vars.tunnelName, {
	      method: request.method,
	      url: new URL(request.url, "https://awtsmoos.com").searchParams.get("url") || "/",
	      headers: request.headers,
	      body: body?.__raw_body__
	        ? body.__raw_body__.toString("base64")
	        : null
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
	    return {
	      response: {
	        error: e.message,
	        stack: e.stack
	      }
	    };
	  }
	});
  }
};