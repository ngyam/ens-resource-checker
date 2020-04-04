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
const Web3 = require('web3');
const namehash = require('eth-ens-namehash');
const ENSCheck_1 = require("./ENSCheck");
const ENSSend_1 = require("./ENSSend");
const ENSBasics_1 = require("./ENSBasics");
const Settings_1 = require("../Settings");
const utils_1 = require("../utils");
const Ens_1 = require("../abi/Ens");
class AppContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            web3: null,
            registryContract: null,
            controllerContract: null,
            baseContract: null,
            chainID: null,
            ensName: null,
            ensHash: null,
            tokenID: null,
            isAddress: false
        };
        this.onNameChange = this.onNameChange.bind(this);
    }
    componentDidMount() {
        return __awaiter(this, void 0, void 0, function* () {
            let web3;
            const ethereumInstance = window.ethereum;
            const web3Instance = window.web3;
            if (ethereumInstance) {
                web3 = new Web3(ethereumInstance);
                yield ethereumInstance.enable();
            }
            else {
                web3 = new Web3(web3Instance !== null && web3Instance !== void 0 ? web3Instance : 'http://localhost:8545');
            }
            const chainID = yield web3.eth.net.getId();
            const registryContract = new web3.eth.Contract(Ens_1.REGISTRY_ABI, Settings_1.NETWORKS[chainID].address_registry);
            const baseContract = new web3.eth.Contract(Ens_1.REGISTRAR_BASE_ABI, Settings_1.NETWORKS[chainID].address_registrar_base);
            const controllerContract = new web3.eth.Contract(Ens_1.REGISTRAR_CONTROLLER_ABI, Settings_1.NETWORKS[chainID].address_registrar_controller);
            this.setState({
                web3,
                registryContract,
                chainID,
                baseContract,
                controllerContract
            });
            //await this.fillWithFirstENSName();
        });
    }
    onNameChange(ensName) {
        console.log("name changed");
        const { web3 } = this.state;
        const ensHash = namehash.hash(ensName);
        const namefragments = ensName.split('.');
        const tokenID = web3.utils.hexToNumberString(web3.utils.soliditySha3(namefragments.length > 1 ? namefragments.slice(0, -1).join('.') : ensName));
        const isAddress = web3.utils.isAddress(ensName);
        this.setState({
            ensName,
            ensHash,
            tokenID,
            isAddress
        });
    }
    onTyping(event, f) {
        return __awaiter(this, void 0, void 0, function* () {
            event.persist();
            console.log("ontyping", event.target.value);
            f(event.target.value);
        });
    }
    render() {
        const { chainID, isAddress, registryContract, baseContract, controllerContract, ensName, ensHash, tokenID, web3 } = this.state;
        const isValidNetwork = Object.keys(Settings_1.NETWORKS).includes(chainID === null || chainID === void 0 ? void 0 : chainID.toString());
        const f = utils_1.debounce(this.onNameChange, 500);
        return React.createElement("div", { className: 'container' },
            React.createElement("h1", { className: 'text-center text-muted space' }, "ENS name resource checker"),
            isValidNetwork &&
                React.createElement(React.Fragment, null,
                    React.createElement("div", { className: 'alert alert-success space text-center', role: 'alert' },
                        "Successfully connected to ",
                        React.createElement("strong", null, Settings_1.NETWORKS[chainID].name),
                        ". This is a ",
                        React.createElement("strong", null, Settings_1.NETWORKS[chainID].type),
                        "."),
                    React.createElement("div", { className: 'row space' },
                        React.createElement("div", { className: 'col-md-4' },
                            React.createElement("h2", { className: 'card-title text-right' }, "Your input")),
                        React.createElement("div", { className: 'col-md-8' },
                            React.createElement("input", { type: 'text', className: 'form-control text-center', placeholder: 'type ENS name to look up, e.g. alice.ewc', onChange: (e) => this.onTyping(e, f), defaultValue: ensName }))),
                    React.createElement(ENSSend_1.ENSSend, { web3: web3, registryContract: registryContract, ensName: ensName, ensHash: ensHash, isAddress: isAddress }),
                    React.createElement(ENSBasics_1.ENSBasics, { ensName: ensName, ensHash: ensHash, tokenID: tokenID, isAddress: isAddress }),
                    React.createElement(ENSCheck_1.ENSCheck, { web3: web3, registryContract: registryContract, baseContract: baseContract, controllerContract: controllerContract, ensName: ensName, ensHash: ensHash, tokenID: tokenID, isAddress: isAddress })),
            !isValidNetwork &&
                React.createElement("div", { className: 'alert alert-warning space', role: 'alert' },
                    React.createElement("strong", null, "You are not connected to Energy Web Chain or Volta test network."),
                    " To connect to the Enery Web Chain or Volta, run a local node at http://localhost:8545 or use MetaMask and connect to a public RPC."));
    }
}
exports.AppContainer = AppContainer;
//# sourceMappingURL=AppContainer.js.map