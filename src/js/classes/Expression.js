import Base from './Base'
import {
  decodeStrings,
  encodeStrings,
  flatten2D,
  transpose2D,
  stackPutArray,
  isArray,
  isNumber,
  isString,
  containsOneType,
  containsNumbersOnly,
} from '../helpers'
import { getInstance } from '../initialiser'
import KernelSet from './KernelSet'

function structureEvaluationInputs(inputs) {
  if (Array.isArray(inputs[0])) {
    return flatten2D(transpose2D(inputs))
  }

  return inputs
}

function calculateEvaluation(inputs, inputPointer, evaluate, outputs) {
  const {
    exports: { delete_double_array },
    memory: { F64 },
  } = getInstance()

  if (isArray(inputs[0])) {
    const results = Array(inputs[0].length)
      .fill(0)
      .map((val, i) => {
        const resultPointer = evaluate(
          inputPointer + i * inputs.length * F64.BYTES_PER_ELEMENT
        )

        const typedResult = new Float64Array(F64.buffer, resultPointer, outputs)
        const result = Array.from(typedResult)

        delete_double_array(resultPointer)
        return result
      })

    return transpose2D(results)
  } else {
    const resultPointer = evaluate(inputPointer)

    const typedResult = new Float64Array(F64.buffer, resultPointer, outputs)
    const results = Array.from(typedResult)

    delete_double_array(resultPointer)
    return results
  }
}

/**
 * @typedef {import('./KernelSet').default} KernelSet
 */

/**
 * @class
 * @property {[number]} chromosome Chromosome of the Expression can be get or set.
 * @param {number} inputs Number of inputs.
 * @param {number} outputs Number of outputs
 * @param {number} rows Number of rows.
 * @param {number} columns Number of columns.
 * @param {number} levelsBack Maximum number of levels back the connections can be.
 * @param {number} arity The number of incomming connections of a node.
 * @param {KernelSet} kernelSet Instances with the kernels to be used in the expression.
 * @param {number} seed Pseudo random number generator seed.
 */
class Expression extends Base {
  /**
   * @param {number} inputs Number of inputs.
   * @param {number} outputs Number of outputs
   * @param {number} rows Number of rows.
   * @param {number} columns Number of columns.
   * @param {number} levelsBack Maximum number of levels back the connections can be.
   * @param {number} arity The number of incomming connections of a node.
   * @param {KernelSet} kernelSet Instances with the kernels to be used in the expression.
   * @param {number} seed Pseudo random number generator seed.
   */
  constructor(
    inputs,
    outputs,
    rows,
    columns,
    levelsBack,
    arity,
    kernelSet,
    seed
  ) {
    super()

    const {
      exports: { expression_constructor },
    } = getInstance()

    const hasValidArguments = [
      inputs,
      outputs,
      rows,
      columns,
      levelsBack,
      arity,
      seed,
    ].every(isNumber)

    if (!hasValidArguments) {
      throw new TypeError(
        'Arguments outputs, rows, columns, levelsBack, arity and seed must all be numbers'
      )
    }

    if (!(kernelSet instanceof KernelSet)) {
      throw new TypeError('kernelSet must be an instance of KernelSet')
    }

    const pointer = expression_constructor(
      inputs,
      outputs,
      rows,
      columns,
      levelsBack,
      arity,
      kernelSet.pointer,
      seed
    )

    Object.defineProperties(this, {
      pointer: { value: pointer },
      inputs: { value: inputs },
      outputs: { value: outputs },
      rows: { value: rows },
      columns: { value: columns },
      levelsBack: { value: levelsBack },
      arity: { value: arity },
      seed: { value: seed },
    })
  }

  /**
   * @memberof Expression
   * @type {number[]}
   */
  get chromosome() {
    this._throwIfDestroyed()

    const {
      exports: { delete_uint32_array, expression_get_chromosome },
      memory: { U32 },
    } = getInstance()

    const stackStart = this._stackSave()

    const lengthPointer = this._stackAlloc(Uint32Array.BYTES_PER_ELEMENT)

    const arrayPointer = expression_get_chromosome(this.pointer, lengthPointer)

    const typedChromosome = new Uint32Array(
      U32.buffer,
      arrayPointer,
      U32[lengthPointer / U32.BYTES_PER_ELEMENT]
    )

    const chromosome = Array.from(typedChromosome)

    delete_uint32_array(arrayPointer)
    this._stackRestore(stackStart)

    return chromosome
  }

  set chromosome(chromosome) {
    this._throwIfDestroyed()

    if (!isArray(chromosome) || !chromosome.every(isNumber)) {
      throw new TypeError('Provided chromosome must be an array of numbers.')
    }

    if (!chromosome.every(i => i >= 0)) {
      throw new TypeError('Every entry of the chromosome must not be negative.')
    }

    const {
      exports: { expression_set_chromosome },
      memory: { U32 },
    } = getInstance()

    const stackStart = this._stackSave()

    const chromosomePointer = stackPutArray(chromosome, U32)

    expression_set_chromosome(
      this.pointer,
      chromosomePointer,
      chromosome.length
    )

    this._stackRestore(stackStart)
  }

  /**
   * Calculates the result of the expression with `inputs`.
   *
   * @memberof Expression
   * @param {...(number|number[])} inputs Input to the expression.
   * @returns {number[]} The outputs of the expression.
   * @example
   * expression.evaluate(1, 2, 3)
   * // could for example return [2, 5]
   * @example
   * kernel.evaluate([1, 4], [2, 5], [3, 6])
   * // could for example return [[2, 4], [5, 8]]
   */
  evaluate(...inputs) {
    this._throwIfDestroyed()

    if (inputs.length !== this.inputs) {
      throw new Error(
        'Number of inputs must match the number of inputs ' +
          `of the expression which is ${this.inputs}`
      )
    }

    if (!containsOneType(inputs) || !containsNumbersOnly(inputs)) {
      throw new TypeError(
        'Provided inputs must be of the same type, ' +
          'Array.<Number> or Number but not mixed.'
      )
    }

    const {
      exports: { expression_evaluate },
      memory: { F64 },
    } = getInstance()

    const stackStart = this._stackSave()

    const inputArray = structureEvaluationInputs(inputs)

    const inputPointer = stackPutArray(inputArray, F64)

    const results = calculateEvaluation(
      inputs,
      inputPointer,
      expression_evaluate.bind(null, this.pointer),
      this.outputs
    )

    this._stackRestore(stackStart)

    return results
  }

  /**
   * Gets the eqution that is represended by the expression.
   *
   * @memberof Expression
   * @param {...string} inputSymbols Symbol for the inputs of the expression.
   * @returns {string[]} Array with with the equation for every output of the expression.
   * @example
   * expression.equation('a', 'b')
   * // could for example return ['(a+b)']
   */
  equations(...inputSymbols) {
    this._throwIfDestroyed()

    if (inputSymbols.length !== this.inputs) {
      throw new Error(
        'Number of inputSymbols needs to match ' +
          `the number of inputs of the expression which is ${this.inputs}.`
      )
    }

    if (!inputSymbols.every(isString)) {
      throw new TypeError('Every inputSymbol must be a string.')
    }

    const {
      exports: { delete_string, expression_equation },
      memory: { U8 },
    } = getInstance()

    const stackStart = this._stackSave()

    const encodedStrings = encodeStrings(...inputSymbols)
    const stringsPointer = stackPutArray(encodedStrings, U8)

    const resultPointer = expression_equation(this.pointer, stringsPointer)
    const results = decodeStrings(resultPointer, this.outputs)

    delete_string(resultPointer)
    this._stackRestore(stackStart)

    return results
  }

  /**
   * Calculate the loss of the current expression between the provided inputs and the labels.
   * Uses the Mean Square Error to calculate the loss.
   *
   * @memberof Expression
   * @param {[[number]]} inputs Matrix with dimentions (inputs, points). The inputs should exclude the constants.
   * @param {[[number]]} labels Matrix with dimentions (outputs, points).
   * @param {number[]} [constants] Array with ephemeral constants to be used as inputs together with `inputs`.
   * @returns {number} The loss.
   */
  loss(inputs, labels, constants = []) {
    this._throwIfDestroyed()

    if (inputs.length + constants.length !== this.inputs) {
      throw new Error(
        'The number of provided inputs is not equal to the required inputs for this expression. ' +
          'The inputs and the constants together must match the number inputs of the expression.'
      )
    }

    if (inputs[0].length !== labels[0].length) {
      throw new Error(
        'input and output must be an array of the same length. ' +
          `Lengths ${inputs.length} and ${labels.length} found.`
      )
    }

    const {
      memory: { F64 },
      exports: { expression_loss },
    } = getInstance()

    const stackStart = this._stackSave()

    const [inputsPointer, labelsPointer] = [inputs, labels].map(data => {
      const flat = flatten2D(data)

      return stackPutArray(flat, F64)
    })

    const constantsPointer =
      constants.length !== 0 ? stackPutArray(constants, F64) : 0

    const loss = expression_loss(
      this.pointer,
      inputsPointer,
      labelsPointer,
      inputs[0].length,
      constantsPointer,
      constants.length
    )

    this._stackRestore(stackStart)
    return loss
  }
  // // Gets the idx of the active genes in the current chromosome(numbering is from 0)
  // getActiveGenes() {}

  // // Gets the idx of the active nodes in the current chromosome
  // getActiveNodes() {}

  // // Gets the kernel functions
  // getKernels() {}

  // // Gets a vector containing the indexes in the chromosome where each node starts to be expressed.
  // getGeneIdx() {}

  // // Gets the lower bounds of the chromosome
  // getLowerBounds() {}

  // // Gets the upper bounds of the chromosome
  // getUpperBounds() {}

  // // Mutates multiple genes within their allowed bounds.
  // mutate(indexes) {}

  // // Mutates N randomly selected active genes within their allowed bounds
  // mutateActive(N = 1) {}

  // // Mutates N randomly selected active connections within their allowed bounds
  // mutateActiveConnections(N = 1) {}

  // // Mutates N randomly selected active function genes within their allowed bounds
  // mutateActiveFunctions(N = 1) {}

  // // Mutates N randomly selected output genes connection within their allowed bounds
  // mutateOutputs(N = 1) {}

  // // Mutates N randomly selected genes within its allowed bounds
  // mutateRandom(N = 1) {}

  // // Sets for a valid node(i.e.not an input node) a new kernel.
  // setFunction(nodeIndexes, kernelIds) {}

  /**
   * @readonly
   * @private
   */
  get [Symbol.toStringTag]() {
    return 'Expression'
  }

  /**
   * Cleans this object from the shared memory with WebAssembly.
   * Must be called before the instance goes out off scope to prevent memory leaks.
   * @memberof Expression
   */
  destroy() {
    const {
      exports: { expression_destroy },
    } = getInstance()

    expression_destroy(this.pointer)

    super.destroy()
  }
}

export default Expression
