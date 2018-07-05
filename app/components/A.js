import { html } from "lit-html/lib/lit-extended.js"
import { repeat } from "lit-html/lib/repeat.js"
import { Data, Lif, Tracker } from "../library/index.js"
import { B } from "./B.js"

export const A = props => html`

<h2>${Data.A} </h2>
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

<button on-click=${() => {
    Tracker.startMutationTracking()
    if (Data.C === "X") {
        Data.B.pop()
    } else {
        Data.C = "X"
        Data.B.push({ id: new Date().valueOf() })
    }
    Tracker.clearMutationTracking()
    Tracker.flush()
}}>click me</button>
<button on-click=${() => {
    Tracker.startMutationTracking()
    Data.C = "C"
    Tracker.clearMutationTracking()
    Tracker.flush()
}}>Set to C</button>
`
