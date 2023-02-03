import { Continify } from 'continify'
import { RouteOptions } from 'continify-http'
// import * as jwt from 'jsonwebtoken'

export interface ContinifyHTTPSwaggerOptions {
  useInBeta?: boolean
  basePath?: string
  info?: {
    description?: string
    version?: string
    title?: string
  }
}

export type ContinifyHTTPSwaggerPlugin = (
  ins: Continify,
  options: ContinifyHTTPSwaggerOptions
) => Promise<void>

declare const plugin: ContinifyHTTPSwaggerPlugin
export = plugin

declare module 'avvio' {
  interface Use<I, C = context<I>> {
    (fn: ContinifyHTTPSwaggerPlugin, options?: ContinifyHTTPSwaggerOptions): C
  }
}

declare module 'continify' {
  interface ContinifyOptions {
    swagger?: ContinifyHTTPSwaggerOptions
  }
}

declare module 'continify-http' {
  interface RouteOptions {
    swagger?: {
      deprecated?: boolean
      desc?: string
      summary?: string
      security?: string | Array<string>
    }
  }
}
