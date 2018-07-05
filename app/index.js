import { StartRender } from "./library/index.js"
import { A } from "./components/A"
StartRender(A, { id: "app1" }, document.getElementById("app1"))

StartRender(A, { id: "app2" }, document.getElementById("app2"))
