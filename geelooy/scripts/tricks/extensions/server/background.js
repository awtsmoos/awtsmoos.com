// B"H
importScripts("streamLedger.js");
importScripts(
  "bgAutomation/storage.js",
  "bgAutomation/graph.js",
  "bgAutomation/chatgpt.js",
  "bgAutomation/engine.js",
  "bgAutomation/api.js"
);
importScripts(
  "bgAutomation/storage.js",
  "bgAutomation/graph.js",
  "bgAutomation/chatgpt.js",
  "bgAutomation/engine.js",
  "bgAutomation/api.js"
);
console.log('B"H');

chrome.webNavigation.onCompleted.addListener(async details => injectAwtsmoosContent(details.tabId));
chrome.tabs.onUpdated.addListener((tabId, info) => {
  if (info.status === "complete") injectAwtsmoosContent(tabId);
});

async function injectAwtsmoosContent(tabId) {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["awtsmoosContent.js"] });
  } catch (error) {
    console.warn("B'H content bridge injection skipped", tabId, error?.message || error);
  }
}

const ChromePortManager = globalThis.ChromePortManager || class ChromePortManager {
  constructor() {
    this.ports = {}; // Store active ports
    this.events = {}; // Store event listeners
    this.init();
  }

  // Event listener registration
  on(event, listener) {
    if (typeof event === 'object') {
      // If event is an object, register multiple listeners at once
      for (const [key, fn] of Object.entries(event)) {
        this.on(key, fn);
      }
    } else {
      // Ensure the event array is initialized
      if (!this.events[event]) {
        this.events[event] = [];
      }
      // Add listener to the event
      this.events[event].push(listener);
    }
  }

  // Emit events to listeners
  emit(event, ...data) {
    if (this.events[event]) {
      this.events[event].forEach(listener => Promise.resolve(listener(...data)).catch(error => console.warn("B'H port listener failed", event, error?.message || error)));
    }
  }

  // Initialize connection handlers
  init() {
    chrome.runtime.onConnect.addListener((port) => {
      console.log("New connection", port);
      this.handleNewConnection(port);
    });

    chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
      console.log("Received message", message);
      await this.handleMessage(message, sendResponse);
    });
  }

  // Handle messages received from a port
  async handlePortMessage(port, message) {
    console.log("Handling port message", message);

    // Emit event for the message if there's an action for it
    if (message.action) {
      this.emit(message.action, message, port); // Emit dynamic event based on action
    }

    // Handle port-specific registration
    if (message.name) {
      this.registerPortByName(port, message.name);
    }

    // Handle sending message to another port
    if (message.to) {
      await this.sendMessageToPort(message);
    }

    // Auto-reply to the port (if needed)
    if (message.reply) {
      this.reply(port, message.reply);
    }
  }

  // Auto-reply function to send messages back to the correct port
  reply(port, data) {
    console.log("Sending reply to port", port,data);
    if (port) {
		var ob = {
        ...data,
        from: data.name || 'background'
      };
	  
      try {
        port.postMessage(ob);
        console.log("Reply sent:", ob);
      } catch (error) {
        console.warn("B'H reply skipped; port disconnected", error?.message || error);
        this.onPortDisconnect(port);
      }
    }
  }

  // Handle incoming messages from the background script or other sources
  async handleMessage(message, sendResponse) {
    switch (message.command) {
      case 'send':
        console.log("Handling send command", message);
        await this.sendMessageToPort(message);
        sendResponse({status: "Message sent"});
        break;

      default:
        console.log("Unhandled command", message.command);
        sendResponse({error: "Unknown command"});
    }
  }

  // Method for port-specific registration
  registerPortByName(port, name) {
    if (!this.ports[name]) {
      console.log("New port registered:", name);
      this.ports[name] = port;
    }
  }

  // Method to send a message to another port
  async sendMessageToPort(message) {
    const { to } = message;
    const targetPort = this.ports[to];
    if (targetPort) {
      try {
        targetPort.postMessage({
          ...message,
          from: message.name || message.from,
        });
        console.log("Message sent to port", to);
      } catch (e) {
        console.error("Error sending message to port", e);
        this.onPortDisconnect(targetPort); // Attempt to disconnect on error
      }
    }
  }

  // Port disconnection handler
  onPortDisconnect(port) {
    const { name } = port;
    delete this.ports[name];
    console.log("Deleted port with name:", name);
  }

  // Handle new connection (optional: for handling port setup)
  handleNewConnection(port) {
    console.log("Handling new connection", port);
    port.onMessage.addListener(async (message) => {
      await this.handlePortMessage(port, message);
    });
    
    // Listen for the port being disconnected
    port.onDisconnect.addListener(() => {
      console.log("Port disconnected:", port);
      this.onPortDisconnect(port);
    });
  }
};

globalThis.ChromePortManager = ChromePortManager;

// Instantiate the class
const portManager = globalThis.__awtsmoosPortManager || new ChromePortManager();
globalThis.__awtsmoosPortManager = portManager;
globalThis.globalThis.registerAwtsmoosBackgroundAutomation?.(portManager);

portManager.on("ping", async (msg, p) => {
	portManager.reply(p, {
		pong: msg
	})
});

// Trigger an event with 'customEvent' action and reply
portManager.on('customEvent', async (message, port) => {
    console.log('Custom event received:', message, port);

    // Simulate some logic, then send a reply
    await new Promise(resolve => setTimeout(resolve, 500));  // Simulating async work

    // Send a reply back to the port
	message.LOL = 1234
    portManager.reply(port, { status: 'Processed', data: message });
});
portManager.on("fetch", async (msg, port) => {
    const { id, url, options } = msg;

    try {
        const safeOptions = {
            ...(options || {}),
            credentials: options?.credentials || "include",
            cache: options?.cache || "no-store"
        };
        const response = await fetch(url, safeOptions);
        const metadata = {
            status: response.status,
            ok: response.ok,
            headers: Array.from(response.headers.entries()),
            url: response.url,
            redirected: response.redirected,
            streamId: id
        };
		var parst = new URL(url)
		var cooks = await getCookieString(parst.hostname)
		metadata.cookies = { count: cooks?.cookies?.length || 0 };

        globalThis.__awtsmoosStreamLedger.create(id, response);

        portManager.reply(port, { metadata, id });
    } catch (error) {
        portManager.reply(port, { error: error.stack, id });
    }
});

portManager.on("fetch-body", async (msg, port) => {
    const { id, bodyAction } = msg;

    try {
        if (bodyAction === "read") {
            portManager.reply(port, { result: await globalThis.__awtsmoosStreamLedger.read(id), id });
        } else if (bodyAction === "text" || bodyAction === "json" || bodyAction === "blob") {
            portManager.reply(port, { result: await globalThis.__awtsmoosStreamLedger.body(id, bodyAction), id });
        }
    } catch (error) {
        portManager.reply(port, { error: error.stack, id });
    }
});

portManager.on("resume-stream", async (msg, port) => {
    const { id, cursor } = msg;
    try {
        portManager.reply(port, { result: await globalThis.__awtsmoosStreamLedger.resume(id, cursor), id });
    } catch (error) {
        portManager.reply(port, { error: error.stack, id });
    }
});

portManager.on("ack-stream", async (msg, port) => {
    const { id, cursor } = msg;
    try {
        portManager.reply(port, { result: globalThis.__awtsmoosStreamLedger.ack(id, cursor), id });
    } catch (error) {
        portManager.reply(port, { error: error.stack, id });
    }
});

portManager.on("stream-stats", async (msg, port) => {
    const { id } = msg;
    try {
        portManager.reply(port, { result: globalThis.__awtsmoosStreamLedger.stats(id), id });
    } catch (error) {
        portManager.reply(port, { error: error.stack, id });
    }
});

function getCookieString(domain) {
    return new Promise(r => 
    chrome.cookies.getAll({domain}, f=> {
        var str = f.map(w=>
            w.name+"="+
            w.value+"; "
        ).join("");
        r({string: str, cookies: f})
    }))
}

