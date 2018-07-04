# liov

> Small Helper lib that uses cerebral state store (https://cerebraljs.com/), lit-html templating (https://github.com/Polymer/lit-html) and some caching functionality. Its using a functional approach.


## Goal

Light and fast clientside html rendering using a central store.
Avoiding huge rendertrees by supporting renderparts without splitting up the store.
Use caching for computed values and even for html components
The plan is to use it for my future personal projects. let me know if you find it useful.

## Requirements

Works in modern browsers. (It's supposed to be used in LOB - Applications)

## Why is it so light?

It uses lit-html for the view rendering which shouldn't be bigger than 5kbs (including extensions)
It uses cerebaljs state store which is small and lightweight too

## Why is it so fast?

Because statechanges in cerebral are signalized trough changed state paths and CeLiCa Components are connected to statepaths. CeLiCa tracks those statechanges using native Sets and Maps and so it knows:

* Which renderparts need to be rerendered
* Which caches needs to be invalidated

(To mark parts of the store to not be tracked by CeLiCa prepend the statepaths with _\_noView_)

And furthermore the used libs (lit-html, cerebral) are libs also developed towards UI performance.
lit-hml shines by just comparing changed values (instead of bloated vnodes in vdom implementations like react) to check if the dom needs to be touched. And it touches it in a very nice way using templates.
cerebral is using a concept of signals to make changes to the state store. those changes are batched as well and can be visualized very nicely in the cerebral debugger.

## Install

All you need is:

* `celica.js`
* `lit-html.js`
* `lit-extended.js`
* `npm install cerebral`

# Samples

## UI Component

```js
import { Celica, cvf } from './celica'
import { html } from './lit-extended'
import tableheader from './tableheader'
import chart1 from './chart1'

function handleClick(event) {
    cvf.RunSignal('addRowToTable')({})
    event.stopPropagation()
}
export default const app = (sharedProps, props) => {
    return html`
  <div>Some Sample!</div>
  <button on-click="${e => handleClick(e, props)}">add row</button>
  <div>${Celica(chart1, sharedProps, {}, true)}</div>
  ${Celica.EndCache()}
  <div>${Celica(tableheader, sharedProps, {})}</div>
    `
}
```

## Some words about the submitted **sharedProps** and **props** and how they should be used

**sharedProps** is maintained by CeLiCa itself. The **Celica(...)** - helper function enriches the props and returns a function called with those enriched props. **sharedProps** is initialised like this:

```js
const initProps = {
    _celica: {
        renderPartId: undefined,
        deps: {},
        changes: [],
        cacheKey: '',
        startCacheKey: undefined,
        isComputed: false
    },
    values: {}
}
```

Whereas:

* **\_celica** is mostly for internal use
* **values** are derived from the **comp.Deps** - part of the component. So all the dependencies get automatically resolved to values which can be used then in the component to generate output. inside **comp.Deps** you may use **props** as well to eg. declare dynamic statepaths
* **props** is the cache relevant user props. Use it eg. to transfer information to child components which are relevant to caching.
* ## _IMPORTANT_

The cache uses _comp.name_, _props_ and the resolved _Comp.Deps_ for its key. A cache gets automatically invalidated if a statepath as declared in **comp.Deps** changes.
This also implies that new props with old state value create a new cache variation. this could be very powerful!
(If you don't like your props beiing cached use eg. a sharedProps.MyProps for transfering data to child)

## How to cache

Use **Celica(chart1, sharedProps, props, _true_)**
(the true is important) to start caching for the particular tree.
**!!Make sure you use `Celica.EndCache()` at the end of the html tree you would like to cache!!**
Thanks to https://github.com/Polymer/lit-html/pull/276 lit-html will gladly ignore the cached nodes!
That said, just implement caching at the very end of your app design. It's not a biggie if you don't cache because lit-html does it's thing already really well

# Parent/Child Sample

## Parent

```js
import TableRow from './tablerow'
import { Celica } from './celica'
import { html } from './lit-extended'
export default function tableHeader(sharedProps, props) {
    return html`
    <div>
      <div>
        ${sharedProps.values.tableHeader.map(col => {
            return col + ' '
        })}
      </div>
      <div>
        ${sharedProps.values.tableRows.map((row, i) => {
            const res = Celica(TableRow, sharedProps, { index: i }, true)
            Celica.EndCache()
            return res
        })}
      </div>
    </div>
  `
}
tableHeader.Deps = () => {
    return {
        tableHeader: 'tableHeader',
        tableRows: 'tableRows'
    }
}
```

## Child

```js
import { html } from './lit-extended'
export default function tableRow(sharedProps, props) {
    return html`<div>
      ${sharedProps.values.tableRow.map(col => {
          return col + ' '
      })}
    </div>
    `
}
tableRow.Deps = props => {
    return { tableRow: `tableRows.${props.index}` }
}
```

## Somewhat crazy sample of using a 3rd party chart component (pay attention to the afterRender hooks)

```js
import { html } from './lit-extended'
import { globals } from './globals'
import {
    registerAfterRender,
    checkForChange,
    Celica,
    Compute,
    cvf
} from './celica'
import Chart from 'chart.js'
import { RowsProduct } from './computed1'

function handleClick(event, props) {
    cvf.RunSignal('changeChartDataClicked')({})
    event.stopPropagation()
}
export default function Chart1(props) {
    if (!props.values.showChart) {
        if (globals.chart1) {
            console.log('deestroy')
            globals.chart1.destroy()
            globals.chart1 = undefined
        }
        return
    }
    registerAfterRender(afterRender, props)
    let rowsProduct = Compute(RowsProduct, { index: 1 })
    return html`
    <div class="animated fadeIn" > 
    <button on-click="${e => handleClick(e, props)}">change chart</button>
    ${rowsProduct}
          <canvas id="chart1" /> 
    </div>
  `
}
Chart1.Deps = () => {
    return {
        showChart: 'showChart',
        chartData: 'chartData'
    }
}

function afterRender(props) {
    if (!globals.chart1) {
        console.log('init')
        let ctx = document.getElementById('chart1').getContext('2d')
        globals.chart1 = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                datasets: [
                    {
                        label: '# of Votes',
                        data: props.values.chartData,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }
                ]
            },
            options: {
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true
                            }
                        }
                    ]
                }
            }
        })
    } else if (checkForChange(props.changes, props.deps)) {
        console.log('uuupdate')
        globals.chart1.update()
    }
}
```

## Computed

```js
export function RowsProduct(props) {
    return props.values.counter * props.values.tableRows[1][1]
}
RowsProduct.Deps = props => {
    return {
        counter: 'app.counter',
        tableRows: 'tableRows'
    }
}
```

## Usage of Computed inside an Cerebral Action

```js
import { Compute } from './celica'
...
function changeChartData({ state }) {
    state.increment('chartData.0', Compute(RowsProduct, { index: 1 }))
...
}
```

Computeds are always automatically cached.
