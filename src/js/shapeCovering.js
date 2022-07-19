import * as hull from 'hull.js'
import Snap from 'snapsvg'

const svg = Snap('#mySvg')

// points array passed in
export function shapeCovering(points) {
  let n = 8
  let r = 19
  let angle = (2 * Math.PI) / n

  let np = []
  for (let i = 0; i < points.length; i++) {
    let x = points[i][0]
    let y = points[i][1]
    for (let j = 0; j < n; j++) {
      let nx = x + r * Math.cos(j * angle)
      let ny = y + r * Math.sin(j * angle)
      np.push([nx, ny])
    }
  }
  // console.log(np)

  // console.log(hull(np, 1000))

  let border = hull(np, 1000)

  let path = 'M'

  for (let i = 0; i < border.length; i++) {
    if (i === border.length - 1) {
      path += `L${border[i][0]} ${border[i][1]}Z`
    } else if (i === 0) {
      path += `${border[i][0]} ${border[i][1]} `
    } else {
      path += `L${border[i][0]} ${border[i][1]} `
    }
  }

  svg.path(path).attr({ stroke: 'none', fillOpacity: '0.5', fill: 'lightgrey' })
  svg
    .path(path)
    .attr({ stroke: 'black', strokeWidth: '5', opacity: '0.5', fill: 'none' })
}
