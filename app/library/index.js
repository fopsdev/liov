import { Store } from "../store.js"
import ProxyStateTree from "proxy-state-tree"
import { noChange } from "lit-html"
import { render } from "lit-html"

export const Tracker = new ProxyStateTree(Store)
export let Data = Tracker.get()

//let CompState = new Map()

export let SettingsAndState = new Map()

//export let Settings = { Rerender: true }
// @todo make parent a object and call it _settings. it will be used to handover the compstate & settings & current parentinfo
export function Compute(
    comp,
    props,
    propsDependency = false,
    validFor = 1000 * 60 * 3
) {
    if (!props) {
        props = {}
    } else {
        if (!propsDependency) {
            let newProps = Object.assign(
                {},
                {
                    _parent: props._parent,
                    _appId: props._appId,
                    _computedSettings: props._computedSettings
                }
            )
            props = newProps
        }
    }
    // if we are coming from render context (UI) then just keep using that infrastructure
    let compId = generateKey(comp, props)
    let computedCompId = "computed_" + compId
    if (!SettingsAndState.has(computedCompId)) {
        SettingsAndState.set(computedCompId, {
            CompState: new Map()
        })
    }
    //console.log(computedCompId)
    let computedState = SettingsAndState.get(computedCompId).CompState

    props["_computedSettings"] = {
        isComputed: true,
        lastAccess: new Date().valueOf(),
        validFor: validFor
    }

    if (props._parent) {
        let res = Lif(comp, props)
        // getting the computed state from the rendertree comp state, no need to recreate it, just use the same

        let renderCompState = SettingsAndState.get(props._appId).CompState
        //console.log(renderCompState)
        let renderComputedState = renderCompState.get(compId)
        // if (!computedState.has(compId)) {
        //     computedState.set(compId, {})
        // }
        renderComputedState.inUI = renderComputedState.compId
        computedState.set(compId, renderComputedState)

        //console.log("Finished Compute " + computedCompId + ", Comp State :")
        //console.log(computedState)
        return res
    }

    props["_parent"] = "computedroot"
    props["_appId"] = computedCompId
    computedState.forEach(c => (c.touched = false))
    //console.log("Start Compute in Compute Mode : " + computedCompId)
    let res = Lif(comp, props)
    let toDelete = []
    for (var value of computedState.values()) {
        if (!value.touched && value.inUI === undefined) {
            if (value.mutationListener) {
                value.mutationListener.dispose()
            }
            toDelete.push(value.compId)
        }
    }
    toDelete.forEach(e => computedState.delete(e))
    // console.log("Finished Compute " + computedCompId + ", Comp State :")
    // console.log(computedState)
    // console.log("store: ")
    // console.log(Store)
    return res
}
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
    let computedSettings = props._computedSettings
    if (!computedSettings) {
        computedSettings = {}
    }
    props["_computedSettings"] = {}
    if (!compState.has(compId) || !compState.get(compId)) {
        compState.set(compId, {
            needsRender: true,
            touched: true,
            inUI: undefined,
            mutationListener: undefined,
            parent: undefined,
            compId: undefined,
            computedSettings: computedSettings
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
                        // flag all relevant comps to be rerendered
                        let checkState = state
                        if (!state.computedSettings.isComputed) {
                            _settings.Settings.Rerender = true
                        }
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
        if (state.computedSettings.isComputed) {
            state.cache = res
        }
        return res
    } else {
        console.log("saved some cycles: " + compId)
        //set all childs to touched = true
        if (state.computedSettings) {
            state.computedSettings.lastAccess = new Date().valueOf()
        }
        setTouched(_settings.CompState, compId)
        if (state.computedSettings.isComputed) {
            return state.cache
        } else {
            return noChange
        }
    }
}
function setTouched(compState, compId) {
    Array.from(compState.values())
        .filter(e => e.parent === compId)
        .forEach(e => {
            //console.log("touch: " + JSON.stringify(e))
            e.touched = true

            if (e.computedSettings) {
                e.computedSettings.lastAccess = new Date().valueOf()
            }
            setTouched(compState, e.compId)
        })
}

function generateKey(comp, props) {
    props.toJSON = function() {
        var result = {}
        for (var x in this) {
            if (
                x !== "_parent" &&
                x !== "_appId" &&
                x !== "_computedSettings"
            ) {
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
            //console.log("Start Render : " + compId)

            let res = Lif(comp, initialprops)
            if (res !== noChange) {
                render(res, domelement)
            }
            // cleanup not touched comps
            let toDelete = []
            for (var value of _settings.CompState.values()) {
                //console.log(value)
                if (!value.touched && !value.computedSettings.isComputed) {
                    if (value.mutationListener) {
                        value.mutationListener.dispose()
                    }
                    //console.log("disposing :" + value.compId)
                    toDelete.push(value.compId)
                }
            }
            toDelete.forEach(e => _settings.CompState.delete(e))
            console.log("Finished Render " + compId + ", All Comp State :")
            // console.log(_settings.CompState)
            // console.log("store: ")
            // console.log(Store)
            console.log(SettingsAndState)
        }
        requestAnimationFrame(mainLoop)
    }
    requestAnimationFrame(mainLoop)
}
