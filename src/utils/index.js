import { RES_CODE } from '@/config'

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
      complete: function() {
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

export function showFail(text) {
  wx.showToast({
    title: text,
    icon: 'fail'
  })
}

export function takePhoto() {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: function(res) {
        resolve(res)
      },
      fail: function(err) {
        reject(err)
      }
    })
  })
}

export default {
  formatNumber,
  formatTime
}
