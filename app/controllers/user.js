'use strict'

var mongoose=require('mongoose')
var User=mongoose.model('User')
var xss=require('xss')

exports.signup=function *(next){
	//var phoneNumber=this.request.body.phoneNumber
	var phoneNumber=this.query.phoneNumber
	var user=yield User.findOne({
		phoneNumber:phoneNumber
	}).exec()
	if(!user){
		user=new User({
			phoneNumber:xss(phoneNumber)
		})
	}else{
		user.verifyCode='1212'
	}
	try{
		user=yield user.save()
	}catch(e){
		this.body={
			success:true
		}
		return
	}	


	this.body={
		success:true
	}
}

exports.verify=function *(next){
	this.body={
		success:true
	}
}

exports.update=function *(next){
	this.body={
		success:true
	}
}