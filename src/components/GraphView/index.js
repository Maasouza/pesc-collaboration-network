import React, { useRef, useEffect, memo } from 'react';
import * as d3 from 'd3';

import colaborationNetwork from '../../data/collaboration-network.json';
import colors from '../../data/colors';

const GraphView = ({ setNode }) => {
  const svgref = useRef(null);

  const bodyStrength = -400;
  const linkStrength = 0.5;

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

    const width = svgref.current.clientWidth;
    const height = svgref.current.clientHeight;

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
      if (!link.source.degree) link.source.degree = 0;
      if (!link.target.degree) link.target.degree = 0;

      link.source.degree++;
      link.target.degree++;
    });

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(networkLinks)
      .join('line')
      .attr('stroke-width', 1.5);

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

    // legendTitle
    svg
      .append('text')
      .text('Área de atuação')
      .attr('font-size', '0.9rem')
      .style('fill', 'rgb(45, 45, 45)')
      .attr('transform', 'translate(15, 30)');

    const colorLegend = svg
      .selectAll('.colorLegend')
      .data(Object.keys(colors))
      .enter()
      .append('g')
      .attr('transform', (d, i) => 'translate(15,' + (40 + 25 * i) + ')');

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
  });

  return (
    <div className="graph-container" style={{ width: '100%', height: '100%' }}>
      <svg ref={svgref} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
};

export default memo(GraphView);
