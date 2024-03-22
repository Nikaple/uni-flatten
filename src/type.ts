export interface UniFlattenOptions {
  circularReference?: 'string' | 'symbol' | 'null';
  strict?: boolean;
  serializeFlattenKey?: (
    /** current key to serialize */
    key: string,
    prefix: string,
    meta: {
      isArrayIndex: boolean;
      isEmpty: boolean;
      hasSpecialCharacters: boolean;
    },
  ) => string;
}
