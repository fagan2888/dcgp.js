import dcgpInitializer from '../../dcgp';
import KernelSetInitialiser from './KernelSet';
import ExpressionInitialiser from './Expression';
import KernelInitialiser from './Kernel';
import algorithmsInitialiser from './algorithms';

import { getTypedMemory } from './helpers';

export function instantiateClasses(instance) {
  return {
    Kernel: KernelInitialiser(instance),
    KernelSet: KernelSetInitialiser(instance),
    Expression: ExpressionInitialiser(instance),
  };
}

function getFetchAndArrayBuffer(fetchOrArrayBuffer) {
  let fetchInstance, arrayBufferInstance;

  // check if user provides an ArrayBuffer of the dcgp.wasm file
  if (fetchOrArrayBuffer instanceof ArrayBuffer) {
    arrayBufferInstance = fetchOrArrayBuffer;

    // check if the user provides a Promise
    // which is asumed to come from a fetch request
    // and will resolve with the dcgp.wasm response
  } else if (fetchOrArrayBuffer instanceof Promise) {
    fetchInstance = fetchOrArrayBuffer;
  } else {
    throw new Error(
      'dcgp must be initialised with an ArrayBuffer or a fetch request of the dcgp.wasm file'
    );
  }

  return {
    fetchInstance,
    arrayBufferInstance,
  };
}

export async function createInstance(fetchOrArrayBuffer) {
  const { fetchInstance, arrayBufferInstance } = getFetchAndArrayBuffer(
    fetchOrArrayBuffer
  );
  const { module, instance } = await dcgpInitializer(
    fetchInstance,
    arrayBufferInstance
  );

  const typedMemory = getTypedMemory(instance.memory);
  Object.assign(instance.memory, typedMemory);

  const classes = instantiateClasses(instance);
  const algorithms = algorithmsInitialiser(instance);

  return {
    module,
    instance,
    ...classes,
    algorithms,
  };
}

export default createInstance;