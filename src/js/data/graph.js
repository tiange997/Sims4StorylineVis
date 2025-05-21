import { STYLE_LABELS } from '../utils/CONSTANTS'
/**
 * @types
 * Story Space
 *  - StoryNode: [x, y]
 *  - StoryNodeID: string
 *  - StorySegment: Node[]
 *  - StorySegmentID: string
 *  - Storyline: Segment[]
 *  - StorylineName: string
 *  - StorylineID: string
 *  - Time: number
 *  - TimeSpan: [t1, t2]
 *  - TimeRange: TimeSpan[]
 *  - LocationID: number
 *  - LocationName: string
 *  - LocationColor: string
 *  - Session:
 *    - SessionID: number
 *    - LocationName: string
 *    - Characters: StorylineID[]
 *    - SessionMap: Map
 *      - StorylineID => TimeSpan
 * Visual Space
 *  - Graph:
 *    - nodes: StorySegment[]
 *    - nodes: Storyline[]
 *    - smoothNodes: Storyline[]
 *    - sketchNodes: Storyline[]
 */
export class Graph {
  constructor(story) {
    this._story = story
    this._style = []
    this._nodes = []
    this._paths = []
    this._session = this.getTable('session')
    this._keyTimeframe = this._story._timeStamps
    this._keyTimeframe2X = this._story._timeStamps2X
    const characterTable = this.getTable('character')
    const positionTable = this.getTable('position')
    const pathTable = this.getTable('path')
    const styleTable = this.getTable('style')
    const rows = this.getTableRows()
    const cols = this.getTableCols()
    for (let row = 0; row < rows; row++) {
      let segments = []
      let segmentPaths = []
      for (let col = 0; col < cols; col++) {
        let characterStatus = characterTable.value(row, col)
        if (characterStatus > 0) {
          // storyline nodes
          let positionId = positionTable.value(row, col)
          let segment = this._story._positions[positionId]
          segments.push(segment)
          // storyline paths
          let pathId = pathTable.value(row, col)
          let path = this._story._paths[pathId]
          segmentPaths.push(path)
          // storyline style
          let styleId = styleTable.value(row, col)
          let styleLabel = STYLE_LABELS[styleId]
          if (styleLabel !== 'Normal') {
            this._style.push({
              name: story.characters[row],
              segmentID: segments.length - 1,
              type: styleLabel,
            })
          }
        }
      }
      if (segments.length > 0) {
        this._nodes.push(segments)
      }
      if (segmentPaths.length > 0) {
        this._paths.push(segmentPaths)
      }
    }
  }

  get characters() {
    return this._story.characters
  }

  get storylines() {
    return this._nodes
  }

  get paths() {
    return this._paths
  }

  get style() {
    return this._style
  }

  get timeline() {
    return this._keyTimeframe
  }

  get timelineGuide() {
    return this._keyTimeframe2X
  }

  get locations() {
    return this._story.locations
  }

  getTable(tableName) {
    return this._story.getTable(tableName)
  }

  getTableRows() {
    return this._story.getTableRows()
  }

  getTableCols() {
    return this._story.getTableCols()
  }

  /**
   * Get the x pos of the specified render node.
   *
   * @param {Number} storyNodeID
   * @param {Number} storySegmentID
   * @param {Number} storylineID
   *
   * @return X
   */
  getStoryNodeX(storyNodeID, storySegmentID, storylineID) {
    return this._nodes[Number(storylineID)][Number(storySegmentID)][
      Number(storyNodeID)
    ][0]
  }

  /**
   * Get the y pos of the specified render node.
   *
   * @param {Number} storyNodeID
   * @param {Number} storySegmentID
   * @param {Number} storylineID
   *
   * @return Y
   */
  getStoryNodeY(storyNodeID, storySegmentID, storylineID) {
    return this._nodes[Number(storylineID)][Number(storySegmentID)][
      Number(storyNodeID)
    ][1]
  }

  /**
   * Get the x pos of the specified character at a given time.
   * Now uses linear interpolation between the two nearest timeStamps for more accurate event placement.
   *
   * @param {String} storylineName
   * @param {Number} time
   *
   * @return X
   */
  getCharacterX(storylineName, time) {
    // Find the storyline index
    let storylineID = this.getStorylineIDByName(storylineName);
    storylineID = Number(storylineID);
    // Defensive: if storylineID is invalid, return -1
    if (storylineID < 0 || storylineID >= this._nodes.length) return -1;

    // Get the timeline (timeStamps) and the segments for this character
    const timeStamps = this._story._timeStamps;
    const segments = this._nodes[storylineID];

    // Defensive: if no segments or timeStamps, return -1
    if (!segments || !timeStamps || timeStamps.length < 2) return -1;

    // Find which segment/time interval the event time falls into
    let segIdx = -1;
    for (let i = 0; i < timeStamps.length - 1; i++) {
      if (time >= timeStamps[i] && time <= timeStamps[i + 1]) {
        segIdx = i;
        break;
      }
    }
    // If not found, clamp to first or last
    if (segIdx === -1) {
      if (time < timeStamps[0]) segIdx = 0;
      else segIdx = timeStamps.length - 2;
    }

    // Defensive: if segment does not exist, return -1
    if (!segments[segIdx] || segments[segIdx].length < 2) return -1;

    // Get the start and end node for this segment
    const startNode = segments[segIdx][0];
    const endNode = segments[segIdx][segments[segIdx].length - 1];

    // Get the start and end times
    const t0 = timeStamps[segIdx];
    const t1 = timeStamps[segIdx + 1];

    // Get the start and end X positions
    const x0 = startNode[0];
    const x1 = endNode[0];

    // Linear interpolation
    let x;
    if (t1 === t0) {
      x = x0;
    } else {
      x = x0 + ((x1 - x0) * (time - t0)) / (t1 - t0);
    }
    return x;
  }

  /**
   * Get the y pos of the specified character at a given time.
   * Now uses linear interpolation between the two nearest timeStamps for more accurate event placement.
   *
   * @param {String} storylineName
   * @param {Number} time
   *
   * @return Y
   */
  getCharacterY(storylineName, time) {
    // Find the storyline index
    let storylineID = this.getStorylineIDByName(storylineName);
    storylineID = Number(storylineID);
    // Defensive: if storylineID is invalid, return -1
    if (storylineID < 0 || storylineID >= this._nodes.length) return -1;

    // Get the timeline (timeStamps) and the segments for this character
    const timeStamps = this._story._timeStamps;
    const segments = this._nodes[storylineID];

    // Defensive: if no segments or timeStamps, return -1
    if (!segments || !timeStamps || timeStamps.length < 2) return -1;

    // Find which segment/time interval the event time falls into
    let segIdx = -1;
    for (let i = 0; i < timeStamps.length - 1; i++) {
      if (time >= timeStamps[i] && time <= timeStamps[i + 1]) {
        segIdx = i;
        break;
      }
    }
    // If not found, clamp to first or last
    if (segIdx === -1) {
      if (time < timeStamps[0]) segIdx = 0;
      else segIdx = timeStamps.length - 2;
    }

    // Defensive: if segment does not exist, return -1
    if (!segments[segIdx] || segments[segIdx].length < 2) return -1;

    // Get the start and end node for this segment
    const startNode = segments[segIdx][0];
    const endNode = segments[segIdx][segments[segIdx].length - 1];

    // Get the start and end times
    const t0 = timeStamps[segIdx];
    const t1 = timeStamps[segIdx + 1];

    // Get the start and end Y positions
    const y0 = startNode[1];
    const y1 = endNode[1];

    // Linear interpolation
    let y;
    if (t1 === t0) {
      y = y0;
    } else {
      y = y0 + ((y1 - y0) * (time - t0)) / (t1 - t0);
    }
    return y;
  }

  getPosID(storylineID, storySegmentID, time) {
    let x = this.getStoryNodeX(String(0), storySegmentID, storylineID)
    let y = this.getStoryNodeY(String(0), storySegmentID, storylineID)
    let timeSpan = this.getStoryTimeSpan(x, y)
    let ret = -1
    if (time >= timeSpan[0] && time <= timeSpan[1]) ret = 0
    return String(ret)
  }

  getStorylineIDByName(storylineName) {
    let ret = -1
    for (let i = 0; i < this.characters.length; i++) {
      if (this.characters[i] === storylineName) {
        ret = i
        break
      }
    }
    return String(ret)
  }

  /**
   * Get the id of a storyNode according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return nodeID
   */
  getStoryNodeID(x, y) {
    let minDis = 1e9
    let retID = 0
    for (let i = 0; i < this._nodes.length; i++) {
      for (let j = 0; j < this._nodes[i].length; j++) {
        for (let k = 0; k < this._nodes[i][j].length; k++) {
          let graphX = this.getStoryNodeX(String(k), String(j), String(i))
          let graphY = this.getStoryNodeY(String(k), String(j), String(i))
          if (
            (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y) <
            minDis
          ) {
            minDis = (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y)
            retID = k
          }
        }
      }
    }
    return String(retID)
  }

  /**
   * Get the id of a storySegment according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return segmentID
   */
  getStorySegmentID(x, y) {
    let minDis = 1e9
    let retID = 0
    for (let i = 0; i < this._nodes.length; i++) {
      for (let j = 0; j < this._nodes[i].length; j++) {
        for (let k = 0; k < this._nodes[i][j].length; k++) {
          let graphX = this.getStoryNodeX(String(k), String(j), String(i))
          let graphY = this.getStoryNodeY(String(k), String(j), String(i))
          if (
            (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y) <
            minDis
          ) {
            minDis = (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y)
            retID = j
          }
        }
      }
    }
    return String(retID)
  }

  /**
   * Get the id of a storyline according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return storylineID
   */
  getStorylineID(x, y) {
    let minDis = 1e9
    let retID = 0
    for (let i = 0; i < this._nodes.length; i++) {
      for (let j = 0; j < this._nodes[i].length; j++) {
        for (let k = 0; k < this._nodes[i][j].length; k++) {
          let graphX = this.getStoryNodeX(String(k), String(j), String(i))
          let graphY = this.getStoryNodeY(String(k), String(j), String(i))
          if (
            (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y) <
            minDis
          ) {
            minDis = (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y)
            retID = i
          }
        }
      }
    }
    return String(retID)
  }

  /**
   * Get the storyNode according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return storyNode
   */
  getStoryNode(x, y) {
    let retI = this.getStorylineID(x, y)
    let retJ = this.getStorySegmentID(x, y)
    let retK = this.getStoryNodeID(x, y)
    return this._nodes[Number(retI)][Number(retJ)][Number(retK)]
  }

  /**
   * Get the storySegment according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return storySegment
   */
  getStorySegment(x, y) {
    let retI = this.getStorylineID(x, y)
    let retJ = this.getStorySegmentID(x, y)
    return this._nodes[Number(retI)][Number(retJ)]
  }

  /**
   * Get the storyline according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return storyline
   */
  getStoryline(x, y) {
    if (typeof x === 'string') {
      return this._nodes[Number(x)]
    } else {
      let tmpStorylineID = this.getStorylineID(x, y)
      return this._nodes[Number(tmpStorylineID)]
    }
  }

  /**
   * Get the storyline name according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return storyline
   */
  getStorylineName(x, y) {
    let tmpStorylineID = this.getStorylineID(x, y)
    return this.characters[Number(tmpStorylineID)]
  }

  /**
   * Get the storyline index according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return storylineIndex
   */
  getStorylineIndex(x, y, state) {
    let cnt = 0
    let ret = 0
    let minDis = 1e9
    for (let i = 0; i < this._nodes.length; i++) {
      for (let j = 0; j < this._nodes[i].length; j++) {
        for (let k = 0; k < this._nodes[i][j].length; k++) {
          cnt++
          let graphX = this.getStoryNodeX(String(k), String(j), String(i))
          let graphY = this.getStoryNodeY(String(k), String(j), String(i))
          if (state === 1 && graphX > x + 1e-6) continue
          if (
            (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y) <
            minDis
          ) {
            minDis = (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y)
            ret = cnt
          }
        }
      }
    }
    return ret
  }

  /**
   * Get the timeSpan according to the given position.
   *
   * @param {Number} x
   *
   * @return timeSpan
   */
  getStoryTimeSpan(x) {
    // console.log(x, this.timelineGuide);
    let i = 0
    if (x < this._keyTimeframe2X[i]) {
      return [-1, -1]
    }
    for (; i < this._keyTimeframe2X.length - 1; i++) {
      const startX = this._keyTimeframe2X[i]
      const endX = this._keyTimeframe2X[i + 1]
      if (x >= startX && x < endX) {
        return [this._keyTimeframe[i], this._keyTimeframe[i + 1]]
      }
    }
    if (x <= this._keyTimeframe2X[i]) {
      return [this._keyTimeframe[i - 1], this._keyTimeframe[i]]
    }
    return [-1, -1]
  }

  /**
   * Get the _session id according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return locationName
   */
  getSessionID(x, y) {
    let tmp = this._session
    let name = this.getStorylineName(x, y)
    let timeSpan = this.getStoryTimeSpan(x, y)
    for (let [key, value] of tmp) {
      for (let i = 0; i < value.length; i++) {
        if (
          value[i].start <= timeSpan[0] &&
          timeSpan[1] <= value[i].end &&
          value[i].entity === name
        ) {
          return String(key)
        }
      }
    }
  }

  getStorySegmentIDByTime(storylineID, timespan) {
    for (let i = 0; i < this._nodes[Number(storylineID)].length; i++) {
      let seg = this._nodes[Number(storylineID)][i]
      let realspan = this.getStoryTimeSpan(seg[0][0], seg[0][1])
      if (timespan[0] <= realspan[0] && realspan[1] <= timespan[1]) {
        return i
      }
    }
    return -1
  }

  /**
   * Get the characters in a _session according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return characters
   */
  getCharacters(x, y) {
    let tmpSessionID = 0
    tmpSessionID = Number(this.getSessionID(x, y))
    return this._session[tmpSessionID].characters
  }
}
