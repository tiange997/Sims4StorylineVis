import * as math from 'mathjs'
import * as mat from 'ml-matrix'
import { pi } from 'mathjs'
import Snap from 'snapsvg'

const svg = Snap('#mySvg')

// xArray, yArray
export function drawEllipseByPoints(x, y) {
  // console.log(x, y)

  /*      let x = [[
        1065.8122150150684,
        1075.9012773700374,
        1308.1351601014105
      ]]

    let y = [[
      395.06024096385545,
      394.33075301204826,
      710.6024096385543
    ]]*/

  for (let i = 0; i < x[0].length; i++) {
    console.log(x[0][i], y[0][i])
    svg
      .circle(x[0][i], y[0][i], 5)
      .attr({ stroke: 'none', fill: 'red', opacity: '0.9' })
  }

  /*    // Ellipse Example With Rotation
    svg.circle(500, 500, 5).attr({ stroke: 'none', fill: 'green', opacity: '0.9'})
    // rotate args are deg, centreX and centreY
    svg.ellipse(500, 500, 50, 75).attr({stroke: 'blue', fill: 'none', strokeWidth: '3', opacity: '0.7', transform: 'rotate(45, 500, 500)'})*/

  let xx = matrixSelfMultiplication(x)
  let xy = matrixMultiplication(x, y)
  let yy = matrixSelfMultiplication(y)
  let onesLike = ones_like(x[0])

  let D = hStack(xx, xy, yy, x, y, onesLike)
  console.log('Stack: ')
  console.log(D)

  let transD = math.transpose(D)
  console.log('D Transpose: ')
  console.log(transD)

  let S = multiply(transD, D)
  console.log('Multi: ')
  console.log(S)

  // console.log("Create Zeros")
  let C = zeros(6, 6)
  // console.log(C)
  C[0][2] = 2
  C[2][0] = 2
  C[1][1] = -1
  // console.log(C)

  console.log(math.inv(S))

  let tempA = multiply(math.inv(S), C)
  console.log('Dot product of inv(S) and C')
  console.log(tempA) // This is correct

  // Maybe need to re-organise the code here
  let M = new mat.EigenvalueDecomposition(tempA)
  let V = M.eigenvectorMatrix
  // console.log("E: ")
  // console.log(E)
  // console.log(M.imaginaryEigenvalues)
  console.log('V: ')
  console.log(V)

  let a = []

  for (let i in V['data']) {
    a.push(V['data'][i][0])
  }

  for (let i in a) {
    a[i] *= -1
  }
  // console.log(a)

  // let centreX = ellipseCentre(a)[0]
  // let centreY = ellipseCentre(a)[1]
  let centreX = (math.max(x) - math.min(x)) / 2 + math.min(x)
  let centreY = (math.max(y) - math.min(y)) / 2 + math.min(y)

  console.log('Centre X: ' + centreX + 'Centre Y: ' + centreY)

  console.log('Angle: ')
  let angle = ellipseAngleOfRotation(a) + pi / 2
  let angleInDeg = radToDeg(angle)
  console.log(angle, angleInDeg)

  // console.log(ellipseAxisLength(a))
  let rx = ellipseAxisLength(a)[0]
  let ry = ellipseAxisLength(a)[1]
  console.log('rx: ' + rx + 'ry: ' + ry)

  // From here, we can implement svg drawing
  svg
    .circle(centreX, centreY, 5)
    .attr({ stroke: 'none', fill: 'blue', opacity: '0.9' })

  svg.ellipse(centreX, centreY, rx / 2, ry / 2).attr({
    stroke: 'red',
    fill: 'none',
    strokeWidth: '3',
    opacity: '0.7',
    transform: `rotate(${angleInDeg + 30}, ${centreX}, ${centreY})`,
  })
}

function radToDeg(rad) {
  return rad * (180 / pi)
}

function ellipseAxisLength(array) {
  let b = array[1] / 2,
    c = array[2],
    d = array[3] / 2,
    f = array[4] / 2,
    g = array[5],
    a = array[0]
  let up = 2 * (a * f * f + c * d * d + g * b * b - 2 * b * d * f - a * c * g)
  let down1 =
    (b * b - a * c) *
    ((c - a) * math.sqrt(1 + (4 * b * b) / ((a - c) * (a - c))) - (c + a))
  let down2 =
    (b * b - a * c) *
    ((a - c) * math.sqrt(1 + (4 * b * b) / ((a - c) * (a - c))) - (c + a))
  let res1 = math.sqrt(up / down1)
  let res2 = math.sqrt(up / down2)
  return [res1, res2]
}

/*function ellipseCentre(array) {
  let b = array[1] / 2,
    c = array[2],
    d = array[3] / 2,
    f = array[4] / 2,
    g = array[5],
    a = array[0]
  let num = b * b - a * c
  let x0 = (c * d - b * f) / num
  let y0 = (a * f - b * d) / num
  return [x0, y0]
}*/

function ellipseAngleOfRotation(array) {
  let b = array[1] / 2,
    c = array[2],
    d = array[3] / 2,
    f = array[4] / 2,
    g = array[5],
    a = array[0]
  if (b === 0) {
    if (a > c) {
      return 0
    } else {
      return pi / 2
    }
  } else {
    if (a > c) {
      return math.atan((2 * b) / (a - c)) / 2
    } else {
      return pi / 2 + math.atan((2 * b) / (a - c)) / 2
    }
  }
}

function multiply(a, b) {
  var aNumRows = a.length,
    aNumCols = a[0].length,
    bNumRows = b.length,
    bNumCols = b[0].length,
    m = new Array(aNumRows) // initialize array of rows
  for (var r = 0; r < aNumRows; ++r) {
    m[r] = new Array(bNumCols) // initialize the current row
    for (var c = 0; c < bNumCols; ++c) {
      m[r][c] = 0 // initialize the current cell
      for (var i = 0; i < aNumCols; ++i) {
        m[r][c] += a[r][i] * b[i][c]
      }
    }
  }
  return m
}

function zeros(col, line) {
  let matrix = []
  let inLine = []
  for (let i = 0; i < line; i++) {
    for (let j = 0; j < col; j++) {
      inLine.push(0)
    }
    matrix.push(inLine)
    inLine = []
  }
  return matrix
}

function hStack(xx, xy, yy, x, y, onesLike) {
  let newArray = []
  console.log(
    xy[0].length,
    yy[0].length,
    x[0].length,
    y[0].length,
    onesLike.length
  )
  for (let i = 0; i < xx[0].length; i++) {
    newArray.push([xx[0][i], xy[0][i], yy[0][i], x[0][i], y[0][i], onesLike[i]])
  }
  return newArray
}

// console.log(hStack(x,y))

function ones_like(array) {
  let tempArray = copy2DArray(array)
  for (let i = 0; i < tempArray.length; i++) {
    tempArray[i] = 1.0
  }
  console.log(tempArray)
  return tempArray
}

function copy2DArray(array) {
  let length = array.length
  let tempArray = []
  for (let i = 0; i < length; i++) {
    tempArray[i] = array[i]
  }
  return tempArray
}

function matrixSelfMultiplication(a) {
  let result = [[]]
  for (let i = 0; i < a[0].length; i++) {
    result[0][i] = a[0][i] * a[0][i]
    // console.log(i, result[0][i])
  }
  console.log(result)
  return result
}

function matrixMultiplication(a, b) {
  let result = [[]]
  if (a.length === b.length) {
    for (let i = 0; i < a[0].length; i++) {
      result[0][i] = a[0][i] * b[0][i]
      // console.log(i, result[0][i])
    }
    console.log(result)
    return result
  } else {
    console.error('Please provide correct arg')
  }
}
