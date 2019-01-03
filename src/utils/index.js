import config, {
    RES_CODE
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
            sizeType: ['compressed'],
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

// 本意是修复 android canvas 不能过大的 bug，如今顺便用来控制图片的质量
export function fixBugInAndroid(source) {
    const isAndroid = wx.getSystemInfoSync().platform === 'android'
    const safe = isAndroid ? 1200 : 2400
    const ratio = source.width / source.height;
    if (ratio >= 1 && source.width > safe) {
        source.width = safe
        source.height = source.width / ratio
    } else if (ratio < 1 && source.height > safe) {
        source.height = safe
        source.width = source.height * ratio
    }
}

export function generateExamList(source, index, howMany) {
    const length = source.length
    // 全部够不够
    if(length < howMany) {
        return source.slice(0)
    }
    // 说明完全不够或者部分不够，则取余下全部
    if(index + howMany > length) {
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
        wx.createSelectorQuery().select(selector).boundingClientRect(function(rect) {
            resolve(rect)
        }).exec()
    })
}

export default {
    formatNumber,
    formatTime
}
