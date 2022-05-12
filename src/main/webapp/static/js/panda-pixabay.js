$(function () {
    /* ====================================================== Commons =============================================== */
    // Context path and notice modal
    var contextPath = $("#span-context-path").text();
    // Response code from server
    var INFO_CODE = 0;
    var SUCCESS_CODE = 1;
    var DANGER_CODE = 2;
    var WARNING_CODE = 3;

    // Prevent the default submit action of form
    $("form").on("submit", function () {
        return false;
    });

    // Show the notice modal
    var showNoticeModal = function (code, msg) {
        var $noticeContent = $("#h-notice-content");
        // Clear the existed style of the notice object
        $noticeContent.parent().removeClass("alert-info alert-success alert-warning alert-danger");
        if (INFO_CODE === code) {
            $noticeContent.parent().addClass("alert-info");
        } else if (SUCCESS_CODE === code) {
            $noticeContent.parent().addClass("alert-success");
        } else if (WARNING_CODE === code) {
            $noticeContent.parent().addClass("alert-warning");
        } else if (DANGER_CODE === code) {
            $noticeContent.parent().addClass("alert-danger");
        }
        $noticeContent.text(msg);
        $("#div-notice-modal").modal('show');
    };

    /* ================================================ Show pixabay ================================================ */
    var PIXABAY;
    var IMAGE;
    var getPixabay = function () {
        $.ajax({
            url: contextPath + "pixabay/first",
            dataType: "json",
            type: "get",
            async: false,
            success: function (response) {
                if (SUCCESS_CODE === response.code) {
                    PIXABAY = response.resultMap.pixabay;
                    IMAGE = PIXABAY.url;
                } else {
                    showNoticeModal(response.code, response.msg);
                }
            },
            error: function () {
                showNoticeModal(DANGER_CODE, "请求获取 Pixabay 数据失败");
            }
        })
        return IMAGE;
    };

    // Show the picture and set character content of the page
    var changeBackgroundSetHitokoto = function (slideObj, imgLink) {
        slideObj.attr("src", imgLink);
        slideObj.parent("a").attr("href", imgLink);
    };

    // After page load successfully, get the first pixabay
    changeBackgroundSetHitokoto($(".first-slide"), getPixabay());

    /* ================================================ Delete pixabay ============================================== */
    $("#btn-pixabay-delete").click(function () {
        // Send a request to server for delete a pixabay picture
        $.ajax({
            url: contextPath + "pixabay/" + PIXABAY.id,
            type: "post",
            data: "_method=delete",
            dataType: "json",
            success: function (response) {
                if (SUCCESS_CODE === response.code) {
                    changeBackgroundSetHitokoto($(".first-slide"), getPixabay());
                } else {
                    showNoticeModal(response.code, response.msg);
                }
            },
            error: function () {
                showNoticeModal(DANGER_CODE, "请求删除 Pixabay 记录失败");
            }
        })
    });

    /* ====================================== Clear all pixabay then insert new ===================================== */
    // Open the pixabay modal
    $("#btn-pixabay-open-modal").click(function () {
        $("#modal-get-pixabay").modal({
            backdrop: "static"
        })
    });

    // Close get pixabay modal click event
    $("#btn-pixabay-modal-close").click(function () {
        var $input_pixabay_condition = $("#input-pixabay-condition");
        $input_pixabay_condition.parent().removeClass("has-error has-success has-warning");
        $input_pixabay_condition.val("");
        $("#select-pixabay-pages").val("01");
        $("#btn-pixabay-add").attr("disabled", false);
    });

    // Get pixabay by condition and pages click event
    $("#btn-pixabay-add").click(function () {
        var $keywords = $("#input-pixabay-condition");
        var condition = $keywords.val();
        var pages = $("#select-pixabay-pages").val();
        $keywords.parent().removeClass("has-error has-success has-warning");
        // The filter condition can not be empty
        if (condition.length <= 0) {
            $keywords.parent().addClass("has-error");
            return false;
        } else {
            $keywords.parent().addClass("has-success");
        }
        // Send an ajax request to server to add new pixabay though python spider
        $(this).attr("disabled", "disabled");
        $.ajax({
            url: contextPath + "pixabay/" + condition + "/" + pages,
            type: "post",
            data: "_method=put",
            dataType: "json",
            success: function (response) {
                if (SUCCESS_CODE === response.code) {
                    changeBackgroundSetHitokoto($(".first-slide"), getPixabay());
                    $("#modal-get-pixabay").modal('hide');
                    var $input_pixabay_condition = $("#input-pixabay-condition");
                    $input_pixabay_condition.parent().removeClass("has-error has-success has-warning");
                    $input_pixabay_condition.val("");
                    $("#select-pixabay-pages").val("01");
                }
                showNoticeModal(response.code, response.msg);
            },
            error: function () {
                showNoticeModal(DANGER_CODE, "请求新增 Pixabay 记录失败");
            }
        })
    });

    /* ================================================= Background upload ========================================== */
    // Background upload click event
    $("#btn-background-upload").click(function () {
        $("#modal-upload-background").modal({
            backdrop: "static"
        })
    });

    // Close the upload modal event
    $("#btn-background-upload-modal-close").click(function () {
        $("#input-background-upload").attr("disabled", false);
        $("#btn-background-start-upload").attr("disabled", false);
    });

    // File upload service by Qiniu Cloud
    var qiniuCloudFileUpload = function (file, key, token) {
        var putExtra = {
            fname: {key},
            params: {},
            mimeType: ["image/*"]
        }
        var config = {
            shouldUseQiniuFileName: false,
            region: qiniu.region.z2,
            forceDirect: true,
        };

        // Get a upload service obj
        var observable = qiniu.upload(file, key, token, putExtra, config);

        var observer = {
            next(res) {
                // Show the progress of the book upload
                var rate = res.total.percent + "";
            },
            error() {
                showNoticeModal(DANGER_CODE, "背景图片上传失败");
            },
            complete() {
                showNoticeModal(SUCCESS_CODE, "背景图片上传成功，感谢您的共享");
                $("#modal-upload-background").modal('hide');
                $("#input-background-upload").attr("disabled", false);
                $("#btn-background-start-upload").attr("disabled", false);
            }
        }

        // Start upload
        observable.subscribe(observer);
    };

    // Listening the content change of the file choose input element
    var file;
    var suffix;
    $("#input-background-upload").on("change", function (e) {
        file = e.target.files[0];
        var srcFileName = $("#input-background-upload").val();
        suffix = srcFileName.substring(srcFileName.lastIndexOf("."));
    });

    // Start uploading book button event
    $("#btn-background-start-upload").click(function () {
        if (!(".png" === suffix || ".jpg" === suffix)) {
            showNoticeModal(WARNING_CODE, "请选择图片文件")
            return false;
        }
        $(this).attr("disabled", "disabled");
        $("#input-background-upload").attr("disabled", "disabled");
        // Ask server the save image file
        $.ajax({
            url: contextPath + "transfer/upload/wallpaper",
            dataType: "json",
            type: "post",
            success: function (response) {
                if (SUCCESS_CODE === response.code) {
                    qiniuCloudFileUpload(file, response.resultMap.key, response.resultMap.token);
                } else {
                    showNoticeModal(response.code, response.msg);
                }
            },
            error: function () {
                showNoticeModal(DANGER_CODE, "请求上传背景图片文件失败");
            }
        })
    });
});