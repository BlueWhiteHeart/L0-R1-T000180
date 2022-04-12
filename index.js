const fs = require('fs')
const path = require('path')
const util = require('util')
// 把 callback 包装成一个 Promise
const open = util.promisify(fs.open)
const read = util.promisify(fs.read)
const { getTime, getLocaleTime } = require('./lib/time')

// ([+- 以及正则开头的斜杠前面要加上分号
;(async function () {
  // 拿到与 index.js 同级的 video 文件夹
  // 再拿到 video 文件夹下所有 mp4 文件
  const dir = path.resolve(__dirname, './video')
  const files = fs.readdirSync(dir)
    .filter(file => path.extname(file) === '.mp4')
    .map(file => path.resolve(dir, file))

  // 同时读取所有 mp4 文件的文件头
  const videos = await Promise.all(
    files.map(async file => {
      try {
        const fd = await open(file, 'r')
        // 申请 100 字节的 Buffer 缓冲区，用 120 150 都没关系，足以拿到 MP4 文件头
        const buff = Buffer.alloc(100)
        const { buffer } = await read(fd, buff, 0, 100, 0)
        const time = getTime(buffer)

        return { file, time }
      } catch (err) {
        console.log(file, err)
      }
    })
  )

  const duration = getLocaleTime(
    videos.reduce((prev, e) => {
      return prev + e.time
    }, 0)
  )
  const info = `视频总数：${videos.length}，视频总时长: ${duration}`

  console.log(info)
  return info
})()
