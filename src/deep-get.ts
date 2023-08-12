import { parsePath } from './internal';

/**
 * Deeply get value by key.
 *
 * @example
 *
 * deepGet({ a: { b: 1 } }, "a.b") // 1
 * deepGet({ a: { b: [1] } }, "a.b.0") // 1
 * deepGet({ a: { '?': [1] } }， 'a["?"][0]') // 1
 */
export const deepGet = (obj: Record<string, unknown>, path: string) => {
  const keys = parsePath(path);

  let result: any = obj;
  keys.forEach(part => {
    result = result[part];
  });
  return result;
};
