//wx云数据库操作
const db = wx.cloud.database(); //连接库
const examTable = db.collection('exams'); //题目集合
const answerRecordTable = db.collection('answer_record'); //题目集合
const testRecordTable = db.collection('test_record'); //题目集合
const totalStarTable = db.collection('total_star'); //题目集合

const RIGHT_TYPE = 1;
const ERROR_TYPE = 2;
const RECITE_TYPE = 3;
const ANSWER_WEIGHT_CHANGE_VALUE = 5;
const MIN_WEIGHT = 1;
const MAX_WEIGHT = 13;

const WEIGHT_ARRAY = [5 * 60 * 1000 /*5min*/ , 30 * 60 * 1000 /* 30min*/ , 12 * 60 * 60 * 1000 /*12h*/ ,
    24 * 60 * 60 * 1000 /* 1d*/ , 2 * 24 * 60 * 60 * 1000 /*2d */ , 4 * 24 * 60 * 60 * 1000 /*4d */ ,
    7 * 24 * 60 * 60 * 1000 /* 7d*/ , 15 * 24 * 60 * 60 * 1000 /* 15d*/
];

export function getTimeWeight(time) {
    for (let index = 0; index < WEIGHT_ARRAY.length; index++) {
        if (WEIGHT_ARRAY[index] > time) {
            return index + 1;
        }
    }
    return WEIGHT_ARRAY.length + 1;
}

/**
 *排序获取题目列表 [题目列表]
 * @param {number} page 页码
 * @param {number} size 每页数量 最大20
 * @param {string} order 排序字段
 */
export async function loadExamsOrder(page, size, order) {
    try {
        const res = await examTable.skip((page - 1) * size).limit(size).orderBy(order, 'desc').get();
        return res.data;
    } catch (error) {
        console.error(error);
    }
    return null;
}

/**
 *获取所有按答题时间排序的题目列表  [背诵]
 */
export async function loadAllExamsOrderByAnswerTime() {
    let page = 1;
    let size = 20;
    let allData = [];
    try {
        while (true) {
            const res = await examTable.skip((page - 1) * size).limit(size).orderBy('last_answer_time', 'asc').get();
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

/**
 * 调用云函数批量删除题目
 * @param {array<String>} ids
 */
export async function deleteExamCallCloudByIds(ids) {
    if (ids == null || ids.length == 0) {
        return 0;
    }
    try {
        const res = await wx.cloud.callFunction({
            // 要调用的云函数名称
            name: 'deleteExamByIds',
            data: {
                ids: ids
            }
        });
        console.log(res);
        return res.result.stats.removed;
    } catch (error) {
        console.log(error);
    }
    return 0;
}

/**
 * 从某题开始按答题顺序获取所有题目  [顺序答题]
 * @param {String} examId 当前开始答题的ID
 */
export async function loadExamsOrderByAnswerTimeFromOne(examId) {
    let page = 1;
    let size = 20;
    let allData = [];
    try {
        const _ = db.command; //表达式
        const exams = await examTable.where({
            _id: examId
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

/**
 * 按照权重获取所有的题目列表
 */
export async function loadAllExamsOrderByWeight() {
    const now = new Date();
    let allData = await loadAllExamsOrderByAnswerTime(); //先获取所有的数据

    if (allData == null || allData.length == 0) {
        return null; //无数据
    }
    allData.sort(function (a, b) {
        let aWeight = getTimeWeight(now.getTime() - a.last_answer_time.getTime()) + a.answer_weight;
        let bWeight = getTimeWeight(now.getTime() - b.last_answer_time.getTime()) + b.answer_weight;
        aWeight = aWeight < MIN_WEIGHT ? MIN_WEIGHT : aWeight;
        aWeight = aWeight > MAX_WEIGHT ? MAX_WEIGHT : aWeight;
        bWeight = bWeight < MIN_WEIGHT ? MIN_WEIGHT : bWeight;
        bWeight = bWeight > MAX_WEIGHT ? MAX_WEIGHT : bWeight;
        if ((aWeight > bWeight) || (aWeight == bWeight && a.last_answer_time.getTime() < b.last_answer_time.getTime())) {
            return -1;
        }
        return 1;
    });
    return allData;
}


/**
 * 插入题目
 * @param {Object} examData(original_img_id	原图片存储id | edited_img_id 编辑过后的图片存储id | is_paint 是否涂抹过 | img_width	图片宽度 | img_height	图片高度)
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
 * @param {number} updateType 更新类型  1 答对 2答错  3背诵
 */
export async function updateTestOrReciteExam(examId, updateType) {

    try {
        let updateData = {
            last_answer_time: db.serverDate()
        };
        if (updateType == RIGHT_TYPE) {
            updateData.answer_weight = 0 - ANSWER_WEIGHT_CHANGE_VALUE;
        } else if (updateType == ERROR_TYPE) {
            updateData.answer_weight = ANSWER_WEIGHT_CHANGE_VALUE;
        } else if (updateType != RECITE_TYPE) {
            console.error('更新失败，更新类型只能为1 | 2 |3');
            return false;
        }
        const res = await examTable.doc(examId).update({
            data: updateData
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
 * 更新涂抹照片
 * @param {String} examId  题目ID
 * @param {String} newImgId  新图片ID
 */
export async function updateEditedImg(examId, newImgId) {
    try {
        const res = await examTable.doc(examId).update({
            data: {
                edited_img_id: newImgId,
                update_time: db.serverDate(),
                is_paint: 1
            }
        });
        if (typeof (res) != 'undefined' && res.stats.updated == 1) {
            return true; //更新成功
        }
    } catch (error) {
        console.error(error);
    }
}


/**
 *通过ID删除题目
 *  @param {Array<string>} ids  题目ID数组
 *  @returns {Array<string>} 成功删除数组
 */
export async function deleteExamById(ids) {
    let resultList = []; //成功删除的数组
    for (let index = 0; index < ids.length; index++) {
        try {
            let res = await examTable.doc(ids[index]).remove();
            if (res.stats.removed == 1) {
                resultList.push(ids[index])
            }
        } catch (error) {
            console.error(element + '元素删除失败：' + error);
        }
    }

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
        if (typeof (res) != 'undefined' && res.stats.updated == 1) {
            return true; //更新成功
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
