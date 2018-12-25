//wx云数据库操作
const db = wx.cloud.database(); //连接库
const examTable = db.collection('exams'); //题目集合
const answerRecordTable = db.collection('answer_record'); //题目集合
const testRecordTable = db.collection('test_record'); //题目集合
const totalStarTable = db.collection('total_star'); //题目集合

const RIGHT_TYPE = 1;
const ERROR_TYPE = 2;
const RECITE_TYPE = 3;
const MAX_ANSWER_WEIGHT = 12;
const MIN_ANSWER_WEIGHT = -8;
const ANSWER_WEIGHT_CHANGE_VALUE = 5;
/**
 *排序获取题目列表
 * @param {number} page 页码
 * @param {number} size 每页数量 最大10
 * @param {string} order 排序字段
 */
export async function loadExamsOrder(page, size, order) {
    try {
        const res = await examTable.skip((page - 1) * size).limit(size).orderBy(order, 'asc').get();
        return res.data;
    } catch (error) {
        console.error(error);
    }
    return null;
}

/**
 * 插入题目
 * @param {Object} examData(original_img_id	原图片存储id | eidted_img_id 编辑过后的图片存储id | is_paint 是否涂抹过 | img_width	图片宽度 | img_height	图片高度)
 * @returns {string}  题目ID
 *
 */
export async function insertExamData(examData) {

    try {
        examData.created_time = db.serverDate(); //服务器时间
        examData.update_time = db.serverDate(); //服务器时间
        examData.last_answer_time = db.serverDate(); //默认为创建时间
        examData.answer_weight = 0; //对错  【-8~12】
        const res = await examTable.add({
            data: examData
        });
        if (typeof (res) != 'undefined') {
            return res._id; //插入成功
        }
    } catch (error) {
        console.error(error);
    }
    return null;
}

/**
 *  更新测验或者背诵后的题目数据
 * @param {String} examId 题目ID
 * @param {String} originalWeight 原始权重(背诵可空)
 * @param {number} updateType 更新类型  1 答对 2答错  3背诵
 */
export async function updateTestOrReciteExam(examId, originalWeight, updateType) {

    try {
        let answer_weight = originalWeight;
        if (updateType == RIGHT_TYPE) {
            answer_weight = (originalWeight - ANSWER_WEIGHT_CHANGE_VALUE) < MIN_ANSWER_WEIGHT ?
                MIN_ANSWER_WEIGHT : (originalWeight - ANSWER_WEIGHT_CHANGE_VALUE);
        } else if (updateType == ERROR_TYPE) {
            answer_weight = (originalWeight + ANSWER_WEIGHT_CHANGE_VALUE) > MAX_ANSWER_WEIGHT ?
                MAX_ANSWER_WEIGHT : (originalWeight + ANSWER_WEIGHT_CHANGE_VALUE);
        } else if (updateType != RECITE_TYPE) {
            console.error('更新失败，更新类型只能为1 | 2 |3');
            return false;
        }
        const res = await examTable.doc(examId).update({
            data: {
                last_answer_time: db.serverDate(),
                answer_weight: answer_weight
            }
        });

        if (typeof (res) != 'undefined' && res.stats.updated == 1) {
            return true; //插入成功
        }
    } catch (error) {
        console.error(error);
    }
    return false;
}



/**
 *通过ID删除题目
 *  @param {Array<string>} ids  题目ID数组
 *  @returns {Array<string>} 成功删除数组
 */
export function deleteExamById(ids) {
    let resultList = []; //成功删除的数组
    ids.forEach(async element => {
        try {
            let res = await examTable.doc(element).remove();
            if (res.stats.removed == 1) {
                resultList.push(element)
            }
        } catch (error) {
            console.error(element + '元素删除失败：' + error);
        }
    });
    return resultList;
}


/**
 * 插入新的作答记录
 * @param {Object} answerData 答题数据  exam_id:题目ID | used_time:作答花费时间(秒) | answer_result:答题结果(1正确2错误) | exam_test_id:测验ID
 */
export async function insertAnswerRecord(answerData) {
    try {
        answerData.answer_time = db.serverDate();
        const res = await answerRecordTable.add({
            data: answerData
        });
        if (typeof (res) != 'undefined') {
            return res._id; //插入成功
        }
    } catch (error) {
        console.error(error);
    }
    return null;
}

/**
 * 插入新的测验记录
 * @returns {string} 测验ID
 */
export async function insertTestRecord() {
    try {
        const res = await testRecordTable.add({
            data: {
                start_time: db.serverDate(),
                star_no: 0,
                end_time: null,
                finish_flag: 2 //初始化未完成
            }
        });
        if (typeof (res) != 'undefined') {
            return res._id; //插入成功
        }
    } catch (error) {
        console.error(error);
    }
    return null;
}
/**
 * 完成测验
 * @param {测验ID} testRecordId
 * @param {答题星星数量} starNo
 * @returns 更新结果
 */
export async function finishTestRecord(testRecordId, starNo) {

    try {
        const res = await testRecordTable.doc(testRecordId).update({
            data: {
                star_no: starNo,
                end_time: db.serverDate(),
                finish_flag: 1 //初始化未完成
            }
        });
        if (typeof (res) != 'undefined') {
            return true; //插入成功
        }
    } catch (error) {
        console.error(error);
    }
    return false;
}

/**
 *获取总星星 null 获取异常
 * @returns {number}
 */
export async function getTotalStar() {
    try {
        const res = await totalStarTable.where({}).get();
        if (typeof (res) != 'undefined') {
            if (res.data.length == 1)
                return res.data[0].star_no;
            return 0;
        }
    } catch (error) {
        console.error(error);
    }
    return null;
}
/**
 * 增加总星星
 * @param {number} starNo 星星数量
 * @returns {boolean} 成功失败
 */
export async function addTotalStar(starNo) {

    try {
        const res = await totalStarTable.where({}).get();
        if (typeof (res) != 'undefined') {
            let starData = null;
            if (res.data.length == 0) { //无数据初始化数据
                starData = {
                    star_no: starNo,
                    created_time: db.serverDate(),
                    update_time: db.serverDate(),
                    createdFlag: true
                };
            } else {
                starData = {
                    _id: res.data[0]._id,
                    created_time: res.data[0].created_time,
                    update_time: db.serverDate(),
                    star_no: res.data[0].star_no + starNo,
                    createdFlag: false
                };
            }
            return await updateOrInsertStarData(starData);
        }

    } catch (error) {
        console.error(error);
    }
    return false;

}

/**
 * 插入总星星数量
 * @param {object} starData
 * @returns {boolean}
 */
export async function insertStarData(starData) {

    try {
        const res = await totalStarTable.add({
            data: {
                update_time: starData.update_time,
                created_time: starData.created_time,
                star_no: starData.star_no
            }
        });
        if (typeof (res) != 'undefined') {
            return true; //插入成功
        }
    } catch (error) {
        console.error(error);
    }
    return false;
}
/**
 * 更新总星星数量
 * @param {object} starData
 * @returns {boolean}
 */
export async function updateStarData(starData) {
    try {
        const res = await totalStarTable.doc(starData._id).update({
            data: {
                update_time: starData.update_time,
                created_time: starData.created_time,
                star_no: starData.star_no
            }
        });
        if (typeof (res) != 'undefined' && res.stats.updated == 1) {
            return true; //更新成功
        }
    } catch (error) {
        console.error(error);
    }
    return false;
}


/**
 * 插入或更新值
 * @param {Object} starData 更新后数据
 * @returns {boolean}
 */
export async function updateOrInsertStarData(starData) {
    if (starData.createdFlag) { //新增数据
        return insertStarData(starData);
    } else {
        return updateStarData(starData);
    }
}
