import { configureUniFlatten } from './configure';
import { deepSet } from './deep-set';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('parsePath', () => {
  beforeEach(() => {
    configureUniFlatten({ strict: true });
  });
  afterEach(() => {
    configureUniFlatten({ strict: false });
  });

  it('should be able to configure default options', () => {
    expect(() => deepSet({}, 'foo.bar baz.qux', 1)).toThrowError();
  });
});
