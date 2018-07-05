import { Store } from "../store.js"
import ProxyStateTree from "proxy-state-tree"
import { noChange } from "lit-html"
import { render } from "lit-html"

export const Tracker = new ProxyStateTree(Store)
export let Data = Tracker.get()

//let CompState = new Map()

let SettingsAndState = new Map()

//export let Settings = { Rerender: true }
// @todo make parent a object and call it _settings. it will be used to handover the compstate & settings & current parentinfo
export function Lif(comp, props) {
    if (!props._parent || !props._appId) {
        throw "liov: components always need to pass _parent and _appId object..."
    }

    let compId = generateKey(comp, props)
    //console.log(compId)
    let newProps = Object.assign({}, props)
    props = newProps
    //console.log(props)
    let _settings = SettingsAndState.get(props._appId)
    let compState = _settings.CompState
    if (!compState.has(compId)) {
        compState.set(compId, {
            needsRender: true,
            touched: true,
            mutationListener: undefined,
            parent: undefined,
            compId: undefined
        })
    }
    let state = compState.get(compId)
    state.parent = props._parent
    state.touched = true
    state.compId = compId
    if (state.needsRender) {
        let trackId = Tracker.startPathsTracking()
        console.log("run comp: " + compId)
        props._parent = compId
        let res = comp(props)
        const paths = Tracker.clearPathsTracking(trackId)
        if (paths.size > 0) {
            if (state.mutationListener === undefined) {
                state.mutationListener = Tracker.addMutationListener(
                    paths,
                    () => {
                        _settings.Settings.Rerender = true
                        // flag all relevant comps to be rerendered
                        let checkState = state
                        while (checkState && !checkState.needsRender) {
                            checkState.needsRender = true
                            checkState = compState.get(checkState.parent)
                        }
                    }
                )
            } else {
                state.mutationListener.update(paths)
            }
        }
        state.needsRender = false
        return res
    } else {
        console.log("saved some cycles: " + compId)
        //set all childs to touched = true
        setTouched(_settings.CompState, compId)
        return noChange
    }
}
function setTouched(compState, compId) {
    Array.from(compState.values())
        .filter(e => e.parent === compId)
        .forEach(e => {
            //console.log("touch: " + e.compId)
            e.touched = true
            setTouched(compState, e.compId)
        })
}

function generateKey(comp, props) {
    props.toJSON = function() {
        var result = {}
        for (var x in this) {
            if (x !== "_parent" && x !== "_appId") {
                result[x] = this[x]
            }
        }
        return result
    }
    let sNewProps = JSON.stringify(props)

    return comp.name + sNewProps
}

export function StartRender(comp, initialprops, domelement) {
    let compId = generateKey(comp, initialprops)
    initialprops["_parent"] = "root"
    initialprops["_appId"] = compId
    if (!SettingsAndState.has(compId)) {
        SettingsAndState.set(compId, {
            Settings: { Rerender: true },
            CompState: new Map()
        })
    }
    let _settings = SettingsAndState.get(compId)
    function mainLoop() {
        //@ todo makes settings, compstate per app root
        if (_settings.Settings.Rerender) {
            _settings.Settings.Rerender = false
            _settings.CompState.forEach(c => (c.touched = false))
            console.log("Start Render : " + compId)

            let res = Lif(comp, initialprops)
            if (res !== noChange) {
                render(res, domelement)
            }
            // cleanup not touched comps
            let toDelete = []
            for (var value of _settings.CompState.values()) {
                if (!value.touched) {
                    if (value.mutationListener) {
                        value.mutationListener.dispose()
                    }
                    //console.log("disposing :" + value.compId)
                    toDelete.push(value.compId)
                }
            }
            toDelete.forEach(e => _settings.CompState.delete(e))
            console.log("Finished Render " + compId + ", Comp State :")
            console.log(_settings.CompState)
            console.log("store: ")
            console.log(Store)
        }
        requestAnimationFrame(mainLoop)
    }
    requestAnimationFrame(mainLoop)
}
