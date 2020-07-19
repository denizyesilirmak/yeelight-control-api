const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3131
const yee = require('./yeelight')

app.use(bodyParser.json())

app.post('/toggle', async (req, res) => {
  await yee.togglePower()
  res.send("a")
})

app.post('/color', async (req, res) => {
  await yee.setRGB(...req.body.color)
  res.send(req.body.color)
})

app.post('/brightness', async (req, res) => {
  await yee.setBrightness(req.body.brightness)
  res.send(JSON.stringify(req.body.brightness))
})

app.post('/options', async (req, res) => {
  const { effect, duration } = req.body
  try {
    await yee.setEffect(effect)
    await yee.setDuration(duration)
    res.send({ effect, duration })
  } catch { }
})

app.post('/power', async (req, res) => {
  await yee.setPower(req.body.state)
  res.send(req.body.state)
})

app.post('/white', async (req, res) => {
  await yee.setColorTemperature(req.body.tempeture)
  res.send(JSON.stringify(req.body.tempeture))
})

app.get('/status',async (req, res) => {
  const status = await yee.getStatusList();
  res.json(status)
})

app.listen(port, () => {
  console.log(`server started at: ${port}`)
})