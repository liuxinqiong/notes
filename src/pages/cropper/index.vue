<template>
    <div>
        <cropper :image-src="imgSrc"></cropper>
    </div>
</template>
<script>
import Cropper from '@/components/cropper/cropper'
export default {
    data() {
        return {
            imgSrc: 'https://blog.pig1024.me/img/upload_710307695389c257dcad21edc9e828e2.png'
        }
    },
    components: {
        Cropper
    }
}
</script>
