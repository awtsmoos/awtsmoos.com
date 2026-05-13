
// B"H

/**
 * B"H
 * OAuth client registry.
 * Add more clients here later: desktop apps, mobile apps, other GPTs,
 * internal tools, and any gate that needs account-scoped tokens.
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
    exampleRedirectUri: "https://chat.openai.com/aip/gpts/oauth/callback",
    redirectUris: [
      "https://chat.openai.com/*",
      "https://chatgpt.com/*",
      "https://*.openai.com/*"
    ]
  }
};

module.exports = { oauthClients };
