import Snap from 'snapsvg'
import $ from 'jquery'

let playerInfo

// An array to store characters' name and starting point
let namePosition = []

const svg = Snap('#mySvg')

let name
let place
let tipWindow

let mySvg = $('#mySvg')[0]

let pt = mySvg.createSVGPoint()

export function drawSegmentPath(
  pathStr,
  defaultWidth = 2,
  hoverWidth = 4,
  character,
  positionInfo
) {
  const pathSvg = svg.path(pathStr)

  let color = 'black'
  // let svgText = svg.text(10, 10, "Test")

  // console.log(positionInfo)

  let index = 0 // Initialise the index

  const offset = 145 // set an offset before drawing lines

  let player1Img = '../../src/image/NA1_4178165221/1.png'
  let player2Img = '../../src/image/NA1_4178165221/2.png'
  let player3Img = '../../src/image/NA1_4178165221/3.png'
  let player4Img = '../../src/image/NA1_4178165221/4.png'
  let player5Img = '../../src/image/NA1_4178165221/5.png'
  let player6Img = '../../src/image/NA1_4178165221/6.png'
  let player7Img = '../../src/image/NA1_4178165221/7.png'
  let player8Img = '../../src/image/NA1_4178165221/8.png'
  let player9Img = '../../src/image/NA1_4178165221/9.png'
  let player10Img = '../../src/image/NA1_4178165221/10.png'

  let text

  console.log('Received: ' + playerInfo)

  /*if (!doOnce) {
    let perTimestamp = 0
    let accumTimestamp = 139016.8

    let timeAidedLine

    for (let segments = 0; segments < 11; segments++){
      // draw vertical lines
      posX = 80 + distance * segments
      console.log(posX)
      timeAidedLine = svg.line(posX, 0, posX, 1100)
      timeAidedLine.attr({
        fill: 'none',
        stroke: "black",
        // 'stroke-width': defaultWidth
        'stroke-dasharray':'4'
      })

      // write labels
      let txt = svg.text(70 + distance * segments, 1120, timeStamp(perTimestamp + accumTimestamp * segments)) // we need a loop to draw all lines#
      console.log(segments)
    }
  }*/

  switch (
    character // text can be replaced with icons in later use
  ) {
    case 'Player2':
      color = '#00B8D1'
      index = positionInfo.indexOf('Player2') // Find the index based on the character's name
      // svg.text(positionInfo[index+1] -offset, positionInfo[index+2] , "Player2")
      pathSvg.attr({
        'stroke-dasharray': '4',
      })
      let iconTwo = svg.image(
        player2Img,
        positionInfo[index + 1] - offset + 80 + 6,
        positionInfo[index + 2] - 20 + 6,
        42,
        42
      )
      iconTwo.hover(
        () => {
          text = svg.text(35, 250 + 60, playerInfo[3])
          text.attr({
            fill: color,
          })
        },
        () => {
          text.remove()
        }
      )
      let borderTwo = svg
        .rect(
          positionInfo[index + 1] - offset + 80,
          positionInfo[index + 2] - 20,
          53,
          53
        )
        .attr({
          fill: 'none',
          stroke: color,
          'stroke-width': '5',
        })
      break
    case 'Player3':
      color = '#00B827'
      index = positionInfo.indexOf('Player3')
      pathSvg.attr({
        'stroke-dasharray': '4',
      })
      // svg.text(positionInfo[index+1] -offset, positionInfo[index+2] , "Player3")
      let iconThree = svg.image(
        player3Img,
        positionInfo[index + 1] - offset + 6,
        positionInfo[index + 2] + 72 + 6,
        41,
        41
      )
      iconThree.hover(
        () => {
          text = svg.text(35, 250 + 60, playerInfo[5])
          text.attr({
            fill: color,
          })
        },
        () => {
          text.remove()
        }
      )
      let borderThree = svg
        .rect(
          positionInfo[index + 1] - offset,
          positionInfo[index + 2] + 72,
          53,
          53
        )
        .attr({
          fill: 'none',
          stroke: color,
          'stroke-width': '5',
        })
      break
    case 'Player4':
      color = '#5BB58A'
      index = positionInfo.indexOf('Player4')
      pathSvg.attr({
        'stroke-dasharray': '4',
      })
      // svg.text(positionInfo[index+1] -offset, positionInfo[index+2] , "Player4")
      let iconFour = svg.image(
        player4Img,
        positionInfo[index + 1] - offset + 80 + 6,
        positionInfo[index + 2] + 53 + 6,
        42,
        42
      )
      iconFour.hover(
        () => {
          text = svg.text(35, 250 + 60, playerInfo[7])
          text.attr({
            fill: color,
          })
        },
        () => {
          text.remove()
        }
      )
      let borderFour = svg
        .rect(
          positionInfo[index + 1] - offset + 80,
          positionInfo[index + 2] + 53,
          53,
          53
        )
        .attr({
          fill: 'none',
          stroke: color,
          'stroke-width': '5',
        })
      break
    case 'Player5':
      color = '#9B8BD6'
      index = positionInfo.indexOf('Player5')
      pathSvg.attr({
        'stroke-dasharray': '4',
      })
      // svg.text(positionInfo[index+1] -offset, positionInfo[index+2] , "Player5")
      let iconFive = svg.image(
        player5Img,
        positionInfo[index + 1] - offset + 6,
        positionInfo[index + 2] + 110 + 14,
        41,
        41
      )
      iconFive.hover(
        () => {
          text = svg.text(35, 250 + 60, playerInfo[9])
          text.attr({
            fill: color,
          })
        },
        () => {
          text.remove()
        }
      )
      let borderFive = svg
        .rect(
          positionInfo[index + 1] - offset,
          positionInfo[index + 2] + 110 + 5 + 3,
          53,
          53
        )
        .attr({
          fill: 'none',
          stroke: color,
          'stroke-width': '5',
        })
      break
    case 'Player6':
      color = '#ff4e00'
      index = positionInfo.indexOf('Player6')
      // svg.text(positionInfo[index+1] -offset, positionInfo[index+2] , "Player6")
      let iconSix = svg.image(
        player6Img,
        positionInfo[index + 1] - offset + 6,
        positionInfo[index + 2] - 160 + 6,
        41,
        41
      )
      iconSix.hover(
        () => {
          text = svg.text(35, 900, playerInfo[11])
          text.attr({
            fill: color,
          })
        },
        () => {
          text.remove()
        }
      )
      let borderSix = svg
        .rect(
          positionInfo[index + 1] - offset,
          positionInfo[index + 2] - 160,
          53,
          53
        )
        .attr({
          fill: 'none',
          stroke: color,
          'stroke-width': '5',
        })
      break
    case 'Player7':
      color = '#ff5c8a'
      index = positionInfo.indexOf('Player7')
      // svg.text(positionInfo[index+1] -offset, positionInfo[index+2] , "Player7")
      let iconSeven = svg.image(
        player7Img,
        positionInfo[index + 1] - offset + 70 + 6,
        positionInfo[index + 2] - 180 + 6,
        42,
        42
      )
      iconSeven.hover(
        () => {
          text = svg.text(35, 900, playerInfo[13])
          text.attr({
            fill: color,
          })
        },
        () => {
          text.remove()
        }
      )
      let borderSeven = svg
        .rect(
          positionInfo[index + 1] - offset + 70,
          positionInfo[index + 2] - 180,
          53,
          53
        )
        .attr({
          fill: 'none',
          stroke: color,
          'stroke-width': '3',
        })
      break
    case 'Player8':
      color = '#f5bb00'
      index = positionInfo.indexOf('Player8')
      // svg.text(positionInfo[index+1] -offset, positionInfo[index+2] , "Player8")
      let iconEight = svg.image(
        player8Img,
        positionInfo[index + 1] - offset + 6,
        positionInfo[index + 2] - 80 + 6,
        40,
        40
      )
      iconEight.hover(
        () => {
          text = svg.text(35, 900, playerInfo[15])
          text.attr({
            fill: color,
          })
        },
        () => {
          text.remove()
        }
      )
      let borderEight = svg
        .rect(
          positionInfo[index + 1] - offset,
          positionInfo[index + 2] - 80,
          53,
          53
        )
        .attr({
          fill: 'none',
          stroke: color,
          'stroke-width': '5',
        })
      break
    case 'Player9':
      color = '#ec9f05'
      index = positionInfo.indexOf('Player9')
      // svg.text(positionInfo[index+1] -offset, positionInfo[index+2] , "Player9")
      let iconNine = svg.image(
        player9Img,
        positionInfo[index + 1] - offset + 70 + 6,
        positionInfo[index + 2] - 100 + 6,
        42,
        42
      )
      iconNine.hover(
        () => {
          text = svg.text(35, 900, playerInfo[17])
          text.attr({
            fill: color,
          })
        },
        () => {
          text.remove()
        }
      )
      let borderNine = svg
        .rect(
          positionInfo[index + 1] - offset + 70,
          positionInfo[index + 2] - 100,
          53,
          53
        )
        .attr({
          fill: 'none',
          stroke: color,
          'stroke-width': '3',
        })
      break
    case 'Player10':
      color = '#bf3100'
      index = positionInfo.indexOf('Player10')
      // svg.text(positionInfo[index+1] -offset, positionInfo[index+2] , "Player10")
      let iconTen = svg.image(
        player10Img,
        positionInfo[index + 1] - offset + 6,
        positionInfo[index + 2] - 50 + 6,
        42,
        42
      )
      iconTen.hover(
        () => {
          text = svg.text(35, 900, playerInfo[19])
          text.attr({
            fill: color,
          })
        },
        () => {
          text.remove()
        }
      )
      let borderTen = svg
        .rect(
          positionInfo[index + 1] - offset,
          positionInfo[index + 2] - 50,
          53,
          53
        )
        .attr({
          fill: 'none',
          stroke: color,
          'stroke-width': '5',
        })
      break
    default:
      color = '#5B7DB1'
      index = positionInfo.indexOf('Player1')
      pathSvg.attr({
        'stroke-dasharray': '4',
      })
      // svg.text(positionInfo[index+1] -offset, positionInfo[index+2] , "Player1")
      let icon = svg.image(
        player1Img,
        positionInfo[index + 1] - offset + 6,
        positionInfo[index + 2] + 6,
        42,
        42
      )
      icon.hover(
        () => {
          text = svg.text(35, 250 + 60, playerInfo[1])
          text.attr({
            fill: color,
          })
        },
        () => {
          text.remove()
        }
      )
      // Add decorative border according to the color scheme
      let borderOne = svg
        .rect(positionInfo[index + 1] - offset, positionInfo[index + 2], 53, 53)
        .attr({
          fill: 'none',
          stroke: color,
          'stroke-width': '5',
        })
  }

  /*switch(character) // text can be replaced with icons in later use
  {
    case "Red cap":
      color = "red"
      index = positionInfo.indexOf("Red cap"); // Find the index based on the character's name
      svg.text(positionInfo[index+1] -offset, positionInfo[index+2] , "Red cap") // set an offset to write text
      break
    case "Mother":
      color = "green"
      index = positionInfo.indexOf("Mother");
      svg.text(positionInfo[index+1] -offset, positionInfo[index+2] , "Mother")
      break
    case "Wolf":
      color = "blue"
      index = positionInfo.indexOf("Wolf");
      svg.text(positionInfo[index+1] -offset, positionInfo[index+2] , "Wolf")
      break
    default:
      color = "black"
      index = positionInfo.indexOf("Grandmother");
      svg.text(positionInfo[index+1] -100, positionInfo[index+2] , "Grandmother")
  }*/

  /*  let strokeAttr = pathStr.attr().stroke
  console.log("ATTR: " + strokeAttr)
  // let strokeWidthAttr = pathStr.attr().*/

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
  type = 'simple'
) {
  // console.log(positionInfo)

  // console.log(participantsInfo)

  if (!printOnce && session && locationSet) {
    console.log('Session passed in!')
    console.log('Location info passed in!')
    console.log(perTimestamp)
    printOnce = true
  }

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
          console.log('printed: ' + pointTwoXPos, pointTwoYPos)
        }
        break
      default:
        if (!Player1) {
          Player1 = true
          namePosition.push(character, segment[0][0], segment[0][1])
          pointOneXPos = segment[0][0]
          pointOneYPos = segment[0][1]
          console.log('get first point:' + pointOneXPos, pointOneYPos)
        }
    }

    /*    switch(character)
    {
      case "Red cap":
        if (!redCap){
          redCap = true
          namePosition.push(character, segment[0][0], segment[0][1]) // character's name followed by the x,y coordinates of the starting point
        }
        break
      case "Mother":
        if (!mother){
          mother = true
          namePosition.push(character, segment[0][0], segment[0][1])
        }
        break
      case "Wolf":
        if (!wolf){
          wolf = true
          namePosition.push(character, segment[0][0], segment[0][1])
        }
        break
      default:
        if (!grandmother){
          grandmother = true
          namePosition.push(character, segment[0][0], segment[0][1])
        }
    }*/

    let segmentPath = ''
    switch (type) {
      case 'bezier':
        segmentPath = generateBezierPath(segment)
        break
      default:
        segmentPath = generateSimplePath(segment)
        break
    }

    let point = [pointOneXPos, pointOneYPos, pointTwoXPos, pointTwoYPos]

    playerInfo = participantsInfo

    const segmentPathSvg = drawSegmentPath(
      segmentPath,
      2,
      4,
      character,
      namePosition,
      perTimestamp
    ) // To pass the character info, participants info as well as the generated array
    segmentPathSvg.click(() => {
      console.log(namePosition)

      // Find out character's name in nameposition array
      // let i = namePosition.indexOf(character)
      // let startingPoint = [namePosition[i+1], namePosition[i+2]]
      // console.log(startingPoint)

      let idNumber = character.match(/\d/g)
      idNumber = idNumber.join('')
      console.log(parseInt(idNumber))
      console.log(character, idx, session[parseInt(idNumber) - 1][idx]) // parseInt(idNumber)-1][idx] has undefined element when it was 14, this needs to minus 1

      console.log(locationSet)

      let accessIndex = session[parseInt(idNumber) - 1][idx] - 1
      console.log(locationSet[accessIndex])
      idNumber = ''
      console.log(character, idx) // parseInt(idNumber)-1][idx] has undefined element when it was 14, this needs to minus 1
    })

    segmentPathSvg.hover(
      event => {
        pt.x = event.clientX
        pt.y = event.clientY

        // console.log(event.clientX, event.clientY)

        pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

        console.log(pt.x, pt.y)

        let idNumber = character.match(/\d/g)
        idNumber = parseInt(idNumber.join(''))
        console.log(idNumber, playerInfo[idNumber * 2 - 1])

        let accessIndex = session[parseInt(idNumber) - 1][idx] - 1

        if (event.clientY > 180) {
          tipWindow = svg.rect(pt.x - 50, pt.y - 100, 150, 70).attr({
            fill: 'yellow',
          })
          name = svg.text(
            pt.x - 30,
            pt.y - 130 + 60,
            playerInfo[idNumber * 2 - 1]
          )
          place = svg.text(pt.x - 30, pt.y - 110 + 60, locationSet[accessIndex])
        } else {
          tipWindow = svg.rect(pt.x - 75, pt.y - 50, 150, 70).attr({
            fill: 'yellow',
          })
          name = svg.text(pt.x - 50, pt.y - 20, playerInfo[idNumber * 2 - 1])
          place = svg.text(pt.x - 50, pt.y, locationSet[accessIndex])
        }
      },

      () => {
        tipWindow.remove()
        name.remove()
        place.remove()
      }
    )

    svg.mousemove(event => {
      pt.x = event.clientX
      pt.y = event.clientY

      // console.log(event.clientX, event.clientY)

      pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

      console.log(pt.x, pt.y)
    })
  })

  // console.log(namePosition)
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

function timeStamp(perTimestamp) {
  let perMin = Math.floor((perTimestamp / 1000 / 60) << 0),
    perSec = Math.floor((perTimestamp / 1000) % 60)

  let log = perMin + ':' + perSec
  return log
}
