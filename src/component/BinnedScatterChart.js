import React from 'react';
import PropTypes from 'prop-types';

import {getElementOffset} from '../util/util';

import * as d3 from 'd3';
import { hexbin } from 'd3-hexbin';
import { scaleLinear } from 'd3-scale';
import { interpolateLab } from 'd3-interpolate';


class Bin extends React.Component {

    render() {
        const {binLoc, binGen, fillColor, binRadius, content} = this.props;
        //const binWidth = binRadius * 2 * Math.sin(Math.PI / 3);
        //const binHeight = binRadius * 2;

        return (
            <g className="binPath">
                <path shapeRendering="geometricPrecision"
                      transform={"translate(" + binLoc.x + "," + binLoc.y + ")"}
                      d={binGen} style={{fill: fillColor}}/>
            </g>
        );
    }
}
//<text transform={"translate(" + binLoc.x + "," + binLoc.y + ")"}>{content}</text>


export default class BinnedScatterChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        };

        this.makeBins = this.makeBins.bind(this);
        this.makeColorScale = this.makeColorScale.bind(this);

    }

    makeBins() {
        const data = this.props.data;

        if (!data) {
            return null;
        }

        //const binShape = this.props.binInfo.shape;
        const binRadius = this.props.binInfo.radius;

        let binGenerator;
        let pathGenerator;
        let bins;

        binGenerator = hexbin().radius(binRadius);
        pathGenerator = binGenerator.hexagon();

        //bins = binGenerator(data);

        const xScale = this.props.xScale;
        const yScale = this.props.yScale;

        const xRangeMin = xScale.domain()[0];
        const xRangeMax = xScale.domain()[1];
        const yRangeMin = yScale.domain()[1];
        const yRangeMax = yScale.domain()[0];

        bins = binGenerator(
            data
                .filter(d => {
                    const x = d[0], y = d[1];
                    if (xRangeMin <= x && x <= xRangeMax && yRangeMin <= y && y <=yRangeMax) {
                        return d;
                    }
                    return null;
                })
                .map(d => {
                return [xScale(d[0]), yScale(d[1])];
            })
        );

        bins = bins.map((d,i) => {d.id = i; return d;});
        return {data: bins, gen: pathGenerator};
    }
    makeColorScale(bins) {
        return scaleLinear()
            .domain([0, d3.max(bins.map(d => d.length))])
            .range(this.props.colorRange)
            .interpolate(interpolateLab);
    }

    getOffsetMousePosition(e) {
        const offset = getElementOffset(this.eventrect);
        const x = e.pageX - offset.left;
        const y = e.pageY - offset.top;
        return [Math.round(x), Math.round(y)];
    }

    render() {

        //console.log(this.props);

        let bins = [];
        let colorScale;

        bins = this.makeBins();
        colorScale = this.makeColorScale(bins.data);

        //console.log(bins);

        return (
            <g>
            {

                bins.data.map(d => {
                return (
                    <Bin key={d.id}
                         binLoc={d}
                         binRadius={this.props.binInfo.radius}
                         binGen={bins.gen}
                         fillColor={colorScale(d.length)}
                         content={d.length}/>);
                })
            }
            </g>
        );
    }
}

BinnedScatterChart.propTypes = {
    colorRange: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired,
    xScale: PropTypes.func,
    yScale: PropTypes.func,
    binInfo: PropTypes.object.isRequired,
    updateBin: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number
};

BinnedScatterChart.defaultProps = {
  updateBin: true
};