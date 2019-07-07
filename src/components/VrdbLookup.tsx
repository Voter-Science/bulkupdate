import * as XC from 'trc-httpshim/xclient'
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as trcSheet from 'trc-sheet/sheet'
import * as sheetContents from 'trc-sheet/sheetContents'
import { ISheetContents } from 'trc-analyze/collections';

declare var _sheetRefGlobal: any;

export interface IVoter {
    RecId: string;
    FirstName?: string;
    LastName?: string;
    Birthdate?: Date;
    PrecinctName?: string;
    LegislativeDistrict?: number;
}

interface ILookupParams {
    first?: string;
    last?: string;
    zip?: string;
    city?: string;
}
export class VrdbClient {
    // private readonly _sheet: trcSheet.SheetClient;
    private readonly _http: XC.XClient;

    public constructor(sheetRef: any) {
        this._http = XC.XClient.New(sheetRef.Server, sheetRef.AuthToken, undefined);
    }

    public getLookup(
        params: ILookupParams
    ): Promise<sheetContents.ISheetContents> {
        var uri = new XC.UrlBuilder("/vrdb/lookup/wa");
        uri.addQuery("first", params.first);
        uri.addQuery("last", params.last);
        uri.addQuery("zip", params.zip);
        uri.addQuery("city", params.city);

        return this._http.getAsync<sheetContents.ISheetContents>(uri);
    }
}

export class VrdbLookup extends React.Component<{
    onSelect?: (record: IVoter) => void
}, {
    results?: sheetContents.ISheetContents,
    _fname?: string,
    _lname?: string,
    _city?: string,
    _zip?: string
}> {
    public constructor(props: any) {
        super(props);
        this.state = {}

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event: any) {

        // alert('A name was submitted: ' + this.state._fname);
        var vc = new VrdbClient(_sheetRefGlobal);
        var params: ILookupParams = {
            first: this.state._fname,
            last: this.state._lname,
            city: this.state._city,
            zip: this.state._zip,
        };

        // $$$ Should be in QueryBuilder
        if (params.first == "") { params.first = undefined };
        if (params.last == "") { params.last = undefined };
        if (params.city == "") { params.city = undefined };
        if (params.zip == "") { params.zip = undefined };


        vc.getLookup(params).then((results) => {
            this.setState({ results: results });
        });

        event.preventDefault();
    }

    private handleSelect(idx: number) {
        // alert("Selected! " + recId);

        if (this.props.onSelect) {
            var x = this.state.results;
            var record: IVoter = {
                RecId : x["StateVoterID"][idx],
                FirstName : x["FirstName"][idx],
                LastName : x["LastName"][idx],
                Birthdate : new Date(x["Birthdate"][idx]),
                PrecinctName : x["PrecinctName"][idx],
                LegislativeDistrict : parseInt(x["LegislativeDistrict"][idx])
            };

            this.props.onSelect(record);
        }
    }

    private renderResults() {
        var x = this.state.results;
        // These are case sensitive
        var recIds = x["StateVoterID"];

        if (recIds.length == 0) {
            return <div>No records found</div>
        }
        else {
            var fnames = x["FirstName"];
            var lnames = x["LastName"];
            var addrs = x["FullAddress"];
            var lds = x["LegislativeDistrict"];

            var bdays = x["Birthdate"];
            var genders = x["Gender"];
            var precincts = x["PrecinctName"];
            var counties = x["CountyCode"];

            return <table>
                <thead>
                    <tr>
                        <td>Precinct</td>
                        <td>County</td>
                        <td>Leg#</td>
                        <td>Name</td>
                        <td>Birthday</td>
                        <td>Gender</td>
                        <td>Address</td>
                    </tr>
                </thead>
                <tbody>
                    {recIds.map((recId, i) =>
                        <tr key={recId}>
                            <td>{precincts[i]}</td>
                            <td>{counties[i]}</td>
                            <td>{lds[i]}</td>
                            <td>
                                <button onClick={() => this.handleSelect(i)}>
                                    {fnames[i]} {lnames[i]}
                                </button>
                            </td>
                            <td>{bdays[i]}</td>
                            <td>{genders[i]}</td>
                            <td>{addrs[i]}</td>
                        </tr>
                    )
                    }
                </tbody>
            </table>
        }
    }

    render() {
        // LastName, City, Zip 
        // Then show list... allow Select from list. 
        if (!this.state.results) {
            return <div>Lookup a voter
                <div>
                    <input type="text" placeholder="(first name)"
                        value={this.state._fname || ""}
                        onChange={(x) => this.setState({ _fname: x.target.value })}></input>
                </div>

                <div>
                    <input type="text" placeholder="(last name)"
                        value={this.state._lname || ""}
                        onChange={(x) => this.setState({ _lname: x.target.value })}></input>
                </div>

                <div>
                    <input type="text" placeholder="(city)"
                        value={this.state._city || ""}
                        onChange={(x) => this.setState({ _city: x.target.value })}></input>
                </div>

                <div>
                    <input type="text" placeholder="(zip)"
                        value={this.state._zip || ""}
                        onChange={(x) => this.setState({ _zip: x.target.value })}></input>
                </div>

                <button onClick={this.handleSubmit}>Lookup</button>
            </div>
        }
        else {
            return <div>
                <button onClick={() => { this.setState({ results: undefined }) }} >Back to lookup</button>
                {this.renderResults()}
            </div>
        }

    }
}

// "StateVoterID",
// "FirstName", "MiddleName", "LastName",
// "Birthdate","Gender",
// "FullAddress",
// "PrecinctName" , "LegislativeDistrict"
