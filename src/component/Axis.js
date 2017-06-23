import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import * as d3 from 'd3';

export default class Axis extends React.Component {
    constructor() {
        super();
        this.renderAxis = this.renderAxis.bind(this);
    }

    componentDidUpdate() {
        this.renderAxis();
    }

    componentDidMount() {
        this.renderAxis();
    }

    renderAxis() {
        const node = ReactDOM.findDOMNode(this);
        d3.select(node).call(this.props.axis);
    }

    render() {
        return (
          <g className="axis"/>
        );
    }
}

Axis.propTypes = {
    axisType: PropTypes.oneOf(['x','y']).isRequired,
    axisLocation: PropTypes.oneOf(['top', 'bottom', 'left', 'right']).isRequired,
    axisSize: PropTypes.number
};

//Axis.defaultProps = {
//};
