// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
//const db = cloud.database()
const db = cloud.database({
    env: 'notes-prd-fbefa0'
})
const examTable = db.collection('exams');

// 云函数入口函数
exports.main = async (event, context) => {
    console.log(event)
    let page = 1;
    let size = 100;
    let allData = [];
    try {
        while (true) {
            const res = await examTable.where({_openid:event.userInfo.openId}).skip((page - 1) * size).limit(size).orderBy('last_answer_time', 'asc').get();
            if (res.data.length > 0) {
                allData = allData.concat(res.data);
                if (res.data.length < size) {
                    break;
                }
                page++;
            } else {
                break;
            }
        }
        return allData;
    } catch (error) {
        console.error(error);
    }
    return null;
}
