import { deepGet } from './deep-get';
import { UniFlattenOptions } from './type';

export const parsePath = (str: string): (string | number)[] => {
  const tokens = [];
  let i = 0;
  while (i < str.length) {
    let token = '';
    const char = str[i];
    if (char === '.' || char === '[' || char === ']') {
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
      tokens.push(JSON.parse(str.slice(start, i)));
      continue;
    }
    while (
      i < str.length &&
      str[i] !== '.' &&
      str[i] !== '[' &&
      str[i] !== ']'
    ) {
      token += str[i];
      i++;
    }
    if (/^\d+$/.test(token)) {
      tokens.push(Number(token));
    } else {
      tokens.push(token);
    }
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
