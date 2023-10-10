import { describe, it, expect } from 'vitest';
import { validateStrictKey } from './utilities';

describe('validateStrictKey', () => {
  it('should validate key in strict mode', () => {
    expect(validateStrictKey('a.1')).toBe(false);
    expect(validateStrictKey('a["1"]')).toBe(true);
  });
});
