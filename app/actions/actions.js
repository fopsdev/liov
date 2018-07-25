import { actions1 } from "./actions1"
import { actions2 } from "./actions2"
export const getActions = action => {
    let res = {}
    Object.assign(res, actions1(action), actions2(action))
    return res
}
