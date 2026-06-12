/**
 * B"H
 * @module HeichelAPI
 * @description
 * Chapter 42: The chamber speaks by chosen attributes.
 *
 * General Heichel UI requests now use the property-map query path for light
 * metadata. The backend still supports full reads, but the browser asks for the
 * fields needed to render the chamber shell.
 */

import { AwtsmoosRequest, BASE_API_URL } from './base.js';

export async function getHeichelDetails(heichelId) {
    const propertyMap = JSON.stringify({
        id: true,
        name: true,
        title: true,
        description: true,
        author: true,
        createdAt: true,
        dayuh: true
    });
    const params = new URLSearchParams({ propertyMap });
    return AwtsmoosRequest.fetch(`${BASE_API_URL}heichelos/${heichelId}?${params}`);
}

export async function checkOwnership(aliasId, heichelId) {
    if (!aliasId || !heichelId) return false;
    const res = await AwtsmoosRequest.fetch(`${BASE_API_URL}alias/${aliasId}/heichelos/${heichelId}/ownership`);
    return !!res?.yes;
}

export async function getEditors(heichelId) {
    return AwtsmoosRequest.fetch(`${BASE_API_URL}heichelos/${heichelId}/editors`);
}
