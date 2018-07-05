import { html } from "lit-html/lib/lit-extended.js"
import { Lif, Compute } from "../library/index.js"
import { C } from "./C.js"
import { Computed1 } from "../computeds/Computed1.js"

const GetExtendedList = props => {
    //console.log(props)
    if (props.id === "B2") {
        return html`${Lif(C, props)}`
    } else {
        return props.id
    }
}
export const B = props => html`
<li>-- ${GetExtendedList(props)}</li>
<b> ${Compute(Computed1, props, false, 60 * 1000 * 10)} </b>
`
