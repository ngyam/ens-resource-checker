import * as React from 'react';
import Web3 = require('web3');
const contentHash = require('content-hash');
import Loader from 'react-loader-spinner'
//import { formatsByCoinType } from '@ensdomains/address-encoder';
import {
    coinMap,
    textKeys,
    abiMap,
    codecToProtocol,
    ZERO_ADDRESS,
    ZERO_BYTES
} from '../Settings';

import {RESOLVER_PUBLIC_ABI} from '../abi/Ens'
interface StringToString {
    [key: string]: string
}

interface ENSProps {
    web3: any
    registryContract: any
    baseContract: any
    controllerContract: any
    ensName: string,
    ensHash: string,
    tokenID: string,
    isAddress: boolean
}

interface ENSState {
    ready: boolean,
    exists: boolean
    hasResolver: boolean
    owner: string
    controller: string
    expires: string
    errorMsg: string
    coins: StringToString
    texts: StringToString
    pubkey: string[]
    abi: StringToString
    address: string
    contenthash: StringToString
    resolverAddr: string
}

export class ENSCheck extends React.Component<ENSProps, ENSState> {

    constructor(props: any) {
        super(props)
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
        }
    }

    componentDidUpdate(prevProps: ENSProps) {
        if (this.props.ensName !== prevProps.ensName) {
            this.setState({ready: false})
            this.getNameData()
        }
    }

    async componentDidMount() {
        this.setState({ready: false})
        await this.getNameData()
    }

    shouldComponentUpdate(nextProps: ENSProps, nextState: ENSState) {
        return true
    }

    async getNameData() {
        const { web3, isAddress, ensName, ensHash, tokenID, registryContract, baseContract } = this.props;

        if (!ensName) {
            this.setState({
                ready: true
            })
            return
        }

        if(isAddress) {
            this.setState ({
                ready: true,
                exists: false,
                hasResolver: false,
            })
            return
        }
        const exists = await registryContract.methods.recordExists(ensHash).call()
        const owner = await registryContract.methods.owner(ensHash).call()
        if (!exists || owner === ZERO_ADDRESS) {
            this.setState ({
                ready: true,
                exists: false,
                hasResolver: false,
            })
            return
        }
        const expires = await baseContract.methods.nameExpires(tokenID).call()
        const resolverAddr = await registryContract.methods.resolver(ensHash).call()
        if (!resolverAddr || resolverAddr === ZERO_ADDRESS) {
            this.setState ({
                ready: true,
                exists: true,
                hasResolver: false,
                owner: owner,
                expires: expires
            })
            return
        }
        const resolverContract = await new web3.eth.Contract(RESOLVER_PUBLIC_ABI as any, resolverAddr)

        let controllers = await resolverContract.getPastEvents('AuthorisationChanged', {
            filter: {node: ensHash, owner: owner},
            fromBlock: 4000000,
            toBlock: 'latest'
        })
        let controller
        if (!controllers || controllers.length == 0) {
            controller = owner
        } else {
            controller = controllers[0]
        }

        const addr = await resolverContract.methods.addr(ensHash).call()
        const pubkeyFragments = await resolverContract.methods.pubkey(ensHash).call()
        const pubkey = pubkeyFragments.x === ZERO_BYTES && pubkeyFragments.y === ZERO_BYTES ? null: [pubkeyFragments.x, pubkeyFragments.y]
        
        const contentres = await resolverContract.methods.contenthash(ensHash).call()
        const contenthash = contentres ? this.decodeContenthash(contentres) : null

        const coins: StringToString = {}
        let result
        for (let key of Object.keys(coinMap)) {
            result = await resolverContract.methods.addr(ensHash, coinMap[key]).call()
            //result && result !== ZERO_ADDRESS ? coins[key] = formatsByCoinType[coinMap[key]].encoder(result.slice(2)) : undefined
            result && result !== ZERO_ADDRESS ? coins[key] = result : undefined
        }

        const texts: StringToString = {}
        for (let key of textKeys) {
            result = await resolverContract.methods.text(ensHash, key).call()
            result ? texts[key] = result : undefined
        }

        const abi: StringToString = {}
        for (let key of Object.keys(abiMap)) {
            result = await resolverContract.methods.ABI(ensHash, abiMap[key]).call()
            result[1] ? abi[key] = web3.utils.hexToUtf8(result[1]) : undefined
        }

        console.log(
            {
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
            }
        )

        //Math.floor(Date.now() / 1000
        this.setState ({
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
        })
    }    

    decodeContenthash(encoded: any): StringToString {
        let decoded: string, error: string, externalLink: string, url: string, protocolType: string

        if (!encoded) {
            let retval :StringToString = {
                'protocolType': null,
                'error': 'Encoded value not exists'
            }
            return retval
        }

        try {
            decoded = contentHash.decode(encoded)
            const codec = contentHash.getCodec(encoded)

            protocolType = codecToProtocol[codec]
            if (!protocolType) {
                decoded = encoded
            }
        } catch (e) {
            error = e.message
            console.log(error)
        }

        if (protocolType === 'ipfs') {
            externalLink = `https://gateway.ipfs.io/ipfs/${decoded}`
            url = `ipfs://${decoded}`
        } else if (protocolType === 'bzz') {
            externalLink = `https://swarm-gateways.net/bzz://${decoded}`
            url = `bzz://${decoded}`
        } else if (protocolType === 'onion' || protocolType === 'onion3') {
            externalLink = `https://${decoded}.onion`
            url = `onion://${decoded}`
        } else {
            externalLink = decoded
            url = decoded
            console.warn(`Unsupported protocol ${protocolType}`)
        }

        return { protocolType, decoded, externalLink, url, error }
    }

    render() {
        const { isAddress } = this.props;
        const ensregistered = this.state.exists && this.state.owner !== null && this.state.owner !== ZERO_ADDRESS
        return this.state.ready ? (
            <div>
                {ensregistered &&
                    <div className='row space'>
                        <div className='col-md-4'>
                            <h2 className='card-title text-right'>
                                Ownership
                            </h2>
                        </div>
                        <div className='col-md-8'>
                            <div className='card'>
                                <div className='card-body padding-half'>
                                    <h5 className='card-title'>
                                        {this.state.owner}
                                    </h5>
                                    <h6 className='card-subtitle mb-2 text-muted'>Owner</h6>
                                </div>
                            </div>
                            <div className='card'>
                                <div className='card-body padding-half'>
                                    <h5 className='card-title'>
                                        {(new Date(Number.parseInt(this.state.expires, 10) * 1000)).toUTCString()}
                                    </h5>
                                    <h6 className='card-subtitle mb-2 text-muted'>Expiration</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {ensregistered  && this.state.hasResolver && this.state.controller && this.state.controller !== ZERO_ADDRESS &&
                    <div className='row space'>
                        <div className='col-md-4'>
                            <h2 className='card-title text-right'>
                                Management
                            </h2>
                        </div>
                        <div className='col-md-8'>
                            <div className='card'>
                                <div className='card-body padding-half'>
                                    <h5 className='card-title'>
                                        {this.state.controller}
                                    </h5>
                                    <h6 className='card-subtitle mb-2 text-muted'>Controller</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {ensregistered  && this.state.hasResolver && this.state.address && this.state.address !== ZERO_ADDRESS &&
                    <div className='row space'>
                        <div className='col-md-4'>
                            <h2 className='card-title text-right'>
                                Address
                            </h2>
                        </div>
                        <div className='col-md-8'>
                            <div className='card'>
                                <div className='card-body padding-half'>
                                    <h5 className='card-title'>
                                        {this.state.address}
                                    </h5>
                                    <h6 className='card-subtitle mb-2 text-muted'>Mapped address</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {ensregistered  && this.state.hasResolver && this.state.coins && Object.keys(this.state.coins).length !== 0 &&
                    <div className='row space'>
                        <div className='col-md-4'>
                            <h2 className='card-title text-right'>
                                Coin addresses
                            </h2>
                        </div>
                        <div className='col-md-8'>
                            {Object.entries(this.state.coins).filter(x => x[1]).map(x =>
                                <div className='card' key={x[0]}>
                                    <div className='card-body padding-half'>
                                        <h5 className='card-title'>
                                            {x[1]}
                                        </h5>
                                        <h6 className='card-subtitle mb-2 text-muted'>{x[0]}</h6>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                }
                {ensregistered  && this.state.hasResolver && this.state.texts && Object.keys(this.state.texts).length !== 0 &&
                    <div className='row space'>
                        <div className='col-md-4'>
                            <h2 className='card-title text-right'>
                                Text
                            </h2>
                        </div>
                        <div className='col-md-8'>
                            {Object.entries(this.state.texts).filter(x => x[1]).map(x =>
                                <div className='card' key={x[0]}>
                                    <div className='card-body padding-half'>
                                        <h5 className='card-title'>
                                            {x[1]}
                                        </h5>
                                        <h6 className='card-subtitle mb-2 text-muted'>{x[0]}</h6>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                }
                {ensregistered  && this.state.hasResolver && this.state.contenthash && !this.state.contenthash.error &&
                    <div className='row space'>
                        <div className='col-md-4'>
                            <h2 className='card-title text-right'>
                                Content
                            </h2>
                        </div>
                        <div className='col-md-8'>
                            <div className='card'>
                                <div className='card-body padding-half'>
                                    <h5 className='card-title'>
                                        {this.state.contenthash.externalLink ?? this.state.contenthash.url}
                                    </h5>
                                    <h6 className='card-subtitle mb-2 text-muted'>{this.state.contenthash.protocolType ? this.state.contenthash.protocolType.charAt(0).toUpperCase() + this.state.contenthash.protocolType.slice(1) : "Uncrecognized protocol"}</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {ensregistered  && this.state.hasResolver && this.state.pubkey &&
                    <div className='row space'>
                        <div className='col-md-4'>
                            <h2 className='card-title text-right'>
                                Public key
                            </h2>
                        </div>
                        <div className='col-md-8'>
                            {this.state.pubkey.map((x,i) => 
                                <div className='card' key={i === 0 ?'X':'Y'}>
                                    <div className='card-body padding-half'>
                                        <h5 className='card-title'>
                                        {x}
                                        </h5>
                                        <h6 className='card-subtitle mb-2 text-muted'>{i === 0 ? 'X': 'Y'} coordinate</h6>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                }
                {ensregistered  && this.state.hasResolver && this.state.abi && Object.keys(this.state.abi).length !== 0 &&
                    <div className='row space'>
                        <div className='col-md-4'>
                            <h2 className='card-title text-right'>
                                ABIs
                            </h2>
                        </div>
                        <div className='col-md-8'>
                            {Object.entries(this.state.abi).filter(x => x[1]).map(x =>
                                <div className='card' key={x[0]}>
                                    <div className='card-body padding-half'>
                                        <h5 className='card-title'>
                                            {x[1]}
                                        </h5>
                                        <h6 className='card-subtitle mb-2 text-muted'>{x[0]}</h6>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                }
            <div className='row'>
                <div className='col text-center'>
                    {isAddress &&
                        <div className='alert alert-warning space' role='alert'>
                            This is a regular Ethereum address. Please enter an ENS name, like 'subdomain.alice.ewc'.
                        </div>  
                    }
                    {!isAddress && !ensregistered && this.props.ensName &&
                        <div className='alert alert-warning space' role='alert'>
                            ENS name does not exist yet.
                        </div>  
                    }
                    {ensregistered && !this.state.hasResolver && 
                        <div className='alert alert-warning space' role='alert'>
                            ENS name does not have a resolver set.
                        </div>  
                    }
                    {this.state.errorMsg &&
                        <div className='alert alert-danger space' role='alert'>
                            {this.state.errorMsg}
                        </div>  
                    }
                </div>
            </div>
        </div>) : (
            <div>
                <div className='row space'>
                    <div className='col text-center'>
                        <Loader
                            type="BallTriangle"
                            height={100}
                            width={100}
                            color='#007bff'
                        />
                    </div>
                </div>
            </div>
        )
    }
}
