import { describe, expect, it } from 'vitest';

import { flatten, unflatten } from '.';

describe('flattenObject', () => {
  const testFlatten = (original: any, expected: any) => {
    const result = flatten(original);
    const source = unflatten(result);
    expect(original).toEqual(source);
    expect(result).toEqual(expected);
  };
  it('should create an object of flattened properties', () => {
    testFlatten(
      {
        a: {
          b: {
            c: 123,
          },
          d: [
            {
              e: 456,
            },
          ],
        },
      },
      {
        'a.b.c': 123,
        'a.d[0].e': 456,
      },
    );
  });

  it('should handle complex nested objects', () => {
    testFlatten(
      {
        a: {
          b: {
            c: 123,
          },
          d: [
            {
              e: { f: 456 },
            },
          ],
        },
        'a.b.c': 789,
      },
      {
        'a.b.c': 123,
        'a.d[0].e.f': 456,
        '["a.b.c"]': 789,
      },
    );
  });

  it('should handle complex arrays', () => {
    testFlatten(
      { a: [0, { b: [1], c: { d: [2], 5: [6] } }] },
      {
        'a[0]': 0,
        'a[1].b[0]': 1,
        'a[1].c.d[0]': 2,
        'a[1].c["5"][0]': 6,
      },
    );
  });

  it('should handle numeric keys', () => {
    testFlatten(
      {
        a: [
          {
            b: 123,
          },
          {
            b: 456,
          },
        ],
        'a.2.c': 789,
      },
      {
        'a[0].b': 123,
        'a[1].b': 456,
        '["a.2.c"]': 789,
      },
    );
  });

  it('should handle key with special characters', () => {
    testFlatten(
      {
        '"': 'quote',
        '"a"': {
          '"b"': 'nested quote',
        },
        ' ': 'space',
      },
      {
        '["\\""]': 'quote',
        '["\\"a\\""]["\\"b\\""]': 'nested quote',
        '[" "]': 'space',
      },
    );
  });

  it('should handle key with brackets', () => {
    testFlatten(
      {
        '["\'[]]': {
          '[(){}]': 'nested brackets',
        },
        '[\'"]': 'brackets',
      },
      {
        '["[\'\\"]"]': 'brackets',
        '["[\\"\'[]]"]["[(){}]"]': 'nested brackets',
      },
    );
  });

  it('should not throw on illegal input', () => {
    expect(flatten('')).toEqual({});
  });
});
