import React, { createContext, useContext, type ReactNode } from 'react'

interface RecorderContextValue {}

interface RecorderProviderProps {
  children: ReactNode
}

export const RecorderContext = createContext<RecorderContextValue | undefined>(undefined)

/**
 * Screen context provider to allow our child components to access screen props
 */
export const RecorderProvider = (props: RecorderProviderProps) => {
  const { children } = props

  return <RecorderContext.Provider value={{}}>{children}</RecorderContext.Provider>
}

export const useRecorder = () => useContext(RecorderContext)
