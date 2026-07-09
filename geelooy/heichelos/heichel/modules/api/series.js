// B"H
/**
 * @module SeriesAPI
 * @description
 * Chapter 907: The browser asks for the tree and, beside it, optional maps.
 * Hebrew letters, spaces, and old Awtsmoos IDs remain sealed in encoded path
 * vessels before the API is asked to reveal the next room.
 */
import { AwtsmoosRequest, BASE_API_URL } from './base.js';
import { makeSeries } from "/scripts/awtsmoos/api/utils.js";

function seg(value) { return encodeURIComponent(String(value || '')); }

export async function getSeriesDetails(heichelId, seriesId) {
  return AwtsmoosRequest.fetch(`${BASE_API_URL}heichelos/${seg(heichelId)}/series/${seg(seriesId)}`);
}

export async function getSubSeriesDetails(heichelId, parentSeriesId) {
  return AwtsmoosRequest.fetch(`${BASE_API_URL}heichelos/${seg(heichelId)}/series/${seg(parentSeriesId)}/subSeries?details=true`);
}

export async function getAlternateGroupDetails(heichelId, parentSeriesId) {
  return AwtsmoosRequest.fetch(`${BASE_API_URL}heichelos/${seg(heichelId)}/series/${seg(parentSeriesId)}/alternateGroups?details=true`);
}

export async function createSeries(data) {
  const { heichelId, parentSeriesId, title, aliasId, inputId, description } = data;
  return await makeSeries({ heichelId, parentSeriesId, title, aliasId: window.curAlias || aliasId, inputId, description });
}

export async function editSeriesDetails({ heichelId, seriesId, aliasId, title, description }) {
  return AwtsmoosRequest.send(
    `${BASE_API_URL}heichelos/${seg(heichelId)}/series/${seg(seriesId)}/editSeriesDetails`,
    "PUT",
    new URLSearchParams({ aliasId, title, description })
  );
}
