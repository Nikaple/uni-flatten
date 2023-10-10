import { deepGet } from './deep-get';
import { UniFlattenOptions } from './type';

export const SPECIAL_CHARACTER_REGEX =
  /[.'"\s\\\b\f\n\r\t\v{}()[\];,<>=!+\-*%&|^~?:]/;

export const config = {
  strict: false,
  circularReference: 'string' as const,
};

export const mergeConfig = (options?: UniFlattenOptions) => ({
  ...config,
  ...options,
});

export const parsePath = (str: string, strict = false): (string | number)[] => {
  const tokens = [];
  const parenthesis = [];
  const panic = (idx: number) => {
    if (strict) {
      throw new Error(
        `Cannot parse key: ${JSON.stringify(str)} at index ${idx}`,
      );
    }
  };
  let i = 0;
  while (i < str.length) {
    let token = '';
    const char = str[i];
    if (char === '.') {
      i++;
      if (SPECIAL_CHARACTER_REGEX.test(str[i]) || /[0-9]/.test(str[i])) {
        panic(i);
      }
      continue;
    }
    if (char === '[') {
      parenthesis.push(char);
      i++;
      continue;
    }
    if (char === ']') {
      if (parenthesis.length === 0) {
        panic(i);
      }
      parenthesis.pop();
      i++;
      continue;
    }
    if (char === '"' || char === "'") {
      const start = i;
      i++;
      while (i < str.length && str[i] !== char) {
        i += str[i] === '\\' ? 2 : 1;
      }
      i++;
      try {
        tokens.push(JSON.parse(str.slice(start, i)));
      } catch (_) {
        panic(start);
      }
      continue;
    }
    while (
      i < str.length &&
      str[i] !== '.' &&
      str[i] !== '[' &&
      str[i] !== ']'
    ) {
      if (SPECIAL_CHARACTER_REGEX.test(str[i])) {
        panic(i);
      }
      token += str[i];
      i++;
    }
    if (/^\d+$/.test(token)) {
      tokens.push(Number(token));
    } else {
      tokens.push(token);
    }
  }
  if (parenthesis.length !== 0) {
    panic(i);
  }
  return tokens;
};

export function formatCircularKey(
  id: string,
  option: UniFlattenOptions['circularReference'] = 'string',
) {
  if (option === 'string') {
    return `[Circular->${JSON.stringify(id)}]`;
  }
  if (option === 'symbol') {
    return Symbol(`[Circular->${JSON.stringify(id)}]`);
  }
  return null;
}

export function extractCircularKey(
  value: unknown,
  option: UniFlattenOptions['circularReference'] = 'string',
): string | undefined {
  if (typeof value !== 'string' && typeof value !== 'symbol') return undefined;
  if (option === 'string') {
    const match = /^\[Circular->(.+)\]$/.exec(String(value)) || [];
    return match[1] ? JSON.parse(match[1]) : undefined;
  }
  if (option === 'symbol') {
    const match = /^Symbol\(\[Circular->(.+)\]\)$/.exec(String(value)) || [];
    return match[1] ? JSON.parse(match[1]) : undefined;
  }
  return undefined;
}

export function extractCircularValue(value: unknown, circularKey: string) {
  return deepGet(value as any, circularKey);
}

export function isObject(obj: unknown) {
  return !!(typeof obj === 'object' && obj);
}

export function isPlainObject(obj: unknown) {
  return (
    Object.prototype.toString.call(obj) === '[object Object]' &&
    Object.getPrototypeOf(obj) === Object.prototype
  );
}
