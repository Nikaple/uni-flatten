import { config } from './internal';
import { UniFlattenOptions } from './type';

export const configureUniFlatten = (options: UniFlattenOptions) => {
  Object.assign(config, options);
};
