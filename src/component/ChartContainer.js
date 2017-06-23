import React from 'react';
import PropTypes from 'prop-types';

import _ from 'underscore';

import Axis from './Axis';
import BinnedScatterChart from './BinnedScatterChart';
//import Chart from './Chart';
import EventHandler from "./EventHandler";

import * as d3 from 'd3';
import { scaleLinear } from 'd3-scale';


/*
 * The '<ChartContainer>' is the outer most element of a chart and is responsible for generating and arranging its
 * sub-elements.
 *
 *
 * Example:
 * ``` xml
 * <ChartContainer xAxisRange={xRange} yAxisRange={yRange} width="800" height="800">
 *     <Chart>
 *          <BinnedScatterChart/>
 *     </Chart>
 *     <Axis axisType="x" axisLocation="bottom" format="" size=""/>
 *     <Axis axisType="y" axisLocation="top" format="" size=""/>
 * </ChartContainer>
 * ``` xml
 *
 * */
export default class ChartContainer extends React.Component {
    constructor(props) {
        super(props);

        const clipId = _.uniqueId("clip_");
        const clipPathURL = `url(#${clipId})`;
        this.state = {
            clipId,
            clipPathURL
        };

        this.computeAxisSpace = this.computeAxisSpace.bind(this);
        this.makeAxisList = this.makeAxisList.bind(this);
        this.makeChartList = this.makeChartList.bind(this);
    }

    handleMouseMove(t) {

    }

    handleMouseOut() {

    }

    handleBackgroundClick() {

    }

    handleZoom(xRange, yRange) {
        if (this.props.onDataRangeChanged) {
            this.props.onDataRangeChanged(xRange, yRange);
        }
    }


    /*
     * Compute spacing
     * - for now, it assumes only one chart, one x-axis and y-axis.
     * - Return margin {left: , right:, top: , bottom:}
     * */
    computeAxisSpace() {

        let leftWidth = 0,
            rightWidth = 0,
            topHeight = 0,
            bottomHeight = 0;

        React.Children.forEach(this.props.children, child => {
            if (child.type === Axis) {
                const size = Number(child.props.axisSize) || 40;
                const location = child.props.axisLocation;
                if (location === 'top') {
                    topHeight = size;
                }
                else if (location === 'bottom') {
                    bottomHeight = size;
                }
                else if (location === 'left') {
                    leftWidth = size;
                }
                else if (location === 'right') {
                    rightWidth = size;
                }
            }
        });

        return {left: leftWidth, right: rightWidth, top: topHeight, bottom: bottomHeight};
    }

    makeAxisList(margin, chartWidth, chartHeight) {

        const axisList = [];
        let i = 0, xScale = [], yScale = [];

        React.Children.forEach(this.props.children, child => {
            if (child.type === Axis) {
                const axisType = child.props.axisType;
                const axisLocation = child.props.axisLocation;
                const axisKey = `axis-${axisType}-${i}`;

                let axisScale, axis, transform;

                if (axisType === 'x') {
                    axisScale = scaleLinear().domain(this.props.xAxisRange).range([0, chartWidth]);
                    xScale = axisScale;
                } else if (axisType === 'y') {
                    const yAxisRange = this.props.yAxisRange;
                    axisScale = scaleLinear().domain([yAxisRange[1], yAxisRange[0]]).range([0, chartHeight]);
                    yScale = axisScale;
                }

                if (axisLocation === 'bottom') {
                    axis = d3.axisBottom(axisScale);
                    transform = `translate(${margin.left},${chartHeight})`;
                } else if (axisLocation === 'top') {
                    axis = d3.axisTop(axisScale);
                    transform = `translate(${margin.left},${margin.top})`;
                } else if (axisLocation === 'left') {
                    axis = d3.axisLeft(axisScale);
                    transform = `translate(${margin.left},${margin.top})`;
                } else if (axisLocation === 'right') {
                    axis = d3.axisRight(axisScale);
                    transform = `translate(${margin.right + chartWidth},${margin.top})`;
                }

                const props = {
                    axis: axis
                };

                axisList.push(
                    <g transform={transform} key={axisKey}>
                        {React.cloneElement(child, props)}
                    </g>
                );
            }
            i += 1;
        });

        return {axisList, xScale, yScale};
    }

    makeChartList(margin, xScale, yScale, chartWidth, chartHeight) {

        const chartList = [];
        let i = 0;

        React.Children.forEach(this.props.children, child => {
            if (child.type === BinnedScatterChart) {
                const chart = child;
                const chartKey = `chart-${i}`;
                const props = {
                    width: chartWidth,
                    height: chartHeight,
                    xScale: xScale,
                    yScale: yScale
                };

                const transform = `translate(${0},${margin.top})`;
                chartList.push(
                    <g transform={transform} key={chartKey} clipPath={this.state.clipPathURL}>
                        {React.cloneElement(chart, props)}
                    </g>
                );

                i += 1;
            }
        });

        return chartList;
    }

    render () {

        const margin = this.computeAxisSpace();
        const chartWidth = this.props.width - margin.left - margin.right;
        const chartHeight = this.props.height - margin.top - margin.bottom;

        const {axisList, xScale, yScale} = this.makeAxisList(margin, chartWidth, chartHeight);
        const chartList = this.makeChartList(margin, xScale, yScale, chartWidth, chartHeight);

        const rows = (
            <g transform={`translate(${margin.left},${margin.top})`}>
                <EventHandler
                    key="event-handler"
                    width={chartWidth}
                    height={chartHeight}
                    scaleX={xScale}
                    scaleY={yScale}
                    enablePanZoom={this.props.enablePanZoom}
                    onMouseOut={e => this.handleMouseOut(e)}
                    onMouseMove={e => this.handleMouseMove(e)}
                    onMouseClick={e => this.handleBackgroundClick(e)}
                    onZoom={(xRange, yRange) => this.handleZoom(xRange, yRange)}
                >
                    {chartList}
                </EventHandler>
            </g>
        );

        const clipper = (
            <defs>
                <clipPath id={this.state.clipId}>
                    <rect x="0" y="0" width={chartWidth} height={chartHeight} />
                </clipPath>
            </defs>
        );

        return (
            <svg width={this.props.width} height={this.props.height} style={{display: "block"}}>
                {clipper}
                {rows}
                {axisList}
            </svg>
        );
    }
}


ChartContainer.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    xAxisRange: PropTypes.array.isRequired,
    yAxisRange: PropTypes.array.isRequired,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element
    ]).isRequired,
    enablePanZoom: PropTypes.bool,
    onDataRangeChanged: PropTypes.func,
};

