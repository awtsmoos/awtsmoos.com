
// B"H

/**
 * B"H
 * OAuth client registry.
 *
 * Public ChatGPT Action client for Awtsmoos Tunnel Control.
 */
const oauthClients = {
  chatgpt: {
    id: "chatgpt",
    name: "ChatGPT Awtsmoos Action",

    // Keep empty only while testing. If you add a secret here,
    // put the exact same value in GPT Builder.
    clientSecret: "",
    secret: "",

    autoApprove: false,
    accessTokenSeconds: 3600,

    defaultScope: "profile tunnel.read tunnel.write tunnel.command tunnel.browser",

    scopes: [
      "profile",
      "tunnel.read",
      "tunnel.write",
      "tunnel.command",
      "tunnel.browser",
      "tunnel.admin"
    ],

    exampleRedirectUri: "https://chat.openai.com/aip/g-01199e270e92ece8406917b184a3f985d4e31220/oauth/callback",

    redirectUris: [
      "https://chat.openai.com/aip/g-01199e270e92ece8406917b184a3f985d4e31220/oauth/callback",
      "https://chatgpt.com/aip/g-01199e270e92ece8406917b184a3f985d4e31220/oauth/callback",

      "https://chat.openai.com/aip/gpts/oauth/callback",
      "https://chatgpt.com/aip/gpts/oauth/callback",

      "https://awtsmoos.com/api/oauth/callback-test"
    ]
  }
};

module.exports = { oauthClients };
