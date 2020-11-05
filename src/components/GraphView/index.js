import React, { useRef, useEffect, memo } from 'react';
import ReactDOMServer from 'react-dom/server';
import {RiArrowUpSLine, RiArrowDownSLine} from 'react-icons/ri'
import * as d3 from 'd3';

import colaborationNetwork from '../../data/collaboration-network.json';
import colors from '../../data/colors';

const GraphView = ({ setNode }) => {
  const svgref = useRef(null);

  const bodyStrength = -400;
  const linkStrength = 0.25;

  var networkLinkStatus = {};

  const networkNodes = colaborationNetwork.nodes;

  const networkLinks = colaborationNetwork.publications.reduce(
    (result, publication) => {
      if (!publication.authors.length > 1) return result;

      const linksIds = publication.authors.flatMap((authorA, idx) =>
        publication.authors.slice(idx + 1).map((authorB) => {
          let [nodeA, nodeB] =
            authorA.localeCompare(authorB) < 0
              ? [authorA, authorB]
              : [authorB, authorA];
          let linkId = `${nodeA}-${nodeB}`;
          networkLinkStatus[linkId] = 1;
          return linkId;
        })
      );

      linksIds.forEach((id) => {
        const link = result.find((link) => link.id === id);
        if (link) {
          link.publications.push(publication.id);
        } else {
          const [source, target] = id.split('-');
          result.push({ id, source, target, publications: [publication.id] });
        }
      });
      return result;
    },
    []
  );

  const isConnected = (nodeA, nodeB) => {
    return (
      networkLinkStatus[`${nodeA.id}-${nodeB.id}`] ||
      networkLinkStatus[`${nodeB.id}-${nodeA.id}`] ||
      nodeA.id === nodeB.id
    );
  };

  const drag = (simulation) => {
    const dragstarted = (event, dNode) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      dNode.fx = dNode.x;
      dNode.fy = dNode.y;
    };

    const dragged = (event, dNode) => {
      dNode.fx = event.x;
      dNode.fy = event.y;
    };

    const dragended = (event, dNode) => {
      if (!event.active) simulation.alphaTarget(0);
      dNode.fx = null;
      dNode.fy = null;
    };

    return d3
      .drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };

  useEffect(() => {
    const svg = d3.select(svgref.current);

    var width = svgref.current.clientWidth;
    var height = svgref.current.clientHeight;

    const simulation = d3
      .forceSimulation(networkNodes)
      .force(
        'link',
        d3
          .forceLink(networkLinks)
          .id((d) => d.id)
          .strength(linkStrength)
      )
      .force('charge', d3.forceManyBody().strength(bodyStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX())
      .force('y', d3.forceY());

    networkLinks.forEach((link) => {

      const publicationsTogether = link.publications.length

      if (!link.source.degree) link.source.degree = 0;
      if (!link.target.degree) link.target.degree = 0;

      link.source.degree += publicationsTogether;
      link.target.degree += publicationsTogether;
    });

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(networkLinks)
      .join('line')
      .attr('stroke-width', (d) => (d.publications ? 1.5 + Math.log(d.publications.length) : 1.5));

    var linkLabel = 
      d3
      .select("body")
      .append("div")
      .attr("class", "link-label")
      .style("opacity", 0);

    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(networkNodes)
      .join('circle')
      .attr('r', (d) => (d.degree ? 8 + Math.sqrt(d.degree) : 8))
      .attr('fill', (d) => colors[d.field])
      .call(drag(simulation));

    const zoomed = ({transform}) => {
      link.attr("transform", transform);
      node.attr("transform", transform);
    }

    svg.call(
      d3
      .zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([.25, 2])
      .on("zoom", zoomed)
    );

    link.on('mouseover',  (_event, link) => {
      d3
        .select(_event.target)
        .transition()
        .duration(50)
          .style("stroke",'#ff760d');

      linkLabel
        .transition()
        .duration(50)
        .style("opacity", 1);

      const label = "Colaborações: "+link.publications.length

      linkLabel
        .html(label)
        .style("position", 'absolute')
        .style("left", (_event.x + 10) + "px")
        .style("top", (_event.y - 15) + "px");
    });

    link.on('mouseout',  (_event, link) => {
      d3
        .select(_event.target)
        .transition()
        .duration(50)
        .style("stroke",'#999');

      linkLabel.transition()
        .duration('50')
        .style("opacity", 0);
    });

    node.on('mouseover', (_event, dNode) => {
      const transition = d3.transition().duration(200);

      node
        .transition(transition)
        .style('stroke-opacity', (o) => (isConnected(dNode, o) ? 1 : 0.3))
        .style('opacity', (o) => (isConnected(dNode, o) ? 1 : 0.3));

      link
        .transition(transition)
        .style('opacity', (l) =>
          dNode === l.source || dNode === l.target ? 1 : 0.2
        );

      setNode(dNode);
    });

    node.on('mouseout', (_dNode) => {
      const transition = d3.transition().duration(200);

      node
        .transition(transition)
        .style('stroke-opacity', 1)
        .style('opacity', 1);

      link.transition(transition).style('opacity', 1);

      setNode({});
    });

    const openIconHTML = ReactDOMServer.renderToString(<RiArrowDownSLine />);
    const closeIconHTML = ReactDOMServer.renderToString(<RiArrowUpSLine />);

    const researchAreaContainer = svg
      .append('g')
      .attr('id','researchAreaContainer')
      .attr('stroke-width', '0')
      .attr('height','10px')
      .style('cursor', 'pointer')
      .attr('open',1);

    const icon = svg
      .append('g')
      .attr('id','icon')
      .style('cursor', 'pointer')
      .attr('transform', 'translate(130, 11)')

    icon
      .html(closeIconHTML)
      .select('svg')
      .attr('width','2em')
      .attr('height','2em');
    
    // legendTitle
    researchAreaContainer
      .append('text')
      .text('Áreas de pesquisa')
      .attr('font-size', '0.9rem')
      .style('fill', 'rgb(45, 45, 45)')
      .style('cursor', 'pointer')
      .attr('transform', 'translate(15, 30)');

    const toggleresearchAreaContainer = () => {
      const isOpen = parseInt(researchAreaContainer.attr('open'))
      if(isOpen){
        researchAreaContainer
          .attr('open', 0);

        researchAreaContainer
          .selectAll("g")
          .transition()
          .attr("opacity", 0)
          .delay(
            function(d, i) { 
              return (researchAreaContainer.selectAll("g").size()-i)*100;
            })
          .duration(500);

        svg
          .select('#icon')
          .html(openIconHTML)
          .transition()
          .select('svg')
          .attr('width','2em')
          .attr('height','2em')
          .duration(100);

      }else{
        researchAreaContainer
          .attr('open', 1);

        researchAreaContainer
          .selectAll("g")
          .transition()
          .attr("opacity", 1)
          .delay(function(d, i) { return 100*(i); })
          .duration(500);

        svg
          .select('#icon')
          .html(closeIconHTML)
          .transition()
          .select('svg')
          .attr('width','2em')
          .attr('height','2em') 
          .duration(100);
      }
    };

    icon.on("click", toggleresearchAreaContainer);
    researchAreaContainer.on("click", toggleresearchAreaContainer);

    const colorLegend = researchAreaContainer
      .selectAll('.colorLegend')
      .data(Object.keys(colors))
      .enter()
      .append('g')
      .attr('transform', (d, i) => 'translate(15,' + (40 + 25 * i) + ')')
      .attr('opacity',1);

    colorLegend
      .append('rect')
      .attr('fill', (d) => colors[d])
      .attr('width', 20)
      .attr('height', 20);

    colorLegend
      .append('text')
      .attr('x', 25)
      .attr('y', 15)
      .attr('font-size', '0.85rem')
      .style('fill', 'rgb(45, 45, 45)')
      .style('user-select', 'none')
      .text((d) => d);


    simulation.on('tick', () => {
      const margin = 80;

      node
        .attr(
          'cx',
          (d) => (d.x = Math.max(margin, Math.min(width - margin, d.x)))
        )
        .attr(
          'cy',
          (d) => (d.y = Math.max(margin, Math.min(height - margin, d.y)))
        );

      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
    });

    const handleResize = () => {
      width = svgref.current.clientWidth;
      height = svgref.current.clientHeight;
      simulation.force('center', d3.forceCenter(width / 2, height / 2));
      simulation.alpha(0.3).restart();
    };

    window.addEventListener('resize', handleResize);
  });

  return (
    <div className="graph-container" style={{ width: '100%', height: '100%' }}>
      <svg ref={svgref} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
};

export default memo(GraphView);
