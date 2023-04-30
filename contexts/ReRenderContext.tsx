import { createContext, useState, useContext, useMemo, ReactNode, Dispatch, SetStateAction } from 'react'

const ctxInit: {
  reRender: number
  setReRender: Dispatch<SetStateAction<number>>
} = {
  reRender: 0,
  setReRender: () => {},
}

const ReRenderContext = createContext(ctxInit)

export const useReRender = () => {
  return useContext(ReRenderContext)
}

export const ReRenderProvider = ({ children }: { children: ReactNode }) => {
  const [reRender, setReRender] = useState(ctxInit.reRender)

  const memoedValue = useMemo(
    () => ({
      reRender,
      setReRender,
    }),
    [reRender, setReRender]
  )

  return <ReRenderContext.Provider value={memoedValue}>{children}</ReRenderContext.Provider>
}
