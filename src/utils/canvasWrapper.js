import {
    getImageInfo,
    getNodeRect
} from '@/utils'

export default class CanvasWrapper {
    constructor(imageSrc, originalImageSrc, canvasId, width, height) {
        this.imageSrc = imageSrc
        this.originalImageSrc = originalImageSrc
        this.canvasId = canvasId
        this.width = width
        this.height = height
        this.executeActions = []
        this.stepActions = []
        this.backEnable = true
        this.touchmoveEnable = true
        this.context = wx.createCanvasContext(canvasId)
        this.erased = false
    }

    // 完成动作
    finishOneStep() {
        this.executeActions.push(this.stepActions)
        this.stepActions = []
    }

    drawImage(immediate, useOrigin) {
        const src = useOrigin ? this.originalImageSrc : this.imageSrc
        this.context.drawImage(src, 0, 0, this.width, this.height)
        immediate && this.context.draw(false)
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
        this.stepActions.push([x, y, 10, 0, Math.PI * 2])
        this.context.setFillStyle('#fff')
        this.context.beginPath()
        this.context.arc(x, y, 10, 0, Math.PI * 2)
        this.context.fill()
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
        this.context.drawImage(this.originalImageSrc, 0, 0, this.width, this.height)
        this.context.restore()
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
        this.drawImage(false)
        this.executeActions.forEach(steps => {
            steps.forEach(action => {
                this.context.arc(...action)
            })
        });
        this.context.setFillStyle('#fff')
        this.context.fill()
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
        const data = await Promise.all([getImageInfo(imageSrc), getNodeRect(`#${canvasId}`)])
        const [imageInfo, canvasInfo] = data
        const radio = imageInfo.width / imageInfo.height
        const canvasHeight = canvasInfo.width / radio
        return new CanvasWrapper(imageSrc, originalImageSrc, canvasId, canvasInfo.width, canvasHeight)
    } catch (e) {
        console.log(e)
    }
}
