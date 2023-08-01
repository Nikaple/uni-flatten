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
