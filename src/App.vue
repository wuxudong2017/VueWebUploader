<template>
  <div id="app">
    <WUpload
    :sizeLimit="500*1024*1024"
    :chunkSize="1*1024*1024"
    checkUrl="/fdfs/checkFile"
    uploadUrl="/fdfs/batchPeaceUpload"
    tip="请选择上传的文件,大小500M以内"
    ></WUpload>
  </div>
</template>

<script>
  export default {
    name:"App"
  }
</script>

<style scoped>
</style>