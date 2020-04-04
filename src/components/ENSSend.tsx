import * as React from 'react';
import Web3 = require('web3');

import {RESOLVER_PUBLIC_ABI} from '../abi/Ens'

import {
    ZERO_ADDRESS
} from '../Settings';

interface ENSSendProps {
    web3: any
    registryContract: any
    ensName: string,
    ensHash: string,
    isAddress: boolean
}

interface ENSSendState {
    [key:string]: string
}

export class ENSSend extends React.Component<ENSSendProps, ENSSendState> {

    constructor(props: any) {
        super(props);
        this.state = {
            value: null,
            data: null,
            errorMsg: null
        }
        this.getAddress = this.getAddress.bind(this);
        this.onTransferClick = this.onTransferClick.bind(this);
    }

    componentDidUpdate(prevProps: ENSSendProps) {
        if (this.props.ensName !== prevProps.ensName) {
            this.setState({errorMsg: null})
        }
    }

    async componentDidMount() {
        console.log("send didmount")
    }

    shouldComponentUpdate(nextProps: ENSSendProps, nextState: ENSSendState) {
        const difference = Object.keys(nextState).filter(k => nextState[k] !== this.state[k]);
        console.log("state diff", difference)
        const propchange = this.props.ensName !== nextProps.ensName
        console.log("prop diff", propchange)
        if((difference.includes('data') || difference.includes('value')) && !difference.includes('errorMsg')) {
            return false || propchange
        }
        return true
    }

    async getAddress() {
        const { web3, ensName, ensHash, isAddress, registryContract } = this.props;
        if(isAddress) {
            return ensName
        }
        const exists = await registryContract.methods.recordExists(ensHash).call()
        const owner = await registryContract.methods.owner(ensHash).call()
        const resolverAddr = await registryContract.methods.resolver(ensHash).call()
        if (!exists || !owner|| owner === ZERO_ADDRESS || !resolverAddr || resolverAddr === ZERO_ADDRESS) {
            throw('Not a valid address or unexistant ENS name.')
        }
        const resolverContract = await new web3.eth.Contract(RESOLVER_PUBLIC_ABI as any, resolverAddr)
        const addr = await resolverContract.methods.addr(ensHash).call()
        console.log("resolution", ensName, addr)
        return web3.utils.toChecksumAddress(addr)
    }

    async onTransferClick() {
        const { data, value } = this.state;
        let acc
        console.log(value, data)
        try {
            acc = await this.getAddress()
        } catch (e) {
            this.setState({
                errorMsg: e
            })
            return
        }
        const { web3 } = this.props;
        try {
            const accounts = await web3.eth.getAccounts();
            await web3.eth.sendTransaction({
                from: accounts[0],
                to: acc,
                data: data,
                value: value ? web3.utils.toWei(value, 'ether'): undefined
            })
        } catch(e) {
            console.error(e)
            this.setState({
                errorMsg: 'Error while executing transaction.'
            })
        }
    }

    async onTxParamChange(event: any, param: string) {
        event.persist();
        console.log(event.target.value)
        if (param === 'data') {
            this.setState({ data: event.target.value });
        } else {
            this.setState({ value: event.target.value });
        }
    }

    render() {
        return <div>
            <div className='row space'>
                <div className='col-md-4'>
                    <button type='button' className='btn btn-primary float-right' onClick={this.onTransferClick}>
                        Send transaction
                    </button>
                </div>
                <div className='col-md-4'>
                    <input 
                        type='text'
                        className='form-control text-center'
                        placeholder='type value to send in ethers..'
                        onChange={(e) => this.onTxParamChange(e, 'value')}
                    />
                </div>
                <div className='col-md-4'>
                    <input 
                        type='text'
                        className='form-control text-center'
                        placeholder='type OPTIONAL data, 0x..'
                        onChange={(e) => this.onTxParamChange(e, 'data')}
                    />
                </div>
            </div>
            {this.state.errorMsg &&
                <div className='row'>
                    <div className='col text-center'>
                        <div className='alert alert-danger space' role='alert'>
                            {this.state.errorMsg}
                        </div>  
                    </div>
                </div>
            }
        </div>
    }
}
