export interface UniFlattenOptions {
  circularReference?: 'string' | 'symbol' | 'null';
  strict?: boolean;
  /**
   * Defines a custom serializer when flattening the object.
   * This may break `unflatten` function (depending on your serializer)
   * @param key current key to serialize
   * @param prefix previously serialized keys
   * @param meta information about current key
   */
  serializeFlattenKey?: (
    key: string,
    prefix: string,
    meta: {
      /** returns true when the key is array index */
      isArrayIndex: boolean;
      /** returns true when the key contains special characters which can not be used in javascript variables */
      hasSpecialCharacters: boolean;
      /** returns true when the key can be used in dot notation */
      canUseDotNotation: boolean;
    },
  ) => string;
}
