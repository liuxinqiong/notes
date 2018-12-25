//wx云存储操作

const EXAM_DIR = 'exam_img';
/**
 * 上传题目图片
 * @param {String} filePath 临时文件路径
 * @returns {String} 文件ID
 */
export async function uploadExamImg(filePath) {
    let fileType = filePath.lastIndexOf('.') == -1 ? '' : filePath.substring(filePath.lastIndexOf('.'), filePath.length);
    let cloudPath = EXAM_DIR + "/" + new Date().getTime() + "" + Math.floor(Math.random() * 1000000) + fileType;
    return await uploadFile(cloudPath, filePath);
}
/**
 * 上传文件到云存储
 * @param {String} cloudPath 云路径
 * @param {String} filePath 临时文件路径
 * @returns {String} 文件ID
 */
export async function uploadFile(cloudPath, filePath) {
    try {
        const res = await wx.cloud.uploadFile({
            cloudPath: cloudPath,
            filePath: filePath
        });
        if (typeof (res) != 'undefined') {
            return res.fileID;
        }
    } catch (error) {
        console.error(error);
    }
    return null;
}
/**
 * 获取文件临时路径
 * @param {Array<String>} fileIds 文件id列表
 * @returns  {Array<String>} 成功ID列表
 */
export async function getTempFileUrl(fileIds) {
    try {
        const res = await wx.cloud.getTempFileURL({
            fileList: fileIds
        });
        if (typeof (res) != 'undefined') {
            return res.fileList;
        }
    } catch (error) {
        console.error(error);
    }
    return null;
}
/**
 * 下载文件
 * @param {String} fileId 文件ID
 * @returns {String} 临时文件路径
 */
export async function downloadFile(fileId) {
    try {
        const res = await wx.cloud.downloadFile({
            fileID: fileId
        });
        if (typeof (res) != 'undefined') {
            return res.tempFilePath;
        }
    } catch (error) {
        console.error(error);
    }
    return null;
}
/**
 * 删除文件
 * @param {Array<String>} fileIds 文件id列表
 * @returns  {Array<String>} 成功ID列表
 */
export async function deleteFile(fileIds) {
    try {
        const res = await wx.cloud.deleteFile({
            fileList: fileIds
        });
        if (typeof (res) != 'undefined') {
            return res.fileList;
        }
    } catch (error) {
        console.error(error);
    }
    return null;
}
