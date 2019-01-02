// 算是目前 mpvue 结合小程序实际情况，一个小小的 bug
export const resetPageData = {
    onUnload() {
        console.log('rest data worked')
        Object.assign(this, this.$options.data())
    }
}