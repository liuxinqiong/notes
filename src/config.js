const config = {
    host: '',
    cloudEnv: process.env.CLOUD_ENV
}

export const RES_CODE = {
    OK: 200
}

export const COMPRESS_SETTING = {
    IOS_MAX_SIZE: 250000,
    ANDROID_MAX_SIZE: 800000,
    ANDROID_NO_COMPRESS_SIZE: 300000,
    ANDROID_COMPRESS_CHANGE_RATE: 0.0000002,
    ANDROID_START_COMPRESS_RATE: 0.9
}
export default config
