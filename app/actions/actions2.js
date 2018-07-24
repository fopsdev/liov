const setToC = (state, value) => {
    state.C = "C"
}

export const actions2 = action => {
    return { setToC: action().mutation(setToC) }
}
