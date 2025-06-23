import { deepSet } from './deep-set';
import {
  CLASS_MAPPING_SYMBOL,
  config,
  extractCircularKey,
  formatCircularKey,
  isClassInstance,
  isObject,
  isPlainObject,
  SPECIAL_CHARACTER_REGEX,
} from './internal';
import { UniFlattenOptions } from './type';

/**
 * Flatten an object to single depth.
 * The flattened key is represented with standard
 * javascript object notation.
 *
 * @example
 *
 * flatten({ a: { b: 1 } }) // { "a.b": 1 }
 * flatten({ a: { b: [1] } }) // { "a.b[0]": 1 }
 * flatten({ a: { '?': [1] } }) // { 'a["?"][0]': 1 }
 */
export const flatten = <T>(
  obj: object,
  options?: UniFlattenOptions,
): Record<string, T> => {
  const seen = new Map();
  const serializer = options?.serializeFlattenKey || config.serializeFlattenKey;
  const flattenClassInstances =
    options?.flattenClassInstances ?? config.flattenClassInstances;
  const unflattenClassInstances =
    options?.unflattenToClassInstances ?? config.unflattenToClassInstances;

  const helper = (obj: any, prefix: string, result: any = {}) => {
    if (!isObject(obj)) {
      return result;
    }
    const previous = seen.get(obj);
    if (previous !== undefined) {
      result[prefix] = formatCircularKey(previous, options?.circularReference);
      return result;
    }
    seen.set(obj, prefix);

    // recursively handle arrays
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => {
        const key = serializer(String(i), prefix, {
          isArrayIndex: true,
          hasSpecialCharacters: false,
          canUseDotNotation: false,
        });
        if (isObject(item)) {
          const res = helper(item, key, result);
          return res;
        }
        result[key] = item;
      });
      return result;
    }

    // recursively handle plain objects and class instances (if enabled)
    if (isPlainObject(obj) || (flattenClassInstances && isClassInstance(obj))) {
      if (unflattenClassInstances) {
        if (!result[CLASS_MAPPING_SYMBOL]) {
          Object.defineProperty(result, CLASS_MAPPING_SYMBOL, {
            enumerable: false,
            configurable: false,
            writable: true,
            value: {},
          });
        }
        if (obj.constructor !== Object) {
          result[CLASS_MAPPING_SYMBOL][prefix] = obj.constructor;
        }
      }
      Object.entries(obj).forEach(([k, item]) => {
        const hasSpecialCharacters = SPECIAL_CHARACTER_REGEX.test(k);
        const startsWithNumber = /^\d/.test(k);
        const isEmpty = k === '';
        const key = serializer(k, prefix, {
          isArrayIndex: false,
          hasSpecialCharacters,
          canUseDotNotation:
            !hasSpecialCharacters && !startsWithNumber && !isEmpty,
        });
        if (isObject(item)) {
          const res = helper(item, key, result);
          return res;
        }
        result[key] = item;
      });
      return result;
    }

    // others
    result[prefix] = obj;
    return result;
  };

  const result: any = {};
  helper(obj, '', result);
  return result;
};

/**
 * The reverse action of `flatten`. Transform a flattened object to original un-flattened object.
 *
 * @example
 *
 * unflatten({ "a.b": 1 }) // { a: { b: 1 } }
 * unflatten({ "a.b[0]": 1 }) // { a: { b: [1] } }
 * unflatten({ 'a["?"][0]': 1 }) // { a: { '?': [1] } }
 */
export const unflatten = <T = any>(
  obj: object,
  options?: UniFlattenOptions,
): T => {
  const circularEntries: [string, any][] = [];
  const normalEntries: [string, any][] = [];
  Object.entries(obj).forEach(([key, value]) => {
    const circularKey = extractCircularKey(value, options?.circularReference);
    if (circularKey !== undefined) {
      circularEntries.push([key, value]);
    } else {
      normalEntries.push([key, value]);
    }
  });

  const entries = normalEntries.concat(circularEntries);
  const classMapping = (obj as any)[CLASS_MAPPING_SYMBOL];
  const RootClassCtor = classMapping?.[''];
  const defaultObject =
    typeof RootClassCtor === 'function' ? new RootClassCtor() : {};
  if (CLASS_MAPPING_SYMBOL in obj) {
    defaultObject[CLASS_MAPPING_SYMBOL] = classMapping;
  }

  const result = /^\[\d+\]/.test(entries[0]?.[0]) ? [] : defaultObject;
  entries.forEach(([key, value]) => {
    deepSet(result, key, value, options);
  });
  delete result[CLASS_MAPPING_SYMBOL];
  return result;
};
