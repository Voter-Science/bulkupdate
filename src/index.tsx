import * as React from "react";
import * as ReactDOM from "react-dom";

import * as XC from 'trc-httpshim/xclient'
import * as common from 'trc-httpshim/common'
import * as core from 'trc-core/core'
import * as trcSheet from 'trc-sheet/sheet'
import { checkPropTypes } from "prop-types";


// import { ColumnSelector } from "./components/ColumnSelector";
import { SheetContainer, IMajorState } from 'trc-react/dist/SheetContainer'

import { VrdbLookup, IVoter } from './components/VrdbLookup'

import * as bcl from 'trc-analyze/collections'
import { AllQuestions } from "trc-react/dist/Questions";
import { PluginLink } from "trc-react/dist/PluginLink";
import { ColumnNames } from "trc-sheet/sheetContents";


import { CsvMatchInput} from 'trc-react/dist/CsvMatchInput'; // $$$

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
        this.renderPerVoter = this.renderPerVoter.bind(this);
        this.selectVoter = this.selectVoter.bind(this);
        this.onSubmitAnswers = this.onSubmitAnswers.bind(this);
    }

    private renderPerVoter() {
        var v = this.state.voter;
        return <div>
            Fill in details for {v.FirstName} {v.LastName}:
            <AllQuestions onSubmit={this.onSubmitAnswers}
                columns={_trcGlobal._info.Columns}
            ></AllQuestions>
        </div>
    }

    private onSubmitAnswers(answers: any) {
        // Post answers
        var v = this.state.voter;
        var recId = v.RecId;
        var columnNames: string[] = [];
        var newValues: string[] = [];

        // Include VRDB information inthe delta table (since we don't have in contents).
        if (v.FirstName) {
            columnNames.push(ColumnNames.FirstName);
            newValues.push(v.FirstName);
        }
        if (v.LastName) {
            columnNames.push(ColumnNames.LastName);
            newValues.push(v.LastName);
        }
        if (v.Birthdate) {
            columnNames.push("Birthday");
            newValues.push(v.Birthdate.toDateString());
        }

        for (var i in answers) {
            columnNames.push(i);
            newValues.push(answers[i]);
        }

        // Push result to server 
        _trcGlobal.SheetClient.postUpdateSingleRowAsync(recId, columnNames, newValues).then(() => {
            // Success. Now go back to looking up another voter.
            alert("Successfully recorded");
            this.setState({
                voter: undefined
            })
        }).catch((err) => {
            alert("Failed to post response: " + err);
        });
    }

    private selectVoter(record: IVoter) {
        this.setState({
            voter: record
        });
    }

    private renderBody1() {
        {
            return <CsvMatchInput></CsvMatchInput>
        }


        if (this.state.voter) {
            return this.renderPerVoter();
        }
        return <div>
            <p>Lookup voters in WA and then answer survey questions about them.</p>
            <VrdbLookup onSelect={this.selectVoter}>
            </VrdbLookup>

            <div>
                You can see results at <PluginLink id="Audit" url="#show=byrecid"/>
            </div>
        </div>
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