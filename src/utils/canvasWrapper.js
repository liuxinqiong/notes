export default class CanvasWrapper {
    constructor(canvasId, width, height, imageSrc) {
        this.canvasId = canvasId
        this.width = width
        this.height = height
        this.imageSrc = imageSrc
        this.executeActions = []
        this.stepActions = []
        this.backEnable = true
        this.touchmoveEnable = true
        this.context = wx.createCanvasContext(canvasId)
        this.erased = false
        this.clearAll = false
        this.touch = {}
    }

    setTouch(x, y) {
        this.touch = {
            startX: x,
            startY: y
        }
    }

    // 完成动作
    finishOneStep() {
        if (this.stepActions.length) {
            this.executeActions.push(this.stepActions)
            this.stepActions = []
        }
    }

    drawImage(immediate, callback) {
        this.imageSrc && this.context.drawImage(this.imageSrc, 0, 0, this.width, this.height)
        immediate && this.context.draw(false, () => {
            callback && callback()
        })
    }

    isPaint() {
        return this.executeActions.length > 0 || this.erased
    }

    saveToTempFilePath() {
        // 生成图片
        return new Promise((resolve, reject) => {
            wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                width: this.width,
                height: this.height,
                canvasId: this.canvasId,
                success: res => {
                    resolve(res.tempFilePath)
                },
                fail: e => {
                    reject(e)
                }
            });
        })
    }

    // 涂抹
    scrawl(x, y) {
        this.clearAll = false
        if (!this.touchmoveEnable) {
            return
        }
        this.touchmoveEnable = false
        this.stepActions.push({
            pointA: [this.touch.startX, this.touch.startY],
            pointB: [x, y]
        })
        this.context.setStrokeStyle('#fff')
        this.context.setLineWidth(20)
        this.context.setLineCap('round') // 让线条圆润
        this.context.save()
        this.context.moveTo(this.touch.startX, this.touch.startY)
        this.context.lineTo(x, y)
        this.context.stroke()
        this.context.restore()
        this.setTouch(x, y)
        this.context.draw(true, () => {
            this.touchmoveEnable = true
        })
    }

    // 橡皮擦
    eraser(x, y) {
        if (!this.touchmoveEnable) {
            return
        }
        this.erased = true
        this.touchmoveEnable = false

        this.context.save()
        this.context.beginPath()
        this.context.arc(x, y, 10, 0, Math.PI * 2)
        this.context.clip()
        this.context.clearRect(0, 0, this.width, this.height)
        this.context.restore()

        let x1 = this.touch.startX
        let y1 = this.touch.startY
        let x2 = x
        let y2 = y
        let asin = 10 * Math.sin(Math.atan((y2 - y1) / (x2 - x1)));
        let acos = 10 * Math.cos(Math.atan((y2 - y1) / (x2 - x1)));
        let x3 = x1 + asin;
        let y3 = y1 - acos;
        let x4 = x1 - asin;
        let y4 = y1 + acos;
        let x5 = x2 + asin;
        let y5 = y2 - acos;
        let x6 = x2 - asin;
        let y6 = y2 + acos;

        this.context.save();
        this.context.beginPath();
        this.context.moveTo(x3, y3);
        this.context.lineTo(x5, y5);
        this.context.lineTo(x6, y6);
        this.context.lineTo(x4, y4);
        this.context.closePath();
        this.context.clip();
        this.context.clearRect(0, 0, this.width, this.height)
        this.context.restore();
        this.setTouch(x, y)
        this.context.draw(true, () => {
            this.touchmoveEnable = true
        })
    }

    // 撤销
    revoke() {
        if (!this.backEnable) {
            return
        }
        this.backEnable = false
        this.executeActions.pop()
        this.context.setStrokeStyle('#fff')
        this.context.setLineWidth(20)
        this.context.setLineCap('round') // 让线条圆润
        this.context.save()
        this.executeActions.forEach(steps => {
            steps.forEach(action => {
                this.context.moveTo(...action.pointA)
                this.context.lineTo(...action.pointB)
            })
        });
        this.context.stroke()
        this.context.restore()
        this.context.draw(false, () => {
            this.backEnable = true
        })
    }

    // 重画
    repaint() {
        this.executeActions = []
        this.erased = true
        this.context.clearRect(0, 0, this.width, this.height)
        this.context.draw()
        this.clearAll = true
    }

    onlyEraser() {
        return typeof (this.imageSrc) == 'undefined' && this.executeActions
            .length <= 0 //卷帘模式只有擦除
    }

    getPaintByClearValue() {
        return this.clearAll ? false : true
    }
}
