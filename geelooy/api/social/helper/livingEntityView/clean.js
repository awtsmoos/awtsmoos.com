// B"H
/**
 * @module LivingEntityClean
 * @description
 * Chapter 1: Before the palace can speak, every spark is washed. The Awtsmoos
 * lets old posts, rich comments, and recursive entities enter one quiet vessel
 * without angle-bracket storms or broken arrays spilling into the reader.
 */

function text(value, fallback = '', max = 8000) {
  return String(value ?? fallback).replace(/[<>]/g, '').trim().slice(0, max);
}

function list(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === 'object') return Object.keys(value);
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function values(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  return Object.values(value);
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

module.exports = { text, list, values, number };
