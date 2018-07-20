import { html } from "lit-html/lib/lit-extended.js"
import { repeat } from "lit-html/lib/repeat.js"
import {
    Lif,
    Compute,
    Tracker,
    SettingsAndState,
    connect
} from "../library/index.js"

import { B } from "./B.js"
import { Computed1 } from "../computeds/Computed1.js"
console.log(connect)
let Store = connect().state
export const A = props => html`

<h2>${Store.A} </h2>
<h2>${Compute(Computed1, props)}</h2>
  <ul>
      ${repeat(
          Store.B,
          i => i.id,
          i => {
              props["id"] = i.id
              return Lif(B, props)
          }
      )}
    </ul>

<button class="c-button c-button--warning" on-click=${() => {
    console.log(Tracker)
    Tracker.proxyStateTree.startMutationTracking()
    if (Store.C === "X") {
        Store.B.pop()
    } else {
        Store.C = "X"
        Store.B.push({ id: new Date().valueOf() })
    }
    Tracker.proxyStateTree.clearMutationTracking()
    Tracker.proxyStateTree.flush()
}}>Do stuff</button>
<button class="c-button c-button--success" on-click=${() => {
    Tracker.startMutationTracking()
    Store.C = "C"
    Tracker.clearMutationTracking()
    Tracker.flush()
}}>Set to C</button>
<button class="c-button" on-click=${() => {
    console.log(Compute(Computed1))
    console.log(SettingsAndState)
}}>Console log Computed1</button>
`
