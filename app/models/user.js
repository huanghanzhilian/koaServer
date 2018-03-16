//'use strict'

var mongoose=require('mongoose')
//定义字段
var UserSchema =new mongoose.Schema({
	phoneNumber:{
		unique:true,
		type:String
	},
	areaCode:String,
	verifyCode:String,
	verifyed:{
		type:Boolean,
		dafault:false
	},
	accessToken:String,
	nickname:String,
	gender:String,//用户性别
	breed:String,//品种
	age:String,//年龄
	avatar:String,//用户头像
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
UserSchema.pre('save',function(next){
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
//第二个参数创建用户各个字段所依据的约定 然后拿到模型UserModel 最后将模型暴露出去
var UserModel=mongoose.model('User',UserSchema)

//最后将模型暴露出去
//有了模型jiuu可以在控制器里面j进行操作
//在这之前要先在app.js项目启动的时候对所有的用户模型进行初始化
//只有初始化之后，在后面的控制器里面才能成功拿到y用户的模型
module.exports=UserModel



