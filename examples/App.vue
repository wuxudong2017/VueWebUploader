<template>
  <div id="app">
    <VueWebUpload 
    checkUrl="/storage/fdfs/checkFile" 
    uploadUrl="/storage/fdfs/batchPeaceUpload"
     tip="请选择上传的文件,大小500M以内"
     :headers="{ 'Authorization': 'Bearer 6adb8473-851a-4dbf-8c5d-e8ac0e04ef2c'}"
      :auto-upload="true" 
      :size-limit="1*1024*1024" 
      :chunk-size="1*1024*1024" 
      :on-success="uploadSuccess"
      :on-remove="uploadRemove" 
      :file-list="fileList"></VueWebUpload>
  </div>
</template>

<script>
  export default {
    name: "App",
    data() {
      return {
        fileList: []
      }
    },
    methods: {
      uploadSuccess(res, file, fileList) {
        console.log(res)
        // console.log(file);
        console.log(fileList)
      },
      uploadRemove(file, fileList) {
        // console.log(file, fileList)
      },
      submitUpload() {
        // this.$refs.upload.submit();
      },
    }
  }
</script>

<style scoped>
</style>