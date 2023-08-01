/**
 * 对象的深层 get / set 方法，规则如下
 *
 * 1. 表达普通对象        "a.b.z"
 * 2. 表达数组           "b[0].z" 或 "c.0.z"
 * 3. 表达数字 key       "c["0"].z"
 * 4. 表达含 "." 的 key  "d["b.c"].z"
 */
export * from './flatten';
export * from './deep-get';
export * from './deep-set';
