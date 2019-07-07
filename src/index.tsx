import * as React from "react";
import * as ReactDOM from "react-dom";

import * as XC from 'trc-httpshim/xclient'
import * as common from 'trc-httpshim/common'
import * as core from 'trc-core/core'
import * as trcSheet from 'trc-sheet/sheet'

import { SheetContainer, IMajorState } from 'trc-react/dist/SheetContainer'
import { VrdbLookup, IVoter } from './components/VrdbLookup'

import * as bcl from 'trc-analyze/collections'
import { PluginLink } from "trc-react/dist/PluginLink";
import { ColumnNames } from "trc-sheet/sheetContents";


import { CsvMatchInput} from 'trc-react/dist/CsvMatchInput';
import { ListColumns } from 'trc-react/dist/ListColumns';

declare var _trcGlobal: IMajorState;

// Lets somebody lookup a voter, and then answer questions about them. 
// See all answers in Audit. 
export class App extends React.Component<{}, {
    voter: IVoter // if undefined, still picking a voter. 
}>
{
    public constructor(props: any) {
        super(props);

        this.state = {
            voter: undefined
        };
        this.renderBody1 = this.renderBody1.bind(this);
        this.selectVoter = this.selectVoter.bind(this);
    }
    private selectVoter(record: IVoter) {
        this.setState({
            voter: record
        });
    }

    private renderBody1() {
        {
            return <div>
                <h2>Bulk Uploader</h2>            
                <div>This lets you specify a CSV to bulk update values in the current sheet.</div>
                <div>Column names for the CSV must match "RecId" (the primary key) and possible editable columns:</div>
                <ListColumns Include={ci => !ci.IsReadOnly}></ListColumns>

                <CsvMatchInput></CsvMatchInput>
             </div>
        }
    }

    render() {
        return <div>
            <SheetContainer
                onReady={this.renderBody1}
                fetchContents={true}
                requireTop={true}>
            </SheetContainer>
        </div>

    };
}

ReactDOM.render(
    <div>
        <App></App>
    </div>,
    document.getElementById("example")
);