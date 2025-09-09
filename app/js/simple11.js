import {
  calculateBorderLength,
  drawStoryline,
} from '../../src/js/utils/drawerB'
import { none } from 'html-webpack-plugin/lib/chunksorter'
import iStoryline from '../../src/js'
import * as d3Fetch from 'd3-fetch'
import Snap from 'snapsvg'
import $ from 'jquery'

let allEventData = [] // Store all event data globally for filtering

// Dynamically generate event type filter checkboxes based on event data
const eventTypeFilterDiv = document.getElementById('eventTypeFilters')
const eventTypeJsonPath = '../../data/json/Match11/Story_Events_DataFull.json'

d3Fetch.json(eventTypeJsonPath).then(data => {
  allEventData = data // Store for filtering
  // Get unique event types
  const eventTypes = Array.from(new Set(data.map(ev => ev.eventType))).sort()
  // Generate checkboxes with legend icons using a CSS grid layout
  eventTypeFilterDiv.innerHTML = ''
  // Add a style block for the grid if not already present
  if (!document.getElementById('eventTypeFilterGridStyle')) {
    const style = document.createElement('style')
    style.id = 'eventTypeFilterGridStyle'
    style.innerHTML = `
      #eventTypeFilters {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px 16px;
        align-items: center;
        margin-bottom: 8px;
      }
      .event-type-filter-item {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 2px 0;
        min-width: 0;
        white-space: nowrap;
      }
      .event-type-filter-item img {
        filter: grayscale(1) brightness(1.1) contrast(1.1);
      }
    `
    document.head.appendChild(style)
  }
  eventTypes.forEach((type, idx) => {
    const id = `eventType_${idx}`
    // Determine icon path
    let iconPath = ''
    // List of event types that use Events_General (png/svg)
    const generalTypes = [
      'Relocation', 'System_Sim_Status', 'Sleep', 'Death', 'Letter', 'Moving_In', 'Choice'
    ]
    // List of event types that use Events_General PNG
    const pngTypes = ['Relocation', 'System_Sim_Status', 'Moving_In', 'Sell', 'Mock']
    if (generalTypes.includes(type)) {
      if (pngTypes.includes(type)) {
        iconPath = `../../src/image/Events_General/${type}.png`
      } else {
        iconPath = `../../src/image/Events_General/${type}.svg`
      }
    } else {
      // Otherwise, use Interaction_Events SVG
      iconPath = `../../src/image/Interaction_Events/${type}.svg`
    }
    eventTypeFilterDiv.innerHTML += `
      <label class="event-type-filter-item" for="${id}">
        <input type="checkbox" id="${id}" name="eventTypes" value="${type}" checked>
        <img src="${iconPath}" alt="${type}" style="width:20px;height:20px;vertical-align:middle;object-fit:contain;">
        <span>${type}</span>
      </label>
    `
  })
  // Add event listener for real-time filtering
  eventTypeFilterDiv.addEventListener('change', () => {
    // Get checked event types
    const checkedTypes = Array.from(
      document.querySelectorAll('input[name="eventTypes"]:checked')
    ).map(cb => cb.value)
    console.log('Filter changed, checked types:', checkedTypes)
    // Redraw events with only checked types
    if (window._drawEventsFilter) {
      window._drawEventsFilter(checkedTypes)
    } else {
      console.warn('window._drawEventsFilter is not defined')
    }
  })
})

main('Match11/simsTestFull.json')

// Initialise json files
const jsonRead = d3Fetch.json('../../data/json/Match11/sims2.json') // Info of match
const jsonReadTwo = d3Fetch.json(
  '../../data/json/Match11/Story_Events_DataFull.json'
)

// Screen Width and Height
const width = 5000
const height = 1080

// We need to set the total timestamp first
// Sections decide how the interval of timeline display
let totalTimestamp
let lastTimestamp = null

// Canvas Origin
let xOrigin = 350,
  yOrigin = 60


let playerColour = {
  Player1: '#000080', // changed
  Player2: '#00B8D1',
  Player3: '#006400', // changed
  Player4: '#5BB58A',
  Player5: '#9B8BD6',
  Player6: '#ff0000',
  Player7: '#ba000d',
  Player8: '#ff94c2',
  Player9: '#FF7F00', // changed
  Player10: '#ffd149',
}

// Save location info for later use
let locationSet

let mySvg = $('#mySvg')[0]

let pt = mySvg.createSVGPoint()

const svg = Snap('#mySvg')
svg.attr({ viewBox: '0 0 14000 1200' })

// --- Zoom and Pan Logic ---
let viewBox = { x: 0, y: 0, w: 14000, h: 1200 }
let minZoom = 0.1
let maxZoom = 10
let zoomStep = 1.1
let lastTouchDist = null
let isPanning = false
let panStart = { x: 0, y: 0 }
let panViewBoxStart = { x: 0, y: 0 }

function setViewBox(x, y, w, h) {
  viewBox.x = x
  viewBox.y = y
  viewBox.w = w
  viewBox.h = h
  svg.attr({ viewBox: `${x} ${y} ${w} ${h}` })
}

function zoomAt(cx, cy, scale) {
  // cx, cy: client coordinates
  // scale: zoom factor (>1 zoom in, <1 zoom out)
  // Convert client to SVG coordinates
  let pt = mySvg.createSVGPoint()
  pt.x = cx
  pt.y = cy
  let svgPt = pt.matrixTransform(mySvg.getScreenCTM().inverse())
  // Calculate new viewBox
  let newW = viewBox.w / scale
  let newH = viewBox.h / scale
  // Clamp zoom
  let zoomLevel = 14000 / newW
  if (zoomLevel < minZoom) {
    newW = 14000 / minZoom
    newH = 1200 / minZoom
  }
  if (zoomLevel > maxZoom) {
    newW = 14000 / maxZoom
    newH = 1200 / maxZoom
  }
  // Keep svgPt at same position in new viewBox
  let newX = svgPt.x - ((svgPt.x - viewBox.x) / viewBox.w) * newW
  let newY = svgPt.y - ((svgPt.y - viewBox.y) / viewBox.h) * newH
  setViewBox(newX, newY, newW, newH)
}

function resetZoom() {
  setViewBox(0, 0, 14000, 1200)
}

// Mouse wheel and touchpad pinch zoom
mySvg.addEventListener('wheel', function(e) {
  // Only zoom if ctrlKey (touchpad pinch) or if not horizontal scroll
  if (e.ctrlKey || Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    e.preventDefault()
    let scale = e.deltaY < 0 ? zoomStep : 1 / zoomStep
    zoomAt(e.clientX, e.clientY, scale)
  }
}, { passive: false })

// Touch pinch zoom
mySvg.addEventListener('touchstart', function(e) {
  if (e.touches.length === 2) {
    lastTouchDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
  } else if (e.touches.length === 1) {
    isPanning = true
    panStart.x = e.touches[0].clientX
    panStart.y = e.touches[0].clientY
    panViewBoxStart.x = viewBox.x
    panViewBoxStart.y = viewBox.y
  }
})

mySvg.addEventListener('touchmove', function(e) {
  if (e.touches.length === 2) {
    e.preventDefault()
    let newDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    )
    if (lastTouchDist) {
      let scale = newDist / lastTouchDist
      zoomAt(
        (e.touches[0].clientX + e.touches[1].clientX) / 2,
        (e.touches[0].clientY + e.touches[1].clientY) / 2,
        scale
      )
    }
    lastTouchDist = newDist
  } else if (e.touches.length === 1 && isPanning) {
    e.preventDefault()
    let dx = e.touches[0].clientX - panStart.x
    let dy = e.touches[0].clientY - panStart.y
    let scaleX = viewBox.w / mySvg.clientWidth
    let scaleY = viewBox.h / mySvg.clientHeight
    setViewBox(
      panViewBoxStart.x - dx * scaleX,
      panViewBoxStart.y - dy * scaleY,
      viewBox.w,
      viewBox.h
    )
  }
}, { passive: false })

mySvg.addEventListener('touchend', function(e) {
  if (e.touches.length < 2) {
    lastTouchDist = null
  }
  if (e.touches.length === 0) {
    isPanning = false
  }
})

/* --- Mouse drag pan with hand/cursor toggle --- */
let isMousePanning = false
let mousePanStart = { x: 0, y: 0 }
let mousePanViewBoxStart = { x: 0, y: 0 }
mySvg.addEventListener('mousedown', function(e) {
  // Only allow pan if hand mode is ON
  if (window._panMode && e.button === 0) {
    isMousePanning = true
    mousePanStart.x = e.clientX
    mousePanStart.y = e.clientY
    mousePanViewBoxStart.x = viewBox.x
    mousePanViewBoxStart.y = viewBox.y
    mySvg.style.cursor = 'grabbing'
    e.preventDefault()
  }
})
window.addEventListener('mousemove', function(e) {
  if (isMousePanning) {
    let dx = e.clientX - mousePanStart.x
    let dy = e.clientY - mousePanStart.y
    let scaleX = viewBox.w / mySvg.clientWidth
    let scaleY = viewBox.h / mySvg.clientHeight
    setViewBox(
      mousePanViewBoxStart.x - dx * scaleX,
      mousePanViewBoxStart.y - dy * scaleY,
      viewBox.w,
      viewBox.h
    )
  }
})
window.addEventListener('mouseup', function(e) {
  if (isMousePanning) {
    isMousePanning = false
    // Restore hand cursor if still in hand mode
    if (window._panMode) {
      mySvg.style.cursor = 'grab'
    } else {
      mySvg.style.cursor = 'default'
    }
  }
})

/* --- Expose zoom and reset for buttons --- */
window.resetZoom = resetZoom
window.zoomByButton = function(scale) {
  // Zoom at centre of SVG viewport
  const rect = mySvg.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  zoomAt(cx, cy, scale)
}


async function main(fileName) {
  const iStorylineInstance = new iStoryline()
  const fileUrl = `../../data/${fileName.split('.')[1]}/${fileName}`
  let graph = await iStorylineInstance.loadFile(fileUrl)
  let dbSCANData
  // console.log(graph)

  // Read Json through the Promise and save participants data

  let participantsInfoData = await jsonRead.then(function(result) {
    return result['info']['participants']
  })

  let participantsInfo = []

  for (const element of participantsInfoData) {
    participantsInfo.push(element['participantId'], element['championName'])
  }

  // Scale to window size
  const containerDom = document.getElementById('mySvg')
  const windowW = containerDom.clientWidth - 20
  const windowH = containerDom.clientHeight - 20
  // graph = iStorylineInstance.scale(80, 10, windowW / 1.2 , windowH / 1.5)
  graph = iStorylineInstance.scale(xOrigin, yOrigin, width*2, height)

  // logStoryInfo(iStorylineInstance._story)

  const session = iStorylineInstance._story._tableMap.get('session')._mat._data

  const characters = graph.characters

  locationSet = iStorylineInstance._story._locations

  const storylines = graph.storylines

  // Timestamp
  const timestamps = iStorylineInstance._story._timeStamps
  totalTimestamp = timestamps[timestamps.length - 1]

  console.log('Match Length: ' + timeStamp(totalTimestamp))

  // convert the last timestamp into minutes

  let min = Math.floor((totalTimestamp / 1000 / 60) << 0),
    sec = Math.floor((totalTimestamp / 1000) % 60)

  // console.log(min + ':' + sec)

  const perTimeStamp = totalTimestamp / 10 //divided by 10

  let perMin = Math.floor((perTimeStamp / 1000 / 60) << 0),
    perSec = Math.floor((perTimeStamp / 1000) % 60)

  // console.log('Per timestamp: ' + perMin + ':' + perSec)

  // timeline()

  storylines.forEach((storyline, idx) => {
    drawStoryline(
      characters[idx],
      storyline,
      session,
      locationSet,
      perTimeStamp,
      participantsInfo
    )
  })

  // Provide a global function for filter UI to call
  window._drawEventsFilter = function(filterTypes) {
    drawEvents(graph, participantsInfo, filterTypes)
  }

  // Initial draw (all types)
  await drawEvents(graph, participantsInfo)

  // await timelineX(graph)

  $('#tip').remove()

  return iStorylineInstance
}


function timeStamp(perTimestamp) {
  let perMin = Math.floor((perTimestamp / 1000 / 60) << 0)
  return perMin + ' Min'
}

// Utility function to parse hh:mm:ss.SSS to seconds
function parseTimeToSeconds(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length !== 3) return 0;
  const [hh, mm, ss] = parts;
  return (
    parseInt(hh, 10) * 3600 +
    parseInt(mm, 10) * 60 +
    parseFloat(ss.replace(',', '.'))
  );
}

// Get video clip range from event object and optional range (default 5s)
function getVideoClipRangeFromEvent(eventObj, rangeSec = 5) {
  const center = parseTimeToSeconds(eventObj.originalTime);
  return {
    start: Math.max(center - rangeSec, 0),
    end: center + rangeSec
  };
}

async function drawEvents(graph, participantsInfo, filterTypes = null) {
  // --- Improved: Use a dedicated SVG group for all event icons/lines ---
  // Create or select a single group for all event elements
  let eventsGroup = svg.select('#events-group')
  if (!eventsGroup) {
    eventsGroup = svg.group().attr({ id: 'events-group' })
    // Ensure it's on top
    svg.append(eventsGroup)
  } else {
    // Remove all children (icons, lines, etc)
    while (eventsGroup.node.firstChild) {
      eventsGroup.node.removeChild(eventsGroup.node.firstChild)
    }
  }

  // Remove any old event-icon-group and mock-event-dotted-line elements outside the group (legacy)
  svg.selectAll('.event-icon-group').forEach(function(g) { g.remove() })
  svg.selectAll('.mock-event-dotted-line').forEach(function(g) { g.remove() })

  // Use allEventData if available, otherwise fallback to jsonReadTwo
  let dataPromise = allEventData.length
    ? Promise.resolve(allEventData)
    : jsonReadTwo

  await dataPromise.then(function(result) {
    const data = result

    // --- Draw dotted lines for paired Mock events ---
    // Only draw if 'Mock' is in filterTypes (or if filterTypes is null/undefined)
    let showMockLines = !filterTypes || filterTypes.includes('Mock')
    // --- New logic: group-based vertical dotted line for each Mock event ---
    if (showMockLines) {
      let mockEvents = []
      for (let i = 0; i < data.length; i++) {
        if (data[i]['eventType'] === 'Mock') {
          mockEvents.push({
            idx: i,
            interactor: data[i]['interactor'],
            interactee: data[i]['interactee'],
            timestamp: data[i]['timestamp'],
            interactorID: data[i]['interactorID'],
            interacteeID: data[i]['interacteeID'],
          })
        }
      }
      // For each Mock event, collect all participant positions (interactor + interactees)
      for (let i = 0; i < mockEvents.length; i++) {
        const ev = mockEvents[i]
        const timestamp = ev.timestamp
        // Always treat interactee/interacteeID as arrays
        let interacteeArr = Array.isArray(ev.interacteeID) ? ev.interacteeID : [ev.interacteeID]
        let allIDs = [ev.interactorID, ...interacteeArr]
        let allPlayers = allIDs.map(id => 'Player' + String(id))
        let points = allPlayers.map(pid => [
          graph.getCharacterX(pid, timestamp),
          graph.getCharacterY(pid, timestamp)
        ])
        // Sort by y (vertical) position
        points.sort((a, b) => a[1] - b[1])
        // Draw vertical dotted line connecting all points
        for (let j = 0; j < points.length - 1; j++) {
          // Draw lines inside the eventsGroup
          eventsGroup.line(points[j][0], points[j][1], points[j+1][0], points[j+1][1])
            .attr({
              stroke: '#222',
              'stroke-width': 2,
              'stroke-dasharray': '6,6',
              class: 'mock-event-dotted-line'
            })
        }
      }
    }
    // --- End new group-based dotted line logic ---

    for (let i in data) {
      let eventType = data[i]['eventType']
      if (filterTypes && !filterTypes.includes(eventType)) continue // Filter out unwanted types

      // let posX = data[i]['position']['x']
      // let posY = data[i]['position']['y']
      let interactee = data[i]['interactee']
      let interactor = data[i]['interactor']

      let border

      let interacteeText, interactorText

      let interacteeIcon, interactorIcon

      let interactorBorder

      let eventInfo

      let interacteeNameElement, interactorNameElement

      // General visualizations with icons and tooltips + video
      if (eventType === 'Relocation' || eventType === 'System_Sim_Status') {
        const iconSize = 30
        const offset = iconSize / 2

        let playerIndex = data[i]['interactorID']
        let currentTimestamp = data[i]['timestamp']
        let currentPlayer = 'Player' + String(playerIndex)

        let eventDetails = data[i]['eventDetails']

        let deathPosX = graph.getCharacterX(currentPlayer, currentTimestamp)
        let deathPosY = graph.getCharacterY(currentPlayer, currentTimestamp)

        // Player Icon
        let indexHolder = currentPlayer.match(/\d/g)
        indexHolder = indexHolder.join('')

        eventsGroup
          .image(
            `../../src/image/Events_General/${eventType}.png`,
            deathPosX - offset,
            deathPosY - offset,
            iconSize,
            iconSize
          )
          .attr({ class: 'event-icon-group' })
          .hover(
            event => {
              pt.x = event.clientX
              pt.y = event.clientY

              pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

              // Offset tooltip so it does not appear under the cursor
              let tipX = pt.x + 20
              let tipY = pt.y + 20

              if (tipY >= 950) {
                tipY -= 70
              }

              if (tipX >= 5700) {
                tipX -= 220
              }

              currentPlayer = 'Player' + String(playerIndex)

              let length

              if (calculateBorderLength(eventDetails, 50) <= 370) {
                length = 380
              } else {
                length = calculateBorderLength(eventDetails, 50)
              }

              // --- Calculate dynamic tooltip height based on all elements ---
              // Padding
              const padding = 0.02
              // Heights of elements
              const textHeight = 28 // "Interactor" text
              const iconHeight = 40 // icon
              const iconMargin = 15 // margin between text and icon
              const borderMargin = 20 // margin between icon and border
              const detailsHeight = 60 // eventDetails (foreignObject)
              const videoHeight = 180 // video (approx, will be scaled)
              // Calculate total height
              let tooltipContentHeight = textHeight + iconMargin + iconHeight + borderMargin + detailsHeight + borderMargin + videoHeight
              let tooltipHeight = tooltipContentHeight * (1 + 2 * padding)
              // Limit tooltip width to 600px max
              let tooltipWidth = Math.min(length, 600)
              border = svg.rect(tipX, tipY, tooltipWidth, tooltipHeight, 10, 10).attr({
                stroke: 'black',
                fill: 'rgba(255,255,255, 0.9)',
                strokeWidth: '3px',
              })

              // Remove any existing wrapper before creating a new one
              let oldWrapper = document.getElementById(
                'relocation-tooltip-wrapper'
              )
              if (oldWrapper) {
                let oldVideo = oldWrapper.querySelector(
                  '#relocation-tooltip-video'
                )
                if (oldVideo) oldVideo.pause()
                oldWrapper.remove()
              }

              // Add video element to tooltip, positioned and scaled to match SVG border
              let wrapper = document.createElement('div')
              wrapper.style.position = 'fixed'
              wrapper.setAttribute('id', 'relocation-tooltip-wrapper')
              wrapper.style.zIndex = 1000
              wrapper.style.pointerEvents = 'none'
              wrapper.style.overflow = 'hidden'
              wrapper.style.scrollbarWidth = 'none'
              wrapper.style.msOverflowStyle = 'none'

              // Get the SVG border's bounding box in SVG coordinates
              let borderBBox = border.node.getBBox()
              // Convert SVG coordinates to screen coordinates
              let ctm = mySvg.getScreenCTM()
              // Top-left corner
              let svgX = borderBBox.x
              let svgY = borderBBox.y
              let svgW = borderBBox.width
              let svgH = borderBBox.height
              // Transform to screen coordinates
              let topLeft = mySvg.createSVGPoint()
              topLeft.x = svgX
              topLeft.y = svgY
              topLeft = topLeft.matrixTransform(ctm)
              // Bottom-right corner
              let bottomRight = mySvg.createSVGPoint()
              bottomRight.x = svgX + svgW
              bottomRight.y = svgY + svgH
              bottomRight = bottomRight.matrixTransform(ctm)
              // Calculate width/height in screen space
              let screenW = bottomRight.x - topLeft.x
              let screenH = bottomRight.y - topLeft.y
              // Set wrapper position and size
              wrapper.style.left = `${topLeft.x}px`
              wrapper.style.top = `${topLeft.y}px`
              wrapper.style.width = `${screenW}px`
              wrapper.style.height = `${screenH}px`

              // Double the video size and centre it horizontally in the tooltip
              let videoW = 320
              let videoH = 180
              // Calculate horizontal centre (with respect to left/right padding)
              let videoLeft = (screenW - videoW) / 2
              let videoTop = (textHeight + iconMargin + iconHeight + borderMargin + detailsHeight + borderMargin) * (screenH / tooltipHeight) + screenH * 0.02

              let video = document.createElement('video')
              video.src = '../../src/video/sims4.mp4'
              video.width = videoW
              video.height = videoH
              video.controls = true
              video.autoplay = true
              video.loop = true
              video.muted = true
              video.setAttribute('id', 'relocation-tooltip-video')
              video.style.pointerEvents = 'auto'
              video.style.background = 'black'
              video.style.position = 'absolute'
              video.style.left = `${videoLeft}px`
              video.style.top = `${videoTop}px`
              video.style.width = `${videoW}px`
              video.style.height = `${videoH}px`
              video.style.borderRadius = '8px'
              video.style.objectFit = 'cover'

              // Clip video to play only within the calculated range and loop
              const videoRange = getVideoClipRangeFromEvent(data[i], 5); // use the current event object
              video.addEventListener('loadedmetadata', function() {
                // Clamp end to video duration if needed
                const end = Math.min(videoRange.end, video.duration);
                video.currentTime = videoRange.start;
                video._clipStart = videoRange.start;
                video._clipEnd = end;
                const playPromise = video.play();
                if (playPromise !== undefined) {
                  playPromise.catch(e => {
                    console.warn('Autoplay play() failed:', e);
                  });
                }
              });
              video.addEventListener('timeupdate', function() {
                // Loop only within the clip range
                if (video.currentTime < video._clipStart || video.currentTime >= video._clipEnd) {
                  video.currentTime = video._clipStart;
                  video.play();
                }
              });

              wrapper.appendChild(video)
              document.body.appendChild(wrapper)

              // Place text, icon, and eventDetails above the video
              interactorText = svg.text(
                35 + tipX,
                25 + tipY,
                'Interactor: ' + interactor
              )

              interactorIcon = svg.image(
                `../../src/image/Characters/${interactor}.png`,
                38 + tipX,
                40 + tipY,
                40,
                40
              )

              // Draw eventDetails as a single line
              // Use foreignObject for word-wrapping eventDetails
              let foreign = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
              foreign.setAttribute('x', 35 + tipX)
              foreign.setAttribute('y', 35 + 50 + 20 + tipY)
              foreign.setAttribute('width', 530) // 600 - 2*35 margin
              foreign.setAttribute('height', 320)
              let div = document.createElement('div')
              div.style.maxWidth = '530px'
              div.style.wordBreak = 'break-word'
              div.style.whiteSpace = 'pre-wrap'
              div.style.fontSize = '18px'
              div.style.fontFamily = 'inherit'
              div.style.color = '#222'
              div.textContent = eventDetails
              foreign.appendChild(div)
              mySvg.appendChild(foreign)
              interactorNameElement = {
                remove: () => foreign.remove()
              }

              interactorBorder = svg.rect(35 + tipX, 37 + tipY, 46, 46).attr({
                fill: 'none',
                stroke: `${playerColour[currentPlayer]}`,
                'stroke-width': '3',
                opacity: 0.7,
              })
            },
            () => {
              border.remove()
              interactorText.remove()
              interactorIcon.remove()
              interactorNameElement.remove()
              interactorBorder.remove()
              // Remove the video wrapper if it exists
              let wrapper = document.getElementById(
                'relocation-tooltip-wrapper'
              )
              if (wrapper) {
                let video = wrapper.querySelector('#relocation-tooltip-video')
                if (video) {
                  video.pause()
                }
                wrapper.remove()
              }
            }
          )
      }

      // interactive events (colour-coded) with icons and tooltips (no video)
      if (eventType === 'Chat' || eventType === 'Cloudgazing' ||
        eventType === 'Photo_Taking' || eventType === 'Playing_Chess' ||
        eventType === 'Cooking' || eventType === 'Eating'||
        eventType === 'Social_Invite' || eventType === 'Listening_Music' ||
        eventType === 'Dancing' || eventType === 'Sleep' || eventType === 'Sell'||
        eventType === 'Letter' || eventType === 'Contact')
      {
        const iconSize = 30
        const offset = iconSize / 2

        let playerIndex = data[i]['interactorID']
        let currentTimestamp = data[i]['timestamp']
        let currentPlayer = 'Player' + String(playerIndex)

        let eventDetails = data[i]['eventDetails']

        let deathPosX = graph.getCharacterX(currentPlayer, currentTimestamp)
        let deathPosY = graph.getCharacterY(currentPlayer, currentTimestamp)

        // Player Icon
        let indexHolder = currentPlayer.match(/\d/g)
        indexHolder = indexHolder.join('')

        // Use Snap.svg to load the SVG, set fill, then place at correct position
        Snap.load(
          `../../src/image/Interaction_Events/${eventType}.svg`,
          function(f) {
            // Remove all fill attributes from the SVG to ensure full override
            f.selectAll('*').forEach(function(el) {
              el.attr({ fill: null })
            })
            // Set fill for all paths/shapes in the SVG
            f.selectAll(
              'path, rect, circle, ellipse, polygon, polyline'
            ).forEach(function(el) {
              el.attr({ fill: playerColour[currentPlayer] || '#000' ,
                "fill-opacity": 0.7, stoke: '#000', "stroke-opacity": 1.0
              })
            })
            // Create a group for the icon
            let g = eventsGroup.group()
            g.append(f)
            // Set the icon to the correct size and position
            g.transform('')
            g.attr({
              transform: `translate(${deathPosX - offset},${deathPosY -
              offset})`,
              class: 'event-icon-group',
            })
            // Set the bounding box to the correct size
            g.selectAll('svg').forEach(function(svgEl) {
              svgEl.attr({ width: iconSize, height: iconSize })
            })
            // Add hover behaviour as before
            g.hover(
              event => {
                pt.x = event.clientX
                pt.y = event.clientY

                pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

                // Offset tooltip so it does not appear under the cursor
                let tipX = pt.x + 20
                let tipY = pt.y + 20

                if (tipY >= 950) {
                  tipY -= 70
                }

                if (tipX >= 5700) {
                  tipX -= 220
                }

                currentPlayer = 'Player' + String(playerIndex)

                let length

                if (calculateBorderLength(eventDetails, 50) < 250) {
                  length = 250
                } else {
                  length = calculateBorderLength(eventDetails, 50)
                }

                // Limit tooltip width to 600px max
                let tooltipWidth = Math.min(length, 600)
                border = svg.rect(tipX, tipY, tooltipWidth, 180, 10, 10).attr({
                  stroke: 'black',
                  fill: 'rgba(255,255,255, 0.9)',
                  strokeWidth: '3px',
                })

                interacteeText = svg.text(130 + tipX, 25 + tipY, 'Interactee: ')
                interactorText = svg.text(35 + tipX, 25 + tipY, 'Interactor: ')

                interacteeIcon = svg.image(
                  `../../src/image/Characters/${interactee}.png`,
                  133 + tipX,
                  41 + tipY,
                  40,
                  40
                )

                interactorIcon = svg.image(
                  `../../src/image/Characters/${interactor}.png`,
                  38 + tipX,
                  40 + tipY,
                  40,
                  40
                )

                // Add coloured borders for interactor and interactee (like Relocation)
                let interactorBorder = svg.rect(38 + tipX, 40 + tipY, 40, 40).attr({
                  fill: 'none',
                  stroke: playerColour[currentPlayer] || '#000',
                  'stroke-width': '3',
                  opacity: 0.7,
                })
                // Try to get interactee player colour
                let interacteePlayerIndex = data[i]['interacteeID']
                let interacteePlayer = 'Player' + String(interacteePlayerIndex)
                let interacteeBorder = svg.rect(133 + tipX, 41 + tipY, 40, 40).attr({
                  fill: 'none',
                  stroke: playerColour[interacteePlayer] || '#000',
                  'stroke-width': '3',
                  opacity: 0.7,
                })

                interacteeNameElement = svg.text(
                  130 + tipX,
                  35 + 50 + 20 + tipY,
                  interactee
                )

                interactorNameElement = svg.text(
                  35 + tipX,
                  35 + 50 + 20 + tipY,
                  interactor
                )

                // Use foreignObject for word-wrapping eventDetails
                let foreign = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
                foreign.setAttribute('x', 35 + tipX)
                foreign.setAttribute('y', 35 + 50 + 20 + tipY + 45)
                foreign.setAttribute('width', 530)
                foreign.setAttribute('height', 60)
                let div = document.createElement('div')
                div.style.maxWidth = '530px'
                div.style.wordBreak = 'break-word'
                div.style.whiteSpace = 'pre-wrap'
                div.style.fontSize = '18px'
                div.style.fontFamily = 'inherit'
                div.style.color = '#222'
                div.textContent = eventDetails
                foreign.appendChild(div)
                mySvg.appendChild(foreign)
                eventInfo = {
                  remove: () => foreign.remove()
                }
              },
              () => {
                border.remove()
                interacteeText.remove()
                interacteeIcon.remove()
                interactorText.remove()
                interactorIcon.remove()
                // Remove the new borders if present
                let allRects = svg.selectAll('rect')
                if (allRects && allRects.length) {
                  // Remove only the last two (the borders we just added)
                  allRects[allRects.length - 1].remove()
                  allRects[allRects.length - 2].remove()
                }
                interacteeNameElement.remove()
                interactorNameElement.remove()
                eventInfo.remove()
              }
            )
          }
        )
      }

      // interactive events (colour-coded) with icons and tooltips (special case for Choice)
      if (eventType === 'Choice')
      {
        const iconSize = 30
        const offset = iconSize / 2

        let playerIndex = data[i]['interactorID']
        let currentTimestamp = data[i]['timestamp']
        let currentPlayer = 'Player' + String(playerIndex)

        let eventDetails = data[i]['eventDetails']

        let deathPosX = graph.getCharacterX(currentPlayer, currentTimestamp)
        let deathPosY = graph.getCharacterY(currentPlayer, currentTimestamp)

        // Player Icon
        let indexHolder = currentPlayer.match(/\d/g)
        indexHolder = indexHolder.join('')

        // --- Add SVG filter for glow effect if not already present ---
        let defs = svg.select('defs');
        if (!defs) {
          defs = svg.paper.el('defs');
          svg.append(defs);
        }
        let glowFilterId = 'choice-glow-filter';
        let existingGlow = defs.select(`#${glowFilterId}`);
        if (!existingGlow) {
          let filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
          filter.setAttribute('id', glowFilterId);
          filter.setAttribute('x', '-40%');
          filter.setAttribute('y', '-40%');
          filter.setAttribute('width', '180%');
          filter.setAttribute('height', '180%');
          let feGaussian = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
          feGaussian.setAttribute('in', 'SourceGraphic');
          feGaussian.setAttribute('stdDeviation', '4');
          feGaussian.setAttribute('result', 'blur');
          filter.appendChild(feGaussian);
          let feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
          let feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
          feMergeNode1.setAttribute('in', 'blur');
          let feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
          feMergeNode2.setAttribute('in', 'SourceGraphic');
          feMerge.appendChild(feMergeNode1);
          feMerge.appendChild(feMergeNode2);
          filter.appendChild(feMerge);
          defs.node.appendChild(filter);
        }

        // Use Snap.svg to load the SVG, set fill, then place at correct position
        Snap.load(
          `../../src/image/Interaction_Events/${eventType}.svg`,
          function(f) {
            // Remove all fill attributes from the SVG to ensure full override
            f.selectAll('*').forEach(function(el) {
              el.attr({ fill: null })
            })
            // Set fill for all paths/shapes in the SVG
            f.selectAll(
              'path, rect, circle, ellipse, polygon, polyline'
            ).forEach(function(el) {
              el.attr({ fill: playerColour[currentPlayer] || '#000' })
            })
            // Create a group for the icon
            let g = eventsGroup.group()
            g.append(f)
            // Set the icon to the correct size and position
            g.transform('')
            g.attr({
              transform: `translate(${deathPosX - offset},${deathPosY -
              offset})`,
              class: 'event-icon-group',
            })
            // Set the bounding box to the correct size
            g.selectAll('svg').forEach(function(svgEl) {
              svgEl.attr({ width: iconSize, height: iconSize })
            })
            // Add hover behaviour as before, with glow effect
            g.hover(
              event => {
                // --- Add glow filter on hover ---
                g.attr({ filter: `url(#${glowFilterId})` });

                pt.x = event.clientX
                pt.y = event.clientY

                pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

                // Offset tooltip so it does not appear under the cursor
                let tipX = pt.x + 20
                let tipY = pt.y + 20

                if (tipY >= 950) {
                  tipY -= 70
                }

                if (tipX >= 5700) {
                  tipX -= 220
                }

                currentPlayer = 'Player' + String(playerIndex)

                // --- Consistent tooltip width, height, and word-wrapping for Choice event ---
                let length
                if (calculateBorderLength(eventDetails, 50) < 250) {
                  length = 250
                } else {
                  length = calculateBorderLength(eventDetails, 50)
                }
                // Limit tooltip width to 600px max
                let tooltipWidth = Math.min(length, 600)
                // Calculate tooltip height considering all elements (like other events)
                const padding = 0.02
                const labelHeight = 28 // "Interactor:" and "Interactee:" text
                const iconHeight = 40 // icon
                const iconMargin = 15 // margin between text and icon
                const borderMargin = 20 // margin between icon and border
                const nameHeight = 28 // interactee/interactor name text
                const nameMargin = 10 // margin between icon and name
                const detailsHeight = 60 // eventDetails (foreignObject)
                // Total: 2 label lines, 2 icons, 2 name lines, margins, details
                let tooltipContentHeight =
                  // Top labels
                  labelHeight +
                  // Icon row
                  iconMargin + iconHeight +
                  // Name row
                  nameMargin + nameHeight +
                  // Details row
                  borderMargin + detailsHeight +
                  // Bottom margin
                  borderMargin;
                let tooltipHeight = tooltipContentHeight * (1 + 2 * padding)
                border = svg.rect(tipX, tipY, tooltipWidth, tooltipHeight, 10, 10).attr({
                  stroke: 'black',
                  fill: 'rgba(255,255,255, 0.9)',
                  strokeWidth: '3px',
                })

                interacteeText = svg.text(130 + tipX, 25 + tipY, 'Interactee: ')
                interactorText = svg.text(35 + tipX, 25 + tipY, 'Interactor: ')

                interacteeIcon = svg.image(
                  `../../src/image/Characters/${interactee}.png`,
                  133 + tipX,
                  41 + tipY,
                  40,
                  40
                )

                interactorIcon = svg.image(
                  `../../src/image/Characters/${interactor}.png`,
                  38 + tipX,
                  40 + tipY,
                  40,
                  40
                )

                // Add coloured borders for interactor and interactee (like Relocation)
                let interactorBorder = svg.rect(38 + tipX, 40 + tipY, 40, 40).attr({
                  fill: 'none',
                  stroke: playerColour[currentPlayer] || '#000',
                  'stroke-width': '3',
                  opacity: 0.7,
                })
                // Try to get interactee player colour
                let interacteePlayerIndex = data[i]['interacteeID']
                let interacteePlayer = 'Player' + String(interacteePlayerIndex)
                let interacteeBorder = svg.rect(133 + tipX, 41 + tipY, 40, 40).attr({
                  fill: 'none',
                  stroke: playerColour[interacteePlayer] || '#000',
                  'stroke-width': '3',
                  opacity: 0.7,
                })

                interacteeNameElement = svg.text(
                  130 + tipX,
                  35 + 50 + 20 + tipY,
                  interactee
                )

                interactorNameElement = svg.text(
                  35 + tipX,
                  35 + 50 + 20 + tipY,
                  interactor
                )

                // Use foreignObject for word-wrapping eventDetails (like other events)
                let foreign = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
                foreign.setAttribute('x', 35 + tipX)
                foreign.setAttribute('y', 35 + 50 + 20 + tipY + 45)
                foreign.setAttribute('width', 530)
                foreign.setAttribute('height', 60)
                let div = document.createElement('div')
                div.style.maxWidth = '530px'
                div.style.wordBreak = 'break-word'
                div.style.whiteSpace = 'pre-wrap'
                div.style.fontSize = '18px'
                div.style.fontFamily = 'inherit'
                div.style.color = '#222'
                div.textContent = eventDetails
                foreign.appendChild(div)
                mySvg.appendChild(foreign)
                eventInfo = {
                  remove: () => foreign.remove()
                }
              },
              () => {
                // --- Remove glow filter on mouseleave ---
                g.attr({ filter: null });

                border.remove()
                interacteeText.remove()
                interacteeIcon.remove()
                interactorText.remove()
                interactorIcon.remove()
                // Remove the new borders if present
                let allRects = svg.selectAll('rect')
                if (allRects && allRects.length) {
                  // Remove only the last two (the borders we just added)
                  allRects[allRects.length - 1].remove()
                  allRects[allRects.length - 2].remove()
                }
                interacteeNameElement.remove()
                interactorNameElement.remove()
                eventInfo.remove()
              }
            )

            // Add click behaviour for modal video overlay
            g.click(function(event) {
              // Remove any existing overlay
              let oldOverlay = document.getElementById('choice-modal-overlay')
              if (oldOverlay) {
                let oldVideo = oldOverlay.querySelector('#choice-modal-video')
                if (oldVideo) oldVideo.pause()
                oldOverlay.remove()
              }

              // Create overlay
              let overlay = document.createElement('div')
              overlay.setAttribute('id', 'choice-modal-overlay')
              overlay.style.position = 'fixed'
              overlay.style.left = '0'
              overlay.style.top = '0'
              overlay.style.width = '100vw'
              overlay.style.height = '100vh'
              overlay.style.background = 'rgba(80,80,80,0.7)'
              overlay.style.zIndex = 2000
              overlay.style.display = 'flex'
              overlay.style.alignItems = 'center'
              overlay.style.justifyContent = 'center'

              // Modal content container
              let modal = document.createElement('div')
              modal.style.position = 'relative'
              modal.style.background = 'rgba(255,255,255,0.95)'
              modal.style.borderRadius = '16px'
              modal.style.boxShadow = '0 4px 32px rgba(0,0,0,0.2)'
              modal.style.padding = '0'
              modal.style.display = 'flex'
              modal.style.flexDirection = 'column'
              modal.style.alignItems = 'center'
              modal.style.justifyContent = 'center'
              modal.style.width = '90vw'
              modal.style.height = '80vh'
              modal.style.maxWidth = '90vw'
              modal.style.maxHeight = '80vh'
              modal.style.minWidth = '320px'
              modal.style.minHeight = '180px'

              // Close button
              let closeBtn = document.createElement('button')
              closeBtn.innerText = '×'
              closeBtn.style.position = 'absolute'
              closeBtn.style.top = '12px'
              closeBtn.style.right = '18px'
              closeBtn.style.fontSize = '2.2rem'
              closeBtn.style.background = 'transparent'
              closeBtn.style.border = 'none'
              closeBtn.style.cursor = 'pointer'
              closeBtn.style.color = '#333'
              closeBtn.style.zIndex = 10
              closeBtn.setAttribute('aria-label', 'Close')
              closeBtn.addEventListener('click', function() {
                let overlay = document.getElementById('choice-modal-overlay')
                if (overlay) {
                  let video = overlay.querySelector('#choice-modal-video')
                  if (video) video.pause()
                  overlay.remove()
                }
              })

              // Video element
              let video = document.createElement('video')
              video.src = '../../src/video/sims4.mp4'
              video.controls = true
              video.autoplay = true
              video.loop = true
              video.muted = true
              video.setAttribute('id', 'choice-modal-video')
              video.style.pointerEvents = 'auto'
              video.style.background = 'black'
              video.style.borderRadius = '12px'
              video.style.width = '100%'
              video.style.height = '100%'
              video.style.margin = '0'
              video.style.objectFit = 'contain'

              // Clip video to play only within the calculated range and loop
              const videoRange = getVideoClipRangeFromEvent(data[i], 5)
              video.addEventListener('loadedmetadata', function() {
                // Clamp end to video duration if needed
                const end = Math.min(videoRange.end, video.duration)
                video.currentTime = videoRange.start
                video._clipStart = videoRange.start
                video._clipEnd = end
                const playPromise = video.play()
                if (playPromise !== undefined) {
                  playPromise.catch(e => {
                    console.warn('Autoplay play() failed:', e)
                  })
                }
              })
              video.addEventListener('timeupdate', function() {
                // Loop only within the clip range
                if (video.currentTime < video._clipStart || video.currentTime >= video._clipEnd) {
                  video.currentTime = video._clipStart
                  video.play()
                }
              })

              // Add close on clicking outside modal
              overlay.addEventListener('mousedown', function(e) {
                if (e.target === overlay) {
                  let video = overlay.querySelector('#choice-modal-video')
                  if (video) video.pause()
                  overlay.remove()
                }
              })

              // Add content to modal
              modal.appendChild(closeBtn)
              modal.appendChild(video)
              overlay.appendChild(modal)
              document.body.appendChild(overlay)
            })
          }
        )
      }

      // draw rectangle with gradient fill for Moving_In event
      if (eventType === 'Moving_In') {
        // Rectangle size
        const rectWidth = 30
        const rectHeight = 70

        let playerIndex = data[i]['interactorID']
        let currentTimestamp = data[i]['timestamp']
        let currentPlayer = 'Player' + String(playerIndex)

        let eventDetails = data[i]['eventDetails']

        let deathPosX = graph.getCharacterX(currentPlayer, currentTimestamp)
        let deathPosY = graph.getCharacterY(currentPlayer, currentTimestamp)

        // Gradient definition
        // Remove any previous gradient with same id to avoid duplicates
        let gradId = `movingin-gradient-${playerIndex}`
        // Remove any existing gradient with this id in <defs>
        let defs = svg.select('defs');
        if (!defs) {
          defs = svg.paper.el('defs');
          svg.append(defs);
        }
        let oldGrad = defs.select(`#${gradId}`);
        if (oldGrad) {
          oldGrad.remove();
        }
        // Create a proper SVG linearGradient element
        let gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', gradId);
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '0%');
        // Start colour stop
        let stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', playerColour[currentPlayer]);
        stop1.setAttribute('stop-opacity', '0.7');
        // End transparent stop
        let stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', playerColour[currentPlayer]);
        stop2.setAttribute('stop-opacity', '0');
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.node.appendChild(gradient);

        // Draw the rectangle with gradient fill
        let rect = eventsGroup
          .rect(
            deathPosX - rectWidth / 2,
            deathPosY - rectHeight / 2,
            rectWidth,
            rectHeight,
            8, // rx for rounded corners
            8  // ry for rounded corners
          )
          .attr({
            fill: `url(#${gradId})`,
            class: 'event-icon-group'
          })

        rect.hover(
          event => {
            pt.x = event.clientX
            pt.y = event.clientY

            pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

            // Offset tooltip so it does not appear under the cursor
            let tipX = pt.x + 20
            let tipY = pt.y + 20

            if (tipY >= 950) {
              tipY -= 70
            }

            if (tipX >= 5700) {
              tipX -= 220
            }

            currentPlayer = 'Player' + String(playerIndex)

            let length

            if (calculateBorderLength(eventDetails, 50) < 250) {
              length = 250
            } else {
              length = calculateBorderLength(eventDetails, 50)
            }

            // Limit tooltip width to 600px max
            let tooltipWidth = Math.min(length, 600)
            border = svg.rect(tipX, tipY, tooltipWidth, 125, 10, 10).attr({
              stroke: 'black',
              fill: 'rgba(255,255,255, 0.9)',
              strokeWidth: '3px',
            })

            interactorText = svg.text(
              35 + tipX,
              25 + tipY,
              'Interactor: ' + interactor
            )

            interactorIcon = svg.image(
              `../../src/image/Characters/${interactor}.png`,
              38 + tipX,
              40 + tipY,
              40,
              40
            )

            // Draw eventDetails as a single line
            interactorNameElement = svg.text(
              35 + tipX,
              35 + 50 + 20 + tipY,
              eventDetails
            );

            interactorBorder = svg.rect(35 + tipX, 37 + tipY, 46, 46).attr({
              fill: 'none',
              stroke: `${playerColour[currentPlayer]}`,
              'stroke-width': '3',
              opacity: 0.7,
            })
          },
          () => {
            border.remove()
            interactorText.remove()
            interactorIcon.remove()
            interactorNameElement.remove()
            interactorBorder.remove()
          }
        )
      }

      // this contains the logic for connecting events with multiple participants
      if (eventType === 'Mock') {
        // Rectangle size
        const rectWidth = 15
        const rectHeight = 20

        let playerIndex = data[i]['interactorID']
        let currentTimestamp = data[i]['timestamp']
        let currentPlayer = 'Player' + String(playerIndex)
        let eventDetails = data[i]['eventDetails']

        // Always treat interactee/interacteeID as arrays
        let interacteeArr = Array.isArray(data[i]['interacteeID']) ? data[i]['interacteeID'] : [data[i]['interacteeID']]
        let interacteeNameArr = Array.isArray(data[i]['interactee']) ? data[i]['interactee'] : [data[i]['interactee']]
        // Collect all participants: interactor + interactees
        let allIDs = [data[i]['interactorID'], ...interacteeArr]
        let allNames = [data[i]['interactor'], ...interacteeNameArr]
        let allPlayers = allIDs.map(id => 'Player' + String(id))
        let allRects = []
        for (let k = 0; k < allPlayers.length; k++) {
          let posX = graph.getCharacterX(allPlayers[k], currentTimestamp)
          let posY = graph.getCharacterY(allPlayers[k], currentTimestamp)
          // Pattern definition for black stripes
          let patternId = 'mock-stripes-pattern'
          let defs = svg.select('defs');
          if (!defs) {
            defs = svg.paper.el('defs');
            svg.append(defs);
          }
          let oldPattern = defs.select(`#${patternId}`);
          if (oldPattern) {
            oldPattern.remove();
          }
          let pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
          pattern.setAttribute('id', patternId);
          pattern.setAttribute('patternUnits', 'userSpaceOnUse');
          pattern.setAttribute('width', '8');
          pattern.setAttribute('height', '8');
          let stripe1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          stripe1.setAttribute('x', '0');
          stripe1.setAttribute('y', '0');
          stripe1.setAttribute('width', '8');
          stripe1.setAttribute('height', '8');
          stripe1.setAttribute('fill', 'white');
          pattern.appendChild(stripe1);
          let line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          line.setAttribute('d', 'M0,0 l10,10');
          line.setAttribute('stroke', 'black');
          line.setAttribute('stroke-width', '2');
          pattern.appendChild(line);
          defs.node.appendChild(pattern);
          // Draw the rectangle with pattern fill
          let rect = eventsGroup
            .rect(
              posX - rectWidth / 2,
              posY - rectHeight / 2,
              rectWidth,
              rectHeight,
              8, // rx for rounded corners
              8  // ry for rounded corners
            )
            .attr({
              fill: `url(#${patternId})`,
              class: 'event-icon-group'
            })
          // Add hover for each rectangle
          rect.hover(
            event => {
              pt.x = event.clientX
              pt.y = event.clientY
              pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())
              let tipX = pt.x
              let tipY = pt.y
              if (pt.y >= 950) tipY -= 50
              if (pt.x >= 5700) tipX -= 200

              // --- Relocation-style tooltip layout for Mock event ---
              let length = calculateBorderLength(eventDetails, 50) <= 370 ? 380 : calculateBorderLength(eventDetails, 50)
              // Padding
              const padding = 0.02
              // Heights of elements
              const textHeight = 28 // "Character Involved" text
              const iconHeight = 40 // icon
              const iconMargin = 15 // margin between text and icon
              const borderMargin = 20 // margin between icon and border
              const detailsHeight = 60 // eventDetails (foreignObject)
              const videoHeight = 180 // video (approx, will be scaled)
              // Calculate total height
              let tooltipContentHeight = textHeight + iconMargin + iconHeight + borderMargin + detailsHeight + borderMargin + videoHeight
              let tooltipHeight = tooltipContentHeight * (1 + 2 * padding)
              // Limit tooltip width to 600px max
              let tooltipWidth = Math.min(length, 600)
              border = svg.rect(tipX, tipY, tooltipWidth, tooltipHeight, 10, 10).attr({
                stroke: 'black',
                fill: 'rgba(255,255,255, 0.9)',
                strokeWidth: '3px',
              })

              // Remove any existing wrapper before creating a new one
              let oldWrapper = document.getElementById(
                'relocation-tooltip-wrapper'
              )
              if (oldWrapper) {
                let oldVideo = oldWrapper.querySelector(
                  '#relocation-tooltip-video'
                )
                if (oldVideo) oldVideo.pause()
                oldWrapper.remove()
              }

              // Add video element to tooltip, positioned and scaled to match SVG border
              let wrapper = document.createElement('div')
              wrapper.style.position = 'fixed'
              wrapper.setAttribute('id', 'relocation-tooltip-wrapper')
              wrapper.style.zIndex = 1000
              wrapper.style.pointerEvents = 'none'
              wrapper.style.overflow = 'hidden'
              wrapper.style.scrollbarWidth = 'none'
              wrapper.style.msOverflowStyle = 'none'

              // Get the SVG border's bounding box in SVG coordinates
              let borderBBox = border.node.getBBox()
              // Convert SVG coordinates to screen coordinates
              let ctm = mySvg.getScreenCTM()
              // Top-left corner
              let svgX = borderBBox.x
              let svgY = borderBBox.y
              let svgW = borderBBox.width
              let svgH = borderBBox.height
              // Transform to screen coordinates
              let topLeft = mySvg.createSVGPoint()
              topLeft.x = svgX
              topLeft.y = svgY
              topLeft = topLeft.matrixTransform(ctm)
              // Bottom-right corner
              let bottomRight = mySvg.createSVGPoint()
              bottomRight.x = svgX + svgW
              bottomRight.y = svgY + svgH
              bottomRight = bottomRight.matrixTransform(ctm)
              // Calculate width/height in screen space
              let screenW = bottomRight.x - topLeft.x
              let screenH = bottomRight.y - topLeft.y
              // Set wrapper position and size
              wrapper.style.left = `${topLeft.x}px`
              wrapper.style.top = `${topLeft.y}px`
              wrapper.style.width = `${screenW}px`
              wrapper.style.height = `${screenH}px`

              // Use a fixed small size for the video, matching a 16:9 aspect ratio (e.g. 160x90)
              let videoW = 320
              let videoH = 180
              // Centre horizontally in the tooltip
              let videoLeft = (screenW - videoW) / 2
              let videoTop = (textHeight + iconMargin + iconHeight + borderMargin + detailsHeight + borderMargin) * (screenH / tooltipHeight) + screenH * 0.02

              let video = document.createElement('video')
              video.src = '../../src/video/sims4.mp4'
              video.width = videoW
              video.height = videoH
              video.controls = true
              video.autoplay = true
              video.loop = true
              video.muted = true
              video.setAttribute('id', 'relocation-tooltip-video')
              video.style.pointerEvents = 'auto'
              video.style.background = 'black'
              video.style.position = 'absolute'
              video.style.left = `${videoLeft}px`
              video.style.top = `${videoTop}px`
              video.style.width = `${videoW}px`
              video.style.height = `${videoH}px`
              video.style.borderRadius = '8px'
              video.style.objectFit = 'cover'

              // Clip video to play only within the calculated range and loop
              const videoRange = getVideoClipRangeFromEvent(data[i], 5); // use the current event object
              video.addEventListener('loadedmetadata', function() {
                // Clamp end to video duration if needed
                const end = Math.min(videoRange.end, video.duration);
                video.currentTime = videoRange.start;
                video._clipStart = videoRange.start;
                video._clipEnd = end;
                const playPromise = video.play();
                if (playPromise !== undefined) {
                  playPromise.catch(e => {
                    console.warn('Autoplay play() failed:', e);
                  });
                }
              });
              video.addEventListener('timeupdate', function() {
                // Loop only within the clip range
                if (video.currentTime < video._clipStart || video.currentTime >= video._clipEnd) {
                  video.currentTime = video._clipStart;
                  video.play();
                }
              });

              wrapper.appendChild(video)
              document.body.appendChild(wrapper)

              // Place text, icon, and eventDetails above the video
              interactorText = svg.text(
                35 + tipX,
                25 + tipY,
                'Character Involved: ' + allNames[k]
              )

              interactorIcon = svg.image(
                `../../src/image/Characters/${allNames[k]}.png`,
                38 + tipX,
                40 + tipY,
                40,
                40
              )

              // Draw eventDetails as a single line
              // Use foreignObject for word-wrapping eventDetails
              let foreign = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
              foreign.setAttribute('x', 35 + tipX)
              foreign.setAttribute('y', 35 + 50 + 20 + tipY)
              foreign.setAttribute('width', 530) // 600 - 2*35 margin
              foreign.setAttribute('height', 320)
              let div = document.createElement('div')
              div.style.maxWidth = '530px'
              div.style.wordBreak = 'break-word'
              div.style.whiteSpace = 'pre-wrap'
              div.style.fontSize = '18px'
              div.style.fontFamily = 'inherit'
              div.style.color = '#222'
              div.textContent = eventDetails
              foreign.appendChild(div)
              mySvg.appendChild(foreign)
              interactorNameElement = {
                remove: () => foreign.remove()
              }

              // Set border color to match storyline color for this character
              let storylineColor = playerColour[allPlayers[k]] || '#222';
              interactorBorder = svg.rect(35 + tipX, 37 + tipY, 46, 46).attr({
                fill: 'none',
                stroke: storylineColor,
                'stroke-width': '3',
                opacity: 0.7,
              })

              // Remove tooltip on mouseleave (standard behaviour)
            },
            () => {
              // Remove the tooltip and video wrapper immediately on mouseleave
              if (border) border.remove();
              if (interactorText) interactorText.remove();
              if (interactorIcon) interactorIcon.remove();
              if (interactorNameElement) interactorNameElement.remove();
              if (interactorBorder) interactorBorder.remove();
              let wrapper = document.getElementById('relocation-tooltip-wrapper');
              if (wrapper) {
                let video = wrapper.querySelector('#relocation-tooltip-video');
                if (video) video.pause();
                wrapper.remove();
              }
            }
          )
          allRects.push(rect)
        }
        // No need to draw lines here; handled above for all participants
      }

      // different size for death icon + video in tooltip
      if (eventType === 'Death') {
        const iconSize = 50
        const offset = iconSize / 2

        let playerIndex = data[i]['interactorID']
        let currentTimestamp = data[i]['timestamp']
        let currentPlayer = 'Player' + String(playerIndex)

        let eventDetails = data[i]['eventDetails']

        let deathPosX = graph.getCharacterX(currentPlayer, currentTimestamp)
        let deathPosY = graph.getCharacterY(currentPlayer, currentTimestamp)

        // console.log(eventDetails, deathPosX, deathPosY)

        // Player Icon
        let indexHolder = currentPlayer.match(/\d/g)
        indexHolder = indexHolder.join('')

        eventsGroup
          .image(
            `../../src/image/Events_General/${eventType}.svg`,
            deathPosX - offset,
            deathPosY - offset,
            iconSize,
            iconSize
          )
          .attr({ class: 'event-icon-group' })
          .hover(
            event => {
              pt.x = event.clientX
              pt.y = event.clientY

              pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

              // Offset tooltip so it does not appear under the cursor
              let tipX = pt.x + 20
              let tipY = pt.y + 20

              if (tipY >= 950) {
                tipY -= 70
              }

              if (tipX >= 5700) {
                tipX -= 220
              }

              currentPlayer = 'Player' + String(playerIndex)

              let length

              if (calculateBorderLength(eventDetails, 50) < 250) {
                length = 250
              } else {
                length = calculateBorderLength(eventDetails, 50)
              }

              // backup arg with minimap - tipX, tipY, 250, 325, 10, 10
              // Limit tooltip width to 600px max
              let tooltipWidth = Math.min(length, 600)
              border = svg.rect(tipX, tipY, tooltipWidth, 400, 10, 10).attr({
                stroke: 'black',
                fill: 'rgba(255,255,255, 0.9)',
                strokeWidth: '3px',
              })

              // interacteeText = svg.text(130 + tipX, 25 + tipY, 'Interactee: ')
              interactorText = svg.text(
                35 + tipX,
                25 + tipY,
                'Interactor: ' + interactor
              )

              interactorIcon = svg.image(
                `../../src/image/Characters/${interactor}.png`,
                38 + tipX,
                40 + tipY,
                40,
                40
              )

              interactorBorder = svg.rect(35 + tipX, 37 + tipY, 46, 46).attr({
                fill: 'none',
                stroke: `${playerColour[currentPlayer]}`,
                'stroke-width': '3',
                opacity: 0.7,
              })

              // Remove any existing wrapper before creating a new one
              let oldWrapper = document.getElementById(
                'relocation-tooltip-wrapper'
              )
              if (oldWrapper) {
                let oldVideo = oldWrapper.querySelector(
                  '#relocation-tooltip-video'
                )
                if (oldVideo) oldVideo.pause()
                oldWrapper.remove()
              }

              // Add video element to tooltip, positioned and scaled to match SVG border
              // Remove any existing wrapper before creating a new one
              let wrapper = document.createElement('div')
              wrapper.style.position = 'fixed'
              wrapper.setAttribute('id', 'relocation-tooltip-wrapper')
              wrapper.style.zIndex = 1000
              wrapper.style.pointerEvents = 'none'
              wrapper.style.overflow = 'hidden'
              wrapper.style.scrollbarWidth = 'none'
              wrapper.style.msOverflowStyle = 'none'

              // Get the SVG border's bounding box in SVG coordinates
              let borderBBox = border.node.getBBox()
              // Convert SVG coordinates to screen coordinates
              let ctm = mySvg.getScreenCTM()
              // Top-left corner
              let svgX = borderBBox.x
              let svgY = borderBBox.y
              let svgW = borderBBox.width
              let svgH = borderBBox.height
              // Transform to screen coordinates
              let topLeft = mySvg.createSVGPoint()
              topLeft.x = svgX
              topLeft.y = svgY
              topLeft = topLeft.matrixTransform(ctm)
              // Bottom-right corner
              let bottomRight = mySvg.createSVGPoint()
              bottomRight.x = svgX + svgW
              bottomRight.y = svgY + svgH
              bottomRight = bottomRight.matrixTransform(ctm)
              // Calculate width/height in screen space
              let screenW = bottomRight.x - topLeft.x
              let screenH = bottomRight.y - topLeft.y
              // Set wrapper position and size
              wrapper.style.left = `${topLeft.x}px`
              wrapper.style.top = `${topLeft.y}px`
              wrapper.style.width = `${screenW}px`
              wrapper.style.height = `${screenH}px`

              // Calculate video size and position (2% padding on each side)
              let videoW = screenW * 0.96
              let videoH = screenH * 0.96
              let videoLeft = screenW * 0.2
              let videoTop = screenH * 0.35

              let video = document.createElement('video')
              video.src = '../../src/video/sims4.mp4'
              video.controls = true
              video.autoplay = true
              video.loop = true
              video.muted = true
              video.setAttribute('id', 'relocation-tooltip-video')
              video.style.pointerEvents = 'auto'
              video.style.background = 'black'
              video.style.position = 'absolute'
              video.style.left = `${videoLeft}px`
              video.style.top = `${videoTop}px`
              video.style.width = `${videoW*0.6}px`
              video.style.height = `${videoH*0.6}px`
              video.style.borderRadius = '8px'

              // Clip video to play only within the calculated range and loop
              const videoRange = getVideoClipRangeFromEvent(data[i], 5); // use the current event object
              video.addEventListener('loadedmetadata', function() {
                // Clamp end to video duration if needed
                const end = Math.min(videoRange.end, video.duration);
                video.currentTime = videoRange.start;
                video._clipStart = videoRange.start;
                video._clipEnd = end;
                const playPromise = video.play();
                if (playPromise !== undefined) {
                  playPromise.catch(e => {
                    console.warn('Autoplay play() failed:', e);
                  });
                }
              });
              video.addEventListener('timeupdate', function() {
                // Loop only within the clip range
                if (video.currentTime < video._clipStart || video.currentTime >= video._clipEnd) {
                  video.currentTime = video._clipStart;
                  video.play();
                }
              });

              wrapper.appendChild(video)
              document.body.appendChild(wrapper)

              // Draw eventDetails as a single line
              // Use foreignObject for word-wrapping eventDetails
              let foreign = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
              foreign.setAttribute('x', 35 + tipX)
              foreign.setAttribute('y', 35 + 50 + 20 + tipY)
              foreign.setAttribute('width', 530)
              foreign.setAttribute('height', 320)
              let div = document.createElement('div')
              div.style.maxWidth = '530px'
              div.style.wordBreak = 'break-word'
              div.style.whiteSpace = 'pre-wrap'
              div.style.fontSize = '18px'
              div.style.fontFamily = 'inherit'
              div.style.color = '#222'
              div.textContent = eventDetails
              foreign.appendChild(div)
              mySvg.appendChild(foreign)
              interactorNameElement = {
                remove: () => foreign.remove()
              }
            },
            () => {
              border.remove()
              interactorText.remove()
              interactorIcon.remove()
              interactorNameElement.remove()
              interactorBorder.remove()
              // Remove the video wrapper if it exists
              let wrapper = document.getElementById(
                'relocation-tooltip-wrapper'
              )
              if (wrapper) {
                let video = wrapper.querySelector('#relocation-tooltip-video')
                if (video) {
                  video.pause()
                }
                wrapper.remove()
              }
            }
          )
      }

      // different style for letter icon: glow on hover, modal "letter" on click
      if (eventType === 'Letter')
      {
        const iconSize = 40
        const offset = iconSize / 2

        let playerIndex = data[i]['interactorID']
        let currentTimestamp = data[i]['timestamp']
        let currentPlayer = 'Player' + String(playerIndex)

        let eventDetails = data[i]['eventDetails']

        let deathPosX = graph.getCharacterX(currentPlayer, currentTimestamp)
        let deathPosY = graph.getCharacterY(currentPlayer, currentTimestamp)

        // --- Add SVG filter for glow effect if not already present ---
        let defs = svg.select('defs');
        if (!defs) {
          defs = svg.paper.el('defs');
          svg.append(defs);
        }
        let glowFilterId = 'letter-glow-filter';
        let existingGlow = defs.select(`#${glowFilterId}`);
        if (!existingGlow) {
          let filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
          filter.setAttribute('id', glowFilterId);
          filter.setAttribute('x', '-40%');
          filter.setAttribute('y', '-40%');
          filter.setAttribute('width', '180%');
          filter.setAttribute('height', '180%');
          let feGaussian = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
          feGaussian.setAttribute('in', 'SourceGraphic');
          feGaussian.setAttribute('stdDeviation', '4');
          feGaussian.setAttribute('result', 'blur');
          filter.appendChild(feGaussian);
          let feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
          let feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
          feMergeNode1.setAttribute('in', 'blur');
          let feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
          feMergeNode2.setAttribute('in', 'SourceGraphic');
          feMerge.appendChild(feMergeNode1);
          feMerge.appendChild(feMergeNode2);
          filter.appendChild(feMerge);
          defs.node.appendChild(filter);
        }

        // Use Snap.svg to load the SVG, set fill, then place at correct position
        Snap.load(
          `../../src/image/Interaction_Events/${eventType}.svg`,
          function(f) {
            // Remove all fill attributes from the SVG to ensure full override
            f.selectAll('*').forEach(function(el) {
              el.attr({ fill: null })
            })
            // Set fill for all paths/shapes in the SVG
            f.selectAll(
              'path, rect, circle, ellipse, polygon, polyline'
            ).forEach(function(el) {
              el.attr({ fill: playerColour[currentPlayer] || '#000' ,
                "fill-opacity": 0.7, stoke: '#000', "stroke-opacity": 1.0
              })
            })
            // Create a group for the icon
            let g = eventsGroup.group()
            g.append(f)
            // Set the icon to the correct size and position
            g.transform('')
            g.attr({
              transform: `translate(${deathPosX - offset},${deathPosY -
              offset})`,
              class: 'event-icon-group',
            })
            // Set the bounding box to the correct size
            g.selectAll('svg').forEach(function(svgEl) {
              svgEl.attr({ width: iconSize, height: iconSize })
            })
            // Add glow on hover, remove on mouseleave
            g.hover(
              () => {
                g.attr({ filter: `url(#${glowFilterId})` });
              },
              () => {
                g.attr({ filter: null });
              }
            )
            // On click, show modal "letter" layout
            g.click(function(event) {
              // Remove any existing overlay
              let oldOverlay = document.getElementById('letter-modal-overlay')
              if (oldOverlay) {
                oldOverlay.remove()
              }

              // Create overlay
              let overlay = document.createElement('div')
              overlay.setAttribute('id', 'letter-modal-overlay')
              overlay.style.position = 'fixed'
              overlay.style.left = '0'
              overlay.style.top = '0'
              overlay.style.width = '100vw'
              overlay.style.height = '100vh'
              overlay.style.background = 'rgba(80,80,80,0.7)'
              overlay.style.zIndex = 2000
              overlay.style.display = 'flex'
              overlay.style.alignItems = 'center'
              overlay.style.justifyContent = 'center'

              // Modal content container styled as a letter
              let modal = document.createElement('div')
              modal.style.position = 'relative'
              modal.style.background = 'linear-gradient(135deg, #fffbe6 90%, #f7ecd0 100%)'
              modal.style.borderRadius = '18px'
              modal.style.boxShadow = '0 4px 32px rgba(0,0,0,0.18)'
              modal.style.padding = '48px 36px 36px 36px'
              modal.style.display = 'flex'
              modal.style.flexDirection = 'column'
              modal.style.alignItems = 'center'
              modal.style.justifyContent = 'flex-start'
              modal.style.width = 'min(90vw, 520px)'
              modal.style.maxWidth = '95vw'
              modal.style.minWidth = '320px'
              modal.style.minHeight = '220px'
              modal.style.border = '2px solid #e2c48d'
              modal.style.fontFamily = '"Georgia", "Times New Roman", serif'
              modal.style.position = 'relative'
              modal.style.overflow = 'visible'

              // Add a "fold" effect at the top
              let fold = document.createElement('div')
              fold.style.position = 'absolute'
              fold.style.top = '0'
              fold.style.left = '0'
              fold.style.width = '100%'
              fold.style.height = '32px'
              fold.style.background = 'linear-gradient(180deg, #f7ecd0 60%, #fffbe6 100%)'
              fold.style.borderTopLeftRadius = '18px'
              fold.style.borderTopRightRadius = '18px'
              fold.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
              fold.style.zIndex = 1
              modal.appendChild(fold)

              // "Last Will Letter" heading
              let heading = document.createElement('div')
              heading.innerText = 'THE LAST WILL AND TESTAMENT OF THE FAMILY'+"'"+'S ESTATE'
              heading.style.fontWeight = 'bold'
              heading.style.fontSize = '2.1rem'
              heading.style.letterSpacing = '0.08em'
              heading.style.marginBottom = '4px'
              heading.style.marginTop = '18px'
              heading.style.color = '#b08d57'
              heading.style.textShadow = '0 1px 0 #fffbe6'
              heading.style.zIndex = 2
              heading.style.width = '100%'
              heading.style.textAlign = 'center'
              heading.style.display = 'block'
              modal.appendChild(heading)

              // Letter content (immediately after title)
              let letterContent = document.createElement('div')
              letterContent.innerText = eventDetails
              letterContent.style.fontSize = '1.25rem'
              letterContent.style.lineHeight = '1.7'
              letterContent.style.color = '#5a4a2c'
              letterContent.style.background = 'rgba(255,255,255,0.7)'
              letterContent.style.padding = '18px 16px'
              letterContent.style.borderRadius = '10px'
              letterContent.style.boxShadow = '0 1px 4px rgba(200,180,120,0.08)'
              letterContent.style.marginBottom = '24px'
              letterContent.style.marginTop = '0'
              letterContent.style.whiteSpace = 'pre-wrap'
              letterContent.style.wordBreak = 'break-word'
              letterContent.style.zIndex = 2
              letterContent.style.width = '100%'
              letterContent.style.display = 'block'
              modal.appendChild(letterContent)

              // Close button
              let closeBtn = document.createElement('button')
              closeBtn.innerText = '×'
              closeBtn.style.position = 'absolute'
              closeBtn.style.top = '12px'
              closeBtn.style.right = '18px'
              closeBtn.style.fontSize = '2.2rem'
              closeBtn.style.background = 'transparent'
              closeBtn.style.border = 'none'
              closeBtn.style.cursor = 'pointer'
              closeBtn.style.color = '#b08d57'
              closeBtn.style.zIndex = 10
              closeBtn.setAttribute('aria-label', 'Close')
              closeBtn.addEventListener('click', function() {
                let overlay = document.getElementById('letter-modal-overlay')
                if (overlay) {
                  overlay.remove()
                }
              })
              modal.appendChild(closeBtn)

              // Add close on clicking outside modal
              overlay.addEventListener('mousedown', function(e) {
                if (e.target === overlay) {
                  overlay.remove()
                }
              })

              overlay.appendChild(modal)
              document.body.appendChild(overlay)
            })
          }
        )
      }

      lastTimestamp = data[i]['timestamp']
    }
  })
}
