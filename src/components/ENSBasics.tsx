import * as React from 'react';

interface ENSBasicsProps {
    isAddress: boolean
    ensName: string,
    ensHash: string,
    tokenID: string
}

interface ENSBasicsState {
    [key:string]: string
}

export class ENSBasics extends React.Component<ENSBasicsProps, ENSBasicsState> {

    constructor(props: any) {
        super(props);
        this.state = {}
    }

    render() {
        const { isAddress, ensName, ensHash, tokenID} = this.props

        return <div>
                {!isAddress && ensName && ensHash &&
                <div className='row space'>
                    <div className='col-md-4'>
                        <h2 className='card-title text-right'>
                            {ensName}
                        </h2>
                    </div>
                    <div className='col-md-8'>
                        <div className='card'>
                            <div className='card-body padding-half'>
                                <h5 className='card-title'>
                                    {ensHash}
                                </h5>
                                <h6 className='card-subtitle mb-2 text-muted'>Name hash</h6>
                            </div>
                        </div>
                        <div className='card'>
                            <div className='card-body padding-half'>
                                <h5 className='card-title'>
                                    {tokenID}
                                </h5>
                                <h6 className='card-subtitle mb-2 text-muted'>ERC721 token ID</h6>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    }
}
