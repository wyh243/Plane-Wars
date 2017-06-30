/*获取DOM对象*/
var oContent = document.getElementById("content");
var oStart = document.getElementById("start");
var oMain = document.getElementById("main");
//敌机被打掉，显示分数区域
var oScoreLable = document.getElementById("label");
var oEnd = document.getElementById("end");
//游戏结束后，显示总分数区域
var oPlaneScore = document.getElementById("planeScore")

var oScore = document.getElementById("score");

var scores = 0; //总得分

//定义飞机类
function Plane(x, y, speed, imgsrc, boomImgSrc, score, breath, dietime) {
	this.planeNode = null; //定义飞机节点
	this.posX = x; //飞机left值
	this.posY = y; //飞机top值
	this.planeSpeed = speed; //飞机正常飞行速度
	this.planeImgSrc = imgsrc; //飞机图片路径
	this.planeBoom = boomImgSrc; //飞机爆炸图片路径
	this.planeScore = score; //飞机分值
	this.planeBreath = breath; //飞机生命力
	this.planeIsDie = false; //飞机是否击毁
	this.planeDieTime = dietime; //飞机消失时间
	this.planeDieTimes = 0; //飞机从被击中开始的一个计时器
	//初始化
	this.init = function() {
		this.planeNode = document.createElement("img");
		this.planeNode.src = this.planeImgSrc;
		this.planeNode.style.left = this.posX + "px";
		this.planeNode.style.top = this.posY + "px";
		oMain.appendChild(this.planeNode);
	}
	this.init();
}
Plane.prototype.move = function() {
	if(scores <= 100000) {
		this.planeNode.style.top = this.planeNode.offsetTop + this.planeSpeed + "px";
	} else if(scores > 100000 && scores < 200000) {
		this.planeNode.style.top = this.planeNode.offsetTop + this.planeSpeed + 5 + "px";
	} else {
		this.planeNode.style.top = this.planeNode.offsetTop + this.planeSpeed + 10 + "px";
	}
}

//创建敌方飞机类

function Enemy(speed, imgsrc, boomImgSrc, score, breath, dietime) {
	Plane.call(this, Math.floor(Math.random() * 210), -164, speed, imgsrc, boomImgSrc, score, breath, dietime)
}
//原型方法的继承
for(var i in Plane.prototype) {
	Enemy.prototype[i] = Plane.prototype[i];
}

//创建我机类

function MyPlane(x, y) {
	Plane.call(this, x, y, 0, "image/我的飞机.gif", "image/本方飞机爆炸.gif", 0, 1, 600);
}

//创建我方战机
var myPlane = new MyPlane(127, 488);

//控制我方飞机移动
oMain.onmousemove = function(e) {
	var evt = e || event;
	var _x = evt.pageX - oContent.offsetLeft - myPlane.planeNode.offsetWidth / 2;
	var _y = evt.pageY - oContent.offsetTop - myPlane.planeNode.offsetHeight / 2;

	if(_x <= 0) {
		_x = 0;
	}
	if(_y <= 0) {
		_y = 0;
	}
	if(_x > oMain.offsetWidth - myPlane.planeNode.offsetWidth) {
		_x = oMain.offsetWidth - myPlane.planeNode.offsetWidth;
	}
	if(_y > oMain.offsetHeight - myPlane.planeNode.offsetHeight) {
		_y = oMain.offsetHeight - myPlane.planeNode.offsetHeight
	}

	myPlane.planeNode.style.left = _x + "px";
	myPlane.planeNode.style.top = _y + "px";
}

//定义子弹类
function Bullet(x, y, imagesrc) {
	this.bulletNode = null; //子弹节点
	this.posX = x;
	this.posY = y;
	this.bulletAttach = 1; //子弹攻击力

	this.init = function() {
		this.bulletNode = document.createElement("img");
		this.bulletNode.src = imagesrc;
		this.bulletNode.style.left = this.posX + "px";
		this.bulletNode.style.top = this.posY + "px";
		oMain.appendChild(this.bulletNode);
	}
	this.init();
}

Bullet.prototype.move = function() {
	//子弹向上移动,top值需减小
	this.bulletNode.style.top = this.bulletNode.offsetTop - 20 + "px";
}


var enemys = []; //保存敌机对象数组
var bullets = []; //保存子弹对象数组

//计数 
var mark = 0;
var mark1 = 0;

//背景变化初值
var bgy = 0;

function start() {

	bgy += 1;
	oMain.style.backgroundPositionY = bgy + "px";

	//通过计数变量判断何时出现大中小敌机
	mark++;

	if(mark == 20) {
		mark1++;
		//中飞机
		if(mark1 % 5 == 0) {
			enemys.push(new Enemy(2, "image/enemy3_fly_1.png", "image/中飞机爆炸.gif", 3000, 6, 360));
		}
		//大飞机
		if(mark1 == 20) {
			enemys.push(new Enemy(1, "image/enemy2_fly_1.png", "image/大飞机爆炸.gif", 5000, 12, 540));
			mark1 = 0;
		}
		//小飞机
		else {
			enemys.push(new Enemy(3, "image/enemy1_fly_1.png", "image/小飞机爆炸.gif", 1000, 1, 240));
		}
		mark = 0;
	}

	for(var i = 0; i < enemys.length; i++) {
		//如果敌机未被击毁，则移动
		if(enemys[i].planeIsDie != true) {
			enemys[i].move();
		}
		
		//如果敌机超出边界,删除敌机
		if(enemys[i].planeNode.offsetTop > 568) {
			oMain.removeChild(enemys[i].planeNode);
			enemys.splice(i, 1);
		}

		//当敌机死亡标记为true时，经过一段时间后清除敌机
		if(enemys[i].planeIsDie == true) {
			enemys[i].planeDieTimes += 20;
			if(enemys[i].planeDieTimes == enemys[i].planeDieTime) {
				oMain.removeChild(enemys[i].planeNode);
				enemys.splice(i, 1);
			}
		}
	}

	
	//创建子弹，子弹的位置在我方飞机的中上方
	if(mark % 5 == 0) {
		bullets.push(new Bullet(parseInt(myPlane.planeNode.style.left) + 31, parseInt(myPlane.planeNode.style.top) - 10, "image/bullet1.png"));
	}

	//移动子弹
	for(var i = 0; i < bullets.length; i++) {
		bullets[i].move();
		
		//如果子弹超出边界,删除子弹
		if(bullets[i].bulletNode.offsetTop < 0) {
			oMain.removeChild(bullets[i].bulletNode);
			bullets.splice(i, 1);
		}
	}

	
	//碰撞判断
	for(var k = 0; k < bullets.length; k++) {
		for(var j = 0; j < enemys.length; j++) {
			//判断碰撞本方飞机 
			if(enemys[j].planeIsDie == false) {
				//敌机左边距 + 敌机的宽度 >= 我机的左边距  && 敌机的左边距 <= 我机的左边距 + 我机的宽度
				if(enemys[j].planeNode.offsetLeft + enemys[j].planeNode.offsetWidth >= myPlane.planeNode.offsetLeft && enemys[j].planeNode.offsetLeft <= myPlane.planeNode.offsetLeft + myPlane.planeNode.offsetWidth) {
					if(enemys[j].planeNode.offsetTop + enemys[j].planeNode.offsetHeight >= myPlane.planeNode.offsetTop + 40 && enemys[j].planeNode.offsetTop <= myPlane.planeNode.offsetTop - 20 + myPlane.planeNode.offsetHeight) {
						//碰撞本方飞机，游戏结束，统计分数
						myPlane.planeNode.src = "image/本方飞机爆炸.gif";
						oEnd.style.display = "block";
						oPlaneScore.innerHTML = scores;
						oMain.onmousemove = null;
						clearInterval(timer);
					}
				}
				//判断子弹与敌机碰撞
				if((bullets[k].bulletNode.offsetLeft + bullets[k].bulletNode.offsetWidth > enemys[j].planeNode.offsetLeft) && (bullets[k].bulletNode.offsetLeft < enemys[j].planeNode.offsetLeft + enemys[j].planeNode.offsetWidth)) {
					if(bullets[k].bulletNode.offsetTop <= enemys[j].planeNode.offsetTop + enemys[j].planeNode.offsetHeight && bullets[k].bulletNode.offsetTop + bullets[k].bulletNode.offsetHeight >= enemys[j].planeNode.offsetTop) {
						//敌机血量减子弹攻击力
						enemys[j].planeBreath = enemys[j].planeBreath - bullets[k].bulletAttach;
						//敌机血量为0，敌机图片换为爆炸图片，死亡标记为true，计分
						if(enemys[j].planeBreath == 0) {
							scores = scores + enemys[j].planeScore;
							oScoreLable.innerHTML = scores;
							enemys[j].planeNode.src = enemys[j].planeBoom;
							enemys[j].planeIsDie = true;
						}
						//删除子弹
						oMain.removeChild(bullets[k].bulletNode);
						bullets.splice(k, 1);
						break;
					}
				}
			}
		}
	}
}
var timer = null;

function begin() {

	oStart.style.display = "none";
	oMain.style.display = "block";
	oScore.style.display = "block";
	timer = setInterval(start, 50)

}

function reload(){
	location.reload();
}
