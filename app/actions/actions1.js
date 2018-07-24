const doStuff = (state, value) => {
    state.B.push({ id: Date.now() })
    state.C = "X"
}
export const actions1 = action => {
    return { doStuff: action().mutation(doStuff) }
}
