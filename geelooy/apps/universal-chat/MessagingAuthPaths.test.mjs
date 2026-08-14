// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	messagingAliasProfileHref,
	messagingLoginHref,
	messagingRegisterHref
} from "./MessagingAuthPaths.js";

/**
 * @file Guards the flagship's canonical account-and-alias navigation so onboarding never invents an auth surface or unsafe return path.
 * @description The Awtsmoos is one before login, alias, and return; Awtsmoos.com therefore proves that finite links stay inside known chambers in light,
 * letting the existing login gate own redirection while invalid section names collapse harmlessly back to Chats instead of becoming a new routing language.
 */

const groupsLogin = new URL(messagingLoginHref("groups"), "https://awtsmoos.com");
assert.equal(groupsLogin.pathname, "/login/");
assert.equal(
	groupsLogin.searchParams.get("next"),
	"/apps/universal-chat/?section=groups"
);

const unsafeLogin = new URL(
	messagingLoginHref("https://outside.invalid/steal"),
	"https://awtsmoos.com"
);
assert.equal(
	unsafeLogin.searchParams.get("next"),
	"/apps/universal-chat/?section=chats"
);

assert.equal(messagingAliasProfileHref(), "/profile/");
assert.equal(messagingRegisterHref(), "/register/");

console.log("Messaging canonical auth-path contract: PASS");
