'use strict'

var Router=require('koa-router')
var User=require('../app/controllers/user')
var App=require('../app/controllers/app')

module.exports=function(){
	var router=new Router({
		prefix:'/api/1'//定义前缀
	})
	//user
	router.post('/u/signup',User.signup)
	router.post('/u/verify',User.verify)
	router.post('/u/update',User.update)

	//app
	router.post('/signature',App.signature)//签名

	return router
}