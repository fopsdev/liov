import { html } from "lit-html/lib/lit-extended.js"
import { Lif, Data } from "../library/index.js"
//import { Store } from "../store"
import { repeat } from "lit-html/lib/repeat.js"
import { D } from "./D.js"
//let Store = connect().state
export const C = props =>
    html`<h1>${Data.C}</h1>
<ul>
    ${repeat(
        Data.D,
        i => i.id,
        i => {
            props["id"] = i.id
            return Lif(D, props)
        }
    )}
    </ul>
`
