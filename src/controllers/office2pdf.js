import converter from 'office-converter'

export default (ctx) => {
  converter.generatePdf('test.xlsx', function (err, result) {
    // Process result if no error
    if (result.status === 0) {
      console.log('Output File located at ' + result.outputFile)
    } else {
      console.log(err)
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
