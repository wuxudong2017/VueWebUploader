<template>
  <div id="app">
    <WUpload checkUrl="/storage/fdfs/checkFile" uploadUrl="/storage/fdfs/batchPeaceUpload" tip="请选择上传的文件,大小500M以内"
      :auto-upload="true" :size-limit="1*1024*1024" :chunk-size="1*1024*1024" :on-success="uploadSuccess"
      :on-remove="uploadRemove" :file-list="formData"></WUpload>
    {{formData}}
    <br/> <br/> <br/> <br/>
    <el-upload class="upload-demo" ref="upload" action="/storage/commonFile/uploadFile"
    :headers="{'Authorization':'Bearer cb87ad9f-7895-43b5-81ee-c6f373ba9279'}"
      :on-preview="handlePreview" :on-remove="handleRemove"
       :file-list="fileList" 
       :auto-upload="false"
       :on-success="uploadSuccess"
       >
      <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
      <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
      <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
    </el-upload>
  </div>
</template>

<script>
  export default {
    name: "App",
    data() {
      return {
        formData: [{
          original: null,
          size: 73728,
          state: "SUCCESS",
          title: "天业仁和-桌面壁纸2.jpg",
          type: "jpg",
          url: "group1/M00/00/02/wKgSaV8SUpqEN_rWAAAAAJQ0q7s307.jpg"
        }],
        fileList: [{
          name: 'food.jpeg',
          url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'
        }, {
          name: 'food2.jpeg',
          url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100'
        }]
      }
    },
    methods: {
      uploadSuccess(res, file, fileList) {
        console.log(res)
        console.log(file);
        console.log(fileList)
      },
      uploadRemove(file, fileList) {
        console.log(file, fileList)
      },
      submitUpload() {
        this.$refs.upload.submit();
      },
      handleRemove(file, fileList) {
        console.log(file, fileList);
      },
      handlePreview(file) {
        console.log(file);
      }
    }
  }
</script>

<style scoped>
</style>