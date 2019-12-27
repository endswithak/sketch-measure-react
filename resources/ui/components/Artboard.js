import React from 'react';
import { createArtboardStyles } from '../../utils/layerStyles';
class Artboard extends React.Component {
    componentDidMount() {
        console.log(this.props.artboard);
    }
    render() {
        return (React.createElement("div", { "data-layer-name": this.props.artboard.name, className: 'c-artboard', style: createArtboardStyles(this.props.artboard) }, this.props.children));
    }
}
export default Artboard;
