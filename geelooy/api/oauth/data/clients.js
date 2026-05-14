
// B"H

/**
 * B"H
 * OAuth client registry.
 *
 * Add more OAuth consumers here later.
 * For now, ChatGPT is the first client.
 *
 * @type {Object<string, object>}
 */
const oauthClients = {
  chatgpt: {
    id: "chatgpt",
    name: "ChatGPT Awtsmoos Action",
    clientSecret: "",
    autoApprove: false,
    accessTokenSeconds: 3600,
    defaultScope: "profile tunnel.read tunnel.write tunnel.command tunnel.browser",
    scopes: ["profile", "tunnel.read", "tunnel.write"],
    exampleRedirectUri: "https://chatgpt.com/aip/gpts/oauth/callback",
    redirectUris: [
      "https://chatgpt.com",
      "https://chatgpt.com/",
      "https://chatgpt.com/*",
      "https://chat.openai.com",
      "https://chat.openai.com/",
      "https://chat.openai.com/*",
      "https://*.openai.com",
      "https://*.openai.com/",
      "https://*.openai.com/*",
	  "https://chat.openai.com/aip/g-01199e270e92ece8406917b184a3f985d4e31220/oauth/callback",
      "https://chatgpt.com/aip/g-01199e270e92ece8406917b184a3f985d4e31220/oauth/callback",
		"https://awtsmoos.com/api/oauth/callback-test",
    ]
  }
};

module.exports = { oauthClients };
