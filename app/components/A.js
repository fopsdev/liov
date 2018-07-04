import { html } from "lit-html/lib/lit-extended.js"
import { repeat } from "lit-html/lib/repeat.js"
import { Data, Lif, tree } from "../library/index.js"
import { B } from "./B.js"

export const A = (props, parent) => html`

<h2>${Data.A} </h2>
  <ul>
      ${repeat(
          Data.B,
          i => i.id,
          i => {
              return Lif(B, { id: i.id }, parent)
          }
      )}
    </ul>

<button on-click=${e => {
    tree.startMutationTracking()
    if (Data.C === "X") {
        Data.B.pop()
    } else {
        Data.C = "X"
        Data.B.push({ id: "B4" })
    }
    tree.clearMutationTracking()
    tree.flush()
}}>click me</button>
<button on-click=${e => {
    tree.startMutationTracking()
    Data.C = "C"
    tree.clearMutationTracking()
    tree.flush()
}}>Set to C</button>
`
