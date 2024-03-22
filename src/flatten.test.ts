import { describe, expect, it } from 'vitest';

import { flatten, unflatten } from '.';

describe('flattenObject', () => {
  const testFlatten = (original: any, expected: any) => {
    const result = flatten(original);
    const source = unflatten(result);
    expect(original).toEqual(source);
    expect(result).toEqual(expected);
  };
  it('should work with empty object', () => {
    testFlatten({}, {});
  });

  it('should create an object of flattened properties', () => {
    testFlatten(
      {
        a: {
          b: {
            c: 123,
            '2c': 456,
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
        'a.b["2c"]': 456,
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

  it('should handle arrays', () => {
    testFlatten(
      [
        1,
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
      ],
      {
        '[0]': 1,
        '[1].a.b.c': 123,
        '[1].a.d[0].e.f': 456,
        '[1]["a.b.c"]': 789,
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

    expect(unflatten({ 'a[1]': 0 })).toEqual({ a: [, 0] });
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

  it('should handle circular dependency, circularReference = string', () => {
    const obj1 = {} as Record<string, any>;
    obj1.a = obj1;
    const target1 = { a: '[Circular->""]' };
    expect(flatten(obj1)).toEqual(target1);
    expect(unflatten(target1)).toEqual(obj1);
  });
  it('should handle circular dependency, circularReference = symbol', () => {
    const obj2 = { a: { 'b[]': { e: '1' } }, c: {} } as Record<string, any>;
    obj2.c.d = obj2.a['b[]'];
    const flattened2 = flatten(obj2, { circularReference: 'symbol' });
    const target2 = {
      'a["b[]"].e': '1',
      'c.d': `Symbol([Circular->"a[\\"b[]\\"]"])`,
    };
    expect({
      ...flattened2,
      'c.d': String(flattened2['c.d']),
    }).toEqual(target2);
    expect(unflatten(target2, { circularReference: 'symbol' })).toEqual(obj2);
  });

  it('should handle circular dependency, circularReference = null', () => {
    const obj3 = {} as Record<string, any>;
    obj3.a = obj3;
    expect(flatten(obj3, { circularReference: 'null' })).toEqual({ a: null });
    expect(
      unflatten({ a: null, b: '1' }, { circularReference: 'null' }),
    ).toEqual({ a: null, b: '1' });
  });

  it('should not flatten Map/Set/Date/etc', () => {
    const date = new Date();
    testFlatten(
      { map: new Map(), set: new Set(), date },
      { map: new Map(), set: new Set(), date },
    );
  });

  it('should not flatten cats', () => {
    class Cat {
      constructor(public name: string) {}
      meow() {
        return 'Meow!';
      }
    }
    const cat = new Cat('cutie');
    testFlatten({ cat }, { cat });
  });

  it('should be able to custom key serializer', () => {
    expect(
      flatten(
        { a: [0, { b: [1], c: { d: [2], 5: [6] } }] },
        {
          serializeFlattenKey(key, prefix, meta) {
            if (meta.isArrayIndex) {
              return `${prefix}.[${key}]`;
            }
            if (!meta.canUseDotNotation) {
              return `${prefix}[${JSON.stringify(key)}]`;
            }
            return prefix ? `${prefix}.${key}` : key;
          },
        },
      ),
    ).toEqual({
      'a.[0]': 0,
      'a.[1].b.[0]': 1,
      'a.[1].c.d.[0]': 2,
      'a.[1].c["5"].[0]': 6,
    });
  });

  it('should not throw on illegal input', () => {
    expect(flatten('' as any)).toEqual({});
  });
});
