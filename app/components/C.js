import { html } from "lit-html/lib/lit-extended.js"
import { Data, Lif } from "../library/index.js"
import { repeat } from "lit-html/lib/repeat.js"
import { D } from "./D.js"

export const C = (props, _settings) =>
    html`<h1>${Data.C}</h1>
<ul>
    ${repeat(
        Data.D,
        i => i.id,
        i => {
            return Lif(D, { id: i.id }, _settings)
        }
    )}
    </ul>
`
