<template>
    <div>
        答题页面
        <exam></exam>
        <p>{{age}}</p>
    </div>
</template>
<script>
import Exam from '@/components/exam/exam'
import Utils from '@/utils'
import { takePhoto } from '@/utils'
export default {
    data() {
        return {
            age: ''
        }
    },
    
    components: {
        Exam
    }
}
</script>
