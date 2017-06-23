import React from "react";
import PropTypes from "prop-types";

import {getElementOffset} from '../util/util';

//import * as d3 from 'd3';
//import { scaleLinear } from 'd3-scale';

//function getElementOffset(element) {
//    const de = document.documentElement;
//    const box = element.getBoundingClientRect();
//    const top = box.top + window.pageYOffset - de.clientTop;
//    const left = box.left + window.pageXOffset - de.clientLeft;
//    return {top, left};/
//}

export default class EventHandler extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isPanning: false,
            initialPanBegin: null,
            initialPanEnd: null,
            initialPanPosition: null
        };

        this.handleScrollWheel = this.handleScrollWheel.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    getOffsetMousePosition(e) {
        const offset = getElementOffset(this.eventRect);
        const x = e.pageX - offset.left;
        const y = e.pageY - offset.top;
        return [Math.round(x), Math.round(y)];
    }

    handleScrollWheel(e) {
        if (!this.props.enablePanZoom) {
            return;
        }

        e.preventDefault();

        // determine scale factor
        const SCALE_FACTOR = 0.001;
        let scale = Math.max(Math.min(1 + e.deltaY * SCALE_FACTOR, 3), 0.1);

        const xy = this.getOffsetMousePosition(e);

        // current data domain in range of [begin, end]
        const beginX = this.props.scaleX.domain()[0];
        const endX = this.props.scaleX.domain()[1];
        const centerX = this.props.scaleX.invert(xy[0]);

        // Y is inversed
        const beginY = this.props.scaleY.domain()[1];
        const endY = this.props.scaleY.domain()[0];
        const centerY = this.props.scaleY.invert(xy[1]);

        // compute new data range
        let beginScaledX = centerX - (centerX - beginX) * scale;
        let endScaledX = centerX + (endX - centerX) * scale;

        let beginScaledY = centerY - (centerY - beginY) * scale;
        let endScaledY = centerY + (endY - centerY) * scale;

        // Duration constraint
        //let duration = (end - begin) * scale;
        //if (this.props.minDuration) {
        //    const minDuration = this.props.minDuration;
        //    if (duration < this.props.minDuration) {
        //        beginScaled = center - (center - begin) / (end - begin) * minDuration;
        //        endScaled = center + (end - center) / (end - begin) * minDuration;
        //    }
        //}
        //if (this.props.minTime && this.props.maxtime) {
        //    const maxDuration = this.props.maxTime - this.props.minTime;
        //    if (duration > maxDuration) {
        //        duration = maxDuration;
        //    }
        //}
        // Range constraint
        //if (this.props.minTime && beginScaled < this.props.minTime) {
        //    beginScaled = this.props.minTime;
        //    endScaled = beginScaled + duration;
        //}
        //if (this.props.maxTime && endScaled > this.props.maxTime) {
        //    endScaled = this.props.maxTime;
        //    beginScaled = endScaled - duration;
        //}
        //const newBegin = beginScaled;
        //const newEnd = endScaled;
        //const newTimeRange = [newBegin, newEnd];

        const xRange = [beginScaledX, endScaledX];
        const yRange = [beginScaledY, endScaledY];

        if (this.props.onZoom) {
            this.props.onZoom(xRange,yRange);
        }
    }

    handleMouseDown(e) {
        if (!this.props.enablePanZoom) {
            return;
        }

        e.preventDefault();

        const x = e.pageX;
        const y = e.pageY;
        const xy0 = [Math.round(x), Math.round(y)];

        const begin = [this.props.scaleX.domain()[0], this.props.scaleY.domain()[1]];
        const end = [this.props.scaleX.domain()[1], this.props.scaleY.domain()[0]];

        document.addEventListener("mouseover", this.handleMouseMove);
        document.addEventListener("mouseup", this.handleMouseUp);

        this.setState({
            isPanning: true,
            initialPanBegin: begin,
            initialPanEnd: end,
            initialPanPosition: xy0
        });

        return false;
    }

    handleMouseUp(e) {
        if (!this.props.enablePanZoom) {
            return;
        }

        e.stopPropagation(); // ???

        document.removeEventListener("mouseover", this.handleMouseMove);
        document.removeEventListener("mouseup", this.handleMouseUp);

        const x = e.pageX;
        if (this.props.onMouseClick && this.state.initialPanPosition &&
            Math.abs(x - this.state.initialPanPosition[0]) < 2)
        {
            this.props.onMouseClick();
        }

        this.setState({
            isPanning: false,
            initialPanBegin: null,
            initialPanEnd: null,
            initialPanPosition: null
        });
    }

    handleMouseOut(e) {
        e.preventDefault();

        if (this.props.onMouseOut) {
            this.props.onMouseOut();
        }
    }

    handleMouseMove(e) {
        e.preventDefault();

        const x = e.pageX;
        const y = e.pageY;
        const xy = [Math.round(x), Math.round(y)];

        if (this.state.isPanning) {
            const xy0 = this.state.initialPanPosition;

            const offsetX = this.props.scaleX.invert(xy[0]) - this.props.scaleX.invert(xy0[0]);
            const offsetY = this.props.scaleY.invert(xy[1]) - this.props.scaleY.invert(xy0[1]);

            let newBeginX = this.state.initialPanBegin[0] - offsetX;
            let newEndX = this.state.initialPanEnd[0] - offsetX;

            let newBeginY = this.state.initialPanBegin[1] - offsetY;
            let newEndY = this.state.initialPanEnd[1] - offsetY;

            //let newBegin = this.state.initialPanBegin - timeOffset;
            //let newEnd = this.state.initialPanEnd - timeOffset;
            //const duration = this.state.initialPanEnd - this.state.initialPanBegin;
            //console.log(newBeginY, newEndY);

            //const newTimeRange = [newBegin, newEnd];
            if (this.props.onZoom) {
                this.props.onZoom([newBeginX, newEndX],[newBeginY, newEndY]);
            }

            //console.log(newBeginX, newEndX);

        } else if (this.props.onMouseMove) {

        }
    }

    render() {
        const cursor = this.state.isPanning ? "-webkit-grabbing" : "default";
        const handlers = {
            onWheel: this.handleScrollWheel,
            onMouseDown: this.handleMouseDown,
            onMouseMove: this.handleMouseMove,
            onMouseOut: this.handleMouseOut,
            onMouseUp: this.handleMouseUp
        };

        return(
            <g pointerEvents="all" {...handlers}>
                <rect
                    key="handler-hit-rect"
                    ref={c => {this.eventRect = c;}}
                    style={{fill: "#000", opacity: 0.1, cursor}}
                    x={0}
                    y={0}
                    width={this.props.width}
                    height={this.props.height}
                />
                {this.props.children}
            </g>
        );
    }
}

EventHandler.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]),
    enablePanZoom: PropTypes.bool,
    scaleX: PropTypes.func,
    scaleY: PropTypes.func,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    onZoom: PropTypes.func,
    onMouseMove: PropTypes.func,
    onMouseOut: PropTypes.func,
    onMouseClick: PropTypes.func
};

EventHandler.defaultProps = {
    enablePanZoom: false
};










