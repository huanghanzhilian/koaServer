'use strict'

var mongoose=require('mongoose')
var User=mongoose.model('User')
var Video=mongoose.model('Video')
var robot=require('../service/robot')


//视频上传同步后台
exports.video=function *(next){
	var body =this.request.body
	var videoData=body.video
	var user=this.session.user
	if(!videoData||!videoData.qiniu_key){
		this.body={
			success:false,
			err:'视频没有上传成功!'
		}
		return next
	}
	var video=yield Video.findOne({
		qiniu_key:videoData.qiniu_key
	}).exec()

	if(!video){
		video=new Video({
			author:user._id,
			qiniu_key:videoData.qiniu_key,
			persistentId:videoData.persistentId
		})
		video=yield video.save()
	}
	this.body={
		success:true,
		data:{
			video._id
		}
	}
}
