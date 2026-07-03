import {
  formatFrontmatterValue,
  getFrontmatterRows,
  normalizeFrontmatter,
} from './utils';

describe('normalizeFrontmatter', () => {
  it('normalizes JSON-compatible frontmatter values', () => {
    expect(
      normalizeFrontmatter({
        last_review_date: '2026-03-07',
        reviewed: true,
        invalid: undefined,
      }),
    ).toEqual({
      last_review_date: '2026-03-07',
      reviewed: true,
    });
  });

  it('returns an empty object for non-record input', () => {
    expect(normalizeFrontmatter(null)).toEqual({});
    expect(normalizeFrontmatter('string')).toEqual({});
    expect(normalizeFrontmatter(42)).toEqual({});
    expect(normalizeFrontmatter(['a'])).toEqual({});
  });

  it('keeps nested arrays and records of JSON-compatible values', () => {
    expect(
      normalizeFrontmatter({
        tags: ['a', 'b'],
        author: { name: 'Gijs', team: 'docs' },
      }),
    ).toEqual({
      tags: ['a', 'b'],
      author: { name: 'Gijs', team: 'docs' },
    });
  });

  it('drops entries containing non-serializable values', () => {
    expect(
      normalizeFrontmatter({
        keep: 'ok',
        drop: { fn: () => 1 } as unknown,
      }),
    ).toEqual({ keep: 'ok' });
  });
});

describe('formatFrontmatterValue', () => {
  it('formats scalar values', () => {
    expect(formatFrontmatterValue('hello')).toBe('hello');
    expect(formatFrontmatterValue(42)).toBe('42');
    expect(formatFrontmatterValue(true)).toBe('Yes');
    expect(formatFrontmatterValue(false)).toBe('No');
    expect(formatFrontmatterValue(null)).toBe('');
  });

  it('joins arrays of scalars, dropping empty results', () => {
    expect(formatFrontmatterValue(['a', 'b'])).toBe('a, b');
    expect(formatFrontmatterValue(['a', null, 'b'])).toBe('a, b');
    expect(formatFrontmatterValue([1, 2, 3])).toBe('1, 2, 3');
    expect(formatFrontmatterValue([true, false])).toBe('Yes, No');
  });

  it('JSON stringifies objects', () => {
    expect(formatFrontmatterValue({ owner: 'docs' })).toBe(
      JSON.stringify({ owner: 'docs' }, null, 2),
    );
  });

  it('JSON stringifies arrays containing non-scalars', () => {
    expect(formatFrontmatterValue([{ a: 1 }])).toBe(
      JSON.stringify([{ a: 1 }], null, 2),
    );
  });
});

describe('getFrontmatterRows', () => {
  it('returns all keys with default labels when no options are given', () => {
    expect(
      getFrontmatterRows({
        last_review_date: '2026-03-07',
        owner_team: 'docs',
      }),
    ).toEqual([
      {
        key: 'last_review_date',
        label: 'Last Review Date',
        value: '2026-03-07',
      },
      {
        key: 'owner_team',
        label: 'Owner Team',
        value: 'docs',
      },
    ]);
  });

  it('title-cases hyphenated keys', () => {
    expect(getFrontmatterRows({ 'page-type': 'guide' })).toEqual([
      { key: 'page-type', label: 'Page Type', value: 'guide' },
    ]);
  });

  it('respects include order and exclude rules', () => {
    expect(
      getFrontmatterRows(
        {
          last_review_date: '2026-03-07',
          owner: 'team-a',
          type: 'How-To',
        },
        {
          include: ['type', 'owner', 'last_review_date'],
          exclude: ['owner'],
          labels: { last_review_date: 'Last reviewed' },
        },
      ),
    ).toEqual([
      { key: 'type', label: 'Type', value: 'How-To' },
      { key: 'last_review_date', label: 'Last reviewed', value: '2026-03-07' },
    ]);
  });

  it('skips keys not present in the data', () => {
    expect(
      getFrontmatterRows(
        { type: 'How-To' },
        { include: ['type', 'missing'] },
      ),
    ).toEqual([{ key: 'type', label: 'Type', value: 'How-To' }]);
  });

  it('skips values that format to an empty string', () => {
    expect(
      getFrontmatterRows({ empty: null, present: 'yes' }),
    ).toEqual([{ key: 'present', label: 'Present', value: 'yes' }]);
  });
});