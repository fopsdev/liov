import { Compute } from "../library/index.js"
import { Store } from "../store"
import { Computed11 } from "./Computed11.js"

export const Computed10 = props => Store.B.length * Compute(Computed11, props)
