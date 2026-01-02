import React, { createContext, useContext, PropsWithChildren, useMemo } from 'react'
import type { SeoConfig, SeoContextValue } from './types'
import { deepMerge } from './utils'

const defaultMergeConfig = (c: SeoConfig) => c

const SeoContext = createContext<SeoContextValue>({
  defaults: {},
  mergeConfig: defaultMergeConfig
})

/**
 * Provider component for global SEO defaults.
 * 
 * Wrap your app with SeoProvider to set site-wide defaults
 * that will be merged with individual SeoTags props.
 * 
 * @example
 * ```tsx
 * <SeoProvider defaults={{ 
 *   titleTemplate: '%s | My Site',
 *   twitter: { site: '@myhandle' }
 * }}>
 *   <App />
 * </SeoProvider>
 * ```
 */
export const SeoProvider: React.FC<
  PropsWithChildren<{ defaults?: Partial<SeoConfig> }>
> = ({ defaults = {}, children }) => {
  const value = useMemo<SeoContextValue>(() => ({
    defaults,
    mergeConfig: (config: SeoConfig): SeoConfig => {
      // Deep merge defaults with config
      const merged = deepMerge(defaults as SeoConfig, config)

      // Special handling for titleTemplate: only use if not explicitly set in config
      if (defaults.titleTemplate && !config.titleTemplate) {
        merged.titleTemplate = defaults.titleTemplate
      }

      return merged
    }
  }), [defaults])

  return (
    <SeoContext.Provider value={value}>
      {children}
    </SeoContext.Provider>
  )
}

SeoProvider.displayName = 'SeoProvider'

/**
 * Hook to access SEO context.
 * 
 * Can be used without a provider - will return a no-op mergeConfig.
 */
export const useSeo = (): SeoContextValue => {
  const context = useContext(SeoContext)
  return context
}
