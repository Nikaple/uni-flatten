import { parsePath } from './internal';

/**
 * deeply get value by key
 */
export const deepGet = (obj: any, path: string) => {
  const keys = parsePath(path);

  let result: unknown = undefined;
  keys.forEach(part => {
    result = (result || obj)[part];
  });
  return result;
};
