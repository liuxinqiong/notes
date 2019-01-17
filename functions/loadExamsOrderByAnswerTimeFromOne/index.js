// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
//const db = cloud.database()
const db = cloud.database({
    env: 'notes-prd-fbefa0'
})
const examTable = db.collection('exams');
const _ = db.command; //表达式
// 云函数入口函数
exports.main = async (event, context) => {
    console.log(event)
    let page = 1;
    let size = 100;
    let allData = [];
    try {
        const exams = await examTable.where({
            _id: event.examId
        }).get();

        if (exams.data.length == 1) {
            allData.push(exams.data[0])
        } else {
            console.error('查询不到或无唯一题目');
            return null; //无此题目
        }

        //查询尾部
        while (true) {
            const res = await examTable.where({
                _openid:event.userInfo.openId,
                last_answer_time: _.lt(exams.data[0].last_answer_time)
            }).skip((page - 1) * size).limit(size).orderBy('last_answer_time', 'desc').get();
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
        //查询头部
        page = 1;
        while (true) {
            const res = await examTable.where({
                _openid:event.userInfo.openId,
                last_answer_time: _.gt(exams.data[0].last_answer_time)
            }).skip((page - 1) * size).limit(size).orderBy('last_answer_time', 'desc').get();
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
