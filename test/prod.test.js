const tap = require('tap')
const Continify = require('continify')
const ContinifyHTTP = require('continify-http')
const ContinifyAJV = require('continify-http-ajv')
const ContinifySwagger = require('..')

tap.test('route: security', async t => {
  const ins = Continify()
  ins.register(ContinifyHTTP, { port: 5000 })
  ins.register(ContinifyAJV)
  ins.register(ContinifySwagger)

  process.env.NODE_ENV = 'beta'
  t.plan(1)
  await ins.ready()
  t.equal(ins.$router.routes.length, 0)

  await ins.close()
})
