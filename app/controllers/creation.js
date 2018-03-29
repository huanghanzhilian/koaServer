'use strict'

var mongoose=require('mongoose')
var User=mongoose.model('User')
var Video=mongoose.model('Video')
var Audio=mongoose.model('Audio')
var robot=require('../service/robot')
var config=require('../../config/config')

//音频
exports.audio=function *(next){
	var body =this.request.body
	var videoId=body.videoId
	var audioData=body.audio
	var user=this.session.user
	if(!audioData||!audioData.public_id){
		this.body={
			success:false,
			err:'音频没有上传成功!'
		}
		return next
	}
	var audio=yield Audio.findOne({
		public_id:audioData.public_id
	})
	.exec()
	var video=yield Video.findOne({
		_id:videoId
	})
	.exec()

	if(!audio){
		var _audio={
			author:user._id,
			public_id:audioData.public_id,
			detail:audioData
		}
		//如果视频是有的
		if(video){
			_audio.video=video._id
		}
		audio=new Audio(_audio)
		audio=yield audio.save()
	}
	this.body={
		success:true,
		data:audio
	}
}

//视频上传同步后台
exports.video=function *(next){
	var body =this.request.body
	var videoData=body.video
	var user=this.session.user
	//console.log(body)
	//console.log(videoData.key)


	if(!videoData||!videoData.key){
		this.body={
			success:false,
			err:'视频没有上传成功!'
		}
		return next
	}
	var video=yield Video.findOne({
		qiniu_key:videoData.key
	}).exec()

	if(!video){
		video=new Video({
			author:user._id,
			qiniu_key:videoData.key,
			persistentId:videoData.persistentId
		})
		video=yield video.save()
	}
	var url=config.qiniu.video+video.qiniu_key
	robot.uploadToCloudinary(url)
		.then(function(data){
			if(data&&data.public_id){
				video.public_id=data.public_id
				video.detail=data
				video.save()
			}
		})

	this.body={
		success:true,
		data:{
			video:video._id
		}
	}
}
