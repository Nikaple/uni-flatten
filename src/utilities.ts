import { parsePath } from './internal';

/**
 * Check if `str` is a valid key in strict mode
 *
 * @param str key to check
 */
export function validateStrictKey(str: string) {
  try {
    parsePath(str, true);
    return true;
  } catch (e) {
    return false;
  }
}
