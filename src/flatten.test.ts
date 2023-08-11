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

  it('should handle circular dependency', () => {
    const obj1 = {} as Record<string, any>;
    obj1.a = obj1;
    const target1 = { a: '[Circular->""]' };
    expect(flatten(obj1)).toEqual(target1);
    expect(unflatten(target1)).toEqual(obj1);

    const obj2 = { a: { b: { e: 1 } }, c: {} } as Record<string, any>;
    obj2.c.d = obj2.a.b;
    const flattened2 = flatten(obj2, { circularReference: 'symbol' });
    const target2 = {
      'a.b.e': 1,
      'c.d': `Symbol([Circular->"a.b"])`,
    };
    expect({
      ...flattened2,
      'c.d': String(flattened2['c.d']),
    }).toEqual(target2);
    expect(unflatten(target2, { circularReference: 'symbol' })).toEqual(obj2);
  });

  it('should not throw on illegal input', () => {
    expect(flatten('' as any)).toEqual({});
  });
});
