import { html } from "lit-html/lib/lit-extended.js"
import { Lif } from "../library/index.js"
import { C } from "./C.js"

const GetExtendedList = (props, parent) => {
    if (props.id === "B2") {
        return html`${Lif(C, {}, parent)}`
    } else {
        return props.id
    }
}
export const B = (props, parent) => html`
<li>-- ${GetExtendedList(props, parent)}</li>
`
