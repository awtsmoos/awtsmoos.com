
// B"H

const oauthClients = {
  chatgpt: {
    id: "chatgpt",
    name: "ChatGPT Awtsmoos Action",

    clientSecret: "",
    secret: "",

    autoApprove: false,
    accessTokenSeconds: 30 * 24 * 60 * 60,
    refreshTokens: true,

    defaultScope: "profile tunnel.read tunnel.write tunnel.command tunnel.browser",

    scopes: [
      "profile",
      "tunnel.read",
      "tunnel.write",
      "tunnel.command",
      "tunnel.browser",
      "tunnel.admin"
    ],

    exampleRedirectUri: "https://chat.openai.com/aip/g-c1e9f8d96dd9a40a3411f119a2dc856502f4aaec/oauth/callback",

    redirectUris: [
      "https://chat.openai.com/aip/g-*/oauth/callback",
      "https://chatgpt.com/aip/g-*/oauth/callback",
      "https://chat.openai.com/aip/gpts/oauth/callback",
      "https://chatgpt.com/aip/gpts/oauth/callback",
      "https://awtsmoos.com/api/oauth/callback-test"
    ]
  }
};

module.exports = { oauthClients };
