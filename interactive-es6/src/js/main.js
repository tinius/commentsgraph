import reqwest from 'reqwest'
import mainHTML from './text/main.html!text'
import share from './lib/share'
import d3 from 'd3'
import _ from 'lodash'
import data from './interactions.json!'

var shareFn = share('Interactive title', 'http://gu.com/p/URL', '#Interactive');

let testData = {
  vertices : [
    { user : 'a' },
    { user : 'b' },
    { user : 'c' }
  ],
  edges : [
    { 'source' : 0, 'target' : 1, 'value' : 10 },
    { 'source' : 1, 'target' : 2, 'value' : 9 },
    { 'source' : 0, 'target' : 2, 'value' : 5 }
  ]
}

console.log(data)

let exp = 2

let min = d3.min(data.edges.map(e => e.value))
let max = d3.max(data.edges.map(e => e.value))
console.log(min)
console.log(max)

let width = el.offsetWidth
let height = screen.height
console.log(width)

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

let linkScale = d3.scale.linear()
  .domain([0, d3.max(data.edges.map(e => e.value))])
  .range([0, 10])

let opacityScale = d3.scale.linear()
  .domain([0, d3.max(data.edges.map(e => e.value))])
  .range([0.05, 0.6])

export function init(el, context, config, mediator) {

  el.innerHTML = ''

  let svg = d3.select(el)
    .append('svg')
    .attr('height', height)
    .attr('width', width)

  let n = 1
  updateGraph(svg, n)
}

function updateGraph(svg, n) {

  let dur = 500/Math.pow(1.2, n)

  force
    .nodes(data.vertices)
    .links(data.edges)
    .start()

  let link = svg.selectAll('.edge')
    .data(data.edges.slice(0,n-1))

  link
    .enter()
    .append('line')
    .style('stroke-width', e => {
      return 2
    })
    .style('stroke-opacity', 0)
    .transition()
    .duration(dur)
    .style('stroke-opacity', e => {
      return 0.4//opacityScale(e.value)
    })
    .style('stroke', e => 'black')
    .attr('class', 'edge')

    link
      .exit()
      .remove()

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

    let v = data.vertices.slice(0,n)

    //briefly remove all vertices to have them re-enter on top of edges
    svg.selectAll('.vertex')
      .data([])
      .exit()
      .remove()

    let vertex = svg.selectAll('.vertex')
      .data(v)

    vertex.enter()
      .append('circle')
      //.attr('r', 1)
      //.transition()
      //.duration(dur)
      .attr('r', 5)
      .attr('class', 'vertex')
      .style('fill', '#22a')

    vertex
      .call(force.drag)

    vertex
      .exit()
      .remove()

  if(n < data.vertices.length){
    setTimeout(() => {
      updateGraph(svg, n+1)
    }, 1000/Math.pow(1.2, n))
  }

}
