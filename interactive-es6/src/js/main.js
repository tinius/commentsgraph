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

let linkScale = d3.scale.linear()
  .domain([0, d3.max(data.edges.map(e => e.value))])
  .range([0, 80])

let opacityScale = d3.scale.linear()
  .domain([0, d3.max(data.edges.map(e => e.value))])
  .range([0.05, 0.6])

export function init(el, context, config, mediator) {

  el.innerHTML = ''

  let width = 800, height = 800

  let force = d3.layout.force()
    .charge(-20)
    .linkDistance((l, i) => {
      return linkScale(max - l.value)
    })
    .linkStrength(1)
    // .linkStrength((link, i) => {
    //
    //   let val = Math.pow(exp, -link.value)
    //   //console.log(linkScale(link.value))
    //   return linkScale(val)
    // })
    .size([width, height])

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

  force
    .nodes(data.vertices)
    .links(data.edges)
    .start()


  let svg = d3.select(el)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  let link = svg.selectAll('.edge')
    .data(data.edges)
    .enter()
    .append('line')
    .style('stroke-width', e => {
      return 2//opacityScale(e.value)*10
    })
    .style('stroke-opacity', e => {
      return opacityScale(e.value)
    })
    .style('stroke', e => {
      if(e.value === min){
        return 'red'
      }
      else if(e.value === max){
        return 'green'
      }
      return 'black'
    })

  let vertex = svg.selectAll('.vertex')
    .data(data.vertices)
    .enter()
    .append('circle')
    .attr('r', 5)
    .style('fill', '#448')
    .call(force.drag)
}
