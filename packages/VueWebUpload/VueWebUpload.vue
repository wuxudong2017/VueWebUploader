<template>
  <div class="w-upload">
    <div id="thelist" class="uploader-list"></div>
    <div :id="id" class="upload_btn">选择大文件</div>
    <el-button v-if="!autoUpload" size="mini" @click="start" :loading="uploadLoading" type="success">上传到服务器</el-button>
    <div class="el-upload__tip">{{tip}}</div>
    <ul class="el-upload-list el-upload-list--text" v-if="fileList.length">
      <li class="el-upload-list__item is-success" v-for="(item,index) in fileList" :key="index">
        <a class="el-upload-list__item-name">
          <i class="el-icon-document"></i>
          <span> {{item.title}}</span>
          <span v-if="item.status!=='uploaded'" class="status">{{item.status}}</span>
          <span v-else class="status success">上传成功</span>
          <i class="el-icon-circle-close" style="float:right" @click.prevent="remove(index, item)"></i>
        </a>
        <el-progress v-if="item.status === '上传中'|| item.status=== '切片中'" :percentage="item.percentage"
          :show-text="false"></el-progress>
      </li>
    </ul>
  </div>
</template>

<script>
  import './js/jquery'
  import './js/webupload/webuploader'

  function noop() {}
  export default {
    name: "VueWebUpload",
    data() {
      return {
        uploader: "",
        fileNum: 0,
        uploadLoading: false, // 上传加载效果
      };
    },
    props: {
      headers: {
        type: Object,
        required: false,
        default: () => ({})
      },
      autoUpload: {
        type: Boolean,
        default: true,
        required: false
      },
      fileList: {
        type: Array,
        required: false,
        default: () => ([])
      },
      limit: {
        type: Number,
        default: 10,
        required: false
      },
      accept: {
        type: String,
        required: false,
      },
      id: {
        type: String,
        default: 'picker',
        required: false,
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
        default: 1 * 1024 * 1024
      },
      onSuccess: {
        type: Function,
        required: false,
        default: noop
      },
      onRemove: {
        type: Function,
        required: false,
        default: noop
      },
      onComplete: {
        type: Function,
        required: false,
        default: noop
      },
      onChange: {
        type: Function,
        required: false,
        default: noop
      }
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
                this.fileList.forEach(item => {
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
                this.fileList.forEach(item => {
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
                    ...this.headers
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
                      this.fileList.forEach(item => {
                        if (file.id === item.id) {
                          item.percentage = 100
                          item.status = "上传成功";
                          item.response = data
                        }
                      })
                      this.uploadLoading = false;
                      // 忽略上传过程，直接标识上传成功；
                      this.uploader.skipFile(file);
                      file.pass = true;
                      this.onSuccess(data, file, this.fileList)
                    } else if (status == 102) {
                      // 部分已经上传到服务器了，但是差几个模块。
                      file.missChunks = data.chunkCurr;
                    }
                  }.bind(this),
                  error: function () {
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
        swf: "./js/webupload/Uploader.swf",
        chunked: true,
        chunkSize: this.chunkSize, // 字节 1M分块
        threads: 1,
        server: this.uploadUrl,
        auto: this.autoUpload,
        // 是否开启多选
        multiple: true,
        // 禁掉全局的拖拽功能。这样不会出现图片拖进页面的时候，把图片打开。
        disableGlobalDnd: true,
        accept: this.getAccept(this.accept), // 允许的文件格式
        fileNumLimit: this.limit,
        fileSizeLimit: this.sizeLimit, // 500 M
        fileSingleSizeLimit: this.sizeLimit // 500 M
      });
      this.w_init();
    },
    methods: {
      w_init() {
        // 当有文件添加对内
        this.uploader.on('beforeFileQueued', function (file) {
          this.onChange(file,this.fileList)
          if (this.fileList.length < this.limit) {
            if (this.getAccept(this.accept).exteensions) {
              if (this.getAccept(this.accept).exteensions.indexOf(file.ext) > -1) {
                return true
              } else {
                this.uploader.trigger('error', 'Q_TYPE_DENIED');
                return false
              }
            } else {
              return true
            }

          } else {
            return false;
          }

        }.bind(this))
        // 当有文件被添加进队列的时候
        this.uploader.on("fileQueued", function (file) {
          console.log("fileQueued");
          this.fileList.push({
            id: file.id,
            title: file.name,
            size: file.size,
            percentage: 0,
            status: '',
            raw: file

          });
        }.bind(this));

        //当某个文件的分块在发送前触发，主要用来询问是否要添加附带参数，大文件在开起分片上传的前提下此事件可能会触发多次。
        this.uploader.onUploadBeforeSend = function (obj, data, headers) {
          $.extend(headers, this.headers);
          console.log("onUploadBeforeSend");
          var file = obj.file;
          data.md5 = file.md5 || "";
          data.uid = file.uid;
          data.chunk = obj.chunk
          data.chunks = obj.chunks
        };
        // 上传中
        this.uploader.on("uploadProgress", function (file, percentage) {
          this.fileList.forEach(item => {
            if (file.id === item.id) {
              item.percentage = (percentage.toFixed(2) * 100)
              item.status = "上传中"
            }
          })
        }.bind(this));
        // 上传返回结果
        this.uploader.on("uploadSuccess", function (file, response) {
          this.fileList.forEach(item => {
            if (file.id === item.id) {
              item.percentage = 100
              item.status = "上传成功";
              if (response) {
                item.response = response
              }
            }
          })
          this.uploadLoading = false;

          if (response) {
            this.onSuccess(response, file, this.fileList)
          }
          this.$message({
            type: "success",
            message: "上传成功...."
          });

        }.bind(this));
        this.uploader.on("uploadError", function (file) {
            this.fileList.forEach(item => {
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
        //文件校验格式和大小
        this.uploader.on('error', function (type) {
          if (type == 'Q_EXCEED_SIZE_LIMIT') {
            this.$message({
              message: '文件超过指定大小',
              type: 'error'
            });
          }
          if (type == 'Q_TYPE_DENIED') {
            this.$message({
              message: '文件格式错误，请选择文件',
              type: 'error'
            });
          }
          if (type == 'F_EXCEED_SIZE') {
            this.$message({
              message: "文件超过" + this.sizeLimit / 1024 / 1024 + "M",
              type: 'error'
            });
          }
        }.bind(this));

        this.uploader.on("uploadComplete", function (file) {
          // 文件上传完成
          this.onComplete(file, this.fileList)
        }.bind(this));
      },
      // 上传开始方法
      start() {
        const fileList = this.uploader.getFiles()
        if (fileList.length > 0) {
          fileList.forEach(item => {
            this.uploader.upload(item.id);
            this.uploadLoading = true;
          })
        } else {
          this.$message.error('请选择上传文件')
        }
      },
      // 删除列表
      remove(index, item) {
        if (item.raw) {
          this.uploader.removeFile(item.raw, true);
        }
        this.fileList.splice(index, 1);
        this.onRemove(index, item, this.fileList);
        this.uploader.reset();
      },
      // 上传允许类型
      getAccept(accept) {
        switch (accept) {
          case 'text':
            return {
              title: 'Texts',
                exteensions: 'doc,docx,xls,xlsx,ppt,pptx,pdf,txt',
                mimeTypes: '.doc,docx,.xls,.xlsx,.ppt,.pptx,.pdf,.txt'
            };
            break;
          case 'video':
            return {
              title: 'Videos',
                exteensions: 'mp4',
                mimeTypes: '.mp4'
            };
            break;
          case 'image':
            return {
              title: 'Images',
                exteensions: 'gif,jpg,jpeg,bmp,png',
                mimeTypes: '.gif,.jpg,.jpeg,.bmp,.png'
            };
            break;
          default:
            return {
              title: 'file',
                exteensions: '',
                mimeTypes: ''
            };
        }
      },
    },
  };
</script>

<style>
  .webuploader-container {
    position: relative;
  }

  .webuploader-element-invisible {
    position: absolute !important;
    clip: rect(1px 1px 1px 1px);
    /* IE6, IE7 */
    clip: rect(1px, 1px, 1px, 1px);
  }

  .webuploader-pick {
    position: relative;
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    background: #fff;
    border: 1px solid #dcdfe6;
    color: #606266;
    -webkit-appearance: none;
    text-align: center;
    box-sizing: border-box;
    outline: none;
    margin: 0;
    transition: .1s;
    font-weight: 500;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    padding: 12px 20px;
    font-size: 14px;
    border-radius: 4px;
    color: #fff;
    background-color: #409eff;
    border-color: #409eff;
    padding: 7px 15px;
    font-size: 12px;
    border-radius: 3px;
  }

  .webuploader-pick-hover {
    background: #66b1ff;
    border-color: #66b1ff;
    color: #fff;
  }

  .webuploader-pick-disable {
    opacity: 0.6;
    pointer-events: none;
  }

  .el-upload__tip {
    font-size: 12px;
    color: #606266;
    margin-top: 7px;
  }

  .el-upload-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .el-upload-list__item {
    -webkit-transition: all .5s cubic-bezier(.55, 0, .1, 1);
    transition: all .5s cubic-bezier(.55, 0, .1, 1);
    font-size: 14px;
    color: #606266;
    line-height: 1.8;
    margin-top: 5px;
    position: relative;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    border-radius: 4px;
    width: 100%;
  }

  .el-upload-list__item-name {
    color: #606266;
    display: block;
    margin-right: 40px;
    overflow: hidden;
    padding-left: 4px;
    text-overflow: ellipsis;
    -webkit-transition: color .3s;
    transition: color .3s;
    white-space: nowrap;
  }

  .upload_btn {
    display: inline-block;
    margin-right: 20px;
  }

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