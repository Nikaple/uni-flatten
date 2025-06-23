import {
  CLASS_MAPPING_SYMBOL,
  extractCircularKey,
  extractCircularValue,
  isObject,
  mergeConfig,
  parsePath,
  SPECIAL_CHARACTER_REGEX,
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
  const classMapping = (obj as any)[CLASS_MAPPING_SYMBOL];
  const lastIndex = keys.length - 1;
  const serializer = options?.serializeFlattenKey || config.serializeFlattenKey;

  let current: any = obj;
  let currentKey = '';

  keys.forEach((key, i, arr) => {
    const isNextArray = typeof arr[i + 1] === 'number';
    const keyString = String(key);
    const hasSpecialCharacters = SPECIAL_CHARACTER_REGEX.test(keyString);
    currentKey = serializer(keyString, currentKey, {
      isArrayIndex: isNextArray,
      hasSpecialCharacters,
      canUseDotNotation:
        !hasSpecialCharacters && !/^\d/.test(keyString) && key !== '',
    });
    if (!isObject(current[key])) {
      const defaultObject = (
        typeof classMapping?.[currentKey] === 'function'
          ? new classMapping[currentKey]()
          : {}
      ) as any;
      current[key] = isNextArray ? [] : defaultObject;
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
