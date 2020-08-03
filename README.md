# VueWebUpload

基于Vue+webuploader+element-ui的文件分片上传,

# 插件使用

 `npm i w-web-uploader --save`
### 组件内使用

``` bash
<VueWebUpload 
    checkUrl="/storage/fdfs/checkFile" 
    uploadUrl="/storage/fdfs/batchPeaceUpload"
    tip="请选择上传的文件,大小500M以内"
    :headers="{ 'Authorization': 'Bearer 2741145f-0065-4e37-9e24-a6d42ca22254'}"
    :auto-upload="true" 
    :size-limit="500*1024*1024" 
    :chunk-size="1*1024*1024" 
    :on-success="uploadSuccess"
    :on-remove="uploadRemove" 
    :file-list="fileList"
    ></VueWebUpload>
```
### 返回参数
* checkUrl:
返回数据:
```
{
code: 101
data: {}
msg: "文件已经上传"
}
```
101    // 忽略上传过程，直接标识上传成功；

100    // 文件不存在,从新上传

102    //部分文件上传,但是差几个模块。({code:102,data:{chunkCurr:1}}) ,chunkCurr第几个片段



# 方法参数

|  参数   | 说明  | 类型  | 可选值  | 默认值  |
|  ----  | ----  | :----:  | :----:  | :----:  | 
| checkUrl  | md5校验接口 |String | — | — |
| uploadUrl  | 文件分片上传接口 |String | — | — |
| tip  | 底部信息提示 | String | — | — |
| headers  | 设置上传的请求头部 | Object | — | — |
| auto-upload  | 是否在选取文件后立即进行上传 | Boolean | — | true |
| accept  | 接受上传的文件类型 | String | text,vide,image | — |
| size-limit  | 文件大小限制(byte) | Number | — | 500M |
| chunk-size  | 分片大小(byte) | Number | — | 1M |
| on-success  | 文件上传成功时的钩子 | function(response, file, fileList) | — | — |
| on-complete  | 文件上传完成后的钩子 | function(file, fileList) | — | — |
| on-remove  | 文件移除的时候 | function(file, fileList)  | — | — |
| file-list  | 上传的文件列表 | Array  | — | — |
| limit  | 最大允许上传个数 | Number  | — | 10 |






