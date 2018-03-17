//'use strict'

var fs=require('fs')//文件管理
var path=require('path')//路径
var mongoose=require('mongoose')
var db='mongodb://localhost:27017/gogoshuo'
mongoose.Promise=require('bluebird')//使用bluebird来作为mongodb内置的Promise
mongoose.connect(db)//链接数据库
var models_path=path.join(__dirname,'/app/models')//定义模型路径  __dirname当前目录，需要拿到的路径
require('./app/models/user')
require('./app/models/video')
// var walk=function(modelsPath){
// 	fs
// 		.readdirSync(modelsPath)
// 		.forEach(function(file){
// 			var filePath=path.join(modelsPath,'/'+file)
// 			var stat=fs.statSync(filePath)
// 			if(stat.isFlie()){
// 				if(/(.*)\.(js|coffee)/.test(file)){
// 					require(filePath)
// 				}
// 			}else if(stat.isDirectory()){
// 				walk(filePath)
// 			}
// 		})
// }
// walk(models_path)

var koa=require('koa')
var logger=require('koa-logger')//日志中间件
var session=require('koa-session')//会话中间件
var bodyParser=require('koa-bodyparser')//解析post过来的数据

//生成服务器实例
var app=koa()

app.keys=['huang']//会话中间件里面  session cookies 里加密的key

//在koa使用中间件很简单 在use中传入中间件

app.use(logger())
app.use(session(app))
app.use(bodyParser())

var router=require('./config/routes')()

app
	.use(router.routes())
	.use(router.allowedMethods())



//监听端口号
app.listen(1234)
console.log('Listening:1234')