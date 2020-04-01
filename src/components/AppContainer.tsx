import * as React from 'react';
const Web3 = require('web3');
import { ENSCheck } from './ENSCheck';
import { ENSSend } from './ENSSend';
import { NETWORKS } from '../Settings';

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
    ensName: string
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
            ensName: null
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

    async fillWithFirstENSName() {
       this.setState({ ensName: 'alice.ewc' });
    }


    async onNameChange(event: any) {
        event.persist();
        this.setState({ ensName: event.target.value });
    }

    render() {
        const { chainID } = this.state;
        const isValidNetwork = Object.keys(NETWORKS).includes(chainID?.toString());
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
                                    onChange={this.onNameChange}
                                    defaultValue={this.state.ensName}
                                />
                            </div>
                        </div>
                    <ENSSend
                        web3={this.state.web3}
                        registryContract={this.state.registryContract}
                        ensName={this.state.ensName}
                    />
                    <ENSCheck
                        web3={this.state.web3}
                        registryContract={this.state.registryContract}
                        baseContract={this.state.baseContract}
                        controllerContract={this.state.controllerContract}
                        ensName={this.state.ensName}
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
