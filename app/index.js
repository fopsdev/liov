import { StartRender } from "./library/index.js"
import { A } from "./components/A"
// just some code to gracefully remove the loading screen
let element = document.getElementById("loader")
element.className = "u-centered animated fadeOutDown"
setTimeout(function() {
    element.remove()
}, 2000)
//

StartRender(A, { id: "app1" }, document.getElementById("app1"))
StartRender(A, { id: "app2" }, document.getElementById("app2"))
