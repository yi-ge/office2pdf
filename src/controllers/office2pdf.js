import fs from 'fs'
import path from 'path'
import Converter from 'office-converter'
import { System as SystemConfig } from '../config'

let converter = new Converter()

let saveFile = async (ctx, yearAndMonth) => {
  // 文件将要上传到哪个文件夹下面
  var uploadfolderpath = path.join(__dirname, '../../assets/uploads' + yearAndMonth)
  var files = ctx.request.body.files

  // formidable 会将上传的文件存储为一个临时文件，现在获取这个文件的目录
  var tempfilepath = files.file.path
  // 获取文件类型
  var type = files.file.type

  // 获取文件名，并根据文件名获取扩展名
  var filename = files.file.name
  var extname = filename.lastIndexOf('.') >= 0 ? filename.slice(filename.lastIndexOf('.') - filename.length) : ''
  // 文件名没有扩展名时候，则从文件类型中取扩展名
  if (extname === '' && type.indexOf('/') >= 0) {
    extname = '.' + type.split('/')[1]
  }
  // 将文件名重新赋值为一个随机数（避免文件重名）
  filename = Math.random().toString().slice(2) + extname

  // 构建将要存储的文件的路径
  var filenewpath = path.join(uploadfolderpath, filename)

  // 将临时文件保存为正式的文件
  try {
    console.time('移动文件耗时：')
    fs.renameSync(tempfilepath, filenewpath)
    console.timeEnd('移动文件耗时：')
  } catch (err) {
    if (err) {
      // 发生错误
      console.log('fs.rename err')
      return 'save error'
    }
  }
  // 保存成功
  console.log('Uploaded new file: ' + filename)
  return {
    path: filenewpath,
    name: filename
  }
}

let converterFile = (filepath, filename, yearAndMonth) => {
  let result = path.resolve(__dirname, '../../files/' + yearAndMonth + '/' + filename)
  return new Promise(function (resolve, reject) {
    converter.generatePdf(filepath, function (err, results) {
      if (err) {
        reject(err)
      } else if (results.status === 0) {
        let outputFile = results.outputFile
        try {
          console.time('移动文件耗时：')
          fs.renameSync(outputFile, result)
          console.timeEnd('移动文件耗时：')
        } catch (err) {
          if (err) {
            // 发生错误
            reject(err)
          }
        }
        result = result.slice(result.indexOf('/files'), result.length)
        resolve(result)
      }
    })
  })
}

let getConverteredFile = async (ctx, yearAndMonth) => {
  let fileInfo = await saveFile(ctx, yearAndMonth)

  if (fileInfo !== 'save error') {
    let result = null
    try {
      result = await converterFile(fileInfo.path, fileInfo.name, yearAndMonth)
      // 拼接url地址
      return {
        status: 1,
        result: {
          Converter: 'ok',
          DownloadPath: SystemConfig.API_server_type + SystemConfig.API_server_host + result
        }
      }
    } catch (err) {
      return {
        status: 503,
        result: {
          errInfo: '转码错误！ Converter Error.'
        }
      }
    }
  } else {
    return {
      status: 503,
      result: {
        errInfo: '文件错误。 File error.'
      }
    }
  }
}

export default (ctx) => {
  // 设置允许跨域的域名称
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.set('Access-Control-Allow-Headers', 'X-Requested-With')
  ctx.set('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')

  // ----- 情况1：跨域时，先发送一个options请求，此处要返回200 -----
  if (ctx.method === 'OPTIONS') {
    // 返回结果
    ctx.status = 200
    ctx.body = 'options OK'
    return
  } else if (ctx.method === 'POST') {
    const now = new Date()
    const yearAndMonth = now.getYear() + now.getMonth()
    // ----- 情况2：发送post请求，上传图片 -----
    return getConverteredFile(ctx, yearAndMonth).then((data) => {
      ctx.body = data
    })
  } else {
    ctx.status = 403
    ctx.body = {
      status: 403,
      result: {
        errInfo: '请求方式不被支持！ The requested method is not supported.'
      }
    }
  }
}
