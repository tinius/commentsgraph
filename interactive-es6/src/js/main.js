import reqwest from 'reqwest'
import mainHTML from './text/main.html!text'
import share from './lib/share'
import d3 from 'd3'
import _ from 'lodash'
import webwewant from './webwewant.json!'
import crosswords from './crosswords.json!'
import moment from 'moment'

var data = window.location.hash === '#web' ? webwewant : crosswords;
var title = window.location.hash === '#web' ? '"The Web We Want"' : 'all crosswords';

var shareFn = share('Interactive title', 'http://gu.com/p/URL', '#Interactive');

let exp = 2

let min = 1//d3.min(data.edges.map(e => e.value))
let max = 1//d3.max(data.edges.map(e => e.value))

let width = el.offsetWidth
let height = screen.height*0.8

let force = d3.layout.force()
  .charge(-60)
  .linkDistance((l, i) => {
    return 4//linkScale(max - l.value)
  })
  .linkStrength(1)
  .gravity(0.1)
  // .linkStrength((link, i) => {
  //
  //   let val = Math.pow(exp, -link.value)
  //   //console.log(linkScale(link.value))
  //   return linkScale(val)
  // })
  .size([width, height])

// let linkScale = d3.scale.linear()
//   .domain([0, d3.max(data.edges.map(e => e.value))])
//   .range([0, 10])
//
// let opacityScale = d3.scale.linear()
//   .domain([0, d3.max(data.edges.map(e => e.value))])
//   .range([0.05, 0.6])

export function init(el, context, config, mediator) {

  el.innerHTML = ''

  let hb = d3.select(el)
    .append('div')
    .attr('id', 'header-box')

  hb
    .append('h2')
    .html('Comments on ' + title)
  hb
    .append('h3')
    .attr('id', 'timer')
    .html('')

  let svg = d3.select(el)
    .append('svg')
    .attr('height', height)
    .attr('width', width)

  let edges = svg
    .append('g')
    .attr('id', 'edges')
  let vertices = svg
    .append('g')
    .attr('id', 'vertices')

  let n = 0
  updateGraph(edges, vertices, n)
}

function updateGraph(edges, vertices, n) {

  d3.select('#timer')
    .html(moment(data[n].start).format('dddd D MMMM, HH:mm'));

  if(n>=1){
    data[n].vertices = data[n-1].vertices.concat(data[n].vertices)
    data[n].edges = data[n-1].edges.concat(data[n].edges)
  }

  console.log(data[n].vertices)
  console.log(data[n].edges)

  force
    .nodes(data[n].vertices)
    .links(data[n].edges)
    .start()

  console.log(n)

  let link = edges.selectAll('.edge')
    .data(data[n].edges)

  link
    .enter()
    .append('line')
    .style('stroke-width', e => {
      return 2
    })
    .style('stroke-opacity', 0)
    //.transition()
    //.duration(dur)
    .style('stroke-opacity', e => e.blocked ? 0.8 : 0.3)
    .style('stroke', e => e.blocked ? 'red' : 'black')
    .attr('class', 'edge')

    //link
    //  .exit()
    //  .remove()

  force.on('tick', () => {
    link
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y)

    vertex
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
    })

    let v = data[n].vertices

    //briefly remove all vertices to have them re-enter on top of edges
    // svg.selectAll('.vertex')
    //   .data([])
    //   .exit()
    //   .remove()

    let vertex = vertices.selectAll('.vertex')
      .data(v)

    vertex.enter()
      .append('circle')
      //.attr('r', 1)
      //.transition()
      //.duration(dur)
      .attr('r', 5)
      .attr('class', 'vertex')
      .style('fill', v => v.blocked ? 'red' : '#005689')

    vertex
      .call(force.drag)

    vertex
      .exit()
      .remove()

  if(n < data.length){
    setTimeout(() => {
      updateGraph(edges, vertices, n+1)
    }, 50)
  }

}
