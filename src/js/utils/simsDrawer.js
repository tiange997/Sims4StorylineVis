import Snap from 'snapsvg';
import $ from 'jquery';

const svg = Snap('#mySvg');
let mySvg = $('#mySvg')[0];
let pt = mySvg.createSVGPoint();

let simsCharacterInfo = {};

function setSimsPathAttributes(pathSvg, character) {
  pathSvg.attr({
    fill: 'none',
    stroke: simsCharacterInfo[character].color,
    'stroke-width': 4,
    opacity: 0.7,
  });
}

export function drawSimsSegmentPath(pathStr, character) {
  const pathSvg = svg.path(pathStr);
  setSimsPathAttributes(pathSvg, character);

  pathSvg.hover(
    () => pathSvg.attr({ 'stroke-width': 8 }),
    () => pathSvg.attr({ 'stroke-width': 4 })
  );

  return pathSvg;
}

export function drawSimsStoryline(character, storyline) {
  storyline.forEach(segment => {
    const segmentPath = generateSimplePath(segment);
    drawSimsSegmentPath(segmentPath, character);
  });
}

function generateSimplePath(points) {
  if (points.length === 0) return '';
  let pathStr = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1, len = points.length; i < len; i++) {
    pathStr += `L ${points[i][0]} ${points[i][1]}`;
  }
  return pathStr;
}
