import { describe, beforeEach, expect, it } from 'vitest';

import { deepSet } from '.';

describe('deepSet', () => {
  let obj: any;

  beforeEach(() => {
    obj = {
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
    };
  });

  it('should set value for single-level keys if obj is an object', () => {
    const newObj = deepSet({}, 'key', 'value');
    expect(newObj).toEqual({
      key: 'value',
    });
  });

  it('should set value for nested keys if obj is an object', () => {
    deepSet(obj, 'a.b.c', 456);
    expect(obj).toEqual({
      a: {
        b: {
          c: 456,
        },
        d: [
          {
            e: 456,
          },
        ],
      },
    });
  });

  it('should set value for array keys with numerical indices if obj is an object', () => {
    deepSet(obj, 'a.d[0].e', 789);
    expect(obj).toEqual({
      a: {
        b: {
          c: 123,
        },
        d: [
          {
            e: 789,
          },
        ],
      },
    });
  });

  it('should set value for non-existent keys and create nested objects', () => {
    deepSet(obj, 'a.b.z', 456);
    deepSet(obj, '["a.2.c"]', 456);
    expect(obj).toEqual({
      a: {
        b: {
          c: 123,
          z: 456,
        },
        d: [
          {
            e: 456,
          },
        ],
      },
      'a.2.c': 456,
    });
  });

  it('should not set value if obj is not an object', () => {
    expect(deepSet('test', 'key', 'value')).toBe('test');
  });
});
