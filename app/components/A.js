import { html } from "lit-html/lib/lit-extended.js"
import { repeat } from "lit-html/lib/repeat.js"
import {
    Lif,
    Compute,
    Tracker,
    SettingsAndState,
    Data
} from "../library/index.js"

import { B } from "./B.js"
import { Computed1 } from "../computeds/Computed1.js"
export const A = props => html`

<h2>${Data.A} </h2>
<h2>${Compute(Computed1, props)}</h2>
  <ul>
      ${repeat(
          Data.B,
          i => i.id,
          i => {
              props["id"] = i.id
              return Lif(B, props)
          }
      )}
    </ul>

<button class="c-button c-button--warning" on-click=${() => {
    Tracker.actions.doStuff()
}}>Add stuff</button>
<button class="c-button c-button--warning" on-click=${() => {
    Tracker.actions.removeStuff()
}}>Remove stuff</button>

<button class="c-button c-button--success" on-click=${() => {
    Tracker.actions.setToC()
}}>Set to C</button>
<button class="c-button" on-click=${() => {
    console.log(Compute(Computed1))
    console.log(SettingsAndState)
}}>Console log Computed1</button>
`
