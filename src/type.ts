export interface UniFlattenOptions {
  circularReference?: 'string' | 'symbol' | 'null';
  strict?: boolean;
  /**
   * Whether to unflatten class instances.
   * When enabled, a special symbol will be added to the flattened object.
   * When unflattening, the symbol will be used to identify class instances.
   * Default is false.
   */
  unflattenToClassInstances?: boolean;
  /**
   * Whether to flatten class instances.
   * Properties on the prototype chain will not be flattened.
   * Default is false.
   */
  flattenClassInstances?: boolean;
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
