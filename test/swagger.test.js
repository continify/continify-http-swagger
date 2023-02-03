const tap = require('tap')
const Continify = require('continify')
const ContinifyHTTP = require('continify-http')
const ContinifySwagger = require('..')

tap.test('swagger: ', async t => {
  const ins = Continify()
  ins.register(ContinifyHTTP, { port: 2000 })
  ins.register(ContinifySwagger)

  t.plan(7)
  await ins.ready()

  const r1 = await ins.inject({
    url: '/swagger-ui'
  })
  t.equal(r1.statusCode, 404)

  const r2 = await ins.inject({
    url: '/swagger-ui/'
  })
  t.equal(r2.statusCode, 200)
  t.ok(r2.payload.includes('Swagger UI'))

  const r3 = await ins.inject({
    url: '/swagger-ui/index.html'
  })
  t.equal(r3.statusCode, 200)
  t.ok(r3.payload.includes('Swagger UI'))

  const r4 = await ins.inject({
    url: '/swagger-ui/other.html'
  })
  t.equal(r4.statusCode, 404)

  const r5 = await ins.inject({
    url: '/swagger-ui/swagger-initializer.js'
  })
  t.equal(r5.statusCode, 200)

  await ins.close()
})
