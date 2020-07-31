<template>
  <div class="w-upload">
    <div id="thelist" class="uploader-list"></div>
    <div :id="id">选择大文件</div>
    <div class="el-upload__tip">{{tip}}</div>
    <ul class="el-upload-list el-upload-list--text" v-if="filesList.length">
      <li class="el-upload-list__item is-success" v-for="(item,index) in filesList" :key="index">
        <a class="el-upload-list__item-name">
          <i class="el-icon-document"></i>
          <span> {{item.title}}</span>
          <span v-if="item.status!=='uploaded'" class="status">{{item.status}}</span>
          <span v-else class="status success">上传成功</span>
          <i class="el-icon-circle-close" style="float:right" @click.prevent="deletes(index, item.file)"></i>
        </a>
        <el-progress v-if="item.status === '上传中'|| item.status=== '切片中'" :percentage="item.percentage" :show-text="false"></el-progress>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: "WebUpload",
    model: {
      prop: 'responseData',
      event: 'change'
    },
    data() {
      return {
        uploader: "",
        filesList: [],
        fileNum: 0,
      };
    },
    props: {
      fileNumLimit: {
        type: Number,
        default: 10,
        required: false
      },
      accept: {
        type: Object,
        default: () => ({}),
        required: false,
      },
      id: {
        type: String,
        default: 'picker',
        required: false,
      },
      responseData: {
        type: Array,
        required: true,
        default: () => ([])
      },
      chunkSize: {
        type: Number,
        default: 5 * 1024 * 1024
      },
      checkUrl: {
        type: String,
        required: false,
        default: '/resource_api/storage/fdfs/checkFile'
      },
      uploadUrl: {
        type: String,
        required: false,
        default: '/resource_api/storage/fdfs/batchPeaceUpload'
      },
      tip: {
        type: String,
        default: '请选择上传的文件,大小500M以内'
      },
      sizeLimit: {
        type: Number,
        default: 500 * 1024 * 1024
      },

    },
    mounted() {
      // HOOK 这个必须要再uploader实例化前面
      WebUploader.Uploader.register({
        "before-send-file": "beforeSendFile",
        "before-send": "beforeSend"
      }, {
        beforeSendFile: function (file) {
          console.log("beforeSendFile");
          // Deferred对象在钩子回掉函数中经常要用到，用来处理需要等待的异步操作。
          var deferred = WebUploader.Deferred();
          // 根据文件内容来查询MD5
          this.uploader
            .md5File(file)
            .progress(
              function (percentage) {
                // 及时显示进度
                this.filesList.forEach(item => {
                  if (file.id === item.id) {
                    item.percentage = (percentage.toFixed(2) * 100)
                    item.status = "切片中"
                  }
                })
              }.bind(this)
            )
            .then(
              function (val) {
                // 完成
                console.log("md5 result:", val);
                this.filesList.forEach(item => {
                  if (file.id === item.id) {
                    item.percentage = 100
                    item.status = "切片完成";
                  }
                })
                file.md5 = val;
                // 模拟用户id
                // file.uid = new Date().getTime() + "_" + Math.random() * 100;
                file.uid = WebUploader.Base.guid();
                let url = this.checkUrl
                // 进行md5判断
                $.ajax({
                  headers: {
                    'Authorization': '111'
                  },
                  type: 'GET',
                  data: {
                    uid: file.uid,
                    md5: file.md5
                  },
                  url,
                  success: function (data) {
                    var status = data.code;
                    deferred.resolve();
                    if (status == 100) {
                      // 文件不存在，那就正常流程
                    } else if (status == 101) {
                      this.responseData.push(data.data.uploadResult);
                      this.$emit('change', this.responseData)
                      // 忽略上传过程，直接标识上传成功；
                      this.uploader.skipFile(file);
                      file.pass = true;
                    } else if (status == 102) {
                      // 部分已经上传到服务器了，但是差几个模块。
                      file.missChunks = data.chunkCurr;
                    }
                  }.bind(this),
                  error:function(){
                    this.$message.error('上传失败')
                  }.bind(this)
                })
              }.bind(this)
            );
          return deferred.promise();
        }.bind(this),
        beforeSend: function (block) {
          var deferred = WebUploader.Deferred();
          var file = block.file;
          var missChunks = file.missChunks;
          var blockChunk = block.chunk;
          if (
            missChunks !== null &&
            missChunks !== undefined &&
            missChunks !== ""
          ) {
            var flag = true;
            for (var i = 0; i < missChunks.length; i++) {
              if (blockChunk == missChunks[i]) {
                flag = false;
                break;
              }
            }
            if (flag) {
              deferred.reject();
            } else {
              deferred.resolve();
            }
          } else {
            deferred.resolve();
          }
          return deferred.promise();
        }.bind(this)
      });
      this.uploader = WebUploader.create({
        pick: {
          id: '#' + this.id,
          label: "点击选择文件"
        },
        formData: {
          uid: 0,
          md5: "",
          chunkSize: this.chunkSize
        },
        //dnd: '#dndArea',
        //paste: '#uploader',
        swf: "/public/js/webupload/Uploader.swf",
        chunked: true,
        chunkSize: this.chunkSize, // 字节 1M分块
        threads: 1,
        server: this.uploadUrl,
        auto: true,
        // 是否开启多选
        multiple: true,
        // 禁掉全局的拖拽功能。这样不会出现图片拖进页面的时候，把图片打开。
        disableGlobalDnd: true,
        accept: this.accept, // 允许的文件格式
        fileNumLimit: this.fileNumLimit,
        fileSizeLimit: this.sizeLimit, // 500 M
        fileSingleSizeLimit: this.sizeLimit // 500 M
      });
      this.w_init();
    },
    methods: {
      // 删除列表
      deletes(index,file) {
        this.filesList.splice(index, 1);
        if(file){
            this.uploader.removeFile(file, true);
        }
        this.responseData.splice(index, 1);
        this.$emit('change',this.responseData)
      },
      w_init() {
        // 当有文件被添加进队列的时候
        this.uploader.on(
          "fileQueued",
          function (file) {
            console.log("fileQueued");
            this.filesList.push({
              id: file.id,
              title: file.name,
              size: file.size,
              percentage: 0,
              status: '',
            });
            this.fileNum = this.filesList.length;

          }.bind(this)
        );

        //当某个文件的分块在发送前触发，主要用来询问是否要添加附带参数，大文件在开起分片上传的前提下此事件可能会触发多次。
        this.uploader.onUploadBeforeSend = function (obj, data, headers) {
          $.extend(headers, {
            "Authorization": '111'
          });
          console.log("onUploadBeforeSend");
          var file = obj.file;
          data.md5 = file.md5 || "";
          data.uid = file.uid;
          data.chunk = obj.chunk
          data.chunks = obj.chunks
        };
        // 上传中
        this.uploader.on(
          "uploadProgress",
          function (file, percentage) {
            this.filesList.forEach(item => {
              if (file.id === item.id) {
                item.percentage = (percentage.toFixed(2) * 100)
                item.status = "上传中"
              }
            })
          }.bind(this)
        );
        // 上传返回结果
        this.uploader.on(
          "uploadSuccess",
          function (file, response) {
            this.filesList.forEach(item => {
              if (file.id === item.id) {
                item.percentage = 100
                item.status = "上传成功";
              }

            })
            if (response && response.code == 0) {
              // 进行后台返回数据处理
              this.responseData.push(response.data);
              this.$emit('change',this.responseData)
            }
            this.$message({
              type: "success",
              message: "上传成功...."
            });

          }.bind(this)
        );
        this.uploader.on(
          "uploadError",
          function (file) {
            this.filesList.forEach(item => {
              if (file.id === item.id) {
                item.percentage = 100
                item.status = "上传失败";
              }
            })
            this.$message({
              message: "上传失败....",
              type: "error"
            });
          }.bind(this)
        );
        this.uploader.on("uploadComplete", function (file) {

        });
      },
    },
    watch:{
      responseData:{
        handler(val){
          if(val.length==0){
            this.filesList=[]
            }else{
            this.filesList = val.filter(item=>item.url)
          };

        },
        immediate:true
      }
    }
  };
</script>

<style scoped>
  .status {
    display: inline-block;
    padding-left: 20px;
    color: #e6a23c;
  }

  .success {
    color: #67c23a;
  }

  .w-upload {}
</style>