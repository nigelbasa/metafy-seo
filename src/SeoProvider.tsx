import React, { createContext, useContext, PropsWithChildren } from 'react'
import type { SeoConfig, SeoContextValue } from './types'

const SeoContext = createContext<SeoContextValue>({
  defaults: {},
  mergeConfig: (c: SeoConfig) => c
})

export const SeoProvider: React.FC<
  PropsWithChildren<{ defaults?: Partial<SeoConfig> }>
> = ({ defaults, children }) => {
  const mergeConfig = (config: SeoConfig): SeoConfig => ({
    ...defaults,
    ...config,
    openGraph: { ...defaults?.openGraph, ...config.openGraph },
    twitter: { ...defaults?.twitter, ...config.twitter }
  })

  return (
    <SeoContext.Provider value={{ defaults, mergeConfig }}>
      {children}
    </SeoContext.Provider>
  )
}

export const useSeo = () => useContext(SeoContext)
