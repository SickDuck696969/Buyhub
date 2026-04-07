import api from '../services/api';

const apiOrigin = (api.defaults.baseURL || '').replace(/\/api\/?$/, '');

export const splitImageSources = (value) =>
  String(value || '')
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);

export const dedupeMediaSources = (sources = []) => [
  ...new Set(
    sources
      .map((entry) => String(entry || '').trim())
      .filter(Boolean)
  ),
];

export const resolveMediaUrl = (value, fallback = '') => {
  const source = String(value || '').trim();

  if (!source) {
    return fallback;
  }

  if (/^(https?:)?\/\//i.test(source) || source.startsWith('data:') || source.startsWith('blob:')) {
    return source;
  }

  const normalized = source.replace(/\\/g, '/');

  if (normalized.startsWith('/uploads/')) {
    return `${apiOrigin}${normalized}`;
  }

  if (normalized.startsWith('uploads/')) {
    return `${apiOrigin}/${normalized}`;
  }

  if (normalized.startsWith('/')) {
    return normalized;
  }

  return `${apiOrigin}/${normalized}`;
};
