// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const examTable = db.collection('exams');
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
    try {
        return await examTable.where({
            _id: _.in(event.ids)
        }).remove();
    } catch (error) {
        console.error(error)
    }
}
