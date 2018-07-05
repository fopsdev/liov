import { html } from "lit-html/lib/lit-extended.js"
import { Lif } from "../library/index.js"
import { C } from "./C.js"

const GetExtendedList = (props, _settings) => {
    if (props.id === "B2") {
        return html`${Lif(C, {}, _settings)}`
    } else {
        return props.id
    }
}
export const B = (props, _settings) => html`
<li>-- ${GetExtendedList(props, _settings)}</li>
`
