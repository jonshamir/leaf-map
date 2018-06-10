// Import CSS
require('normalize.css');
require('app/main.scss');

import * as d3 from 'd3';
import d3Tip from 'd3-tip';

import data from './data';

let svg, map, tooltip;
let xScale, yScale;
const pad = 50;
const leafSize = 44;

// Event listeners
let onLoad = function() {
  initMap();
  window.addEventListener('resize', renderMap);
};

function initMap() {
  svg = d3
    .select('#map') // D3 uses a jQuery like selector
    .append('svg');
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
      const sciname = d[2];
      const popname = d[3];
      return `<span class="popname">${popname}</span><br />
              <span class="sciname">${sciname}</span>`;
    })
    .offset([-15, 0]);

  svg.call(tooltip);

  // Scales
  xScale = d3
    .scaleLinear() // For the X axis
    .domain([0, d3.max(data, d => d[0])]);

  yScale = d3
    .scaleLinear() // For the Y axis
    .domain([0, d3.max(data, d => d[1])]);

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
    .attr('cx', d => xScale(d[0]))
    .attr('cy', d => yScale(d[1]))
    .attr('r', leafSize * 2 / 3)
    .attr('fill', 'black')
    .attr('style', d => `transform-origin: ${xScale(d[0])}px ${yScale(d[1])}px`)
    .on('mouseover', function(d) {
      tooltip.attr('class', 'd3-tip animate').show(d, this);
    })
    .on('mouseout', function(d) {
      tooltip.attr('class', 'd3-tip').hide();
    })
    .on('click', function(d) {
      console.log(d);
    });

  leaf
    .append('svg:image')
    .attr('xlink:href', d => 'assets/leaves/' + d[2].replace(' ', '_') + '.png')
    .attr('x', d => xScale(d[0]) - leafSize / 2)
    .attr('y', d => yScale(d[1]) - leafSize / 2)
    .attr('width', leafSize)
    .attr('height', leafSize);
}

window.addEventListener('load', onLoad);
