'use strict'

var mongoose=require('mongoose')
var User=mongoose.model('User')
var Video=mongoose.model('Video')
var Audio=mongoose.model('Audio')
var robot=require('../service/robot')
var config=require('../../config/config')
var Promise=require('bluebird')

function asyncMedia(videoId,audioId){
	if(!videoId){
		return
	}
	var query={
		_id:audioId
	}
	if(!audioId){
		query={
			video:videoId
		}
	}

	Promise.all([
    Video.findOne({_id: videoId}).exec(),
    Audio.findOne(query).exec()
  ])
  .then(function(data) {
    console.log(data)
    var video = data[0]
    var audio = data[1]

    console.log("检查数据有效性")
		if(!video||!video.public_id||!audio||!audio.public_id){
			return
		}
		console.log("开始同步音频视频")
		var video_public_id=video.public_id
		var audio_public_id=audio.public_id.replace('/',':')
		var videoName=video_public_id.replace('/','_')+'.mp4'
		var videoURL='http://res.cloudinary.com/de5fw2yto/video/upload/e_volume:-100/e_volume:400,l_video:'+audio_public_id+'/'+video_public_id+'.mp4'
		//拿到封面图
		var thumbName=video_public_id.replace('/','_')+'.jpg'
		var thumbURL='http://res.cloudinary.com/de5fw2yto/video/upload/'+video_public_id+'.jpg'
		console.log('同步视频到七牛')
		robot
			.saveToQiniu(videoURL,videoName)
			.catch(function(err){
				console.log(err)
			})
			.then(function(response){
				if(response&&response.key){
					audio.qiniu_video=response.key
					audio.save().then(function(_audio){
						console.log(_audio)
					})
					console.log('同步视频成功')
				}
			})
		console.log('同步图片到七牛')
		robot
			.saveToQiniu(thumbURL,thumbName)
			.catch(function(err){
				console.log(err)
			})
			.then(function(response){
				if(response&&response.key){
					audio.qiniu_thumb=response.key
					audio.save().then(function(_audio){
						console.log(_audio)
					})
					console.log('同步图片成功')
				}
			})

  })	
}


//音频
exports.audio=function *(next){
	var body =this.request.body

	var videoId=body.videoId.video
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
	//异步操作 不会阻止后面代码执行
	//同步多媒体数据
	asyncMedia(video._id, audio._id)

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
				video.save().then(function(_video){
					asyncMedia(_video._id)
				})
			}
		})

	this.body={
		success:true,
		data:{
			video:video._id
		}
	}
}
