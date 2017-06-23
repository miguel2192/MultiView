/**
 * Created by scott on 6/15/17.
 */
import React from 'react';
import ReactDOM from 'react-dom';

import ChartContainer from './component/ChartContainer';
import BinnedScatterChart from './component/BinnedScatterChart';
import Axis from './component/Axis';

import './index.css';

import * as d3 from 'd3';
//import { hexbin } from 'd3-hexbin';

//import { scaleLinear } from 'd3-scale';


const CHART_WIDTH = 650;
const CHART_HEIGHT = 650;

function buildPoints() {
    const mu = 0;
    const sigma = 300;
    const nPoints = 5000;

    let random = d3.randomNormal(mu, sigma);
    let points = d3.range(nPoints).map(() => [random(), random()]);

    return points;
}

const dataSeries = {
    name: "Test data",
    points: buildPoints(),
    xRange: function () {
        return [d3.min(this.points, (d) => {return d[0]}),
                d3.max(this.points, (d) => {return d[0]})];
    },
    yRange: function () {
        return [d3.min(this.points, (d) => {return d[1]}),
                d3.max(this.points, (d) => {return d[1]})];
    },
    binInfo: {
        shape: "hexagon",
        radius: 20,
    },
    colorRange: ["#a8c6f7", "#221eff"],
};

//d3.min(fakeData, (d) => {return Math.min(d[0],d[1])});

class MvScatterPlot extends React.Component {

    constructor() {
        super();
        this.state = {
            xRange: dataSeries.xRange(),
            yRange: dataSeries.yRange(),
        };

        this.handleDataRangeChange = this.handleDataRangeChange.bind(this);
    }


    handleDataRangeChange(xRange, yRange) {
        this.setState({xRange, yRange});
    }

    render() {
        return (
            <div>
                Multi-view scatter plot

                <ChartContainer
                    width={750}
                    height={750}
                    xAxisRange={this.state.xRange}
                    yAxisRange={this.state.yRange}
                    enablePanZoom={true}
                    onDataRangeChanged={this.handleDataRangeChange}
                >
                    <BinnedScatterChart
                        data={dataSeries.points}
                        binInfo={dataSeries.binInfo}
                        colorRange={dataSeries.colorRange}/>
                    <Axis axisType={'x'} axisLocation={'bottom'} axisSize={100}/>
                    <Axis axisType={'y'} axisLocation={'left'} axisSize={100}/>
                </ChartContainer>
            </div>
        );
    }
}
//<Axis axisType={'y'} axisLocation={'left'}/>





// ===========================================================================
ReactDOM.render(
    <MvScatterPlot/>,
    document.getElementById('root')
);

// ===========================================================================

