
// B"H

/**
 * B"H
 * OAuth client registry.
 *
 * This file is the source of truth for Awtsmoos OAuth clients.
 *
 * For public GPT usage, every GPT gets its own callback URL like:
 * https://chat.openai.com/aip/g-.../oauth/callback
 *
 * So we allow only narrow GPT callback patterns, not all of chatgpt.com.
 *
 * For testing, clientSecret may stay empty.
 * Before public publishing, set clientSecret and secret to the same long random value
 * and put that same value in GPT Builder.
 *
 * @type {Object<string, object>}
 */
const oauthClients = {
  chatgpt: {
    id: "chatgpt",
    name: "ChatGPT Awtsmoos Action",

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
