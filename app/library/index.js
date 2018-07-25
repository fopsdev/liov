import { state } from "../state.js"
import App from "overmind"
import { noChange } from "lit-html"
import { render, TemplateResult } from "lit-html"

import { getActions } from "../actions/actions.js"

export const Tracker = new App({
    state,
    actions: action => getActions(action),
    devtools: null
})

let _rerenderSettings = []
let _renderCounter = 0
//console.log(Tracker)

export const Data = Tracker.proxyStateTree.get()

export let SettingsAndState = new Map()

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
    // always prepare the computed in its own state
    let compId = generateKey(comp, props)
    let computedCompId = "computed_" + compId
    if (!SettingsAndState.has(computedCompId)) {
        SettingsAndState.set(computedCompId, {
            CompState: new Map()
        })
    }

    let computedState = SettingsAndState.get(computedCompId).CompState
    // if there is no parent then its a "pure" computed which is not used in the ui
    // so lets init it

    let isPure = false
    if (!props._parent) {
        props["_parent"] = "computedroot"
        props["_appId"] = computedCompId
        isPure = true
        computedState.forEach(c => (c.touched = false))
    } else {
        isPure = props._computedSettings && props._computedSettings.isPure
    }
    // lastAccess and valdFor
    // they are here because computeds do't get removed from memory (the handlers get disposed, thats fine)
    // so this lastAccess and validFor will give us a change to remove them after validFor-millisecs of inactivity
    // the code which in fact is removing them is not yt implemnted
    props["_computedSettings"] = {
        isComputed: true,
        lastAccess: new Date().valueOf(),
        validFor: validFor,
        isPure: isPure
    }
    let res = Lif(comp, props)
    let renderCompState = SettingsAndState.get(props._appId).CompState
    let renderComputedState = renderCompState.get(compId)
    computedState.set(compId, renderComputedState)
    return res
}
export function Lif(comp, props) {
    if (!props._parent || !props._appId) {
        throw "liov: components always need to pass _parent and _appId object..."
    }

    let compId = generateKey(comp, props)

    let newProps = Object.assign({}, props)
    props = newProps

    let _settings = SettingsAndState.get(props._appId)
    let compState = _settings.CompState
    let computedSettings = props._computedSettings
    if (!computedSettings) {
        computedSettings = {}
    }

    if (!compState.has(compId) || !compState.get(compId)) {
        let setFromComputed = false
        if (computedSettings.isComputed) {
            // check if its a computed which was already executed before (not in the UI, eg. via Action)
            let computedCompId = "computed_" + compId

            let computedMain = SettingsAndState.get(computedCompId)
            if (computedMain) {
                let computedState = computedMain.CompState.get(compId)
                if (computedState) {
                    // the computed was already executed and available
                    // so yeh, reuse it
                    computedState.computedSettings.isPure = false
                    compState.set(compId, computedState)
                    setFromComputed = true
                }
            }
        }
        if (!setFromComputed) {
            compState.set(compId, {
                needsRender: true,
                touched: true,
                mutationListener: undefined,
                parent: undefined,
                compId: undefined,
                comp: undefined,
                computedSettings: computedSettings
            })
        }
    }
    let state = compState.get(compId)
    state.parent = props._parent
    state.touched = true
    state.compId = compId
    state.comp = comp
    if (state.needsRender) {
        // @todo, idea
        // the first comp it hits which needs to be rerendered also set a DOM value (id?)
        // so the next startrender will start from here and not always from the very root

        _renderCounter++
        //console.log(_renderCounter)
        let trackId = Tracker.trackState()
        console.log("run comp: " + compId)
        props._parent = compId
        let res = comp(props)
        if (!state.computedSettings.isComputed && !_settings.StartFromDomId) {
            // todo: check if already a __overlit id generated an already in dom...if yes use that
            //console.log(res)
            // create a new instance templateResult with a prepending div id for our purpose
            let renderId = ""
            let s = res.strings[0]
            let startId = s.indexOf("__overlit")
            console.log(res)
            console.log("renderid: " + s + " start:" + startId)
            if (startId === -1) {
                renderId = "__overlit" + _renderCounter
                let stringsArray = res.strings.slice(0)

                stringsArray[0] =
                    "<div id='" + renderId + "'/> " + stringsArray[0]
                res = new TemplateResult(
                    stringsArray,
                    res.values,
                    res.type,
                    res.partCallback
                )
            } else {
                renderId = ""
            }
            _settings.StartFromDomId = renderId
            _settings.InitialProps = props
            _settings.StartComp = state.comp
            console.log("compId:" + compId)
            console.log("Settings Comp: ")
            console.log(comp)
        }

        const paths = Tracker.clearTrackState(trackId)
        if (paths.size > 0) {
            if (state.mutationListener === undefined) {
                state.mutationListener = Tracker.addMutationListener(
                    paths,
                    () => {
                        // flag all relevant comps to be rerendered
                        let checkState = state
                        checkState.needsRender = true
                        if (!state.computedSettings.isComputed) {
                            _rerenderSettings.push(_settings)
                            if (_rerenderSettings.length === 1) {
                                requestAnimationFrame(mainLoop)
                            }
                        }
                        while (checkState && !checkState.touched) {
                            checkState.touched = true
                            if (
                                checkState.computedSettings.isComputed &&
                                checkState.computedSettings.isPure
                            ) {
                                // pure computeds just need to set rerender and then can be disconnected from the listener
                                // so they are not in ui and therefore can be recalculated when the user wants it next time
                                state.mutationListener.dispose()
                                state.mutationListener = undefined
                            }
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

export function StartRender(comp, initialprops, domId) {
    let compId = generateKey(comp, initialprops)
    initialprops["_parent"] = "root"
    initialprops["_appId"] = compId
    if (!SettingsAndState.has(compId)) {
        SettingsAndState.set(compId, {
            CompState: new Map(),
            InitialProps: initialprops,
            CompId: compId,
            StartComp: comp,
            StartFromDomId: domId
        })
    }
    _rerenderSettings.push(SettingsAndState.get(compId))
    //console.log(_settings)
    mainLoop()
}

function mainLoop() {
    while (_rerenderSettings.length > 0) {
        let _settings = _rerenderSettings.pop()

        _settings.CompState.forEach(c => (c.touched = false))

        console.log(" Render Start Settings Before:")
        let settingsClone = {}
        Object.assign(settingsClone, _settings)
        console.log(settingsClone)

        let startFromDomId = _settings.StartFromDomId
        _settings.StartFromDomId = ""
        let res = Lif(_settings.StartComp, _settings.InitialProps)

        console.log(" Render Start Settings After:")
        settingsClone = {}
        Object.assign(settingsClone, _settings)
        console.log(settingsClone)

        if (res !== noChange) {
            console.log(startFromDomId)

            render(res, document.getElementById(startFromDomId))
        }
        // cleanup not touched comps
        let toDelete = []
        for (var value of _settings.CompState.values()) {
            if (!value.touched) {
                if (value.mutationListener) {
                    value.mutationListener.dispose()
                    value.mutationListener = undefined
                }
                if (!value.computedSettings.isComputed) {
                    toDelete.push(value.compId)
                }
            }
        }
        toDelete.forEach(e => _settings.CompState.delete(e))

        console.log(
            "Finished Render " + _settings.CompId + ", All Comp State :"
        )
        console.log(SettingsAndState)
    }

    //requestAnimationFrame(mainLoop)
}
