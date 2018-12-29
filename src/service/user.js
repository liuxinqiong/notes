import {
    ajax,
    showToast
} from '@/utils'
import {
    USER
} from './url'

export function login() {
    wx.login({
        success(res) {
            if (res.code) {
                return ajax({
                    url: USER.LOGIN,
                    data: {
                        code: res.code
                    }
                })
            } else {
                showToast('登录失败！' + res.errMsg)
            }
        },
        fail() {
            showToast('微信出错啦')
        }
    })
}
