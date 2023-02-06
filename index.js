const getValue = require('get-value')
const merge = require('lodash.merge')
const ConnitifyPlugin = require('continify-plugin')
const SwaggerUI = require('swagger-ui-dist')
const { existsSync, createReadStream } = require('fs')

function addParameters (name, schema, parameters) {
  const props = schema.properties || {}
  const required = schema.required || []

  Object.keys(props).forEach(k => {
    const field = props[k]
    parameters.push({
      name: k,
      in: name,
      required: required.includes(k),
      type: field.type,
      default: field.default,
      description: field.desc
    })
  })
}

module.exports = ConnitifyPlugin(
  async function (ins, options) {
    const { $options } = ins
    const envOption = getValue($options, 'swagger', {
      default: {}
    })
    const serverOption = getValue($options, 'server', {
      default: {}
    })
    const rootPath = SwaggerUI.absolutePath()
    const swaggerOption = merge(options, envOption)
    swaggerOption.basePath = serverOption.routePrefix
    const swaggerPaths = {}

    if (ins.hasDecorator('$ajv')) {
      ins.$ajv.addKeyword({
        keyword: 'desc',
        type: 'string',
        allowUndefined: true
      })
    }

    ins.addHook('onRoute', async function (rt) {
      if (!rt.schema && !rt.swagger) {
        this.$log.warn(`swagger.json skip:[${rt.method}] ${rt.url}`)
      }

      const url = rt.url
        .split('/')
        .map(v => {
          if (v.indexOf(':') === 0) {
            return `{${v.substring(1)}}`
          }
          return v
        })
        .join('/')

      if (!swaggerPaths[url]) {
        swaggerPaths[url] = {}
      }

      const parameters = []
      const responses = {}
      const path = swaggerPaths[url]
      const swagger = rt.swagger || {}
      const schema = rt.schema || {}

      if (swagger.security) {
        if (!Array.isArray(swagger.security)) {
          swagger.security = [swagger.security]
        }

        swagger.security.forEach(s => {
          parameters.push({
            name: s,
            in: 'header',
            required: true,
            type: 'string'
          })
        })
      }

      if (schema.params) {
        addParameters('path', schema.params, parameters)
      }

      if (schema.query) {
        addParameters('query', schema.query, parameters)
      }

      if (schema.body) {
        parameters.push({
          name: 'body',
          in: 'body',
          required: true,
          schema: schema.body
        })
      }

      if (schema.reply) {
        responses['200'] = {
          schema: schema.reply
        }
      }

      path[rt.method.toLowerCase()] = {
        deprecated: swagger.deprecated || false,
        description: swagger.desc || '',
        summary: swagger.summary || '',
        parameters,
        responses
      }
    })

    ins.route({
      $useInProd: false,
      $useInBeta: swaggerOption.useInBeta,
      url: '/swagger-ui/swagger-initializer.js',
      handler (req, rep) {
        const path = './swagger-initializer.jsc'
        rep.$sent = true
        createReadStream(path).pipe(rep.$raw)
      }
    })

    ins.route({
      $useInProd: false,
      $useInBeta: swaggerOption.useInBeta,
      url: '/swagger-ui/swagger.json',
      handler (req, rep) {
        rep.send({
          ...swaggerOption,
          paths: swaggerPaths
        })
      }
    })

    ins.route({
      $useInProd: false,
      $useInBeta: swaggerOption.useInBeta,
      url: '/swagger-ui/:file',
      handler (req, rep) {
        const path = `${rootPath}/${req.$params.file || 'index.html'}`

        if (existsSync(path)) {
          rep.$sent = true
          createReadStream(path).pipe(rep.$raw)
        } else {
          rep.code(404).end()
        }
      }
    })
  },
  {
    useInBeta: false,
    swagger: '2.0',
    info: {
      description: 'This is a sample description',
      version: '1.0.0',
      title: 'Continify Swagger'
    },
    schemes: ['http'],
    continify: '>=0.1.11'
  }
)
