"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Ens_1 = require("../abi/Ens");
const Settings_1 = require("../Settings");
class ENSSend extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: null,
            data: null,
            errorMsg: null
        };
        this.getAddress = this.getAddress.bind(this);
        this.onTransferClick = this.onTransferClick.bind(this);
    }
    componentDidUpdate(prevProps) {
        if (this.props.ensName !== prevProps.ensName) {
            this.setState({ errorMsg: null });
        }
    }
    componentDidMount() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("send didmount");
        });
    }
    shouldComponentUpdate(nextProps, nextState) {
        const difference = Object.keys(nextState).filter(k => nextState[k] !== this.state[k]);
        console.log("state diff", difference);
        const propchange = this.props.ensName !== nextProps.ensName;
        console.log("prop diff", propchange);
        if ((difference.includes('data') || difference.includes('value')) && !difference.includes('errorMsg')) {
            return false || propchange;
        }
        return true;
    }
    getAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            const { web3, ensName, ensHash, isAddress, registryContract } = this.props;
            if (isAddress) {
                return ensName;
            }
            const exists = yield registryContract.methods.recordExists(ensHash).call();
            const owner = yield registryContract.methods.owner(ensHash).call();
            const resolverAddr = yield registryContract.methods.resolver(ensHash).call();
            if (!exists || !owner || owner === Settings_1.ZERO_ADDRESS || !resolverAddr || resolverAddr === Settings_1.ZERO_ADDRESS) {
                throw ('Not a valid address or unexistant ENS name.');
            }
            const resolverContract = yield new web3.eth.Contract(Ens_1.RESOLVER_PUBLIC_ABI, resolverAddr);
            const addr = yield resolverContract.methods.addr(ensHash).call();
            console.log("resolution", ensName, addr);
            return web3.utils.toChecksumAddress(addr);
        });
    }
    onTransferClick() {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, value } = this.state;
            let acc;
            console.log(value, data);
            try {
                acc = yield this.getAddress();
            }
            catch (e) {
                this.setState({
                    errorMsg: e
                });
                return;
            }
            const { web3 } = this.props;
            try {
                const accounts = yield web3.eth.getAccounts();
                yield web3.eth.sendTransaction({
                    from: accounts[0],
                    to: acc,
                    data: data,
                    value: value ? web3.utils.toWei(value, 'ether') : undefined
                });
            }
            catch (e) {
                console.error(e);
                this.setState({
                    errorMsg: 'Error while executing transaction.'
                });
            }
        });
    }
    onTxParamChange(event, param) {
        return __awaiter(this, void 0, void 0, function* () {
            event.persist();
            console.log(event.target.value);
            if (param === 'data') {
                this.setState({ data: event.target.value });
            }
            else {
                this.setState({ value: event.target.value });
            }
        });
    }
    render() {
        return React.createElement("div", null,
            React.createElement("div", { className: 'row space' },
                React.createElement("div", { className: 'col-md-4' },
                    React.createElement("button", { type: 'button', className: 'btn btn-primary float-right', onClick: this.onTransferClick }, "Send transaction")),
                React.createElement("div", { className: 'col-md-4' },
                    React.createElement("input", { type: 'text', className: 'form-control text-center', placeholder: 'type value to send in ethers..', onChange: (e) => this.onTxParamChange(e, 'value') })),
                React.createElement("div", { className: 'col-md-4' },
                    React.createElement("input", { type: 'text', className: 'form-control text-center', placeholder: 'type OPTIONAL data, 0x..', onChange: (e) => this.onTxParamChange(e, 'data') }))),
            this.state.errorMsg &&
                React.createElement("div", { className: 'row' },
                    React.createElement("div", { className: 'col text-center' },
                        React.createElement("div", { className: 'alert alert-danger space', role: 'alert' }, this.state.errorMsg))));
    }
}
exports.ENSSend = ENSSend;
//# sourceMappingURL=ENSSend.js.map