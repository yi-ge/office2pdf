import path from 'path'
import Converter from 'office-converter'

let converter = new Converter()

export default (ctx) => {
  converter.generatePdf(path.resolve(__dirname, './test.xlsx'), function (err, result) {
    if (err) {
      console.log(err)
    }
    // Process result if no error
    if (result.status === 0) {
      console.log('Output File located at ' + result.outputFile)
    }
  })
  // converter.generateHtml('test.docx', function (err, result) {
  //   // Process result if no error
  //   if (result.status === 0) {
  //     console.log('Output File located at ' + result.outputFile)
  //   }
  // })
  ctx.body = {
    result: 'post',
    name: ctx.params.name,
    para: ctx.request.body
  }
}
