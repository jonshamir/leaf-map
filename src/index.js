// Import CSS
require('normalize.css');
require('app/main.scss');

import * as d3 from 'd3';
import d3Tip from 'd3-tip';

import data from './data';

let svg, map, tooltip;
let xScale, yScale;
const pad = 50,
  leafSize = 44;

const X = 0,
  Y = 1,
  SCINAME = 2,
  POPNAME = 3,
  DESC = 4;

// Event listeners
let onLoad = function() {
  initMap();
  window.addEventListener('resize', renderMap);
  document
    .getElementById('close-details')
    .addEventListener('click', hideDetails);
};

function hideDetails() {
  document.getElementById('details').classList.add('hidden');
}

let leafImageSrc = sciname =>
  'assets/leaves/' + sciname.replace(' ', '_') + '.png';

function showDetails(data) {
  let detEl = document.getElementById('details');
  detEl.classList.remove('hidden');
  detEl.getElementsByClassName('popname')[0].innerHTML = data[POPNAME];
  detEl.getElementsByClassName('sciname')[0].innerHTML = data[SCINAME];
  detEl.getElementsByClassName('description')[0].innerHTML = data[DESC];
  detEl.getElementsByClassName('detail-leaf')[0].src = leafImageSrc(
    data[SCINAME]
  );
}

function initMap() {
  svg = d3.select('#map').append('svg');
  map = svg
    .call(
      d3
        .zoom()
        .scaleExtent([0.25, 3])
        .on('zoom', () => {
          tooltip.attr('class', 'd3-tip').hide();
          map.attr('transform', d3.event.transform);
        })
    )
    .append('g');

  tooltip = d3Tip()
    .attr('class', 'd3-tip')
    .html(d => {
      const sciname = d[SCINAME];
      const popname = d[POPNAME];
      return `<span class="popname">${popname}</span><br />
              <span class="sciname">${sciname}</span>`;
    })
    .offset([-15, 0]);

  svg.call(tooltip);

  // Scales
  xScale = d3
    .scaleLinear() // For the X axis
    .domain([0, d3.max(data, d => d[X])]);

  yScale = d3
    .scaleLinear() // For the Y axis
    .domain([0, d3.max(data, d => d[Y])]);

  renderMap();
}

function renderMap() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  svg.attr('width', w).attr('height', h);

  xScale.range([pad, w - pad]);
  yScale.range([h - pad, pad]);

  // Leaves
  let leaf = map
    .selectAll('.leaf')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'leaf');

  leaf
    .append('circle')
    .attr('cx', d => xScale(d[X]))
    .attr('cy', d => yScale(d[Y]))
    .attr('r', (leafSize * 2) / 3)
    .attr('fill', 'black')
    .attr('style', d => `transform-origin: ${xScale(d[X])}px ${yScale(d[Y])}px`)
    .on('mouseover', function(d) {
      tooltip.attr('class', 'd3-tip animate').show(d, this);
    })
    .on('mouseout', function(d) {
      tooltip.attr('class', 'd3-tip').hide();
    })
    .on('click', showDetails);

  leaf
    .append('svg:image')
    .attr('xlink:href', d => leafImageSrc(d[SCINAME]))
    .attr('x', d => xScale(d[X]) - leafSize / 2)
    .attr('y', d => yScale(d[Y]) - leafSize / 2)
    .attr('width', leafSize)
    .attr('height', leafSize);
}

window.addEventListener('load', onLoad);
