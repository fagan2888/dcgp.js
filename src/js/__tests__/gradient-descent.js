const fs = require('fs')
const path = require('path')
import { initialise, getInstance } from '../initialiser'
import gradientDescent from '../algorithms/gradient-descent'
import KernelSet from '../classes/KernelSet'
import Expression from '../classes/Expression'

describe('gradient descent', () => {
  let stackStart

  beforeAll(async () => {
    const dcgpBuffer = fs.readFileSync(path.resolve('dcgp.wasm')).buffer
    await initialise(dcgpBuffer)
    const { stackSave } = getInstance().exports

    stackStart = stackSave()
  })

  afterEach(() => {
    const { stackRestore } = getInstance().exports

    stackRestore(stackStart)
  })

  it('solves edge case equation 1', () => {
    const MIN_POINT_DISTANCE = 4

    const points = [
      { y: 97.58776, x: 1.0 },
      { y: 97.76344, x: 2.0 },
      { y: 96.56705, x: 3.0 },
      { y: 92.52037, x: 4.0 },
      { y: 91.15097, x: 5.0 },
      { y: 95.21728, x: 6.0 },
      { y: 90.21355, x: 7.0 },
      { y: 89.29235, x: 8.0 },
      { y: 91.51479, x: 9.0 },
      { y: 89.60966, x: 10.0 },
      { y: 86.56187, x: 11.0 },
      { y: 85.55316, x: 12.0 },
      { y: 87.13054, x: 13.0 },
      { y: 85.6794, x: 14.0 },
      { y: 80.04851, x: 15.0 },
      { y: 82.18925, x: 16.0 },
      { y: 87.24081, x: 17.0 },
      { y: 80.79407, x: 18.0 },
      { y: 81.2857, x: 19.0 },
      { y: 81.5694, x: 20.0 },
      { y: 79.22715, x: 21.0 },
      { y: 79.43275, x: 22.0 },
      { y: 77.90195, x: 23.0 },
      { y: 76.75468, x: 24.0 },
      { y: 77.17377, x: 25.0 },
      { y: 74.27348, x: 26.0 },
      { y: 73.119, x: 27.0 },
      { y: 73.84826, x: 28.0 },
      { y: 72.4787, x: 29.0 },
      { y: 71.92292, x: 30.0 },
      { y: 66.92176, x: 31.0 },
      { y: 67.93835, x: 32.0 },
      { y: 69.56207, x: 33.0 },
      { y: 69.07066, x: 34.0 },
      { y: 66.53983, x: 35.0 },
      { y: 63.87883, x: 36.0 },
      { y: 69.71537, x: 37.0 },
      { y: 63.60588, x: 38.0 },
      { y: 63.37154, x: 39.0 },
      { y: 60.01835, x: 40.0 },
      { y: 62.67481, x: 41.0 },
      { y: 65.80666, x: 42.0 },
      { y: 59.14304, x: 43.0 },
      { y: 56.62951, x: 44.0 },
      { y: 61.21785, x: 45.0 },
      { y: 54.3879, x: 46.0 },
      { y: 62.93443, x: 47.0 },
      { y: 56.65144, x: 48.0 },
      { y: 57.13362, x: 49.0 },
      { y: 58.29689, x: 50.0 },
      { y: 58.91744, x: 51.0 },
      { y: 58.50172, x: 52.0 },
      { y: 55.22885, x: 53.0 },
      { y: 58.30375, x: 54.0 },
      { y: 57.43237, x: 55.0 },
      { y: 51.69407, x: 56.0 },
      { y: 49.93132, x: 57.0 },
      { y: 53.7076, x: 58.0 },
      { y: 55.39712, x: 59.0 },
      { y: 52.89709, x: 60.0 },
      { y: 52.31649, x: 61.0 },
      { y: 53.9872, x: 62.0 },
      { y: 53.54158, x: 63.0 },
      { y: 56.45046, x: 64.0 },
      { y: 51.32276, x: 65.0 },
      { y: 53.11676, x: 66.0 },
      { y: 53.28631, x: 67.0 },
      { y: 49.80555, x: 68.0 },
      { y: 54.69564, x: 69.0 },
      { y: 56.41627, x: 70.0 },
      { y: 54.59362, x: 71.0 },
      { y: 54.3852, x: 72.0 },
      { y: 60.15354, x: 73.0 },
      { y: 59.78773, x: 74.0 },
      { y: 60.49995, x: 75.0 },
      { y: 65.43885, x: 76.0 },
      { y: 60.70001, x: 77.0 },
      { y: 63.71865, x: 78.0 },
      { y: 67.77139, x: 79.0 },
      { y: 64.70934, x: 80.0 },
      { y: 70.78193, x: 81.0 },
      { y: 70.38651, x: 82.0 },
      { y: 77.22359, x: 83.0 },
      { y: 79.52665, x: 84.0 },
      { y: 80.13077, x: 85.0 },
      { y: 85.67823, x: 86.0 },
      { y: 85.20647, x: 87.0 },
      { y: 90.24548, x: 88.0 },
      { y: 93.61953, x: 89.0 },
      { y: 95.86509, x: 90.0 },
      { y: 93.46992, x: 91.0 },
      { y: 105.8137, x: 92.0 },
      { y: 107.8269, x: 93.0 },
      { y: 114.0607, x: 94.0 },
      { y: 115.5019, x: 95.0 },
      { y: 118.511, x: 96.0 },
      { y: 119.6177, x: 97.0 },
      { y: 122.194, x: 98.0 },
      { y: 126.9903, x: 99.0 },
      { y: 125.7005, x: 100.0 },
      { y: 123.7447, x: 101.0 },
      { y: 130.6543, x: 102.0 },
      { y: 129.7168, x: 103.0 },
      { y: 131.824, x: 104.0 },
      { y: 131.8759, x: 105.0 },
      { y: 131.9994, x: 106.0 },
      { y: 132.1221, x: 107.0 },
      { y: 133.4414, x: 108.0 },
      { y: 133.8252, x: 109.0 },
      { y: 133.6695, x: 110.0 },
      { y: 128.2851, x: 111.0 },
      { y: 126.5182, x: 112.0 },
      { y: 124.755, x: 113.0 },
      { y: 118.4016, x: 114.0 },
      { y: 122.0334, x: 115.0 },
      { y: 115.2059, x: 116.0 },
      { y: 118.7856, x: 117.0 },
      { y: 110.7387, x: 118.0 },
      { y: 110.2003, x: 119.0 },
      { y: 105.1729, x: 120.0 },
      { y: 103.4472, x: 121.0 },
      { y: 94.5428, x: 122.0 },
      { y: 94.40526, x: 123.0 },
      { y: 94.57964, x: 124.0 },
      { y: 88.76605, x: 125.0 },
      { y: 87.28747, x: 126.0 },
      { y: 92.50443, x: 127.0 },
      { y: 86.27997, x: 128.0 },
      { y: 82.44307, x: 129.0 },
      { y: 80.47367, x: 130.0 },
      { y: 78.36608, x: 131.0 },
      { y: 78.74307, x: 132.0 },
      { y: 76.12786, x: 133.0 },
      { y: 79.13108, x: 134.0 },
      { y: 76.76062, x: 135.0 },
      { y: 77.60769, x: 136.0 },
      { y: 77.76633, x: 137.0 },
      { y: 81.2822, x: 138.0 },
      { y: 79.74307, x: 139.0 },
      { y: 81.97964, x: 140.0 },
      { y: 80.02952, x: 141.0 },
      { y: 85.95232, x: 142.0 },
      { y: 85.96838, x: 143.0 },
      { y: 79.94789, x: 144.0 },
      { y: 87.17023, x: 145.0 },
      { y: 90.50992, x: 146.0 },
      { y: 93.23373, x: 147.0 },
      { y: 89.14803, x: 148.0 },
      { y: 93.11492, x: 149.0 },
      { y: 90.34337, x: 150.0 },
      { y: 93.69421, x: 151.0 },
      { y: 95.74256, x: 152.0 },
      { y: 91.85105, x: 153.0 },
      { y: 96.74503, x: 154.0 },
      { y: 87.60996, x: 155.0 },
      { y: 90.47012, x: 156.0 },
      { y: 88.1169, x: 157.0 },
      { y: 85.70673, x: 158.0 },
      { y: 85.01361, x: 159.0 },
      { y: 78.5304, x: 160.0 },
      { y: 81.34148, x: 161.0 },
      { y: 75.19295, x: 162.0 },
      { y: 72.66115, x: 163.0 },
      { y: 69.85504, x: 164.0 },
      { y: 66.29476, x: 165.0 },
      { y: 63.58502, x: 166.0 },
      { y: 58.33847, x: 167.0 },
      { y: 57.50766, x: 168.0 },
      { y: 52.80498, x: 169.0 },
      { y: 50.79319, x: 170.0 },
      { y: 47.0349, x: 171.0 },
      { y: 46.4709, x: 172.0 },
      { y: 43.09016, x: 173.0 },
      { y: 34.11531, x: 174.0 },
      { y: 39.28235, x: 175.0 },
      { y: 32.68386, x: 176.0 },
      { y: 30.44056, x: 177.0 },
      { y: 31.98932, x: 178.0 },
      { y: 23.6333, x: 179.0 },
      { y: 23.69643, x: 180.0 },
      { y: 20.26812, x: 181.0 },
      { y: 19.07074, x: 182.0 },
      { y: 17.59544, x: 183.0 },
      { y: 16.08785, x: 184.0 },
      { y: 18.94267, x: 185.0 },
      { y: 18.61354, x: 186.0 },
      { y: 17.258, x: 187.0 },
      { y: 16.62285, x: 188.0 },
      { y: 13.48367, x: 189.0 },
      { y: 15.37647, x: 190.0 },
      { y: 13.47208, x: 191.0 },
      { y: 15.96188, x: 192.0 },
      { y: 12.32547, x: 193.0 },
      { y: 16.3388, x: 194.0 },
      { y: 10.43833, x: 195.0 },
      { y: 9.628715, x: 196.0 },
      { y: 13.12268, x: 197.0 },
      { y: 8.772417, x: 198.0 },
      { y: 11.76143, x: 199.0 },
      { y: 12.5502, x: 200.0 },
      { y: 11.33108, x: 201.0 },
      { y: 11.20493, x: 202.0 },
      { y: 7.816916, x: 203.0 },
      { y: 6.800675, x: 204.0 },
      { y: 14.26581, x: 205.0 },
      { y: 10.66285, x: 206.0 },
      { y: 8.911574, x: 207.0 },
      { y: 11.56733, x: 208.0 },
      { y: 11.58207, x: 209.0 },
      { y: 11.59071, x: 210.0 },
      { y: 9.730134, x: 211.0 },
      { y: 11.44237, x: 212.0 },
      { y: 11.22912, x: 213.0 },
      { y: 10.17213, x: 214.0 },
      { y: 12.50905, x: 215.0 },
      { y: 6.201493, x: 216.0 },
      { y: 9.019605, x: 217.0 },
      { y: 10.80607, x: 218.0 },
      { y: 13.09625, x: 219.0 },
      { y: 3.914271, x: 220.0 },
      { y: 9.567886, x: 221.0 },
      { y: 8.038448, x: 222.0 },
      { y: 10.23104, x: 223.0 },
      { y: 9.36741, x: 224.0 },
      { y: 7.695971, x: 225.0 },
      { y: 6.118575, x: 226.0 },
      { y: 8.793207, x: 227.0 },
      { y: 7.796692, x: 228.0 },
      { y: 12.45065, x: 229.0 },
      { y: 10.61601, x: 230.0 },
      { y: 6.001003, x: 231.0 },
      { y: 6.765098, x: 232.0 },
      { y: 8.764653, x: 233.0 },
      { y: 4.586418, x: 234.0 },
      { y: 8.390783, x: 235.0 },
      { y: 7.209202, x: 236.0 },
      { y: 10.01209, x: 237.0 },
      { y: 7.327461, x: 238.0 },
      { y: 6.525136, x: 239.0 },
      { y: 2.840065, x: 240.0 },
      { y: 10.32371, x: 241.0 },
      { y: 4.790035, x: 242.0 },
      { y: 8.376431, x: 243.0 },
      { y: 6.26398, x: 244.0 },
      { y: 2.705892, x: 245.0 },
      { y: 8.362109, x: 246.0 },
      { y: 8.983507, x: 247.0 },
      { y: 3.362469, x: 248.0 },
      { y: 1.182678, x: 249.0 },
      { y: 4.875312, x: 250.0 },
    ]
      .sort((a, b) => a.x - b.x)
      .reduce((prev, cur) => {
        if (prev.length === 0) {
          prev.push(cur)
        }

        if (cur.x - prev[prev.length - 1].x > MIN_POINT_DISTANCE) {
          prev.push(cur)
        }

        return prev
      }, [])

    const inputs = [points.map(pt => pt.x)]
    const outputs = [points.map(pt => pt.y)]

    const myKernelSet = new KernelSet('sum', 'diff', 'mul', 'div', 'log', 'exp')
    const myExpression = new Expression(5, 1, 1, 20, 5, 2, myKernelSet, 1)

    myExpression.chromosome = JSON.parse(
      '[5,3,0,3,0,4,1,0,2,5,5,3,0,5,8,1,8,5,1,9,10,3,11,11,1,11,12,2,13,12,4,10,13,1,12,11,2,15,15,3,15,13,4,15,15,4,18,15,3,16,18,1,19,21,5,22,18,0,22,22,23]'
    )

    const constants = [1, 2, 3, 4]

    const lossBefore = myExpression.loss(inputs, outputs, constants)

    const result = gradientDescent(
      myExpression,
      100,
      inputs,
      outputs,
      constants
    )

    expect(isFinite(result.loss)).toBeTruthy()
    expect(result.constants.every(c => isFinite(c))).toBeTruthy()

    expect(lossBefore >= result.loss).toBeTruthy()
    expect(result.loss < 1400).toBeTruthy()
  })

  describe('edge case equation 2', () => {
    const points = [
      { y: 92.9, x: 0.5 },
      { y: 57.1, x: 1.0 },
      { y: 31.05, x: 1.75 },
      { y: 11.5875, x: 3.75 },
      { y: 8.025, x: 5.75 },
      { y: 63.6, x: 0.875 },
      { y: 21.4, x: 2.25 },
      { y: 14.25, x: 3.25 },
      { y: 8.475, x: 5.25 },
      { y: 63.8, x: 0.75 },
      { y: 26.8, x: 1.75 },
      { y: 16.4625, x: 2.75 },
      { y: 7.125, x: 4.75 },
      { y: 67.3, x: 0.625 },
      { y: 41.0, x: 1.25 },
      { y: 21.15, x: 2.25 },
      { y: 8.175, x: 4.25 },
      { y: 81.5, x: 0.5 },
      { y: 13.12, x: 3.0 },
      { y: 59.9, x: 0.75 },
      { y: 14.62, x: 3.0 },
      { y: 32.9, x: 1.5 },
      { y: 5.44, x: 6.0 },
      { y: 12.56, x: 3.0 },
      { y: 5.44, x: 6.0 },
      { y: 32.0, x: 1.5 },
      { y: 13.95, x: 3.0 },
      { y: 75.8, x: 0.5 },
      { y: 20.0, x: 2.0 },
      { y: 10.42, x: 4.0 },
      { y: 59.5, x: 0.75 },
      { y: 21.67, x: 2.0 },
      { y: 8.55, x: 5.0 },
      { y: 62.0, x: 0.75 },
      { y: 20.2, x: 2.25 },
      { y: 7.76, x: 3.75 },
      { y: 3.75, x: 5.75 },
      { y: 11.81, x: 3.0 },
      { y: 54.7, x: 0.75 },
      { y: 23.7, x: 2.5 },
      { y: 11.55, x: 4.0 },
      { y: 61.3, x: 0.75 },
      { y: 17.7, x: 2.5 },
      { y: 8.74, x: 4.0 },
      { y: 59.2, x: 0.75 },
      { y: 16.3, x: 2.5 },
      { y: 8.62, x: 4.0 },
      { y: 81.0, x: 0.5 },
      { y: 4.87, x: 6.0 },
      { y: 14.62, x: 3.0 },
      { y: 81.7, x: 0.5 },
      { y: 17.17, x: 2.75 },
      { y: 81.3, x: 0.5 },
      { y: 28.9, x: 1.75 },
    ].sort((a, b) => a.x - b.x)

    const inputs = [points.map(pt => pt.x)]
    const outputs = [points.map(pt => pt.y)]

    it('improves the constants from [1, 2, 3, 4]', () => {
      const myKernelSet = new KernelSet(
        'sum',
        'diff',
        'mul',
        'div',
        'log',
        'exp'
      )
      const myExpression = new Expression(5, 1, 1, 20, 4, 2, myKernelSet, 1)

      myExpression.chromosome = JSON.parse(
        '[4,3,0,0,1,1,2,0,6,2,5,5,5,8,6,5,6,8,1,7,9,1,9,11,3,9,11,3,12,10,2,13,13,4,12,14,5,14,15,5,14,14,3,18,15,1,18,17,3,19,20,5,18,19,0,22,22,2,23,22,24]'
      )

      const constants = [1, 2, 3, 4]

      const lossBefore = myExpression.loss(inputs, outputs, constants)

      const result = gradientDescent(
        myExpression,
        100,
        inputs,
        outputs,
        constants
      )

      expect(isFinite(result.loss)).toBeTruthy()
      expect(result.constants.every(c => isFinite(c))).toBeTruthy()

      expect(lossBefore >= result.loss).toBeTruthy()
      expect(result.loss < 15).toBeTruthy()
    })

    it('improves the constants from [0.5, 2, 3, 4]', () => {
      const myKernelSet = new KernelSet(
        'sum',
        'diff',
        'mul',
        'div',
        'log',
        'exp'
      )
      const myExpression = new Expression(5, 1, 1, 20, 4, 2, myKernelSet, 1)

      myExpression.chromosome = JSON.parse(
        '[4,3,0,0,1,1,2,0,6,2,5,5,5,8,6,5,6,8,1,7,9,1,9,11,3,9,11,3,12,10,2,13,13,4,12,14,5,14,15,5,14,14,3,18,15,1,18,17,3,19,20,5,18,19,0,22,22,2,23,22,24]'
      )

      const constants = [0.5, 2, 3, 4]

      const lossBefore = myExpression.loss(inputs, outputs, constants)

      const result = gradientDescent(
        myExpression,
        100,
        inputs,
        outputs,
        constants
      )

      expect(isFinite(result.loss)).toBeTruthy()
      expect(result.constants.every(c => isFinite(c))).toBeTruthy()

      expect(lossBefore >= result.loss).toBeTruthy()
      expect(result.loss < 15).toBeTruthy()
    })
  })
})
