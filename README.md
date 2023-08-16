<h1 align="center">Uni-flatten</h1>

<p align="center">
<a href="https://www.npmjs.com/package/uni-flatten"><img src="https://img.shields.io/npm/v/uni-flatten.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/package/uni-flatten"><img src="https://img.shields.io/npm/l/uni-flatten.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/package/uni-flatten"><img src="https://img.shields.io/npm/dm/uni-flatten.svg" alt="NPM Downloads" /></a>
<a href="https://github.com/Nikaple/uni-flatten/actions/workflows/build.yml"><img src="https://github.com/Nikaple/uni-flatten/workflows/build/badge.svg" alt="build" /></a>
</p>

## Features

## Installation

```bash
$ npm i --save uni-flatten
```

## Inspiration

There are various popular modules to flatten an object, but they lost context such as numeric keys, dot in object key, special characters etc. These behaviors disabled converting flattened object to original object. This is when `uni-flatten` becomes handy.

## Quick Start

### Flatten a nested object

```ts
import { flatten } from 'uni-flatten';

flatten({
  a: {
    b: {
      c: 123,
    },
    d: [
      {
        e: { f: 456 },
      },
    ],
  },
  'a.b.c': 789,
});
/*
result:
{
  'a.b.c': 123, // normal nested object
  'a.d[0].e.f': 456, // nested object array, use brackets to represent array index
  '["a.b.c"]': 789, // object with special character in keys
},
*/
```

### Unflatten a flat object

```ts
import { unflatten } from 'uni-flatten';

unflatten({
  'a.b.c': 123, // normal nested object
  'a.d[0].e.f': 456, // nested object array, use brackets to represent array index
  '["a.b.c"]': 789, // object with special character in keys
});
/*
result:
{
  a: {
    b: {
      c: 123,
    },
    d: [
      {
        e: { f: 456 },
      },
    ],
  },
  'a.b.c': 789,
}
*/
```

### Flatten a cyclic object

Circular references are serialized as `[Circular->"<path>"]` when flattened, which is useful for unflattening.

```ts
import { flatten, unflatten } from 'uni-flatten';

const obj = { a: { b: { c: 1 } } };
obj.a.d = obj.a;
const flattened = flatten(obj); // { 'a.b.c': 1, 'a.d': '[Circular->"a"]' }
const restored = unflatten(obj); // { a: <ref *1> { b: { c: 1 }, d: [Circular *1] }
```

## API

Please refer to our [API website](https://nikaple.github.io/uni-flatten) for full documentation.

## Changelog

Please refer to [changelog.md](https://github.com/Nikaple/uni-flatten/blob/main/changelog.md)

## License

[MIT](LICENSE).

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Nikaple/uni-flatten&type=Date)](https://star-history.com/#Nikaple/uni-flatten&Date)
