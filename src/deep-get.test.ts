import { describe, beforeEach, expect, it } from 'vitest';

import { deepGet } from '.';

describe('deepGet', () => {
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
          {
            e: 789,
          },
        ],
      },
    };
  });

  it('should return value for single-level keys', () => {
    expect(deepGet({ a: 1 }, 'a')).toBe(1);
  });

  it('should return value for nested keys', () => {
    expect(deepGet(obj, 'a.b.c')).toBe(123);
  });

  it('should return value for array keys with numerical indices', () => {
    expect(deepGet(obj, 'a.d[0].e')).toBe(456);
    expect(deepGet(obj, 'a.d[1].e')).toBe(789);
  });

  it('should return undefined for non-existent keys', () => {
    expect(deepGet(obj, 'a.b.c.d')).toBe(undefined);
  });

  it('should return undefined if obj is not an object', () => {
    expect(deepGet('test', 'key')).toBe(undefined);
  });
});
