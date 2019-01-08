// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// const db = cloud.database({
//     env: 'notes-prd-fbefa0'
// })
const examTable = db.collection('exams');
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
    try {
        console.log(event)
        return await examTable.where({
            _id: _.in(event.ids)
        }).remove();
    } catch (error) {
        console.error(error)
    }
}
