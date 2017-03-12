import KoaRouter from 'koa-router'
import controllers from '../controllers/index.js'

const router = new KoaRouter()

router
  .get('/', function (ctx, next) {
    ctx.body = '禁止访问！'
  }) // HOME 路由
  .all('/upload', controllers.upload.default)
  .post('/office2pdf', controllers.office2pdf.default)

module.exports = router
