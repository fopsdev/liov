const doStuff = (state, value) => {
    state.B.push({ id: Date.now() })
    state.C = "X"
}

const removeStuff = (state, value) => {
    state.B.pop()
}

export const actions1 = action => {
    return {
        doStuff: action().mutation(doStuff),
        removeStuff: action().mutation(removeStuff)
    }
}
