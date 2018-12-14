import { ajax, showFail } from '@/utils'
import { USER } from './url'

export function login() {
    wx.login({
        success(res) {
            if(res.code) {
                return ajax({
                    url: USER.LOGIN,
                    data: {
                        code: res.code
                    }
                })
            } else {
                showFail('登录失败！' + res.errMsg)
            }
        },
        fail() {
            showFail('微信出错啦')
        }
    })
}