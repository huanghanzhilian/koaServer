'use strict'

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