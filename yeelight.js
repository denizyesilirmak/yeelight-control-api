const { Yeelight } = require('yeelight-node')

const OPTIONS = {
  effect: 'smooth', // smooth/sudden
  duration: 1000 * 1, // ms
  defaultPowerOnMode: 0, // mode 0 = normal, 1 = CT mode, 2 = RGB mode, 3 = HSV mode, 4 = CF mode, 5 = Night mode
}

//55444 sağ
//55443 sol
const yeelight_left = new Yeelight({ ip: 'semizyeelight.asuscomm.com', port: 55443 })
const yeelight_right = new Yeelight({ ip: 'semizyeelight.asuscomm.com', port: 55444 })

const getCommandRunner = yee => fn => {
  if (yee) {
    fn(yee)
  } else {
    fn(yeelight_left)
    fn(yeelight_right)
  }
}

const getProp = async (prop, yee) => {
  const res = await yee.get_prop(prop)
  const data = JSON.parse(res)
  const result = data['result']
  if (result.length <= 1) { return result[0] }
  else { return result }
  return result
}

const setProp = async (prop, value, yee) => {
  const runner = getCommandRunner(yee)
  runner(async yee => {
    const s = await yee.set_prop(prop, value)
    return s
  })
}

/**
 * Set the RGB color of the light
 * @param {Boolean|string} val Array of R,G,B as values between 0 and 255
 */
const setPower = async (val, yee) => {
  // value: 'on'/'off'
  if (typeof val === 'boolean') {
    value = val ? 'on' : 'off'
  } else {
    value = val
  }
  const runner = getCommandRunner(yee)
  runner(async yee => {
    const test = await yee.set_power(value, OPTIONS.effect, OPTIONS.duration, OPTIONS.defaultPowerOnMode)
  })
}

const togglePower = async (yee) => {
  const runner = getCommandRunner(yee)
  runner(async yee => {
    const current = await getProp('power', yee)
    if (current === 'on') {
      await setPower('off', yee)
    } else if (current === 'off') {
      await setPower('on', yee)
    }
  })
}

const decimalToRGB = (decimal) => {
  return {
    red: (decimal >> 16) & 0xff,
    green: (decimal >> 8) & 0xff,
    blue: decimal & 0xff,
  }
}

const getStatusList = async () => {
  // Left
  const YEE_LEFT = {}
  YEE_LEFT.colorMode = await getProp('color_mode', yeelight_left)
  YEE_LEFT.ct = YEE_LEFT.colorMode === '2' ? await getProp('ct', yeelight_left) : ''
  YEE_LEFT.rgb = YEE_LEFT.colorMode === '1' ? decimalToRGB(await getProp('rgb', yeelight_left)) : ''
  YEE_LEFT.brightness = await getProp('bright', yeelight_left)
  YEE_LEFT.power = await getProp('power', yeelight_left)

  // Right
  const YEE_RIGHT = {}
  YEE_RIGHT.colorMode = await getProp('color_mode', yeelight_right)
  YEE_RIGHT.ct = YEE_RIGHT.colorMode === '2' ? await getProp('ct', yeelight_right) : ''
  YEE_RIGHT.rgb = YEE_RIGHT.colorMode === '1' ? decimalToRGB(await getProp('rgb', yeelight_right)) : ''
  YEE_RIGHT.brightness = await getProp('bright', yeelight_right)
  YEE_RIGHT.power = await getProp('power', yeelight_right)

  return {
    yeelightLeft: YEE_LEFT,
    yeelightRight: YEE_RIGHT
  }
}

/**
 * Set the RGB color of the light as values between 0 and 255
 */
const setRGB = async (r, g, b, yee) => {
  // If off
  await setPower('on', yee)
  const runner = getCommandRunner(yee)
  runner(async yee => {
    await yee.set_rgb([r, g, b], OPTIONS.effect, OPTIONS.duration)
  })
}

/**
 * Set the color temperature
 * @param {number} val The color temperature as an int between 1700 and 6500 (k)
 */
const setColorTemperature = (val, yee) => {
  const runner = getCommandRunner(yee)
  runner(async yee => {
    await yee.set_ct_abx(val, OPTIONS.effect, OPTIONS.duration)
  })
}

/**
 * This method is used to change the brightness of the Smart LED
 * @param {Number} val The desired brightness between 1 and 100
 */
const setBrightness = async (val, yee) => {
  const runner = getCommandRunner(yee)
  runner(async yee => {
    await yee.set_bright(val, OPTIONS.effect, OPTIONS.duration)
  })
}

const setDuration = val => {
  OPTIONS.duration = val
}

const setEffect = val => {
  OPTIONS.effect = val
}

module.exports = {
  setBrightness,
  setColorTemperature,
  setRGB,
  togglePower,
  getStatusList,
  setPower,
  setDuration,
  setEffect
}