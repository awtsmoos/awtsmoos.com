//B"H
/**
 * @module roles
 * @description
 * Thin browser-side vessels for heichel social authority. The API separates
 * role lists from submission policy so UI panels can stay small and truthful.
 */

import { AwtsmoosRequest, BASE_API_URL } from './base.js';

export const HEICHEL_ROLES = ["editors", "moderators", "contributors", "followers"];

function roleUrl(heichelId, role) {
    return `${BASE_API_URL}heichelos/${encodeURIComponent(heichelId)}/roles/${encodeURIComponent(role)}`;
}

function settingsUrl(heichelId) {
    return `${BASE_API_URL}heichelos/${encodeURIComponent(heichelId)}/settings/submissions`;
}

export async function getRoleMembers({ heichelId, role }) {
    return await AwtsmoosRequest.fetch(roleUrl(heichelId, role));
}

export async function addRoleMember({ heichelId, aliasId, role, memberAliasId }) {
    return await AwtsmoosRequest.post(roleUrl(heichelId, role), new URLSearchParams({
        aliasId,
        memberAliasId
    }));
}

export async function removeRoleMember({ heichelId, aliasId, role, memberAliasId }) {
    return await AwtsmoosRequest.delete(roleUrl(heichelId, role), new URLSearchParams({
        aliasId,
        memberAliasId
    }));
}

export async function getSubmissionSettings({ heichelId }) {
    return await AwtsmoosRequest.fetch(settingsUrl(heichelId));
}

export async function saveSubmissionSettings({ heichelId, aliasId, settings }) {
    return await AwtsmoosRequest.post(settingsUrl(heichelId), new URLSearchParams({
        aliasId,
        ...settings
    }));
}
