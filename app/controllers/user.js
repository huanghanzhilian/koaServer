'use strict'

var mongoose=require('mongoose')
var User=mongoose.model('User')
var xss=require('xss')
var uuid=require('uuid') //生成tonkonid
var sms=require('../service/sms')


//手机注册 发送短信
exports.signup=function *(next){
	var phoneNumber=this.request.body.phoneNumber  //post参数
	//var phoneNumber=this.query.phoneNumber  //get参数
	var user=yield User.findOne({
		phoneNumber:phoneNumber
	}).exec()
	var verifyCode=sms.getCode()
	if(!user){
		var accessToken=uuid.v4()
		user=new User({
			avatar:'http://static.samured.com/assets/images/game/head/44663f7d04d0b59ab162c51700494646.png',
			nickname:'小黄人',
			phoneNumber:xss(phoneNumber),
			verifyCode:verifyCode,
			accessToken:accessToken
		})
	}else{
		user.verifyCode=verifyCode
	}
	//保存信息
	try{
		user=yield user.save()
	}catch(e){
		this.body={
			success:true
		}
		return next
	}	
	//发送验证码
	var msg='您的注册验证码是：'+user.verifyCode
	
	try{
		sms.send(user.phoneNumber,msg)
	}catch(e){
		console.log(e)
		this.body={
			success:false,
			err:'短信法务异常'
		}
		return next
	}
	this.body={
		success:true
	}
}

//短信验证登录
exports.verify=function *(next){
	var verifyCode=this.request.body.verifyCode
	var phoneNumber=this.request.body.phoneNumber
	if(!verifyCode||!phoneNumber){
		this.body={
			success:false,
			err:'验证未通过'
		}
		return next
	}
	var user =yield User.findOne({
		phoneNumber:phoneNumber,
		verifyCode:verifyCode
	}).exec()

	if(user){
		user.verifyed=true,
		user=yield user.save()
		this.body={
			success:true,
			data:{
				nickname:user.nickname,
				accessToken:user.accessToken,
				avatar:user.avatar,
				_id:user._id
			}
		}
	}else{
		this.body={
			success:false,
			err:'验证未通过'
		}
	}
}
//更新用户信息
exports.update=function *(next){
	var body=this.request.body
	
	var user=this.session.user

	var fields='avatar,gender,age,nickname,breed'.split(',')
	fields.forEach(function(field){
		if(body[field]){
			user[field]=body[field]
		}
	})
	user=yield user.save()

	this.body={
		success:true,
		data:{
			nickname:user.nickname,
			accessToken:user.accessToken,
			avatar:user.avatar,
			gender:user.gender,
			age:user.age,
			breed:user.breed,
			_id:user._id
		}
	}
}