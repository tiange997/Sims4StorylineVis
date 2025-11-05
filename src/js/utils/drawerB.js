import Snap from 'snapsvg'
import $ from 'jquery'

let playerInfo

// An array to store characters' name and starting point
let namePosition = []

// For tips

let border //, mask, img

let name //zone

let heroIcon

// For SVG selection

const svg = Snap('#mySvg')

let mySvg = $('#mySvg')[0]

let pt = mySvg.createSVGPoint()

let playerColour = {
  Player1: '#00B8D1',
  Player2: '#ff0000',
  Player3: '#9B8BD6',
  Player4: '#ffd149',
}

export function drawSegmentPath(
  pathStr,
  defaultWidth = 2,
  hoverWidth = 4,
  character
) {
  const pathSvg = svg.path(pathStr)

  let color = 'black'
  // let svgText = svg.text(10, 10, "Test")

  // console.log(positionInfo)

  // console.log('Received: ' + playerInfo)

  switch (character) {
    case 'Player2':
      color = playerColour[character]
      pathSvg.attr({
        opacity: 0.7,
      })
      break
    case 'Player3':
      color = playerColour[character]
      pathSvg.attr({
        opacity: 0.7,
      })
      break
    case 'Player4':
      color = playerColour[character]
      pathSvg.attr({
        opacity: 0.7,
      })
      break
    case 'Player5':
      color = playerColour[character]
      pathSvg.attr({
        opacity: 0.7,
      })
      break
    case 'Player6':
      color = playerColour[character]
      pathSvg.attr({ opacity: 0.7, 'stroke-dasharray': '6,4' })
      break
    case 'Player7':
      color = playerColour[character]
      pathSvg.attr({ opacity: 0.7, 'stroke-dasharray': '6, 4' })
      break
    case 'Player8':
      color = playerColour[character]
      pathSvg.attr({ opacity: 0.7, 'stroke-dasharray': '6, 4' })
      break
    case 'Player9':
      color = playerColour[character]
      pathSvg.attr({ opacity: 0.7, 'stroke-dasharray': '6, 4' })
      break
    case 'Player10':
      color = playerColour[character]
      pathSvg.attr({ opacity: 0.7, 'stroke-dasharray': '6, 4' })
      break
    default:
      color = playerColour[character]
      pathSvg.attr({
        // 'stroke-dasharray': '4',
        opacity: 0.7,
      })
  }

  pathSvg.hover(
    () => {
      pathSvg.attr({
        'stroke-width': 8,
      })
    },
    () => {
      pathSvg.attr({
        'stroke-width': 4,
      })
    }
  )

  pathSvg.attr({
    fill: 'none',
    stroke: color,
    // 'stroke-width': defaultWidth
    'stroke-width': 4,
  })

  return pathSvg
}

export function drawStorylinePath(storylinePath) {
  storylinePath.forEach(segmentPath => drawSegmentPath(segmentPath))
}

// let redCap = false
// let mother = false
// let grandmother = false
// let wolf = false

// make sure we only get the starting point once in the iteration
let Player1 = false
let Player2 = false
let Player3 = false
let Player4 = false
let Player5 = false
let Player6 = false
let Player7 = false
let Player8 = false
let Player9 = false
let Player10 = false

let printOnce = false

let pointOneXPos, pointOneYPos, pointTwoXPos, pointTwoYPos

export function drawStoryline(
  character,
  storyline,
  session,
  locationSet,
  perTimestamp,
  participantsInfo,
  pathList,
  type = 'simple'
) {
  // console.log(positionInfo)

  // console.log(participantsInfo)

  // Log storyline data for this character
  console.log('=== STORYLINE DATA FOR CHARACTER:', character, '===')
  console.log(participantsInfo)
  // console.log('Storyline array:', storyline)

  // --- BEGIN: Add profile pic at start and end of storyline ---
  let id = parseInt(character.match(/\d/g).join(''))
  id = id * 2 - 1
  let Name = participantsInfo[id]
  console.log(Name)

  // Find the first point of the first segment
  let firstPoint = null
  if (storyline.length > 0 && storyline[0].length > 0) {
    firstPoint = storyline[0][0]
    // Draw profile image at start
    svg.image(
      `src/image/Characters/${Name}.png`,
      firstPoint[0] - 60,
      firstPoint[1] - 25,
      40,
      40
    )
  }

  // Find the last point of the last segment
  let lastPoint = null
  let endIcon = null
  if (storyline.length > 0) {
    let lastSegment = storyline[storyline.length - 1]
    if (lastSegment.length > 0) {
      lastPoint = lastSegment[lastSegment.length - 1]
      // Draw profile image at end
      endIcon = svg.image(
        `src/image/Characters/${Name}.png`,
        lastPoint[0] + 20,
        lastPoint[1] - 25,
        40,
        40
      )
      // Draw a cross if this is the player who died
      if (
        typeof window !== 'undefined' &&
        window.playerWithDeathEvent &&
        character === window.playerWithDeathEvent
      ) {
        // Draw a cross (X) over the icon
        const x = lastPoint[0] + 20
        const y = lastPoint[1] - 25
        const w = 40
        const h = 40
        svg.line(x, y, x + w, y + h).attr({
          stroke: playerColour[character] || '#000',
          'stroke-width': 6,
          'stroke-linecap': 'round',
          opacity: 0.95,
          'pointer-events': 'none',
        })
        svg.line(x + w, y, x, y + h).attr({
          stroke: playerColour[character] || '#000',
          'stroke-width': 6,
          'stroke-linecap': 'round',
          opacity: 0.95,
          'pointer-events': 'none',
        })
      }
    }
  }

  // --- END: Add profile pic at start and end of storyline ---

  storyline.forEach((segment, idx) => {
    // console.log(character)
    // console.log(segment)

    switch (character) {
      case 'Player2':
        if (!Player2) {
          Player2 = true
          namePosition.push(character, segment[0][0], segment[0][1]) // character's name followed by the x,y coordinates of the starting point
          // console.log("Player2 caught!")
          // console.log(character, segment[0][0], segment[0][1])
        }
        break
      case 'Player3':
        if (!Player3) {
          Player3 = true
          namePosition.push(character, segment[0][0], segment[0][1])
        }
        break
      case 'Player4':
        if (!Player4) {
          Player4 = true
          namePosition.push(character, segment[0][0], segment[0][1])
        }
        break
      case 'Player5':
        if (!Player5) {
          Player5 = true
          namePosition.push(character, segment[0][0], segment[0][1])
        }
        break
      case 'Player6':
        if (!Player6) {
          Player6 = true
          namePosition.push(character, segment[0][0], segment[0][1])
        }
        break
      case 'Player7':
        if (!Player7) {
          Player7 = true
          namePosition.push(character, segment[0][0], segment[0][1])
        }
        break
      case 'Player8':
        if (!Player8) {
          Player8 = true
          namePosition.push(character, segment[0][0], segment[0][1])
        }
        break
      case 'Player9':
        if (!Player9) {
          Player9 = true
          namePosition.push(character, segment[0][0], segment[0][1])
        }
        break
      case 'Player10':
        if (!Player10) {
          Player10 = true
          namePosition.push(character, segment[0][0], segment[0][1])
          pointTwoXPos = parseInt(segment[0][0])
          pointTwoYPos = parseInt(segment[0][1])
          // console.log('printed: ' + pointTwoXPos, pointTwoYPos)
        }
        break
      default:
        if (!Player1) {
          Player1 = true
          namePosition.push(character, segment[0][0], segment[0][1])
          pointOneXPos = segment[0][0]
          pointOneYPos = segment[0][1]
          // console.log('get first point:' + pointOneXPos, pointOneYPos)
          // console.log(segment)
        }
    }

    let segmentPath = ''
    switch (type) {
      case 'bezier':
        segmentPath = generateBezierPath(segment)
        break
      default:
        segmentPath = generateSimplePath(segment)
        break
    }

    playerInfo = participantsInfo

    const segmentPathSvg = drawSegmentPath(segmentPath, 2, 4, character)

    segmentPathSvg.hover(event => {
      pt.x = event.clientX
      pt.y = event.clientY
      pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

      const idNumber = parseInt(character.match(/\d/g).join(''))
      const placeIndex = session[idNumber - 1][idx]
      const accessIndex = placeIndex - 1

      console.log(segmentPath)

      drawLineTip(
        pt.x,
        pt.y,
        200,
        200,
        playerInfo,
        idNumber,
        locationSet,
        accessIndex,
        placeIndex
      )
    }, removeTips)
  })
}

function drawLineTip(tipX, tipY, mapSize, maskSize, playerInfo, idNumber) {
  const borderHeight = 85
  let playerName = playerInfo[idNumber * 2 - 1]
  let iconSize = 50
  // console.log(playerInfo[5])

  // console.log(playerName)
  // console.log(idNumber)

  let borderLength = calculateBorderLength(playerName, iconSize)
  // console.log(borderLength)

  if (pt.x >= 5700) {
    tipX -= borderLength
  }

  if (pt.y > 1000) {
    tipY -= 50
  }

  border = svg.rect(tipX, tipY, borderLength, borderHeight, 10, 10).attr({
    stroke: playerColour[`Player${idNumber}`],
    fill: 'rgba(255,255,255, 0.9)',
    strokeWidth: '3px',
  })

  heroIcon = svg.image(
    `../../src/image/Characters/${playerName}.png`,
    borderLength / 2 - iconSize / 2 + tipX,
    10 + tipY,
    iconSize,
    iconSize
  )

  if (playerName.length > 5) {
    name = svg.text(15 + tipX, 78 + tipY, playerName)
  } else if (playerName.length == 5) {
    name = svg.text(10 + tipX, 78 + tipY, playerName)
  } else {
    name = svg.text(13 + tipX, 78 + tipY, playerName)
  }
}

function removeTips() {
  border.remove()
  heroIcon.remove()
  name.remove()
  // zone.remove()
  // mask.remove()
  // img.remove()
}

function generateSimplePath(points) {
  if (points.length === 0) return ''
  let pathStr = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 1, len = points.length; i < len; i++) {
    pathStr += `L ${points[i][0]} ${points[i][1]}`
  }
  return pathStr
}

function generateBezierPath(points) {
  if (points.length < 4) return generateSimplePath(points)
  const pointsNum = points.length
  let i = 0
  let pathStr = `M ${points[i][0]} ${points[i][1]} C ${points[i + 1][0]} ${
    points[i + 1][1]
  } ${points[i + 2][0]} ${points[i + 2][1]} ${points[i + 3][0]} ${
    points[i + 3][1]
  }`
  for (i = 4; i < pointsNum - 2; i += 2) {
    pathStr += `S ${points[i][0]} ${points[i][1]} ${points[i + 1][0]} ${
      points[i + 1][1]
    }`
  }
  pathStr += ` L ${points[pointsNum - 1][0]} ${points[pointsNum - 1][1]}`
  return pathStr
}

export function calculateBorderLength(text, iconSize) {
  if (text.length < 1) {
    console.log('Invalid Name!')
  } else {
    // Length for one uppercase letter is 16
    // Length for one lowercase letter is 8
    let length = 16 + (text.length - 1) * 8
    if (length <= iconSize) {
      return 60 // default length if text length less than the iconsize
    } else {
      length += 20 // offset
      return length
    }
  }
}

// Utility function to draw a cross over a profile pic
function defineDrawCross(
  svg,
  icon,
  character,
  playerWithShortestEnd,
  playerColour
) {
  // Use window.playerWithDeathEvent if available, otherwise fallback to playerWithShortestEnd
  const playerToCross = window.playerWithDeathEvent || playerWithShortestEnd
  if (character === playerToCross) {
    // Get icon position and size
    const x = icon.attr('x') || 38
    const y = icon.attr('y') || 40
    const w = icon.attr('width') || 40
    const h = icon.attr('height') || 40
    // Draw two lines (cross)
    svg.line(x, y, x + w, y + h).attr({
      stroke: playerColour[playerToCross] || '#000',
      'stroke-width': 4,
      'pointer-events': 'none',
    })
    svg.line(x + w, y, x, y + h).attr({
      stroke: playerColour[playerToCross] || '#000',
      'stroke-width': 4,
      'pointer-events': 'none',
    })
  }
}
