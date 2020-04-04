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
const contentHash = require('content-hash');
const react_loader_spinner_1 = require("react-loader-spinner");
//import { formatsByCoinType } from '@ensdomains/address-encoder';
const Settings_1 = require("../Settings");
const Ens_1 = require("../abi/Ens");
class ENSCheck extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ready: false,
            exists: false,
            hasResolver: false,
            owner: null,
            controller: null,
            expires: null,
            errorMsg: null,
            coins: null,
            texts: null,
            pubkey: null,
            abi: null,
            address: null,
            contenthash: null,
            resolverAddr: null,
        };
    }
    componentDidUpdate(prevProps) {
        if (this.props.ensName !== prevProps.ensName) {
            this.setState({ ready: false });
            this.getNameData();
        }
    }
    componentDidMount() {
        return __awaiter(this, void 0, void 0, function* () {
            this.setState({ ready: false });
            yield this.getNameData();
        });
    }
    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }
    getNameData() {
        return __awaiter(this, void 0, void 0, function* () {
            const { web3, isAddress, ensName, ensHash, tokenID, registryContract, baseContract } = this.props;
            if (!ensName) {
                this.setState({
                    ready: true
                });
                return;
            }
            if (isAddress) {
                this.setState({
                    ready: true,
                    exists: false,
                    hasResolver: false,
                });
                return;
            }
            const exists = yield registryContract.methods.recordExists(ensHash).call();
            const owner = yield registryContract.methods.owner(ensHash).call();
            if (!exists || owner === Settings_1.ZERO_ADDRESS) {
                this.setState({
                    ready: true,
                    exists: false,
                    hasResolver: false,
                });
                return;
            }
            const expires = yield baseContract.methods.nameExpires(tokenID).call();
            const resolverAddr = yield registryContract.methods.resolver(ensHash).call();
            if (!resolverAddr || resolverAddr === Settings_1.ZERO_ADDRESS) {
                this.setState({
                    ready: true,
                    exists: true,
                    hasResolver: false,
                    owner: owner,
                    expires: expires
                });
                return;
            }
            const resolverContract = yield new web3.eth.Contract(Ens_1.RESOLVER_PUBLIC_ABI, resolverAddr);
            let controllers = yield resolverContract.getPastEvents('AuthorisationChanged', {
                filter: { node: ensHash, owner: owner },
                fromBlock: 4000000,
                toBlock: 'latest'
            });
            let controller;
            if (!controllers || controllers.length == 0) {
                controller = owner;
            }
            else {
                controller = controllers[0];
            }
            const addr = yield resolverContract.methods.addr(ensHash).call();
            const pubkeyFragments = yield resolverContract.methods.pubkey(ensHash).call();
            const pubkey = pubkeyFragments.x === Settings_1.ZERO_BYTES && pubkeyFragments.y === Settings_1.ZERO_BYTES ? null : [pubkeyFragments.x, pubkeyFragments.y];
            const contentres = yield resolverContract.methods.contenthash(ensHash).call();
            const contenthash = contentres ? this.decodeContenthash(contentres) : null;
            const coins = {};
            let result;
            for (let key of Object.keys(Settings_1.coinMap)) {
                result = yield resolverContract.methods.addr(ensHash, Settings_1.coinMap[key]).call();
                //result && result !== ZERO_ADDRESS ? coins[key] = formatsByCoinType[coinMap[key]].encoder(result.slice(2)) : undefined
                result && result !== Settings_1.ZERO_ADDRESS ? coins[key] = result : undefined;
            }
            const texts = {};
            for (let key of Settings_1.textKeys) {
                result = yield resolverContract.methods.text(ensHash, key).call();
                result ? texts[key] = result : undefined;
            }
            const abi = {};
            for (let key of Object.keys(Settings_1.abiMap)) {
                result = yield resolverContract.methods.ABI(ensHash, Settings_1.abiMap[key]).call();
                result[1] ? abi[key] = web3.utils.hexToUtf8(result[1]) : undefined;
            }
            console.log({
                ready: true,
                exists: true,
                hasResolver: true,
                owner: owner,
                controller: controller,
                expires: expires,
                errorMsg: null,
                address: addr,
                coins: coins,
                texts: texts,
                pubkey: pubkey,
                contenthash: contenthash,
                resolverAddr: resolverAddr,
                abi: abi
            });
            //Math.floor(Date.now() / 1000
            this.setState({
                ready: true,
                exists: true,
                hasResolver: true,
                owner: owner,
                controller: controller,
                expires: expires,
                errorMsg: null,
                address: addr,
                coins: coins,
                texts: texts,
                pubkey: pubkey,
                contenthash: contenthash,
                resolverAddr: resolverAddr,
                abi: abi
            });
        });
    }
    decodeContenthash(encoded) {
        let decoded, error, externalLink, url, protocolType;
        if (!encoded) {
            let retval = {
                'protocolType': null,
                'error': 'Encoded value not exists'
            };
            return retval;
        }
        try {
            decoded = contentHash.decode(encoded);
            const codec = contentHash.getCodec(encoded);
            protocolType = Settings_1.codecToProtocol[codec];
            if (!protocolType) {
                decoded = encoded;
            }
        }
        catch (e) {
            error = e.message;
            console.log(error);
        }
        if (protocolType === 'ipfs') {
            externalLink = `https://gateway.ipfs.io/ipfs/${decoded}`;
            url = `ipfs://${decoded}`;
        }
        else if (protocolType === 'bzz') {
            externalLink = `https://swarm-gateways.net/bzz://${decoded}`;
            url = `bzz://${decoded}`;
        }
        else if (protocolType === 'onion' || protocolType === 'onion3') {
            externalLink = `https://${decoded}.onion`;
            url = `onion://${decoded}`;
        }
        else {
            externalLink = decoded;
            url = decoded;
            console.warn(`Unsupported protocol ${protocolType}`);
        }
        return { protocolType, decoded, externalLink, url, error };
    }
    render() {
        var _a;
        const { isAddress } = this.props;
        const ensregistered = this.state.exists && this.state.owner !== null && this.state.owner !== Settings_1.ZERO_ADDRESS;
        return this.state.ready ? (React.createElement("div", null,
            ensregistered &&
                React.createElement("div", { className: 'row space' },
                    React.createElement("div", { className: 'col-md-4' },
                        React.createElement("h2", { className: 'card-title text-right' }, "Ownership")),
                    React.createElement("div", { className: 'col-md-8' },
                        React.createElement("div", { className: 'card' },
                            React.createElement("div", { className: 'card-body padding-half' },
                                React.createElement("h5", { className: 'card-title' }, this.state.owner),
                                React.createElement("h6", { className: 'card-subtitle mb-2 text-muted' }, "Owner"))),
                        React.createElement("div", { className: 'card' },
                            React.createElement("div", { className: 'card-body padding-half' },
                                React.createElement("h5", { className: 'card-title' }, (new Date(Number.parseInt(this.state.expires, 10) * 1000)).toUTCString()),
                                React.createElement("h6", { className: 'card-subtitle mb-2 text-muted' }, "Expiration"))))),
            ensregistered && this.state.hasResolver && this.state.controller && this.state.controller !== Settings_1.ZERO_ADDRESS &&
                React.createElement("div", { className: 'row space' },
                    React.createElement("div", { className: 'col-md-4' },
                        React.createElement("h2", { className: 'card-title text-right' }, "Management")),
                    React.createElement("div", { className: 'col-md-8' },
                        React.createElement("div", { className: 'card' },
                            React.createElement("div", { className: 'card-body padding-half' },
                                React.createElement("h5", { className: 'card-title' }, this.state.controller),
                                React.createElement("h6", { className: 'card-subtitle mb-2 text-muted' }, "Controller"))))),
            ensregistered && this.state.hasResolver && this.state.address && this.state.address !== Settings_1.ZERO_ADDRESS &&
                React.createElement("div", { className: 'row space' },
                    React.createElement("div", { className: 'col-md-4' },
                        React.createElement("h2", { className: 'card-title text-right' }, "Address")),
                    React.createElement("div", { className: 'col-md-8' },
                        React.createElement("div", { className: 'card' },
                            React.createElement("div", { className: 'card-body padding-half' },
                                React.createElement("h5", { className: 'card-title' }, this.state.address),
                                React.createElement("h6", { className: 'card-subtitle mb-2 text-muted' }, "Mapped address"))))),
            ensregistered && this.state.hasResolver && this.state.coins && Object.keys(this.state.coins).length !== 0 &&
                React.createElement("div", { className: 'row space' },
                    React.createElement("div", { className: 'col-md-4' },
                        React.createElement("h2", { className: 'card-title text-right' }, "Coin addresses")),
                    React.createElement("div", { className: 'col-md-8' }, Object.entries(this.state.coins).filter(x => x[1]).map(x => React.createElement("div", { className: 'card', key: x[0] },
                        React.createElement("div", { className: 'card-body padding-half' },
                            React.createElement("h5", { className: 'card-title' }, x[1]),
                            React.createElement("h6", { className: 'card-subtitle mb-2 text-muted' }, x[0])))))),
            ensregistered && this.state.hasResolver && this.state.texts && Object.keys(this.state.texts).length !== 0 &&
                React.createElement("div", { className: 'row space' },
                    React.createElement("div", { className: 'col-md-4' },
                        React.createElement("h2", { className: 'card-title text-right' }, "Text")),
                    React.createElement("div", { className: 'col-md-8' }, Object.entries(this.state.texts).filter(x => x[1]).map(x => React.createElement("div", { className: 'card', key: x[0] },
                        React.createElement("div", { className: 'card-body padding-half' },
                            React.createElement("h5", { className: 'card-title' }, x[1]),
                            React.createElement("h6", { className: 'card-subtitle mb-2 text-muted' }, x[0])))))),
            ensregistered && this.state.hasResolver && this.state.contenthash && !this.state.contenthash.error &&
                React.createElement("div", { className: 'row space' },
                    React.createElement("div", { className: 'col-md-4' },
                        React.createElement("h2", { className: 'card-title text-right' }, "Content")),
                    React.createElement("div", { className: 'col-md-8' },
                        React.createElement("div", { className: 'card' },
                            React.createElement("div", { className: 'card-body padding-half' },
                                React.createElement("h5", { className: 'card-title' }, (_a = this.state.contenthash.externalLink) !== null && _a !== void 0 ? _a : this.state.contenthash.url),
                                React.createElement("h6", { className: 'card-subtitle mb-2 text-muted' }, this.state.contenthash.protocolType ? this.state.contenthash.protocolType.charAt(0).toUpperCase() + this.state.contenthash.protocolType.slice(1) : "Uncrecognized protocol"))))),
            ensregistered && this.state.hasResolver && this.state.pubkey &&
                React.createElement("div", { className: 'row space' },
                    React.createElement("div", { className: 'col-md-4' },
                        React.createElement("h2", { className: 'card-title text-right' }, "Public key")),
                    React.createElement("div", { className: 'col-md-8' }, this.state.pubkey.map((x, i) => React.createElement("div", { className: 'card', key: i === 0 ? 'X' : 'Y' },
                        React.createElement("div", { className: 'card-body padding-half' },
                            React.createElement("h5", { className: 'card-title' }, x),
                            React.createElement("h6", { className: 'card-subtitle mb-2 text-muted' },
                                i === 0 ? 'X' : 'Y',
                                " coordinate")))))),
            ensregistered && this.state.hasResolver && this.state.abi && Object.keys(this.state.abi).length !== 0 &&
                React.createElement("div", { className: 'row space' },
                    React.createElement("div", { className: 'col-md-4' },
                        React.createElement("h2", { className: 'card-title text-right' }, "ABIs")),
                    React.createElement("div", { className: 'col-md-8' }, Object.entries(this.state.abi).filter(x => x[1]).map(x => React.createElement("div", { className: 'card', key: x[0] },
                        React.createElement("div", { className: 'card-body padding-half' },
                            React.createElement("h5", { className: 'card-title' }, x[1]),
                            React.createElement("h6", { className: 'card-subtitle mb-2 text-muted' }, x[0])))))),
            React.createElement("div", { className: 'row' },
                React.createElement("div", { className: 'col text-center' },
                    isAddress &&
                        React.createElement("div", { className: 'alert alert-warning space', role: 'alert' }, "This is a regular Ethereum address. Please enter an ENS name, like 'subdomain.alice.ewc'."),
                    !isAddress && !ensregistered && this.props.ensName &&
                        React.createElement("div", { className: 'alert alert-warning space', role: 'alert' }, "ENS name does not exist yet."),
                    ensregistered && !this.state.hasResolver &&
                        React.createElement("div", { className: 'alert alert-warning space', role: 'alert' }, "ENS name does not have a resolver set."),
                    this.state.errorMsg &&
                        React.createElement("div", { className: 'alert alert-danger space', role: 'alert' }, this.state.errorMsg))))) : (React.createElement("div", null,
            React.createElement("div", { className: 'row space' },
                React.createElement("div", { className: 'col text-center' },
                    React.createElement(react_loader_spinner_1.default, { type: "BallTriangle", height: 100, width: 100, color: '#007bff' })))));
    }
}
exports.ENSCheck = ENSCheck;
//# sourceMappingURL=ENSCheck.js.map