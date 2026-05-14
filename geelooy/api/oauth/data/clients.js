
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
    defaultScope: "profile tunnel.read",
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
      "https://*.openai.com/*"
    ]
  }
};

module.exports = { oauthClients };
