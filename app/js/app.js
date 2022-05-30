import { logStoryInfo } from '../../src/js/utils/logger'
import { drawStoryline } from '../../src/js/utils/drawer'
import iStoryline from '../../src/js'
import Snap from 'snapsvg'

import * as d3Fetch from 'd3-fetch'

let locationSet

let jsonRead = d3Fetch.json('../../data/json/MatchDetail.json')
let jsonReadTwo = d3Fetch.json('../../data/json/KillingInfo.json')

// We need to set the total timestamp first
let totalTimestamp = 1390168

// Get the drawing path info
let paths,
  playerOnePath = [],
  playerTwoPath = [],
  playerThreePath = [],
  playerFourPath = [],
  playerFivePath = [],
  playerSixPath = [],
  playerSevenPath = [],
  playerEightPath = [],
  playerNinePath = [],
  playerTenPath = []

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
  graph = iStorylineInstance.scale(180, 60, 6000, 1080)

  console.log(iStorylineInstance)

  // graph = iStorylineInstance.bend(['Mother'], [10]);
  logStoryInfo(iStorylineInstance._story)

  const session = iStorylineInstance._story._tableMap.get('session')._mat._data
  // console.log(session)

  paths = iStorylineInstance._story._paths

  // console.log(paths)

  let pathList = [
    playerOnePath,
    playerTwoPath,
    playerThreePath,
    playerFourPath,
    playerFivePath,
    playerSixPath,
    playerSevenPath,
    playerEightPath,
    playerNinePath,
    playerTenPath,
  ]

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 76; j++) {
      pathList[i].push(paths[i * 76 + j])
    }
  }

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

  locationBox(locationSet)

  const storylines = graph.storylines

  // console.log(storylines)

  const characters = graph.characters

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
  })

  // console.log(characters)

  drawEvents()

  return iStorylineInstance
}
main('result6.json')

// Can also draw things here

const svg = Snap('#mySvg')

let perTimestamp = 0
let accumTimestamp = 139016.8

let timeAidedLine

const distance = 592
let posX

for (let segments = 0; segments < 11; segments++) {
  // draw vertical lines
  posX = 180 + distance * segments
  console.log(posX)
  timeAidedLine = svg.line(posX, 60, posX, 1160)
  timeAidedLine.attr({
    fill: 'none',
    stroke: 'black',
    // 'stroke-width': defaultWidth
    'stroke-dasharray': '4',
  })

  // write labels
  let txt = svg.text(
    70 + distance * segments + 95,
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

// let rect = svg.rect(85, 0, 6000, 58.8).attr({
//   fill: 'none',
//   stroke: 'black'
// })

function locationBox(locationSet) {
  let height = 0,
    incremental = 64.7

  // let pattern = p.pattern(0, 0, 10, 10)

  let stripe = svg.image('../../src/image/stripe.svg', 0, 0, 5920, 58.8)

  let pat = stripe.pattern(0, 0, 5920, 58.8)

  let rect1,
    rect2,
    rect3,
    rect4,
    rect5,
    rect6,
    rect7,
    rect8,
    rect9,
    rect10,
    rect11,
    rect12,
    rect13,
    rect14,
    rect15,
    rect16,
    rect17

  const rectObjArray = [
    rect1,
    rect2,
    rect3,
    rect4,
    rect5,
    rect6,
    rect7,
    rect8,
    rect9,
    rect10,
    rect11,
    rect12,
    rect13,
    rect14,
    rect15,
    rect16,
    rect17,
  ]

  const textXPos = 6200

  for (let i = 0; i < 17; i++) {
    height = height + incremental
    // console.log(height)

    if ((i + 1) % 2 !== 0) {
      rectObjArray[i] = svg.rect(185, incremental * i + 60, 6000, 58.8).attr({
        fill: 'rgba(128, 128, 128, 0.5)',
        fillOpacity: '0.1',
        stroke: 'none',
      })
      console.log('y Value: ' + (incremental * (i + 1)) / 2 + 60)
      svg.text(textXPos, incremental * (i + 1) - 20 + 60, locationSet[i])
    }

    if ((i + 1) % 2 === 0) {
      rectObjArray[i] = svg.rect(185, incremental * i + 60, 6000, 58.8).attr({
        fill: 'none',
        stroke: 'none',
      })
      console.log('y Value: ' + incremental * i + 60)
      svg.text(textXPos, incremental * i + 40 + 60, locationSet[i])
    }
    console.log('LOC: ' + locationSet[i])
  }
}

let locationMap = []

for (let i = 0; i < 17; i++) {
  const incremental = 64.7
  locationMap.push(incremental * i + 60 + 58.8 / 2)
}

async function drawEvents() {
  await jsonReadTwo.then(function(result) {
    let data = result

    console.log(data)

    let pathList = [
      playerOnePath,
      playerTwoPath,
      playerThreePath,
      playerFourPath,
      playerFivePath,
      playerSixPath,
      playerSevenPath,
      playerEightPath,
      playerNinePath,
      playerTenPath,
    ]

    for (let i in data) {
      let playerIndex = data[i]['victimID'] - 1
      let localPath = pathList[playerIndex]

      let circle_x =
        ((6000 - 180) * data[i]['timestamp']) / totalTimestamp + 180

      // "M 300 0 L 300 1080" ( Replace 300 with real X based on the timestamp)

      let findingPath = `M ${circle_x} 0 L${circle_x} 1080`

      let intersection = Snap.path.intersection(localPath, findingPath)[0]

      if (intersection === undefined) {
        console.log('Undefined at data point: ' + i)
        console.log('Undefined storyline (Victim ID): ' + data[i]['victimID'])
        console.log(
          'Undefined position X (Cannot find its corresponding Y): ' + circle_x
        )
      }

      if (intersection) {
        let circle_y = parseInt(intersection.y)
        svg
          .circle(circle_x, circle_y, 26)
          .attr({ fill: 'none', stroke: 'red', strokeWidth: 3 })
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
