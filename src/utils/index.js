import config, {
    RES_CODE,
    COMPRESS_SETTING
} from '@/config'

function formatNumber(n) {
    const str = n.toString()
    return str[1] ? str : `0${str}`
}

export function formatTime(date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    const t1 = [year, month, day].map(formatNumber).join('/')
    const t2 = [hour, minute, second].map(formatNumber).join(':')

    return `${t1} ${t2}`
}

export function ajax(url, method, data) {
    return new Promise((resolve, reject) => {
        wx.showNavigationBarLoading()
        wx.request({
            data,
            method,
            url: config.host + url,
            success: function (res) {
                if (res.data.code === RES_CODE.OK) {
                    resolve(res.data.data)
                } else {
                    showModal('失败', res.data.data.msg)
                    reject(res.data)
                }
            },
            fail: function (err) {
                showModal('错误', '未知错误')
                reject(err)
            },
            complete: function () {
                wx.hideNavigationBarLoading()
            }
        })
    })
}

export function showModal(title, content) {
    wx.showModal({
        title,
        content,
        showCancel: false
    })
}

export function showSuccess(text) {
    wx.showToast({
        title: text,
        icon: 'success'
    })
}

export function showToast(text) {
    wx.showToast({
        title: text,
        icon: 'none'
    })
}

export function showLoading(text) {
    wx.showLoading({
        title: text
    })
}

export function hideLoading() {
    wx.hideLoading()
}

export function getImageInfo(imageSrc) {
    return new Promise((resolve, reject) => {
        wx.getImageInfo({
            src: imageSrc,
            success: function (res) {
                resolve(res)
            },
            fail: function (err) {
                reject(err)
            }
        })
    })
}

export function previewImage(current, urls) {
    urls = urls || [current]
    wx.previewImage({
        current: current,
        urls: urls
    })
}

export function takePhoto() {
    return new Promise((resolve, reject) => {
        wx.chooseImage({
            count: 1,
            sizeType: ['original'],
            sourceType: ['camera'], // album/camera
            success: function (res) {
                resolve(res.tempFilePaths[0])
            },
            fail: function (err) {
                reject(err)
            }
        })
    })
}

export function arrayRemove(array, func) {
    for (let index = 0; index < array.length; index++) {
        if (func(array[index])) {
            array.splice(index, 1);
        }
    }

}

// 备注：android canvas 设置过大会导致程序秒退，安全值 safe 大约 1200
export function updateImageInfo(source, value, type = 'MAX_SIZE') {
    if (type == 'MAX_SIZE') {
        const total = source.width * source.height
        if (total > value) {
            let scale = Math.sqrt(value / total)
            source.width = source.width * scale
            source.height = source.height * scale
        }
    } else if (type === 'MAX_BORDER') {
        const ratio = source.width / source.height;
        if (ratio >= 1 && source.width > value) {
            source.width = value
            source.height = source.width / ratio
        } else if (ratio < 1 && source.height > value) {
            source.height = value
            source.width = source.height * ratio
        }
    }
}

export function getImgCompressInfo(width, height) {
    var exportInfo = {}
    exportInfo.width = width;
    exportInfo.height = height;
    const systemInfo = wx.getSystemInfoSync();

    const total = width * height
    let maxSize = COMPRESS_SETTING.ANDROID_MAX_SIZE
    exportInfo.quality = 1
    if ((systemInfo.system.indexOf('IOS') >= 0 || systemInfo.system.indexOf('iOS') >= 0)) { //IOS
        maxSize = COMPRESS_SETTING.IOS_MAX_SIZE
    } else { //安卓 像素不能降低太多
        if (total > COMPRESS_SETTING.ANDROID_NO_COMPRESS_SIZE) {
            let tempTotal = total > maxSize ? maxSize : total
            //质量从设定值起 像素越大越低
            exportInfo.quality = COMPRESS_SETTING.ANDROID_START_COMPRESS_RATE - (tempTotal - COMPRESS_SETTING.ANDROID_NO_COMPRESS_SIZE) * COMPRESS_SETTING.ANDROID_COMPRESS_CHANGE_RATE
        }
    }
    if (total > maxSize) { //根据裁剪的位置压缩 不提前压缩 只压缩IOS
        console.log('裁剪位置需要压缩');
        let scale = Math.sqrt(maxSize / total)
        exportInfo.width = width * scale
        exportInfo.height = height * scale
    }
    return exportInfo
}

export async function computeCanvasInfo(imageSrc, container) {
    const data = await Promise.all([getImageInfo(imageSrc), getNodeRect(container)])
    const [imageInfo, containerInfo] = data
    const radio = imageInfo.width / imageInfo.height
    const res = wx.getSystemInfoSync()
    // 不要问我为啥630，手动算出来的，缺点：不够弹性，此为待优化处
    const maxHeight = res.windowHeight - (630 * res.windowWidth / 750)
    let canvasWidth = containerInfo.width
    let canvasHeight = canvasWidth / radio
    if (maxHeight < canvasHeight) {
        canvasHeight = maxHeight
        canvasWidth = maxHeight * radio
    }
    return {
        canvasWidth,
        canvasHeight
    }
}

export function generateExamList(source, index, howMany) {
    const length = source.length
    // 全部够不够
    if (length < howMany) {
        return source.slice(0)
    }
    // 说明完全不够或者部分不够，则取余下全部
    if (index + howMany > length) {
        const part = source.slice(index)
        const rest = howMany - part.length
        return part.concat(source.slice(0, rest))
    } else {
        // 完全足够，直接返回
        return source.slice(index, howMany)
    }
}

export async function getUserOpenId() {
    const res = await wx.cloud.callFunction({
        // 要调用的云函数名称
        name: 'wxContext',
    }).catch(err => {
        showToast('获取用户信息失败');
    })
    return res.result;
}

export function getNodeRect(selector) {
    return new Promise((resolve) => {
        wx.createSelectorQuery().select(selector).boundingClientRect(function (rect) {
            resolve(rect)
        }).exec()
    })
}

export function debounce(func, delay) {
    let timer

    return function (...args) {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            func.apply(this, args)
        }, delay)
    }
}

export function throttle(func, delay) {
    let timer
    return function (...args) {
        if (!timer) {
            timer = setTimeout(() => {
                timer = null;
                func.apply(this, args)
            }, delay)
        }
    }
}

export default {
    formatNumber,
    formatTime
}
