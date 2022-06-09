import { logStoryInfo } from '../../src/js/utils/logger'
import { drawStoryline } from '../../src/js/utils/drawer'
import { Graph } from '../../src/js/data/graph'
import iStoryline from '../../src/js'
import Snap from 'snapsvg'

import * as d3Fetch from 'd3-fetch'
import { image } from 'd3-fetch'

let locationSet

let jsonRead = d3Fetch.json('../../data/json/MatchDetail.json')
let jsonReadTwo = d3Fetch.json('../../data/json/KillingInfo.json')

// We need to set the total timestamp first
let totalTimestamp = 1390168

let xOrigin = 350,
  yOrigin = 60

// We have to hard-code this part as we manually define colours
// Saving this for decorating circles
let playerColour = {
  Player1: '#5B7DB1',
  Player2: '#00B8D1',
  Player3: '#00B827',
  Player4: '#5BB58A',
  Player5: '#9B8BD6',
  Player6: '#ff4e00',
  Player7: '#ff5c8a',
  Player8: '#f5bb00',
  Player9: '#ec9f05',
  Player10: '#bf3100',
}

const width = 6000
const height = 1080

console.log('Match Length: ' + timeStamp(totalTimestamp))

async function main(fileName) {
  const iStorylineInstance = new iStoryline()
  const fileUrl = `../../data/${fileName.split('.')[1]}/${fileName}`
  let graph = await iStorylineInstance.loadFile(fileUrl)

  // Read Json through the Promise and save participants data

  let participantsInfo = await jsonRead.then(function(result) {
    // console.log(result['info']['participants'])
    let data = result['info']['participants']
    let participantList = []

    for (const element of data) {
      participantList.push(element['participantId'], element['championName'])
    }

    // console.log(participantList)
    return participantList
  })

  // console.log(participantsInfo)

  // Scale to window size
  const containerDom = document.getElementById('mySvg')
  const windowW = containerDom.clientWidth - 20
  const windowH = containerDom.clientHeight - 20
  // graph = iStorylineInstance.scale(80, 10, windowW / 1.2 , windowH / 1.5)
  graph = iStorylineInstance.scale(xOrigin, yOrigin, width, height)

  console.log(iStorylineInstance)

  // graph = iStorylineInstance.bend(['Mother'], [10]);
  logStoryInfo(iStorylineInstance._story)

  const session = iStorylineInstance._story._tableMap.get('session')._mat._data
  // console.log(session)

  // paths = iStorylineInstance._story._paths

  // console.log(paths)

  const characters = graph.characters

  let zero = false

  // To check if there is a zero element in the session table
  for (let i = 0; i < 10; i++) {
    let sessionElement = session[i]
    sessionElement.forEach(item => {
      if (item === 0 || item === '0') {
        zero = true
      }
    })
  }

  if (!zero) {
    console.log('0 Does not Exist!')
  } else {
    console.log('0 Exists!')
  }

  locationSet = iStorylineInstance._story._locations

  // console.log("Loc: " + locationSet)

  heroInfo(characters, participantsInfo)

  locationBox(locationSet)

  const storylines = graph.storylines

  // Timestamp
  const timestamps = iStorylineInstance._story._timeStamps
  const lastTimeStamp = timestamps[timestamps.length - 1]
  console.log(lastTimeStamp)

  // convert the last timestamp into minutes

  let min = Math.floor((lastTimeStamp / 1000 / 60) << 0),
    sec = Math.floor((lastTimeStamp / 1000) % 60)

  console.log(min + ':' + sec)

  const perTimeStamp = lastTimeStamp / 10 //divided by 10

  let perMin = Math.floor((perTimeStamp / 1000 / 60) << 0),
    perSec = Math.floor((perTimeStamp / 1000) % 60)

  console.log('Per timestamp: ' + perMin + ':' + perSec)

  storylines.forEach((storyline, idx) => {
    // drawStoryline(characters[idx], storyline, positionName);
    drawStoryline(
      characters[idx],
      storyline,
      session,
      locationSet,
      perTimeStamp,
      participantsInfo
    )
    // console.log(characters[idx]);
    // console.log("Tab " + graph.getCharacterY("Player5", 506627))
  })

  // console.log(characters)

  drawEvents(graph)

  return iStorylineInstance
}
main('result6.json')

const svg = Snap('#mySvg')

// Draw hero info

function heroInfo(character, participantsInfo) {
  let playerImg = []
  for (let i = 0; i < character.length; i++) {
    playerImg[i] = `../../src/image/NA1_4178165221/${i + 1}.png`
  }
  console.log(playerImg)
  console.log(participantsInfo)
  console.log(character)

  const heroInfoOriginX = 30
  const heroInfoOriginY = 50
  const borderOffset = 5

  const iconSize = 42
  const borderSize = 52

  const horizontalAdj = 30
  const verticalAdj = 20

  let text

  switch (character) {
    /*case 'Player2':
      let iconTwo = svg.image(
          playerImg[1], heroInfoOriginX + horizontalAdj,heroInfoOriginY,iconSize,iconSize
      )
      iconTwo.hover(
          () => {
            text = svg.text(35, 250 + 60, participantsInfo[3])
            text.attr({
              fill: color,
            })
          },
          () => {
            text.remove()
          }
      )
      svg
          .rect(
              heroInfoOriginX - borderOffset + horizontalAdj,
              heroInfoOriginY - borderOffset + horizontalAdj,
              borderSize,
              borderSize
          )
          .attr({
            fill: 'none',
            stroke: color,
            'stroke-width': '5',
          })
      break*/

    default:
      let icon = svg.image(
        playerImg[0],
        heroInfoOriginX,
        heroInfoOriginY,
        iconSize,
        iconSize
      )
      icon.hover(
        () => {
          text = svg.text(35, 250 + 60, participantsInfo[1])
          text.attr({
            fill: playerColour['Player1'],
          })
        },
        () => {
          text.remove()
        }
      )
      // Add decorative border according to the color scheme
      svg
        .rect(
          heroInfoOriginX - borderOffset,
          heroInfoOriginY - borderOffset,
          borderSize,
          borderSize
        )
        .attr({
          fill: 'none',
          stroke: playerColour['Player1'],
          'stroke-width': '5',
        })
  }
}

/*case 'Player2':
color = '#00B8D1'
index = positionInfo.indexOf('Player2') // Find the index based on the character's name
// svg.text(positionInfo[index+1] -offset, positionInfo[index+2] , "Player2")
pathSvg.attr({
  'stroke-dasharray': '4',
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
    positionInfo[index + 1] - offset + 6 - 70 - 100,
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
        positionInfo[index + 1] - offset - 70 - 100,
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
    positionInfo[index + 1] - offset + 80 + 6 - 70 - 100,
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
        positionInfo[index + 1] - offset + 80 - 70 - 100,
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
    positionInfo[index + 1] - offset + 6 - 70 - 100,
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
        positionInfo[index + 1] - offset - 70 - 100,
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
    positionInfo[index + 1] - offset + 6 - 70 - 100,
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
        positionInfo[index + 1] - offset - 70 - 100,
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
    positionInfo[index + 1] - offset + 70 + 6 - 70 - 100,
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
        positionInfo[index + 1] - offset + 70 - 70 - 100,
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
    positionInfo[index + 1] - offset + 6 - 70 - 100,
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
        positionInfo[index + 1] - offset - 70 - 100,
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
    positionInfo[index + 1] - offset + 70 + 6 - 70 - 100,
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
        positionInfo[index + 1] - offset + 70 - 70 - 100,
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
    positionInfo[index + 1] - offset + 6 - 70 - 100,
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
        positionInfo[index + 1] - offset - 70 - 100,
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
*/

let perTimestamp = 0
let accumTimestamp = 139016.8
let timeAidedLine
const distance = 592
let posX

for (let segments = 0; segments < 11; segments++) {
  // draw vertical lines
  posX = xOrigin + distance * segments
  // console.log(posX)
  timeAidedLine = svg.line(posX, yOrigin, posX, 1160)
  timeAidedLine.attr({
    fill: 'none',
    stroke: 'black',
    // 'stroke-width': defaultWidth
    'stroke-dasharray': '4',
  })

  // write labels
  let txt = svg.text(
    70 + distance * segments + 95 + 70 + 100,
    1120 + 20 + 60,
    timeStamp(perTimestamp + accumTimestamp * segments)
  ) // we need a loop to draw all lines#
  txt.attr({
    'font-size': 30,
  })
  // console.log(segments)
}

function timeStamp(perTimestamp) {
  let perMin = Math.floor((perTimestamp / 1000 / 60) << 0),
    perSec = Math.floor((perTimestamp / 1000) % 60)

  let log = perMin + ':' + perSec
  return log
}

console.log('TIME: ' + timeStamp(26063))

function locationBox(locationSet) {
  let height = 0,
    incremental = 64.7

  const lineHeight = 63.52

  let stripe = svg.image('../../src/image/stripe.svg', 0, 0, 5920, lineHeight)

  let pat = stripe.pattern(0, 0, 5920, lineHeight)

  // Initialise Rectangles

  let rect = []

  for (let i = 0; i < locationSet.length; i++) {
    rect[i] = []
  }

  const textXPosOne = 210
  const textXPosTwo = 6380

  for (let i = 0; i < locationSet.length; i++) {
    height = height + incremental
    // console.log(height)

    if ((i + 1) % 2 !== 0) {
      rect[i] = svg
        .rect(xOrigin, incremental * i + yOrigin, width, lineHeight)
        .attr({
          fill: 'rgba(128, 128, 128, 0.5)',
          fillOpacity: '0.1',
          stroke: 'none',
        })
      console.log('y Value: ' + (incremental * (i + 1)) / 2 + yOrigin)
      svg.text(
        textXPosOne,
        incremental * (i + 1) - 20 + yOrigin,
        locationSet[i]
      )
      svg.text(
        textXPosTwo,
        incremental * (i + 1) - 20 + yOrigin,
        locationSet[i]
      )
    }

    if ((i + 1) % 2 === 0) {
      rect[i] = svg
        .rect(xOrigin, incremental * i + yOrigin, width, lineHeight)
        .attr({
          fill: 'none',
          stroke: 'none',
        })
      console.log('y Value: ' + incremental * i + yOrigin)
      svg.text(
        textXPosOne,
        incremental * (i + 1) - 20 + yOrigin,
        locationSet[i]
      )
      svg.text(textXPosTwo, incremental * i + 40 + yOrigin, locationSet[i])
    }
    console.log('LOC: ' + locationSet[i])
  }
}

async function drawEvents(graph) {
  await jsonReadTwo.then(function(result) {
    let data = result
    console.log(data)

    for (let i in data) {
      if (data[i]['killType'] === 'CHAMPION_KILL') {
        let playerIndex = data[i]['victimID']
        let currentTimestamp = data[i]['timestamp']
        let currentPlayer = 'Player' + String(playerIndex)
        let circleX = graph.getCharacterX(currentPlayer, currentTimestamp)
        let circleY = graph.getCharacterY(currentPlayer, currentTimestamp)
        console.log(currentPlayer, circleX, circleY)
        svg.circle(circleX, circleY, 10).attr({
          fill: 'none',
          stroke: playerColour[currentPlayer],
          strokeWidth: 3,
        })
      }

      const scaling = 0.1

      if (data[i]['killType'] === 'BUILDING_KILL') {
        console.log('building kill detected')
        let playerIndex = data[i]['killerId']
        let currentTimestamp = data[i]['timestamp']
        let currentPlayer = 'Player' + String(playerIndex + 1)
        let posX = graph.getCharacterX(currentPlayer, currentTimestamp)
        let posY = graph.getCharacterY(currentPlayer, currentTimestamp)
        console.log(currentPlayer, posX, posY)
        if (data[i]['buildingType'] === 'TOWER_BUILDING') {
          svg
            .polygon(
              '208 288 192 160 224 160 240 144 240 0 192 0 192 48 160 48 160 0 96 0 96 48 64 48 64 0 16 0 16 144 32 160 64 160 48 288 16 288 0 304 0 384 256 384 256 304 240 288'
            )
            .attr({
              transform: `translate(${posX} ${posY})
                            scale(${scaling})`,
              fill: playerColour[currentPlayer],
              // stroke: playerColour[currentPlayer],
              // strokeWidth: 3
            })
        }
        // if (data[i]['buildingType'] === "TOWER_BUILDING")
      }
    }
  })
}

// function main2() {
//   const iStoryliner = new iStoryline()
//   // Scale to window size
//   const containerDom = document.getElementById('mySvg')
//   const windowW = containerDom.clientWidth - 20
//   const windowH = containerDom.clientHeight - 20
//   iStoryliner.addCharacter('tt', [[0, 10], [50, 60]])
//   graph = iStoryliner.scale(10, 10, windowW * 0.8, windowH / 2)
//   logStoryInfo(iStorylineInstance._story)
//   const storylines = graph.storylines
//   storylines.forEach(storyline => drawStoryline(storyline))
// }

// main2()
