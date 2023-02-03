const tap = require('tap')
const Continify = require('continify')
const ContinifyHTTP = require('continify-http')
const ContinifyAJV = require('continify-http-ajv')
const ContinifySwagger = require('..')

tap.test('route: security', async t => {
  const ins = Continify()
  ins.register(ContinifyHTTP, { port: 4000 })
  ins.register(ContinifyAJV)
  ins.register(ContinifySwagger)

  t.plan(4)
  await ins.ready()
  ins.route({
    method: 'GET',
    url: '/aaaa',
    schema: {
      query: {
        type: 'object',
        additionalProperties: false,
        desc: 'desc test', // add desc keyword
        properties: {
          q1: { type: 'number' },
          q2: { type: 'string' }
        }
      }
    },
    handler (req, rep) {
      t.equal(req.$query.q1, 12)
      t.equal(req.$query.q3, undefined)
      rep.send(req.$query.q2)
    }
  })

  const r1 = await ins.inject({
    url: '/aaaa?q1=12&q2=yyy&q3=ppp'
  })
  t.equal(r1.statusCode, 200)
  t.equal(r1.payload, 'yyy')

  await ins.close()
})
