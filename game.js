const N = 4;// 数字华容道的大小
const BASE_X = 120, BASE_Y = 100;// 基准点绝对位置

window.onload = function () {
    // 网页加载完毕后即执行
    initBlocks();// 初始化
    window.startButton = document.getElementById("button");
    window.startButton.onclick = startGame;// 点击按钮开始游戏
}

function initBlocks() {
    // 初始化方格
    for (let i = 0; i < N; ++i) {
        for (let j = 0; j < N; ++j) {
            if (i * 4 + j + 1 < 16) {
                let block = document.getElementById("block_" + (i * 4 + j + 1));
                block.style.top = (i * 100 + BASE_X).toString() + "px";
                block.style.left = (j * 100 + BASE_Y).toString() + "px";
            }
        }
    }
}

let startGame = function () {
    // 游戏开始
    window.startButton.innerHTML = "游戏中";
    window.startButton.style.backgroundColor = "red";
    window.game = new GAME();// 创建游戏    
    document.onkeydown = keyboardOperation;// 设置键盘操作
    document.onclick = mouseOperation;// 设置鼠标操作
    window.startButton.onclick = null;// 防止同时创建多个游戏
}

let keyboardOperation = function (event) {
    console.log(event);
    // 根据监听到的键盘操作对游戏进行控制
    switch (event.key) {
        case "ArrowLeft":
            // 左箭头键
            window.game.move(0, -1);
            break;
        case "ArrowRight":
            // 右箭头键
            window.game.move(0, 1);
            break;
        case "ArrowUp":
            // 上箭头键
            window.game.move(-1, 0);
            break;
        case "ArrowDown":
            // 下箭头键
            window.game.move(1, 0);
            break;
    }
}

let mouseOperation = function (event) {
    // 根据监听到的键盘操作对游戏进行控制
    // 获取所点击方块的序号
    let index = parseInt(event.target.id.split("block_")[1]);

    // 获取所点方块和空格的位置
    let zeroP = window.game.getXY(0);
    let selectP = window.game.getXY(index);

    // 判断并进行移动
    if (zeroP.X === selectP.X && zeroP.Y === selectP.Y + 1) { window.game.move(0, 1); }
    else if (zeroP.X === selectP.X && zeroP.Y === selectP.Y - 1) { window.game.move(0, -1); }
    else if (zeroP.X === selectP.X + 1 && zeroP.Y === selectP.Y) { window.game.move(1, 0); }
    else if (zeroP.X === selectP.X - 1 && zeroP.Y === selectP.Y) { window.game.move(-1, 0); }
}

class GAME {
    constructor() {
        // 构造函数
        this.data = new Array(N);// 存放数据
        this.time = 0;// 存储游戏时间
        this.step = 0;// 存储游戏步数
        this.timerId = setInterval(() => { ++this.time }, 1000);// 计时
        this.infoRefresh = setInterval(() => { this.updateInfo() }, 10);// 每10ms更新信息 

        // 创建一个N*N的二维数组并填入数字
        let cnt = 0;
        for (let i = 0; i < this.data.length; ++i) {
            this.data[i] = new Array(N)
            for (let j = 0; j < this.data[i].length; ++j) {
                this.data[i][j] = cnt;
                ++cnt;
            }
        }

        do { this.shuffle(); } while (this.isSolvable() === false);// 随机出题直到有解
        this.initDisplay();// 初始显示
    }

    initDisplay() {
        // 初始显示
        for (let i = 0; i < this.data.length; ++i) {
            for (let j = 0; j < this.data[i].length; ++j) {
                if (this.data[i][j] != 0) {
                    let block = document.getElementById("block_" + this.data[i][j]);
                    block.style.top = (i * 100 + BASE_X).toString() + "px";
                    block.style.left = (j * 100 + BASE_Y).toString() + "px";
                }
            }
        }
    }

    getXY(index) {
        // 找到某方块位置
        let X = -1;
        let Y = -1;
        for (let i = 0; i < this.data.length; ++i) {
            for (let j = 0; j < this.data[i].length; ++j) {
                if (this.data[i][j] === index) {
                    X = i;
                    Y = j;
                }
            }
        }
        return { X: X, Y: Y };// 返回一个包含位置信息的对象
    }

    move(dx, dy) {
        // 移动格子
        // 移动格子相当于空格反向移动，故将位移取反，此时的dx和dy代表空格位移
        [dx, dy] = [-dx, -dy];

        // 获得空格位置
        let zeroP = this.getXY(0);

        // 检查是否可以移动
        if (dx < 0 && zeroP.X === 0) { return; }
        if (dx > 0 && zeroP.X === N - 1) { return; }
        if (dy < 0 && zeroP.Y === 0) { return; }
        if (dy > 0 && zeroP.Y === N - 1) { return; }

        // 移动数据
        this.data[zeroP.X][zeroP.Y] = this.data[zeroP.X + dx][zeroP.Y + dy];
        this.data[zeroP.X + dx][zeroP.Y + dy] = 0;

        // 生成移动动画
        [dx, dy] = [-dx, -dy];// 再把空格位移转为方格位移
        this.animate(this.data[zeroP.X][zeroP.Y], dx, dy);

        // 检查游戏是否结束
        this.checkGameOver();

        // 记录步数
        ++this.step;
    }

    animate(index, dx, dy) {
        // 生成方格移动动画
        let block = document.getElementById("block_" + index);
        let cnt = 0;
        let timerId = setInterval(() => {
            block.style.top = (parseInt(block.style.top.split("px")[0]) + dx * 10).toString() + "px";
            block.style.left = (parseInt(block.style.left.split("px")[0]) + dy * 10).toString() + "px";
            ++cnt;
            if (cnt >= 10) {
                clearInterval(timerId);
            }
        }, 8);// 每8毫秒移动10px，共移动10次
    }

    isSolvable() {
        // 判断题面是否有解
        // 将data由二维数组转为一维数组
        let index = 0;
        let tempData = new Array(N * N);
        for (let i = 0; i < this.data.length; ++i) {
            for (let j = 0; j < this.data[i].length; ++j) {
                tempData[index] = this.data[i][j];
                ++index;
            }
        }

        // 求逆序数
        let inv = 0;
        for (let i = 0; i < N * N - 1; ++i) {
            for (let j = i + 1; j < N * N; ++j) {
                if (tempData[j] === 0) {
                    continue;
                }
                if (tempData[i] > tempData[j]) {
                    ++inv;
                }
            }
        }

        //判断有无解
        let zeroP = this.getXY(0);
        return (inv % 2 === (N - zeroP.X - 1) % 2);
    }

    shuffle() {
        // 打乱数组
        // 将data由二维数组转为一维数组
        let index = 0;
        let tempData = new Array(N * N);
        for (let i = 0; i < this.data.length; ++i) {
            for (let j = 0; j < this.data[i].length; ++j) {
                tempData[index] = this.data[i][j];
                ++index;
            }
        }

        // 用返回随机值的比较函数进行sort
        tempData.sort(() => Math.random() - 0.5);

        // 将打乱的一维数组重新转为二维数组
        index = 0;
        for (let i = 0; i < this.data.length; ++i) {
            for (let j = 0; j < this.data[i].length; ++j) {
                this.data[i][j] = tempData[index];
                ++index;
            }
        }
    }

    updateInfo() {
        // 更新信息
        let info = document.getElementById("info");
        info.innerHTML = `已用时 ${this.time} 秒\t已走步数 ${this.step} 步`;
    }

    checkGameOver() {
        // 检查游戏是否结束
        let index = 0;
        for (let i = 0; i < this.data.length; ++i) {
            for (let j = 0; j < this.data[i].length; ++j) {
                ++index;
                if (index % (N * N) != this.data[i][j]) {
                    return;
                }
            }
        }
        setTimeout(() => { this.gameOver() }, 200);// 防止alert窗口阻断渲染
    }

    gameOver() {
        // 游戏结束
        clearInterval(this.timerId);// 停止计时
        clearInterval(this.infoRefresh);// 停止更新信息
        alert(`恭喜您挑战成功！\n用时 ${this.time} 秒\n操作 ${this.step} 步`);// 提示信息
        location.reload();// 刷新网页
    }
}