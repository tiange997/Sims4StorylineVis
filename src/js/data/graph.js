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
        // Log segments for this character
        console.log('--- SEGMENTS FOR CHARACTER (row index):', row, '---')
        console.log('Segments data structure:', segments)
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
   * Now uses arc-length interpolation along the polyline of the segment for accurate event placement.
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

    // Defensive: if segment does not exist, try to extend from nearest valid neighbour
    let segment = segments[segIdx];
    if (!segment || segment.length < 2) {
      // Try to extend from previous or next valid segment
      let prev = segIdx - 1;
      let next = segIdx + 1;
      // Try previous
      while (prev >= 0) {
        if (segments[prev] && segments[prev].length >= 2) {
          const p0 = segments[prev][segments[prev].length - 2];
          const p1 = segments[prev][segments[prev].length - 1];
          const dx = p1[0] - p0[0];
          const dy = p1[1] - p0[1];
          const norm = Math.sqrt(dx * dx + dy * dy) || 1;
          const extLen = Math.sqrt(dx * dx + dy * dy);
          return p1[0] + (dx / norm) * extLen;
        }
        prev--;
      }
      // Try next
      while (next < segments.length) {
        if (segments[next] && segments[next].length >= 2) {
          const p0 = segments[next][0];
          const p1 = segments[next][1];
          const dx = p1[0] - p0[0];
          const dy = p1[1] - p0[1];
          const norm = Math.sqrt(dx * dx + dy * dy) || 1;
          const extLen = Math.sqrt(dx * dx + dy * dy);
          return p0[0] - (dx / norm) * extLen;
        }
        next++;
      }
      // If still not found, warn and return -1
      console.warn(
        `[getCharacterX] Segment missing or too short for character "${storylineName}" at time ${time}. segIdx: ${segIdx}, segment:`,
        segment
      );
      return -1;
    }

    // Get the start and end times for this segment
    const t0 = timeStamps[segIdx];
    const t1 = timeStamps[segIdx + 1];

    // Calculate the proportion of time between t0 and t1
    let p;
    if (t1 === t0) {
      p = 0;
    } else {
      p = (time - t0) / (t1 - t0);
      if (p < 0) p = 0;
      if (p > 1) p = 1;
    }

    // Arc-length interpolate along the polyline of the segment
    // 1. Compute total length of the polyline
    let totalLength = 0;
    let segLengths = [];
    for (let i = 0; i < segment.length - 1; i++) {
      const dx = segment[i + 1][0] - segment[i][0];
      const dy = segment[i + 1][1] - segment[i][1];
      const len = Math.sqrt(dx * dx + dy * dy);
      segLengths.push(len);
      totalLength += len;
    }

    // 2. Find the target length along the polyline
    const targetLength = totalLength * p;

    // 3. Walk along the polyline to find the correct segment and interpolate
    let accLength = 0;
    for (let i = 0; i < segment.length - 1; i++) {
      if (accLength + segLengths[i] >= targetLength) {
        // Interpolate within this segment
        const remain = targetLength - accLength;
        const localP = segLengths[i] === 0 ? 0 : remain / segLengths[i];
        // Linear interpolate between segment[i] and segment[i+1]
        const x =
          segment[i][0] + (segment[i + 1][0] - segment[i][0]) * localP;
        return x;
      }
      accLength += segLengths[i];
    }
    // If we didn't find it (shouldn't happen), return last point's x
    return segment[segment.length - 1][0];
  }

  /**
   * Get the y pos of the specified character at a given time.
   * Now uses arc-length interpolation along the polyline of the segment for accurate event placement.
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

    // Defensive: if segment does not exist, try to extend from nearest valid neighbour
    let segment = segments[segIdx];
    if (!segment || segment.length < 2) {
      // Try to extend from previous or next valid segment
      let prev = segIdx - 1;
      let next = segIdx + 1;
      // Try previous
      while (prev >= 0) {
        if (segments[prev] && segments[prev].length >= 2) {
          const p0 = segments[prev][segments[prev].length - 2];
          const p1 = segments[prev][segments[prev].length - 1];
          const dx = p1[0] - p0[0];
          const dy = p1[1] - p0[1];
          const norm = Math.sqrt(dx * dx + dy * dy) || 1;
          const extLen = Math.sqrt(dx * dx + dy * dy);
          return p1[1] + (dy / norm) * extLen;
        }
        prev--;
      }
      // Try next
      while (next < segments.length) {
        if (segments[next] && segments[next].length >= 2) {
          const p0 = segments[next][0];
          const p1 = segments[next][1];
          const dx = p1[0] - p0[0];
          const dy = p1[1] - p0[1];
          const norm = Math.sqrt(dx * dx + dy * dy) || 1;
          const extLen = Math.sqrt(dx * dx + dy * dy);
          return p0[1] - (dy / norm) * extLen;
        }
        next++;
      }
      // If still not found, warn and return -1
      console.warn(
        `[getCharacterY] Segment missing or too short for character "${storylineName}" at time ${time}. segIdx: ${segIdx}, segment:`,
        segment
      );
      return -1;
    }

    // Get the start and end times for this segment
    const t0 = timeStamps[segIdx];
    const t1 = timeStamps[segIdx + 1];

    // Calculate the proportion of time between t0 and t1
    let p;
    if (t1 === t0) {
      p = 0;
    } else {
      p = (time - t0) / (t1 - t0);
      if (p < 0) p = 0;
      if (p > 1) p = 1;
    }

    // Arc-length interpolate along the polyline of the segment
    // 1. Compute total length of the polyline
    let totalLength = 0;
    let segLengths = [];
    for (let i = 0; i < segment.length - 1; i++) {
      const dx = segment[i + 1][0] - segment[i][0];
      const dy = segment[i + 1][1] - segment[i][1];
      const len = Math.sqrt(dx * dx + dy * dy);
      segLengths.push(len);
      totalLength += len;
    }

    // 2. Find the target length along the polyline
    const targetLength = totalLength * p;

    // 3. Walk along the polyline to find the correct segment and interpolate
    let accLength = 0;
    for (let i = 0; i < segment.length - 1; i++) {
      if (accLength + segLengths[i] >= targetLength) {
        // Interpolate within this segment
        const remain = targetLength - accLength;
        const localP = segLengths[i] === 0 ? 0 : remain / segLengths[i];
        // Linear interpolate between segment[i] and segment[i+1]
        const y =
          segment[i][1] + (segment[i + 1][1] - segment[i][1]) * localP;
        return y;
      }
      accLength += segLengths[i];
    }
    // If we didn't find it (shouldn't happen), return last point's y
    return segment[segment.length - 1][1];
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
