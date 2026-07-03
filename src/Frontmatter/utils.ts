import { FrontmatterAddonProps, FrontmatterData, FrontmatterValue } from './props';

export type FrontmatterRow = {
  key: string;
  label: string;
  value: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFrontmatterValue = (value: unknown): value is FrontmatterValue => {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isFrontmatterValue);
  }

  if (isRecord(value)) {
    return Object.values(value).every(isFrontmatterValue);
  }

  return false;
};

export const normalizeFrontmatter = (value: unknown): FrontmatterData => {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => isFrontmatterValue(entry)),
  ) as FrontmatterData;
};

export const formatFrontmatterValue = (value: FrontmatterValue): string => {
  if (value === null) {
    return '';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (
      value.every(
        entry =>
          entry === null ||
          typeof entry === 'string' ||
          typeof entry === 'number' ||
          typeof entry === 'boolean',
      )
    ) {
      return value.map(formatFrontmatterValue).filter(Boolean).join(', ');
    }
  }

  return JSON.stringify(value, null, 2);
};

const defaultLabel = (key: string) =>
  key
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase());

export const getFrontmatterRows = (
  data: FrontmatterData,
  props: Pick<FrontmatterAddonProps, 'include' | 'exclude' | 'labels'> = {},
): FrontmatterRow[] => {
  const excluded = new Set(props.exclude ?? []);
  const keys = props.include ?? Object.keys(data);

  return keys
    .filter(key => !excluded.has(key) && key in data)
    .map(key => ({
      key,
      label: props.labels?.[key] ?? defaultLabel(key),
      value: formatFrontmatterValue(data[key]),
    }))
    .filter(row => row.value.length > 0);
};