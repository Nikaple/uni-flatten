import { deepSet } from './deep-set';

/**
 * flatten an object to single depth
 */
export const flatten = (obj: any) => {
  const result: any = {};
  const getKey = (key: string, prefix: string, isNumber: boolean) => {
    let k;
    if (
      /[.'"\\\b\f\n\r\t\v{}()[\].;,<>=!+\-*%&|^~?:]/.test(key) ||
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
  const helper = (obj: any, prefix: string) => {
    if (typeof obj !== 'object') {
      return;
    }
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => {
        const key = getKey(String(i), prefix, true);
        if (typeof item === 'object') {
          return helper(item, key);
        }
        result[key] = item;
      });
      return;
    }

    Object.entries(obj).forEach(([k, v]) => {
      const key = getKey(k, prefix, false);
      if (typeof v === 'object') {
        return helper(v, key);
      }
      result[key] = v;
    });
  };
  helper(obj, '');
  return result;
};

export const unflatten = (obj: any) => {
  const result = {};
  Object.entries(obj).forEach(([key, value]) => {
    deepSet(result, key, value);
  });
  return result;
};
