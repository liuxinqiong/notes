import {
    getImageInfo,
    getNodeRect,
    throttle,
    debounce
} from '@/utils'

export default class CanvasWrapper {
    constructor(imageSrc, originalImageSrc, canvasId, width, height, scale) {
        this.imageSrc = imageSrc
        this.originalImageSrc = originalImageSrc
        this.canvasId = canvasId
        this.width = width
        this.height = height
        this.scale = scale
        this.destWidth = this.width * this.scale
        this.destHeight = this.destWidth * this.height / this.width
        this.executeActions = []
        this.stepActions = []
        this.backEnable = true
        this.touchmoveEnable = true
        this.context = wx.createCanvasContext(canvasId)
        this.erased = false
        this.touch = {}
        this.reDrawThrottle = debounce(this.reDraw, 200)
        this.erasedPoint = {}
    }

    setTouch(x, y) {
        this.touch = {
            startX: x,
            startY: y
        }
        this.erasedPoint = {
            x: x,
            y: y
        }
    }

    // 完成动作
    finishOneStep() {
        if (this.stepActions.length) {
            this.executeActions.push(this.stepActions)
            this.stepActions = []
        }
    }

    drawImage(immediate, useOrigin, callback) {
        if (typeof useOrigin === 'function') {
            callback = useOrigin
        }
        const src = useOrigin ? this.originalImageSrc : this.imageSrc
        this.context.drawImage(src, 0, 0, this.width, this.height)
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
                quality: 1,
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
        // 即使局部绘制，依然很卡，待优化处理
        // this.context.drawImage(this.originalImageSrc, (x - 10) * this.scale, (y - 10) * this.scale, 20 * this.scale, 20 * this.scale, x - 10, y - 10, 20, 20)
        this.drawImage(false, true)
        this.context.restore()

        let x1 = this.erasedPoint.x
        let y1 = this.erasedPoint.y
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
        this.context.drawImage(this.originalImageSrc, 0, 0, this.width, this.height)
        this.context.restore();

        this.erasedPoint = {
            x: x2,
            y: y2
        }
        this.context.draw(true, () => {
            this.touchmoveEnable = true
            this.reDrawDebounce()
        })
    }

    async reDraw() {
        this.touchmoveEnable = false
        const tempFilePath = await this.saveToTempFilePath()
        console.log('reDraw')
        this.context.drawImage(tempFilePath, 0, 0, this.width, this.height)
        this.context.draw(false, () => {
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
        this.drawImage(false)
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
        this.drawImage(true, true)
    }
}

export async function createCanvasWrapper(imageSrc, canvasId, originalImageSrc) {
    try {
        originalImageSrc = originalImageSrc || imageSrc
        const data = await Promise.all([getImageInfo(imageSrc), getNodeRect(`#${canvasId}`), getImageInfo(originalImageSrc)])
        const [imageInfo, canvasInfo, originalImageInfo] = data
        const radio = imageInfo.width / imageInfo.height
        const res = wx.getSystemInfoSync()
        // 不要问我为啥630，手动算出来的，缺点：不够弹性，此为待优化处
        const maxHeight = res.windowHeight - (630 * res.windowWidth / 750)
        let canvasWidth = canvasInfo.width
        let canvasHeight = canvasWidth / radio
        if (maxHeight < canvasHeight) {
            canvasHeight = maxHeight
            canvasWidth = maxHeight * radio
        }
        return new CanvasWrapper(imageSrc, originalImageSrc, canvasId, canvasWidth, canvasHeight, originalImageInfo.width / canvasWidth)
    } catch (e) {
        console.log(e)
    }
}
