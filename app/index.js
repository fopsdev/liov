import { StartRender, Compute } from "./library/index.js"
import { A } from "./components/A"
import { C } from "./components/C.js"
import { Computed1 } from "./computeds/Computed1.js"
// just some code to gracefully remove the loading screen
let element = document.getElementById("loader")
element.className = "u-centered animated fadeOutDown"
setTimeout(function() {
    element.remove()
}, 2000)
//
console.log("Use Computed1: " + Compute(Computed1))
StartRender(A, { id: "app1" }, document.getElementById("app1"))
StartRender(A, { id: "app2" }, document.getElementById("app2"))
