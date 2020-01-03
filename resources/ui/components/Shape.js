import React from 'react';
import { createShapeStyles, createShapeSVGPathStyles, createShapeSVGMarkerShape, createShapeSVGMarkerStyles, createShapeSVGMarkerPosition } from '../../utils/layerStyles';
const Shape = (props) => {
    const { layer, svgs } = props;
    const path = svgs[`${layer.id}`];
    const endArrowhead = layer.style.borderOptions.endArrowhead;
    const startArrowhead = layer.style.borderOptions.startArrowhead;
    return (React.createElement("svg", { className: 'c-layer c-layer--shape', style: createShapeStyles(layer), onClick: props.onClick, onMouseOver: props.onMouseOver, onMouseOut: props.onMouseOut },
        React.createElement("defs", null,
            React.createElement("marker", { id: 'head', orient: 'auto-start-reverse', markerWidth: '5', markerHeight: '5', refX: createShapeSVGMarkerPosition(startArrowhead), refY: '2.5' },
                React.createElement("path", { style: createShapeSVGMarkerStyles(layer, startArrowhead), d: `${createShapeSVGMarkerShape(startArrowhead)}` })),
            React.createElement("marker", { id: 'tail', orient: 'auto', markerWidth: '5', markerHeight: '5', refX: createShapeSVGMarkerPosition(endArrowhead), refY: '2.5' },
                React.createElement("path", { style: createShapeSVGMarkerStyles(layer, endArrowhead), d: `${createShapeSVGMarkerShape(endArrowhead)}` }))),
        React.createElement("path", { 
            //@ts-ignore
            style: createShapeSVGPathStyles(layer), markerEnd: 'url(#tail)', markerStart: 'url(#head)', d: path })));
};
export default Shape;
