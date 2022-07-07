import { logStoryInfo } from '../../src/js/utils/logger'
import { drawStoryline } from '../../src/js/utils/drawer'
import iStoryline from '../../src/js'
import Snap from 'snapsvg'

import * as d3Fetch from 'd3-fetch'
import $ from 'jquery'

// Initialise json files
const jsonRead = d3Fetch.json('../../data/json/EUW1_5922388644Info.json')
const jsonReadTwo = d3Fetch.json('../../data/json/newKillingInfo.json')
const jsonDBSCAN = d3Fetch.json('../../data/json/dbscan2.json')

// Screen Width and Height
const width = 6000
const height = 1080

// We need to set the total timestamp first
// Sections decide how the interval of timeline display
let totalTimestamp
let sections = 10

// Canvas Origin
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
  Player6: '#ff0000',
  Player7: '#ba000d',
  Player8: '#ff94c2',
  Player9: '#ffa000',
  Player10: '#ffd149',
}

// Save location info for later use
let locationSet

// console.log('Match Length: ' + timeStamp(totalTimestamp))
console.log(timeStamp(573678))

let mySvg = $('#mySvg')[0]

let pt = mySvg.createSVGPoint()

async function main(fileName) {
  const iStorylineInstance = new iStoryline()
  const fileUrl = `../../data/${fileName.split('.')[1]}/${fileName}`
  let graph = await iStorylineInstance.loadFile(fileUrl)
  let dbSCANData

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

  let dbscan = await jsonDBSCAN.then(function(result) {
    dbSCANData = result
  })

  // console.log("DB: " + dbscan[0][0])

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

  let simple = true

  locationSet = iStorylineInstance._story._locations

  if (locationSet.length > 6) {
    simple = false
  }

  // console.log("Loc: " + locationSet)

  heroInfo(characters, participantsInfo, simple)

  locationBox(locationSet, simple)

  const storylines = graph.storylines

  // Timestamp
  const timestamps = iStorylineInstance._story._timeStamps
  totalTimestamp = timestamps[timestamps.length - 1]
  // console.log(totalTimestamp)

  // convert the last timestamp into minutes

  let min = Math.floor((totalTimestamp / 1000 / 60) << 0),
    sec = Math.floor((totalTimestamp / 1000) % 60)

  console.log(min + ':' + sec)

  const perTimeStamp = totalTimestamp / 10 //divided by 10

  let perMin = Math.floor((perTimeStamp / 1000 / 60) << 0),
    perSec = Math.floor((perTimeStamp / 1000) % 60)

  console.log('Per timestamp: ' + perMin + ':' + perSec)

  timeline()

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

  await drawEvents(graph, participantsInfo, dbSCANData)

  return iStorylineInstance
}
main('Simple.json')

const svg = Snap('#mySvg')

// Draw hero info
function heroInfo(character, participantsInfo, simple) {
  let playerImg = []
  console.log(participantsInfo)
  for (let i = 0; i < character.length; i++) {
    playerImg[i] = `../../src/image/Champions/${
      participantsInfo[i * 2 + 1]
    }Square.png`
    console.log(
      `../../src/image/Champions/${participantsInfo[i * 2 + 1]}Square.png`
    )
  }
  // console.log(playerImg)
  // console.log(participantsInfo)
  // console.log(character)

  const teamOneX = 30
  const teamOneY = 50
  const borderOffset = 5

  const iconSize = 42
  const borderSize = 52

  const horizontalAdj = 70
  const verticalAdj = 110

  // let text

  let icon = svg.image(playerImg[0], teamOneX, teamOneY, iconSize, iconSize)
  svg.text(teamOneX - 10, teamOneY + 80, participantsInfo[1]).attr({
    fill: playerColour['Player1'],
  })

  /*icon.hover(
    () => {
      text = svg.text(teamOneX, teamOneY + 80, participantsInfo[1])
      text.attr({
        fill: playerColour['Player1'],
      })
    },
    () => {
      text.remove()
    }
  )*/
  // Add decorative border according to the color scheme
  svg
    .rect(
      teamOneX - borderOffset,
      teamOneY - borderOffset,
      borderSize,
      borderSize
    )
    .attr({
      fill: 'none',
      stroke: playerColour['Player1'],
      'stroke-width': '5',
      opacity: 0.7,
    })

  let iconTwo = svg.image(
    playerImg[1],
    teamOneX + horizontalAdj,
    teamOneY,
    iconSize,
    iconSize
  )

  svg.text(teamOneX + horizontalAdj, teamOneY + 80, participantsInfo[3]).attr({
    fill: playerColour['Player2'],
  })

  /*  iconTwo.hover(
    () => {
      text = svg.text(
        teamOneX + horizontalAdj,
        teamOneY + 80,
        participantsInfo[3]
      )
      text.attr({
        fill: playerColour['Player2'],
      })
    },
    () => {
      text.remove()
    }
  )*/

  svg
    .rect(
      teamOneX - borderOffset + horizontalAdj,
      teamOneY - borderOffset,
      borderSize,
      borderSize
    )
    .attr({
      fill: 'none',
      stroke: playerColour['Player2'],
      'stroke-width': '5',
      opacity: 0.7,
    })

  let iconThree = svg.image(
    playerImg[2],
    teamOneX,
    teamOneY + verticalAdj,
    iconSize,
    iconSize
  )

  svg
    .text(teamOneX - 10, teamOneY + verticalAdj + 80, participantsInfo[5])
    .attr({
      fill: playerColour['Player3'],
    })
  /*iconThree.hover(
    () => {
      text = svg.text(
        teamOneX,
        teamOneY + verticalAdj + 80,
        participantsInfo[5]
      )
      text.attr({
        fill: playerColour['Player3'],
      })
    },
    () => {
      text.remove()
    }
  )*/

  svg
    .rect(
      teamOneX - borderOffset,
      teamOneY - borderOffset + verticalAdj,
      borderSize,
      borderSize
    )
    .attr({
      fill: 'none',
      stroke: playerColour['Player3'],
      'stroke-width': '5',
      opacity: 0.7,
    })

  let iconFour = svg.image(
    playerImg[3],
    teamOneX + horizontalAdj,
    teamOneY + verticalAdj,
    iconSize,
    iconSize
  )

  svg
    .text(
      teamOneX + horizontalAdj,
      teamOneY + verticalAdj + 80,
      participantsInfo[7]
    )
    .attr({
      fill: playerColour['Player4'],
    })

  /*iconFour.hover(
    () => {
      text = svg.text(
        teamOneX + horizontalAdj,
        teamOneY + verticalAdj + 80,
        participantsInfo[7]
      )
      text.attr({
        fill: playerColour['Player4'],
      })
    },
    () => {
      text.remove()
    }
  )*/

  svg
    .rect(
      teamOneX - borderOffset + horizontalAdj,
      teamOneY - borderOffset + verticalAdj,
      borderSize,
      borderSize
    )
    .attr({
      fill: 'none',
      stroke: playerColour['Player4'],
      'stroke-width': '5',
      opacity: 0.7,
    })

  let iconFive = svg.image(
    playerImg[4],
    teamOneX,
    teamOneY + verticalAdj * 2,
    iconSize,
    iconSize
  )

  svg
    .text(teamOneX - 10, teamOneY + verticalAdj * 2 + 80, participantsInfo[9])
    .attr({
      fill: playerColour['Player5'],
    })

  /*iconFive.hover(
    () => {
      text = svg.text(
        teamOneX,
        teamOneY + verticalAdj * 2 + 80,
        participantsInfo[9]
      )
      text.attr({
        fill: playerColour['Player5'],
      })
    },
    () => {
      text.remove()
    }
  )*/

  svg
    .rect(
      teamOneX - borderOffset,
      teamOneY - borderOffset + verticalAdj * 2,
      borderSize,
      borderSize
    )
    .attr({
      fill: 'none',
      stroke: playerColour['Player5'],
      'stroke-width': '5',
      opacity: 0.7,
    })

  const teamTwoX = teamOneX
  const teamTwoY = 850

  let iconSix = svg.image(playerImg[5], teamTwoX, teamTwoY, iconSize, iconSize)
  svg.text(teamTwoX - 10, teamTwoY + 80, participantsInfo[11]).attr({
    fill: playerColour['Player6'],
  })
  /*iconSix.hover(
    () => {
      text = svg.text(teamTwoX, teamTwoY + 80, participantsInfo[11])
      text.attr({
        fill: playerColour['Player6'],
      })
    },
    () => {
      text.remove()
    }
  )*/

  svg
    .rect(
      teamTwoX - borderOffset,
      teamTwoY - borderOffset,
      borderSize,
      borderSize
    )
    .attr({
      fill: 'none',
      stroke: playerColour['Player6'],
      'stroke-width': '5',
      opacity: 0.7,
    })

  let iconSeven = svg.image(
    playerImg[6],
    teamTwoX + horizontalAdj,
    teamTwoY,
    iconSize,
    iconSize
  )

  svg.text(teamTwoX + horizontalAdj, teamTwoY + 80, participantsInfo[13]).attr({
    fill: playerColour['Player7'],
  })

  /*iconSeven.hover(
    () => {
      text = svg.text(
        teamTwoX + horizontalAdj,
        teamTwoY + 80,
        participantsInfo[13]
      )
      text.attr({
        fill: playerColour['Player7'],
      })
    },
    () => {
      text.remove()
    }
  )*/
  svg
    .rect(
      teamTwoX - borderOffset + horizontalAdj,
      teamTwoY - borderOffset,
      borderSize,
      borderSize
    )
    .attr({
      fill: 'none',
      stroke: playerColour['Player7'],
      'stroke-width': '5',
      opacity: 0.7,
    })

  let iconEight = svg.image(
    playerImg[7],
    teamTwoX,
    teamTwoY + verticalAdj,
    iconSize,
    iconSize
  )

  svg
    .text(teamTwoX - 10, teamTwoY + verticalAdj + 80, participantsInfo[15])
    .attr({
      fill: playerColour['Player8'],
    })

  /*iconEight.hover(
    () => {
      text = svg.text(
        teamTwoX,
        teamTwoY + verticalAdj + 80,
        participantsInfo[15]
      )
      text.attr({
        fill: playerColour['Player8'],
      })
    },
    () => {
      text.remove()
    }
  )*/

  svg
    .rect(
      teamTwoX - borderOffset,
      teamTwoY - borderOffset + verticalAdj,
      borderSize,
      borderSize
    )
    .attr({
      fill: 'none',
      stroke: playerColour['Player8'],
      'stroke-width': '5',
      opacity: 0.7,
    })

  let iconNine = svg.image(
    playerImg[8],
    teamTwoX + horizontalAdj,
    teamTwoY + verticalAdj,
    iconSize,
    iconSize
  )

  svg
    .text(
      teamTwoX + horizontalAdj,
      teamTwoY + verticalAdj + 80,
      participantsInfo[17]
    )
    .attr({
      fill: playerColour['Player9'],
    })

  /*iconNine.hover(
    () => {
      text = svg.text(
        teamTwoX + horizontalAdj,
        teamTwoY + verticalAdj + 80,
        participantsInfo[17]
      )
      text.attr({
        fill: playerColour['Player8'],
      })
    },
    () => {
      text.remove()
    }
  )*/

  svg
    .rect(
      teamTwoX - borderOffset + horizontalAdj,
      teamTwoY - borderOffset + verticalAdj,
      borderSize,
      borderSize
    )
    .attr({
      fill: 'none',
      stroke: playerColour['Player9'],
      'stroke-width': '5',
      opacity: 0.7,
    })

  let iconTen = svg.image(
    playerImg[9],
    teamTwoX,
    teamTwoY + verticalAdj * 2,
    iconSize,
    iconSize
  )

  svg
    .text(teamTwoX - 10, teamTwoY + verticalAdj * 2 + 80, participantsInfo[19])
    .attr({
      fill: playerColour['Player10'],
    })

  /*iconTen.hover(
    () => {
      text = svg.text(
        teamTwoX,
        teamTwoY + verticalAdj * 2 + 80,
        participantsInfo[19]
      )
      text.attr({
        fill: playerColour['Player10'],
      })
    },
    () => {
      text.remove()
    }
  )*/
  svg
    .rect(
      teamTwoX - borderOffset,
      teamTwoY - borderOffset + verticalAdj * 2,
      borderSize,
      borderSize
    )
    .attr({
      fill: 'none',
      stroke: playerColour['Player10'],
      'stroke-width': '5',
      opacity: 0.7,
    })

  const mapSize = 128
  const mapX = 23
  const mapY = 520

  svg.text(mapX + 15, mapY - 25, 'Map Division')

  if (simple) {
    svg.image('../../src/image/MiniMapSimple.png', mapX, mapY, mapSize, mapSize)
  } else {
    svg.image(
      '../../src/image/MiniMapComplex.png',
      mapX,
      mapY,
      mapSize,
      mapSize
    )
  }
}

// Draw timeline
function timeline() {
  let accumTimestamp = totalTimestamp / sections
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
      'stroke-dasharray': '4',
    })

    // write labels
    let txt = svg.text(
      70 + distance * segments + 95 + 70 + 100,
      1120 + 20 + 60,
      timeStamp(accumTimestamp * segments)
    ) // we need a loop to draw all lines#
    txt.attr({
      'font-size': 30,
    })
    // console.log(segments)
  }
}

function timeStamp(perTimestamp) {
  let perMin = Math.floor((perTimestamp / 1000 / 60) << 0),
    perSec = Math.floor((perTimestamp / 1000) % 60)

  return perMin + ':' + perSec
}

// console.log('TIME: ' + timeStamp(26063))

function locationBox(locationSet, simple) {
  // console.log(locationSet)

  let lineHeight = height / locationSet.length

  let stripe = svg.image('../../src/image/stripe.svg', 0, 0, 5920, lineHeight)

  let pat = stripe.pattern(0, 0, 5920, lineHeight)

  // Initialise Rectangles

  let rect = []
  let length = locationSet.length

  console.log('LEN: ' + length)

  for (let i = 0; i < length; i++) {
    rect[i] = []
  }

  const textXPosOne = 210
  const textXPosTwo = 6380

  let localHeight = 0

  let mask
  let img

  for (let i = 0; i < length; i++) {
    localHeight = localHeight + lineHeight
    // console.log(height)

    if ((i + 1) % 2 !== 0) {
      rect[i] = svg
        .rect(xOrigin, lineHeight * i + yOrigin, width, lineHeight)
        .attr({
          fill: 'rgba(128, 128, 128, 0.5)',
          fillOpacity: '0.1',
          stroke: 'none',
        })
      console.log('y Value: ' + (lineHeight * (i + 1)) / 2 + yOrigin)
      svg
        .text(
          textXPosOne,
          localHeight + yOrigin - lineHeight / 2,
          locationSet[i]
        )
        .attr({ 'font-size': 17 })
        .hover(
          event => {
            pt.x = event.clientX
            pt.y = event.clientY

            pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

            const tipWindowSize = 200
            const maskSize = 200

            let tipX = pt.x
            let tipY = pt.y

            if (i > 4) {
              tipX -= 100
              tipY -= 100
            }

            mask = svg
              .rect(tipX, tipY, maskSize, maskSize, 10, 10)
              .attr({ fill: 'yellow' })
            // draw for complex and simple version
            if (simple) {
              img = svg.image(
                `../../src/image/sessionImgsSimple/${i + 1}.png`,
                tipX,
                tipY,
                tipWindowSize,
                tipWindowSize
              )
              console.log(`../../src/image/sessionImgsSimple/${i + 1}.png`)
            } else {
              img = svg.image(
                `../../src/image/MiniMaps/${i + 1}.png`,
                tipX,
                tipY,
                tipWindowSize,
                tipWindowSize
              )
            }
            img.attr({
              mask: mask,
            })
          },
          () => {
            mask.remove()
            img.remove()
          }
        )
      svg
        .text(
          textXPosTwo,
          localHeight + yOrigin - lineHeight / 2,
          locationSet[i]
        )
        .attr({ 'font-size': 17 })
        .hover(
          event => {
            pt.x = event.clientX
            pt.y = event.clientY

            pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

            const tipWindowSize = 200
            const maskSize = 200

            let tipX = pt.x
            let tipY = pt.y

            tipX -= 300
            tipY -= 100

            mask = svg
              .rect(tipX, tipY, maskSize, maskSize, 10, 10)
              .attr({ fill: 'yellow' })
            // draw for complex and simple version
            if (length == 6) {
              img = svg.image(
                `../../src/image/sessionImgsSimple/${i + 1}.png`,
                tipX,
                tipY,
                tipWindowSize,
                tipWindowSize
              )
              console.log(`../../src/image/sessionImgsSimple/${i + 1}.png`)
            } else {
              img = svg.image(
                `../../src/image/MiniMaps/${i + 1}.png`,
                tipX,
                tipY,
                tipWindowSize,
                tipWindowSize
              )
            }
            img.attr({
              mask: mask,
            })
          },
          () => {
            mask.remove()
            img.remove()
          }
        )
    }

    if ((i + 1) % 2 === 0) {
      rect[i] = svg
        .rect(xOrigin, lineHeight * i + yOrigin, width, lineHeight)
        .attr({
          fill: 'rgba(255, 255, 255, 0.1)',
          stroke: 'none',
        })
      console.log('y Value: ' + lineHeight * i + yOrigin)
      svg
        .text(
          textXPosOne,
          localHeight + yOrigin - lineHeight / 2,
          locationSet[i]
        )
        .attr({ 'font-size': 17 })
        .hover(
          event => {
            pt.x = event.clientX
            pt.y = event.clientY

            pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

            const tipWindowSize = 200
            const maskSize = 200

            let tipX = pt.x
            let tipY = pt.y

            if (i > 4) {
              tipX -= 100
              tipY -= 100
            }

            mask = svg
              .rect(tipX, tipY, maskSize, maskSize, 10, 10)
              .attr({ fill: 'yellow' })
            // draw for complex and simple version
            if (length == 6) {
              img = svg.image(
                `../../src/image/sessionImgsSimple/${i + 1}.png`,
                tipX,
                tipY,
                tipWindowSize,
                tipWindowSize
              )
              console.log(`../../src/image/sessionImgsSimple/${i + 1}.png`)
            } else {
              img = svg.image(
                `../../src/image/MiniMaps/${i + 1}.png`,
                tipX,
                tipY,
                tipWindowSize,
                tipWindowSize
              )
            }
            img.attr({
              mask: mask,
            })
          },
          () => {
            mask.remove()
            img.remove()
          }
        )

      svg
        .text(
          textXPosTwo,
          localHeight + yOrigin - lineHeight / 2,
          locationSet[i]
        )
        .attr({ 'font-size': 17 })
        .hover(
          event => {
            pt.x = event.clientX
            pt.y = event.clientY

            pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

            const tipWindowSize = 200
            const maskSize = 200

            let tipX = pt.x
            let tipY = pt.y

            tipX -= 300
            tipY -= 100

            mask = svg
              .rect(tipX, tipY, maskSize, maskSize, 10, 10)
              .attr({ fill: 'yellow' })
            // draw for complex and simple version
            if (length == 6) {
              img = svg.image(
                `../../src/image/sessionImgsSimple/${i + 1}.png`,
                tipX,
                tipY,
                tipWindowSize,
                tipWindowSize
              )
              console.log(`../../src/image/sessionImgsSimple/${i + 1}.png`)
            } else {
              img = svg.image(
                `../../src/image/MiniMaps/${i + 1}.png`,
                tipX,
                tipY,
                tipWindowSize,
                tipWindowSize
              )
            }
            img.attr({
              mask: mask,
            })
          },
          () => {
            mask.remove()
            img.remove()
          }
        )
    }

    console.log('LOC: ' + locationSet[i])
  }

  let border

  let text

  for (let i = 0; i < length; i++) {
    rect[i].mousedown(() => {
      console.log(rect[i])
      pt.x = event.clientX
      pt.y = event.clientY
      pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

      const mapSize = 200

      let tipX = pt.x
      let tipY = pt.y

      if (pt.y >= 800) {
        tipX -= 100
        tipY -= 400
      }

      border = svg.rect(tipX, tipY, 250, 280, 10, 10).attr({
        stroke: 'black',
        fill: 'rgba(255,255,255, 0.9)',
        strokeWidth: '3px',
      })

      mask = svg
        .rect(tipX + 25, tipY + 50, mapSize, mapSize, 10, 10)
        .attr({ fill: 'rgba(225, 225, 0)' })
      if (length != 6) {
        img = svg.image(
          `../../src/image/Minimaps/${i + 1}.png`,
          tipX + 25,
          tipY + 50,
          mapSize,
          mapSize
        )
      } else {
        img = svg.image(
          `../../src/image/sessionImgsSimple/${i + 1}.png`,
          tipX + 25,
          tipY + 50,
          mapSize,
          mapSize
        )
      }

      img.attr({
        mask: mask,
      })

      text = svg
        .text(tipX + 28, tipY + 35, locationSet[i])
        .attr('pointer-events', 'none')
        .attr({ 'font-size': 20 })
    })

    rect[i].mouseup(() => {
      console.log('REMOVE')
      border.remove()
      img.remove()
      mask.remove()
      text.remove()
      event.preventDefault()
    })
  }
}

// console.log('TS: ' + timeStamp(209564))
// console.log('TS: ' + timeStamp(214564))

async function drawEvents(graph, participantsInfo, dbSCANData) {
  await jsonReadTwo.then(function(result) {
    const data = result
    // console.log(data)

    let killTimestamp = []
    let clusters = []

    let clusterColors = {
      '0': '#f7f7f7',
      '1': '#f0f0f0',
      '2': '#d9d9d9',
      '3': '#bdbdbd',
      '4': '#969696',
      '5': '#737373',
      '6': '#525252',
      '7': '#252525',
      '8': '#000000',
    }

    /*    for (let item in dbSCANData) {
      let currentTimestamp = dbSCANData[item]['timestamp']

      for (let element in data) {
        // 1 second offset for timestamp calculation
        let innerTimestamp = data[element]['timestamp']

        // For Debug
        let clusterLabel = dbSCANData[item]['label']
        if (clusters.length == 0) {
          clusters.push(clusterLabel)
          } else {
            if (clusters.includes(clusterLabel) == false) {
              clusters.push(clusterLabel)
            }
          }
          killTimestamp.push(currentTimestamp)
      }
    }

    console.log(dbSCANData)
    console.log(killTimestamp)

    // Debug: make sure the len of inner timestamp == outer timestamp
    if (dbSCANData.length == killTimestamp.length) {
      console.log('OK')
      // Get avg of posX in the same cluster
      // console.log(clusters) // check how many clusters do we have

      /!*let avgTimestamp = []

      for (let num in clusters) {
        let tempX = 0
        let counter = 0
        for (let item in dbSCANData) {
          if (clusters[num] == dbSCANData[item]['label']){
            tempX = tempX + dbSCANData[item]['timestamp']
            counter ++
          }
        }
        tempX = tempX/counter
        // console.log(tempX)
        avgTimestamp.push(parseInt(tempX))
      }
      console.log(avgTimestamp)*!/
    } else {
      console.warn('Cannot find all DBSCAN results in death json')
    }*/

    for (let i in data) {
      let posX = data[i]['position']['x']
      let posY = data[i]['position']['y']
      let killerName = data[i]['killerName']
      let victimName = data[i]['victimName']

      let border, mask, img

      let killer, victim

      let killerIcon, victimIcon

      let killing

      if (data[i]['killType'] === 'CHAMPION_KILL') {
        const iconSize = 30
        const offset = iconSize / 2

        let playerIndex = data[i]['victimID']
        let currentTimestamp = data[i]['timestamp']
        let currentPlayer = 'Player' + String(playerIndex)

        let deathPosX = graph.getCharacterX(currentPlayer, currentTimestamp)
        let deathPosY = graph.getCharacterY(currentPlayer, currentTimestamp)
        console.log(currentPlayer, deathPosX, deathPosY)
        // let segmentStart = graph.getStorySegment(deathPosX, deathPosY)[0]
        // console.log(segmentStart)
        // svg.circle(segmentStart[0], segmentStart[1], 10).attr({fill:"blue"})

        // Player Icon
        let indexHolder = currentPlayer.match(/\d/g)
        indexHolder = indexHolder.join('')
        // console.log('CP: ' + (parseInt(indexHolder) - 1))

        svg
          .image(
            `../../src/image/Skulls/${currentPlayer}.png`,
            deathPosX - offset,
            deathPosY - offset,
            iconSize,
            iconSize
          )
          .hover(
            event => {
              pt.x = event.clientX
              pt.y = event.clientY

              pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

              const mapSize = 200

              let tipX = pt.x
              let tipY = pt.y

              if (pt.y >= 995) {
                tipX -= 100
                tipY -= 400
              }

              if (pt.x >= 5700) {
                tipX -= 200
              }

              console.log(posX, posY)
              console.log(timeStamp(currentTimestamp))

              let xOffset = (posX / 15000) * 200
              let yOffset = 200 - (posY / 15000) * 200

              border = svg.rect(tipX, tipY, 250, 300, 10, 10).attr({
                stroke: playerColour[currentPlayer],
                fill: 'rgba(255,255,255, 0.9)',
                strokeWidth: '3px',
              })

              killer = svg.text(35 + tipX, 25 + tipY, 'KILLER: ')
              victim = svg.text(130 + tipX, 25 + tipY, 'VICTIM: ')

              killerIcon = svg.image(
                `../../src/image/Champions/${killerName}Square.png`,
                35 + tipX,
                35 + tipY,
                40,
                40
              )
              victimIcon = svg.image(
                `../../src/image/Champions/${victimName}Square.png`,
                130 + tipX,
                35 + tipY,
                40,
                40
              )

              mask = svg
                .rect(tipX + 25, tipY + 90, mapSize, mapSize, 10, 10)
                .attr({ fill: 'rgba(225, 225, 0)' })
              img = svg.image(
                `../../src/image/MiniMap.png`,
                tipX + 25,
                tipY + 90,
                mapSize,
                mapSize
              )
              img.attr({
                mask: mask,
              })
              killing = svg
                .circle(tipX + 25 + xOffset, tipY + 90 + yOffset, 5)
                .attr({ fill: 'none', stroke: 'white', strokeWidth: '3px' })
              console.log(currentTimestamp, currentPlayer)
            },
            () => {
              border.remove()
              killer.remove()
              killerIcon.remove()
              victim.remove()
              victimIcon.remove()
              mask.remove()
              img.remove()
              killing.remove()
            }
          )

        // Show DBSCAN result using white-black gradient color
        for (let item in dbSCANData) {
          if (dbSCANData[item]['timestamp'] == currentTimestamp) {
            console.log(
              'DB: ' + dbSCANData[item]['timestamp'],
              dbSCANData[item]['label']
            )
            svg
              .circle(deathPosX, deathPosY, 15)
              .attr({
                fill: clusterColors[`${dbSCANData[item]['label']}`],
                opacity: '0.9',
                stroke: 'black',
              })
              .hover(
                event => {
                  pt.x = event.clientX
                  pt.y = event.clientY

                  pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

                  const mapSize = 200

                  let tipX = pt.x
                  let tipY = pt.y

                  if (pt.y >= 995) {
                    tipX -= 100
                    tipY -= 400
                  }

                  if (pt.x >= 5700) {
                    tipX -= 200
                  }

                  console.log(posX, posY)
                  console.log(timeStamp(currentTimestamp))

                  let xOffset = (posX / 15000) * 200
                  let yOffset = 200 - (posY / 15000) * 200

                  border = svg.rect(tipX, tipY, 250, 300, 10, 10).attr({
                    stroke: playerColour[currentPlayer],
                    fill: 'rgba(255,255,255, 0.9)',
                    strokeWidth: '3px',
                  })

                  killer = svg.text(35 + tipX, 25 + tipY, 'KILLER: ')
                  victim = svg.text(130 + tipX, 25 + tipY, 'VICTIM: ')

                  killerIcon = svg.image(
                    `../../src/image/Champions/${killerName}Square.png`,
                    35 + tipX,
                    35 + tipY,
                    40,
                    40
                  )
                  victimIcon = svg.image(
                    `../../src/image/Champions/${victimName}Square.png`,
                    130 + tipX,
                    35 + tipY,
                    40,
                    40
                  )

                  mask = svg
                    .rect(tipX + 25, tipY + 90, mapSize, mapSize, 10, 10)
                    .attr({ fill: 'rgba(225, 225, 0)' })
                  img = svg.image(
                    `../../src/image/MiniMap.png`,
                    tipX + 25,
                    tipY + 90,
                    mapSize,
                    mapSize
                  )
                  img.attr({
                    mask: mask,
                  })
                  killing = svg
                    .circle(tipX + 25 + xOffset, tipY + 90 + yOffset, 5)
                    .attr({ fill: 'none', stroke: 'white', strokeWidth: '3px' })
                  console.log(
                    'DB Label: ' + dbSCANData[item]['label'],
                    currentTimestamp
                  )
                },
                () => {
                  border.remove()
                  killer.remove()
                  killerIcon.remove()
                  victim.remove()
                  victimIcon.remove()
                  mask.remove()
                  img.remove()
                  killing.remove()
                }
              )
          }
        }
      }

      building: if (data[i]['killType'] === 'BUILDING_KILL') {
        const iconSize = 35
        const offset = iconSize / 2
        // console.log('building kill detected')
        let playerIndex = data[i]['killerId']
        let currentTimestamp = data[i]['timestamp']
        let buildingType = data[i]['towerType']

        if (data[i]['towerType'] == undefined) {
          buildingType = data[i]['buildingType']
        }

        let resultType = buildingType.replace('_', ' ')

        let currentPlayer = 'Player' + String(playerIndex)

        if (playerIndex === 0) {
          break building
        } // We need to ignore the case 0, later on we should ignore it when we collect the data
        // turret destroyed => 0 means it either self-destructed (azir tower) or minions got it

        console.log('BUILDING KILLER: ' + currentPlayer)
        let iconPosX = graph.getCharacterX(currentPlayer, currentTimestamp)
        let iconPosY = graph.getCharacterY(currentPlayer, currentTimestamp)
        // console.log(currentPlayer, posX, posY)

        let mask, img

        svg
          .image(
            `../../src/image/Turrets/${currentPlayer}.png`,
            iconPosX - offset,
            iconPosY - offset,
            iconSize,
            iconSize
          )
          .hover(
            event => {
              pt.x = event.clientX
              pt.y = event.clientY

              pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

              const mapSize = 200

              let tipX = pt.x
              let tipY = pt.y

              if (pt.y >= 995) {
                tipX -= 100
                tipY -= 400
              }

              if (pt.x >= 5700) {
                tipX -= 200
              }

              let xOffset = (posX / 15000) * 200
              let yOffset = 200 - (posY / 15000) * 200

              border = svg.rect(tipX, tipY, 250, 300, 10, 10).attr({
                stroke: 'black',
                fill: 'rgba(255,255,255, 0.9)',
                strokeWidth: '3px',
              })

              killer = svg.text(35 + tipX, 25 + tipY, 'KILLER: ')
              victim = svg.text(80 + tipX, 62 + tipY, resultType)

              killerName =
                participantsInfo[participantsInfo.indexOf(playerIndex) + 1]

              killerIcon = svg.image(
                `../../src/image/Champions/${killerName}Square.png`,
                35 + tipX,
                35 + tipY,
                40,
                40
              )

              mask = svg
                .rect(tipX + 25, tipY + 90, mapSize, mapSize, 10, 10)
                .attr({ fill: 'rgba(225, 225, 0)' })
              img = svg.image(
                `../../src/image/MiniMap.png`,
                tipX + 25,
                tipY + 90,
                mapSize,
                mapSize
              )
              img.attr({
                mask: mask,
              })
              killing = svg
                .circle(tipX + 25 + xOffset, tipY + 90 + yOffset, 5)
                .attr({ fill: 'none', stroke: 'white', strokeWidth: '3px' })
            },
            () => {
              border.remove()
              killer.remove()
              killerIcon.remove()
              victim.remove()
              mask.remove()
              img.remove()
              killing.remove()
            }
          )
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
