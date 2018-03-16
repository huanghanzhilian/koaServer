'use strict'

var mongoose=require('mongoose')
var User=mongoose.model('User')
var config=require('../../config/config')
var sha1=require('sha1')


//上传图片签名
exports.signature=function *(next){
	var body =this.request.body //post参数
	var type=body.type
	var timestamp=body.timestamp
	var folder
	var tags
	if(type=='avatar'){
		folder='avatar'
		tags='app,avatar'
	}else if(type==='video'){
		folder='video'
		tags='app,video'
	}else if(type==='audio'){
		folder='audio'
		tags='app,audio'
	}
	var signature='folder='+folder+'&tags='+tags+'&timestamp='+timestamp+config.cloudinary.api_secret
  signature=sha1(signature)//加密算法
	this.body={
		success:true,
		data:signature
	}
}

//验证post是否无字段 中间件
exports.hasBody=function *(next){
	var body =this.request.body||{}  //post参数
	if(!body||Object.keys(body).length===0){
		this.body={
			success:false,
			err:'是不是漏掉什么了'
		}
		return next
	}
	//走向下一个中间件
	yield next
}

//验证是否有accessToken 中间件
exports.hasToken=function *(next){
	var accessToken=this.query.accessToken  //get参数
	if(!accessToken){
		accessToken =this.request.body.accessToken  //post参数
	}
	
	if(!accessToken){
		this.body={
			success:false,
			err:'钥匙丢了'
		}
		return next
	}
	var user=yield User.findOne({
		accessToken:accessToken
	}).exec()
	if(!user){
		this.body={
			success:false,
			err:'用户没登录'
		}
		return next
	}
	this.session=this.session||{}
	this.session.user=user
	//走向下一个中间件
	yield next
}