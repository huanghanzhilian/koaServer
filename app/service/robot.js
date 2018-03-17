'use strict'

var qiniu = require('qiniu')//七牛
var config = require('../../config/config')
var sha1=require('sha1')
var uuid=require('uuid')
var cloudinary=require('cloudinary')
var Promise=require('bluebird')

cloudinary.config(config.cloudinary)

qiniu.conf.ACCESS_KEY = config.qiniu.AK
qiniu.conf.SECRET_KEY = config.qiniu.SK
//要上传的空间
var bucket = 'gougouavarat';

//构建上传策略函数
function uptoken(bucket, key) {
  //putPolicy.callbackUrl = 'http://your.domain.com/callback';
  //putPolicy.callbackBody = 'filename=$(fname)&filesize=$(fsize)';
  return putPolicy.token();//返回token值
}

//获取七牛token
exports.getQiniuToken=function(body){
	var putPolicy
	var type=body.type
	var key=uuid.v4()
	var options={
		persistentNotifyUrl:config.notify
	}
	if(type==='avatar'){
		key+='.png'
		putPolicy = new qiniu.rs.PutPolicy(bucket+":"+key)
	}else if(type==='video'){
		key+='.mp4'
		options.scope='gougouvideo:'+key
		options.persistentOps='avthumb/mp4/an/1'
		putPolicy = new qiniu.rs.PutPolicy2(options)
	}else if(type==='audio'){
		//key+='.png'
	}
	var token = putPolicy.token();
	return {
		token:token,
		key:key
	}
}


//获取CloudinaryToken
exports.getCloudinaryToken=function(body){
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

	return token
}

//将七牛视频上传到 Cloudinary
exports.uploadToCloudinary=function(url){
	return new Promise(function(resolve,reject){
		cloudinary.uploader.upload(url,function(result){
			if(result&&result.public_id){
				resolve(result)
			}else{
				reject(result)
			}
		},{
			resource_type:'video',
			folder:'video'
		})
	})
}








