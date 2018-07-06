# liov

lit-html and project overmind proof of concept

WIP

computeds are sharing state (if used in ui or in a action, if computed compid is the same state gets shared)

todos:
check with chartjs comp (hint: afterRender Hooks)
testsuite
nice readme
usage:
Computeds (In Actions or in UI Comp)

## Compute(comp, props, hasPropsDependency, validForMS)

-   props for user props <- mandatory if used inside ui comp for parent handling!!
-   hasPropsDependency true if it should react also on props changes
-   validForMS -> Timespan in millisecs. if there is no activity for such a period the compstate gets deleted (handlers will always be removed)

## Lif(comp, props)

For the UI Components
