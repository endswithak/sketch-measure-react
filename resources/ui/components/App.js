import React from 'react';
import Sidebar from './Sidebar';
import Canvas from './Canvas';
class App extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            selection: '',
            hover: ''
        };
        this.setAppState = (args) => {
            this.setState(args);
        };
    }
    render() {
        return (React.createElement("div", { className: 'c-app-wrap' },
            React.createElement("div", { className: 'c-app' },
                React.createElement(Sidebar, { appState: this.state, images: this.props.images }),
                React.createElement(Canvas, Object.assign({}, this.props, { appState: this.state, setAppState: this.setAppState })))));
    }
}
export default App;
