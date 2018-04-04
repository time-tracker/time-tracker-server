const express = require('express')
const cookieSession = require('cookie-session')

const env = require('./.env.js')
console.log(env)

const app = express()

const WebSocketServer = require('ws').Server
const wss = new WebSocketServer({ port: 40510 })

function noop() { }
function heartbeat() {
  this.isAlive = true;
}
wss.on('connection', function (ws) {
  console.log('Connected')
  ws.isAlive = true
  ws.on('pong', heartbeat);
})
setInterval(() => {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
      console.log('Terminating')
      return ws.terminate()
    }
    ws.send(`${new Date()}`)

    ws.isAlive = false;
    ws.ping(noop)
  })
}, 1000)

app.use(express.json())
app.use(cookieSession({
  name: 'session',
  keys: [env.cookieKey],
  maxAge: 24 * 60 * 60 * 1000 * 30 // 1 month
}))

app.get('/', (req, res) => {
  res.send('Hello from your api!')
})
app.get('/user', (req, res) => {
  const user = req.session.user || { name: 'guest', msg: 'Please login'}
  res.send(user)
})
app.post('/signup', (req, res) => {
  console.log(req.body)
  res.send({ msg: 'Got it! saving now...' })
})
app.post('/login', (req, res) => {
  console.log(req.body)
  res.send(req.body)
})

app.listen(3000, (err) => {
  if (err) console.log(err)
  console.log('Listening on 3000')
})
