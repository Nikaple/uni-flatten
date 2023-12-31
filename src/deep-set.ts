import {
  extractCircularKey,
  extractCircularValue,
  isObject,
  mergeConfig,
  parsePath,
} from './internal';
import { UniFlattenOptions } from './type';

/**
 * Deeply set value by key. This method mutates the original object.
 *
 * @example
 *
 * deepSet({}, "a.b", 1) // { a: { b: 1 } }
 * deepGet({}, "a.b.0", 1) // { a: { b: [1] } }
 * deepGet({}, 'a["?"][0]', 1) // { a: { '?': [1] } }
 */
export const deepSet = <T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown,
  options?: UniFlattenOptions,
) => {
  if (!isObject(obj)) return obj;

  const config = mergeConfig(options);
  const keys = parsePath(path, config.strict);
  const lastIndex = keys.length - 1;

  let current: any = obj;

  keys.forEach((key, i, arr) => {
    const isNextArray = typeof arr[i + 1] === 'number';
    if (!isObject(current[key])) {
      current[key] = isNextArray ? [] : {};
    }
    if (i === lastIndex) {
      const circularKey = extractCircularKey(value, config.circularReference);
      current[key] =
        circularKey === undefined
          ? value
          : extractCircularValue(obj, circularKey);
    }

    current = current[key];
  });

  return obj;
};
