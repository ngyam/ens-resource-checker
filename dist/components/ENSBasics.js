"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class ENSBasics extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        const { isAddress, ensName, ensHash, tokenID } = this.props;
        return React.createElement("div", null, !isAddress && ensName && ensHash &&
            React.createElement("div", { className: 'row space' },
                React.createElement("div", { className: 'col-md-4' },
                    React.createElement("h2", { className: 'card-title text-right' }, ensName)),
                React.createElement("div", { className: 'col-md-8' },
                    React.createElement("div", { className: 'card' },
                        React.createElement("div", { className: 'card-body padding-half' },
                            React.createElement("h5", { className: 'card-title' }, ensHash),
                            React.createElement("h6", { className: 'card-subtitle mb-2 text-muted' }, "Name hash"))),
                    React.createElement("div", { className: 'card' },
                        React.createElement("div", { className: 'card-body padding-half' },
                            React.createElement("h5", { className: 'card-title' }, tokenID),
                            React.createElement("h6", { className: 'card-subtitle mb-2 text-muted' }, "ERC721 token ID"))))));
    }
}
exports.ENSBasics = ENSBasics;
//# sourceMappingURL=ENSBasics.js.map