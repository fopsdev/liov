import { html } from "lit-html/lib/lit-extended.js"
import { Lif } from "../library/index.js"
import { C } from "./C.js"

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
`
