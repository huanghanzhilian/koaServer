'use strict'

var Router=require('koa-router')
var User=require('../app/controllers/user')
var App=require('../app/controllers/app')
var Creation=require('../app/controllers/creation')

module.exports=function(){
	var router=new Router({
		prefix:'/api'//定义前缀
	})
	//user
	router.post('/u/signup',App.hasBody,User.signup)//获取验证码
	router.post('/u/verify',App.hasBody,User.verify)//验证验证码登录
	router.post('/u/update',App.hasBody,App.hasToken,User.update)

	//app
	router.post('/signature',App.hasBody,App.hasToken,App.signature)//签名


	router.post('/creations/video',App.hasBody,App.hasToken,Creation.video)//视频上传同步后台

	return router
}