import { mergeConfig, parsePath } from './internal';
import { UniFlattenOptions } from './type';

/**
 * Deeply get value by key.
 *
 * @example
 *
 * deepGet({ a: { b: 1 } }, "a.b") // 1
 * deepGet({ a: { b: [1] } }, "a.b.0") // 1
 * deepGet({ a: { '?': [1] } }， 'a["?"][0]') // 1
 */
export const deepGet = (
  obj: Record<string, unknown>,
  path: string,
  options?: UniFlattenOptions,
) => {
  const config = mergeConfig(options);
  const keys = parsePath(path, config.strict);

  let result: any = obj;
  keys.forEach(part => {
    if (!result) return;
    result = result[part];
  });
  return result;
};
