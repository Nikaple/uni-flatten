import { parsePath } from './internal';

/**
 * deeply set value by key
 */
export const deepSet = (obj: any, path: string, value: any) => {
  if (typeof obj !== 'object' && obj) return obj;

  const keys = parsePath(path);
  const lastIndex = keys.length - 1;

  let current = obj;

  keys.forEach((key, i, arr) => {
    const isNextArray = typeof arr[i + 1] === 'number';
    if (typeof current[key] !== 'object') {
      current[key] = isNextArray ? [] : {};
    }
    if (i === lastIndex) {
      current[key] = value;
    }

    current = current[key];
  });

  return obj;
};
