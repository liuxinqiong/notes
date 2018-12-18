//wx云数据库操作
export function doTest() {
    console.log("begin test");
    const db = wx.cloud.database();
    const todos = db.collection('a');
    todos.add({

        data: {

            description: "你好啊！",

            due: new Date(),

            tags: [

                "cloud",

                "database"

            ],

        },

        success: function (res) {

            console.log(res)

        },
        fail: function (res) {
            console.log(res)
        }
    });
}

const db = wx.cloud.database(); //连接库
const examTable = db.collection('exams'); //题目集合
/**
 *排序获取题目列表
 * @param {列表数量} size
 * @param {排序字段} order
 */
export function loadExamsOrder(size, order) {

}
/**
 *通过ID删除题目
 *  @param {题目ID数组} ids
 */
export function deleteExamById(ids) {

}
