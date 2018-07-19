import { html } from "lit-html/lib/lit-extended.js"
import { Lif } from "../library/index.js"
import { Store } from "../store"
import { repeat } from "lit-html/lib/repeat.js"
import { D } from "./D.js"

export const C = props =>
    html`<h1>${Store.C}</h1>
<ul>
    ${repeat(
        Store.D,
        i => i.id,
        i => {
            props["id"] = i.id
            return Lif(D, props)
        }
    )}
    </ul>
`
