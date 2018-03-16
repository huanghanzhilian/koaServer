'use strict'

var mongoose=require('mongoose')
var User=mongoose.model('User')
var robot=require('../service/robot')

//上传图片签名
exports.signature=function *(next){
	var body =this.request.body //post参数
	var key=body.key
	var token
	if(key){
		token=robot.getQiniuToken(key)
	}else{
		token=robot.getCloudinaryToken(body)
	}
	this.body={
		success:true,
		data:token
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