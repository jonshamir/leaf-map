// Import CSS
require('normalize.css');
require('app/main.scss');

import * as d3 from 'd3';
import d3Tip from 'd3-tip';

import data from './data';

let svg, map, tooltip;
let xScale, yScale;
let w = window.innerWidth;
let h = window.innerHeight;
const leafSize = 44;

const X = 0,
  Y = 1,
  SCINAME = 2,
  POPNAME = 3,
  DESC = 4;

let detailsHidden = true;
let currData = [0, 0, 0, 0];
let filterOn = false;
let currFilter;

let onLoad = function() {
  initMap();
  window.addEventListener('resize', renderMap);
  document
    .getElementById('close-details')
    .addEventListener('click', hideDetails);

  let searchInput = document.getElementById('search-input');
  let searchContainer = document.getElementsByClassName('search-input')[0];

  searchInput.addEventListener('input', filterLeaves);
  searchInput.addEventListener('focus', e =>
    searchContainer.classList.add('active')
  );
  searchInput.addEventListener('blur', e => {
    if (e.target.value.length == 0) searchContainer.classList.remove('active');
  });
};

let leafImageSrc = sciname =>
  'assets/leaves/' + sciname.replace(' ', '_') + '.png';

function partialMatch(data) {
  if (currFilter.test(data[SCINAME]) || currFilter.test(data[POPNAME])) {
    return true;
  }
  return false;
}

function filterLeaves(e) {
  const text = e.target.value;
  if (text.length > 1) {
    filterOn = true;
    currFilter = new RegExp(text, 'i');
  } else filterOn = false;

  map.selectAll('.leaf').attr('class', d => {
    if (filterOn) return partialMatch(d) ? 'leaf selected' : 'leaf fade';
    else return 'leaf';
  });
}

function hideDetails() {
  document.getElementById('details').classList.add('hidden');
  detailsHidden = true;
}

function showDetails(data) {
  if (!detailsHidden && data[SCINAME] != currData[SCINAME]) {
    document.getElementById('details').classList.add('hidden');
    setTimeout(() => revealDetails(data), 250);
  } else revealDetails(data);
  currData = data;
}

function handleZoom() {
  tooltip.attr('class', 'd3-tip').hide();
  map.attr('transform', d3.event.transform);
}

function revealDetails(data) {
  let detEl = document.getElementById('details');

  detEl.getElementsByClassName('popname')[0].innerHTML = data[POPNAME];
  detEl.getElementsByClassName('sciname')[0].innerHTML = data[SCINAME];
  detEl.getElementsByClassName('description')[0].innerHTML = data[DESC];
  detEl.getElementsByClassName('detail-leaf')[0].src = leafImageSrc(
    data[SCINAME]
  );
  detEl.classList.remove('hidden');
  detailsHidden = false;
}

function initMap() {
  svg = d3.select('#map').append('svg');
  let zoom = d3
    .zoom()
    .scaleExtent([0.25, 3])
    .on('zoom', handleZoom);
  map = svg.call(zoom).append('g');

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

  // Initial zoom
  svg.call(zoom.translateBy, w / 2, h / 2);

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
  w = window.innerWidth;
  h = window.innerHeight;
  svg.attr('width', w).attr('height', h);

  xScale.range([0, 800]);
  yScale.range([0, 800]);

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
