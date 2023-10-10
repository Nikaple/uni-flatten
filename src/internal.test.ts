import { parsePath } from './internal';
import { describe, it, expect } from 'vitest';

describe('parsePath', () => {
  it('should return an array of strings and numbers', () => {
    const result = parsePath('foo.bar[1].baz["qux"]');
    expect(result).toEqual(['foo', 'bar', 1, 'baz', 'qux']);
  });

  it('should parse escaped quotes correctly', () => {
    const result = parsePath('foo["bar\\"baz"]');
    expect(result).toEqual(['foo', 'bar"baz']);
  });

  it('should handle empty brackets correctly', () => {
    const result = parsePath('foo[]');
    expect(result).toEqual(['foo']);
  });

  it('should handle leading and trailing dots correctly', () => {
    const result = parsePath('.foo[0].bar.');
    expect(result).toEqual(['foo', 0, 'bar']);
  });

  it('should handle leading and trailing square brackets correctly', () => {
    const result = parsePath('[1].foo[0]');
    expect(result).toEqual([1, 'foo', 0]);
  });

  it('should return an empty array for an empty string', () => {
    const result = parsePath('');
    expect(result).toEqual([]);
  });

  it('should handle nested objects correctly', () => {
    const result = parsePath('foo.bar.baz.qux');
    expect(result).toEqual(['foo', 'bar', 'baz', 'qux']);
  });

  it('should handle keys with spaces correctly', () => {
    const result = parsePath('foo.bar["hello world"].baz');
    expect(result).toEqual(['foo', 'bar', 'hello world', 'baz']);
  });

  it('should handle keys with special characters correctly', () => {
    const result = parsePath(
      'foo.bar.baz["$%^&*()_+-={}|[]\\\\;\':\\"<>?,./"]',
    );
    expect(result).toEqual([
      'foo',
      'bar',
      'baz',
      '$%^&*()_+-={}|[]\\;\':"<>?,./',
    ]);
  });

  it('should throw on invalid keys', () => {
    const strictParse = (str: string) => parsePath(str, true);
    expect(() => strictParse('foo.bar baz.qux')).toThrowError();
    expect(() => strictParse('foo.bar-baz.qux')).toThrowError();
    expect(() => strictParse('foo.[].qux')).toThrowError();
    expect(() => strictParse('foo["1"].qux[')).toThrowError();
    expect(() => strictParse('foo["].qux')).toThrowError();
    expect(() => strictParse('foo.bar".qux')).toThrowError();
    expect(() => strictParse('a - b')).toThrowError();
    expect(() => strictParse('a.1')).toThrowError();
    expect(() => strictParse('a.cb[]]')).toThrowError();
    expect(() => strictParse('a["a]')).toThrowError();
    expect(() => strictParse('a["a\\"]')).toThrowError();
  });
});
