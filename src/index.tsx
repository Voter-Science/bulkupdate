import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { SheetContainer } from 'trc-react/dist/SheetContainer';

import { Copy } from 'trc-react/dist/common/Copy';
import { CsvMatchInput } from 'trc-react/dist/CsvMatchInput';
import { ListColumns } from 'trc-react/dist/ListColumns';
import { Panel } from 'trc-react/dist/common/Panel';
import { PluginShell } from 'trc-react/dist/PluginShell';

// Lets somebody lookup a voter, and then answer questions about them.
// See all answers in Audit.

interface IVoter {
  RecId: string;
  FirstName?: string;
  LastName?: string;
  Birthdate?: Date;
  PrecinctName?: string;
  LegislativeDistrict?: number;
}

interface IState {
  voter: IVoter; // if undefined, still picking a voter.
}

export class App extends React.Component<{}, IState> {
  public constructor(props: any) {
    super(props);

    this.state = {
      voter: undefined,
    };

    this.renderBody1 = this.renderBody1.bind(this);
    this.selectVoter = this.selectVoter.bind(this);
  }

  private selectVoter(record: IVoter) {
    this.setState({
      voter: record,
    });
  }

  private renderBody1() {
    return (
      <Panel>
        <Copy>
          <p>
            This lets you specify a CSV to bulk update values in the current
            sheet.
          </p>
          <p>
            Column names for the CSV must match "RecId" (the primary key) and
            possible editable columns:
          </p>
        </Copy>

        <ListColumns Include={(ci) => !ci.IsReadOnly} />

        <CsvMatchInput />
      </Panel>
    );
  }

  render() {
    return (
      <PluginShell
        description={
          <p>
            This lets you specify a CSV to bulk update values in the current
            sheet.
          </p>
        }
        title="Bulk Uploader"
      >
        {this.renderBody1()}
      </PluginShell>
    );
  }
}

ReactDOM.render(
  <SheetContainer fetchContents={true} requireTop={true}>
    <App />
  </SheetContainer>,
  document.getElementById('app')
);
