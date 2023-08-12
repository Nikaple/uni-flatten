import { deepSet } from './deep-set';
import { extractCircularKey, formatCircularKey } from './internal';
import { UniFlattenOptions } from './type';

/**
 * Flatten an object to single depth.
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
      /[.'"\s\\\b\f\n\r\t\v{}()[\];,<>=!+\-*%&|^~?:]/.test(key) ||
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
    if (typeof obj !== 'object') {
      return result;
    }
    const previous = seen.get(obj);
    if (previous !== undefined) {
      result[prefix] = formatCircularKey(previous, options?.circularReference);
      return result;
    }
    seen.set(obj, prefix);
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => {
        const key = getKey(String(i), prefix, true);
        if (typeof item === 'object') {
          const res = helper(item, key, result);
          return res;
        }
        result[key] = item;
      });
      return result;
    }

    Object.entries(obj).forEach(([k, item]) => {
      const key = getKey(k, prefix, false);
      if (typeof item === 'object') {
        const res = helper(item, key, result);
        return res;
      }
      result[key] = item;
    });
    return result;
  };

  const result: any = {};
  helper(obj, '', result);
  return result;
};

/**
 * The reverse action of flatten. Transform a flattened object to original un-flattened object.
 *
 * @example
 *
 * flatten({ "a.b": 1 }) // { a: { b: 1 } }
 * flatten({ "a.b[0]": 1 }) // { a: { b: [1] } }
 * flatten({ 'a["?"][0]': 1 }) // { a: { '?': [1] } }
 */
export const unflatten = (obj: any, options?: UniFlattenOptions) => {
  const result = {};
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
  normalEntries.concat(circularEntries).forEach(([key, value]) => {
    deepSet(result, key, value, options);
  });
  return result;
};
