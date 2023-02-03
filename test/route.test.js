const tap = require('tap')
const Continify = require('continify')
const ContinifyHTTP = require('continify-http')
const ContinifySwagger = require('..')

tap.test('route: security', async t => {
  const ins = Continify()
  ins.register(ContinifyHTTP, { port: 3000 })
  ins.register(ContinifySwagger)

  t.plan(1)
  await ins.ready()
  ins.route({
    method: 'GET',
    url: '/aaaa',
    swagger: {
      security: 'token'
    }
  })
  ins.route({
    method: 'PUT',
    url: '/aaaa',
    swagger: {
      security: ['token', 'jwt']
    }
  })
  ins.route({
    method: 'POST',
    url: '/aaaa'
  })

  const r1 = await ins.inject({
    url: '/swagger-ui/swagger.json'
  })
  t.equal(r1.statusCode, 200)

  await ins.close()
})

tap.test('route: params', async t => {
  const ins = Continify()
  ins.register(ContinifyHTTP, { port: 3001 })
  ins.register(ContinifySwagger)

  t.plan(1)
  await ins.ready()
  ins.route({
    method: 'GET',
    url: '/aaaa/:p1/ccc',
    schema: {
      params: {
        type: 'object',
        properties: {
          p1: { type: 'string' }
        }
      }
    }
  })
  ins.route({
    method: 'PUT',
    url: '/aaaa/bbbb/:p2'
  })
  ins.route({
    method: 'POST',
    url: '/aaaa'
  })

  const r1 = await ins.inject({
    url: '/swagger-ui/swagger.json'
  })
  t.equal(r1.statusCode, 200)

  await ins.close()
})

tap.test('route: query', async t => {
  const ins = Continify()
  ins.register(ContinifyHTTP, { port: 3002 })
  ins.register(ContinifySwagger)

  t.plan(1)
  await ins.ready()
  ins.route({
    method: 'GET',
    url: '/aaaa',
    schema: {
      query: {
        type: 'object',
        properties: {
          q1: { type: 'string' }
        }
      }
    }
  })
  ins.route({
    method: 'PUT',
    url: '/aaaa'
  })
  ins.route({
    method: 'POST',
    url: '/aaaa',
    schema: {
      query: {
        type: 'object'
      }
    }
  })

  const r1 = await ins.inject({
    url: '/swagger-ui/swagger.json'
  })
  t.equal(r1.statusCode, 200)

  await ins.close()
})

tap.test('route: body', async t => {
  const ins = Continify()
  ins.register(ContinifyHTTP, { port: 3003 })
  ins.register(ContinifySwagger)

  t.plan(1)
  await ins.ready()
  ins.route({
    method: 'GET',
    url: '/aaaa'
  })
  ins.route({
    method: 'PUT',
    url: '/aaaa'
  })
  ins.route({
    method: 'POST',
    url: '/aaaa',
    schema: {
      body: {
        type: 'object',
        properties: {
          b1: { type: 'string' }
        }
      }
    }
  })

  const r1 = await ins.inject({
    url: '/swagger-ui/swagger.json'
  })
  t.equal(r1.statusCode, 200)

  await ins.close()
})

tap.test('route: reply', async t => {
  const ins = Continify()
  ins.register(ContinifyHTTP, { port: 3004 })
  ins.register(ContinifySwagger)

  t.plan(1)
  await ins.ready()
  ins.route({
    method: 'GET',
    url: '/aaaa'
  })
  ins.route({
    method: 'PUT',
    url: '/aaaa'
  })
  ins.route({
    method: 'POST',
    url: '/aaaa',
    schema: {
      reply: {
        type: 'object',
        properties: {
          r1: { type: 'string' }
        }
      }
    }
  })

  const r1 = await ins.inject({
    url: '/swagger-ui/swagger.json'
  })
  t.equal(r1.statusCode, 200)

  await ins.close()
})
