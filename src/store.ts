import { create } from "zustand"

const makeCoord = (x: number, y: number, z: number) => `${x},${y},${z}`


export type Store = {
    grid: Set<string>
    getPoint: (x: number, y: number, z: number) => boolean
    setPoint: (x: number, y: number, z: number, value: boolean) => void
    togglePoint: (x: number, y: number, z: number) => boolean
}

export const useStore = create<Store>((set, get) => ({
    grid: new Set<string>,

    getPoint: (x, y, z) => get().grid.has(makeCoord(x, y, z)),
    setPoint: (x, y, z, v) => set(state => {
        const hasCoord = state.getPoint(x, y, z)
        if (hasCoord) {
            if (!v) {
                const copy = new Set(state.grid)
                copy.delete(makeCoord(x, y, z))
                return {
                    grid: copy
                }
            }
        } else {
            if (v) {
                return {
                    grid: new Set(state.grid).add(makeCoord(x, y, z))
                }
            }
        }
        return { grid: state.grid }
    }),
    togglePoint: (x, y, z) => {
        const state = get()
        const hasCoord = state.getPoint(x, y, z)
        const copy = new Set(state.grid)
        if (hasCoord) {
            copy.delete(makeCoord(x, y, z))
            set(() => ({ grid: copy }))
            return false
        } else {
            copy.add(makeCoord(x, y, z))
            set(() => ({ grid: copy }))
            return true
        }
    },
}))