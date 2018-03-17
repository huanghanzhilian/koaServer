//'use strict'

var mongoose=require('mongoose')
var Schema=mongoose.Schema
var ObjectId=Schema.Types.ObjectId
var Mixed=Schema.Types.Mixed


//定义字段
var VideoSchema =new Schema({
	author:{
		type:ObjectId,//关联User这张表
		ref:'User'//引用哪张表
	},
	qiniu_key:String,//定义七牛上面存储的数据
	persistentId:String,//任务id
	qiniu_final_key:String,//定义七牛上面存储的数据 转码后静音视频
	qiniu_detail:Mixed,//七牛的detal  存储视频有关详细信息比如宽高 码率等 数据为混合类型

	public_id:String,//国外图床
	detail:Mixed,
	
	meta:{
		createAt:{//创建时间
			type:Date,
			dafault:Date.now()
		},
		updateAt:{//更新时间
			type:Date,
			dafault:Date.now()
		}
	}
})

//存储前，牵制的一些逻辑
//pre 在存储以前有一个回调函数
VideoSchema.pre('save',function(next){
	//如果是一条新数据
	if(this.isNew){
		this.meta.createAt=this.meta.updateAt=Date.now()
	}else{
		this.meta.updateAt=Date.now()
	}
	next()
})

//进行建模
//通过mongoose.model 传入模型的名字其实就是表的名字
//第二个参数创建用户各个字段所依据的约定 然后拿到模型VideoModel 最后将模型暴露出去
var VideoModel=mongoose.model('Video',VideoSchema)

//最后将模型暴露出去
//有了模型jiuu可以在控制器里面j进行操作
//在这之前要先在app.js项目启动的时候对所有的用户模型进行初始化
//只有初始化之后，在后面的控制器里面才能成功拿到y用户的模型
module.exports=VideoModel



