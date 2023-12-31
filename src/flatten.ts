import { deepSet } from './deep-set';
import {
  extractCircularKey,
  formatCircularKey,
  isObject,
  isPlainObject,
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
  obj: Record<string, unknown>,
  options?: UniFlattenOptions,
): Record<string, T> => {
  const seen = new Map();
  const getKey = (key: string, prefix: string, isNumber: boolean) => {
    let k;
    if (
      /[.'"\s\\\b\f\n\r\t\v{}()[\];,<>=!+\-*%&|^~?:]|^\d+\D/.test(key) ||
      key === ''
    ) {
      // use brackets if key contains special characters
      k = `[${JSON.stringify(key)}]`;
    } else if (/^\d+$/.test(key)) {
      // use [0] for arrays, and ["0"] for numeric keys
      k = isNumber ? `[${key}]` : `["${key}"]`;
    } else {
      k = key;
    }
    return prefix ? `${prefix}${/^\[/.test(k) ? '' : '.'}${k}` : k;
  };
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
        const key = getKey(String(i), prefix, true);
        if (isObject(item)) {
          const res = helper(item, key, result);
          return res;
        }
        result[key] = item;
      });
      return result;
    }

    // recursively handle plain objects
    if (isPlainObject(obj)) {
      Object.entries(obj).forEach(([k, item]) => {
        const key = getKey(k, prefix, false);
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
 * flatten({ "a.b": 1 }) // { a: { b: 1 } }
 * flatten({ "a.b[0]": 1 }) // { a: { b: [1] } }
 * flatten({ 'a["?"][0]': 1 }) // { a: { '?': [1] } }
 */
export const unflatten = (obj: any, options?: UniFlattenOptions) => {
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
  const result = /^\[\d+\]/.test(entries[0]?.[0]) ? [] : {};
  entries.forEach(([key, value]) => {
    deepSet(result, key, value, options);
  });
  return result;
};
