const moment = require('moment')

function getTime (buffer) {
  // 关于 mvhd + 17 可以看下文档
  // https://www.yuque.com/5k/tdu0oz/ok8obr#IQ2ih
  const idx = buffer.indexOf(Buffer.from('mvhd'))

  if (idx === -1) throw new Error('文件头已损坏无法读取 mvhd')

  const start = idx + 17
  const timeScale = buffer.readUInt32BE(start)
  const duration = buffer.readUInt32BE(start + 4)
  const movieLength = Math.floor(duration / timeScale)

  return movieLength
}

function getLocaleTime (seconds) {
  return moment
    .duration(seconds, 'seconds')
    .toJSON()
    .replace(/[PTHMS]/g, str => {
      switch (str) {
        case 'H': return '小时'
        case 'M': return '分钟'
        case 'S': return '秒'
        default: return ''
      }
    })
}

module.exports = {
  getTime,
  getLocaleTime
}
