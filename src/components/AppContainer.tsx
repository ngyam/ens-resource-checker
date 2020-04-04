import * as React from 'react';
const Web3 = require('web3');
const namehash = require('eth-ens-namehash');
import { ENSCheck } from './ENSCheck';
import { ENSSend } from './ENSSend';
import { ENSBasics } from './ENSBasics';
import { NETWORKS } from '../Settings';
import { debounce } from '../utils'

import {
    REGISTRY_ABI,
    REGISTRAR_BASE_ABI,
    REGISTRAR_CONTROLLER_ABI
} from '../abi/Ens';


interface AppContainerState {
    web3: any,
    registryContract: any
    baseContract: any
    controllerContract:any
    chainID: number
    ensName: string,
    tokenID: string,
    ensHash: string,
    isAddress : boolean
}

export class AppContainer extends React.Component<{}, AppContainerState> {

    constructor(props: any) {
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
        }

        this.onNameChange = this.onNameChange.bind(this);
    }

    async componentDidMount() {
        let web3;

        const ethereumInstance = (window as any).ethereum;
        const web3Instance = (window as any).web3;

        if (ethereumInstance) {
            web3 = new Web3(ethereumInstance);
            await ethereumInstance.enable();
        } else {
            web3 = new Web3(web3Instance ?? 'http://localhost:8545');
        }
        const chainID = await web3.eth.net.getId();
        const registryContract = new web3.eth.Contract(REGISTRY_ABI as any, NETWORKS[chainID].address_registry);
        const baseContract = new web3.eth.Contract(REGISTRAR_BASE_ABI as any, NETWORKS[chainID].address_registrar_base);
        const controllerContract = new web3.eth.Contract(REGISTRAR_CONTROLLER_ABI as any, NETWORKS[chainID].address_registrar_controller);
        
        this.setState({
             web3,
             registryContract,
             chainID,
             baseContract,
             controllerContract
        });

        //await this.fillWithFirstENSName();
    }

    onNameChange(ensName: string) {
        console.log("name changed")
        const { web3 } = this.state
        const ensHash = namehash.hash(ensName)
        const namefragments = ensName.split('.')
        const tokenID = web3.utils.hexToNumberString(web3.utils.soliditySha3(namefragments.length > 1 ? namefragments.slice(0,-1).join('.') : ensName))
        const isAddress = web3.utils.isAddress(ensName)
        this.setState({
            ensName,
            ensHash,
            tokenID,
            isAddress
        });
    }

    async onTyping(event: any, f: any) {
        event.persist()
        console.log("ontyping", event.target.value)
        f(event.target.value)
    }

    render() {
        const { chainID, isAddress, registryContract, baseContract, controllerContract, ensName, ensHash, tokenID, web3 } = this.state;
        const isValidNetwork = Object.keys(NETWORKS).includes(chainID?.toString());
        const f = debounce(this.onNameChange, 500)
        return <div className='container'>
            <h1 className='text-center text-muted space'>ENS name resource checker</h1>
            {isValidNetwork &&
                <>
                    <div className='alert alert-success space text-center' role='alert'>
                        Successfully connected to <strong>{NETWORKS[chainID].name}</strong>. This is a <strong>{NETWORKS[chainID].type}</strong>.
                    </div>
                        <div className='row space'>
                            <div className='col-md-4'>
                                <h2 className='card-title text-right'>
                                    Your input
                                </h2>
                            </div>
                            <div className='col-md-8'>
                                <input 
                                    type='text'
                                    className='form-control text-center'
                                    placeholder='type ENS name to look up, e.g. alice.ewc'
                                    onChange={(e) => this.onTyping(e, f)}
                                    defaultValue={ensName}
                                />
                            </div>
                        </div>
                    <ENSSend
                        web3={web3}
                        registryContract={registryContract}
                        ensName={ensName}
                        ensHash={ensHash}
                        isAddress={isAddress}
                    />
                    <ENSBasics
                        ensName={ensName}
                        ensHash={ensHash}
                        tokenID={tokenID}
                        isAddress={isAddress}
                    />
                    <ENSCheck
                        web3={web3}
                        registryContract={registryContract}
                        baseContract={baseContract}
                        controllerContract={controllerContract}
                        ensName={ensName}
                        ensHash={ensHash}
                        tokenID={tokenID}
                        isAddress={isAddress}
                    />
                </>
            }
            {!isValidNetwork &&
                <div className='alert alert-warning space' role='alert'>
                    <strong>You are not connected to Energy Web Chain or Volta test network.</strong> To connect to the Enery Web Chain or Volta, run a local node at http://localhost:8545 or use MetaMask and connect to a public RPC.
                </div>
            }
            {/*
            <div className='row more-space'>
                <img className='center' src='/assets/energy-web-logo-final.svg' alt='light logo' />
            </div>
            */}
        </div>
        
    }
}
