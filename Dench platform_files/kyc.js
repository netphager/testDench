var FILE_SIZE_LIMIT = 5242880;
var documentToDeleteId;
var documentToDelete;
var kycFiles = null;
var currentUser = {};
var isMobileDevice = isMobile();

$(function () {
    if (isMobileDevice) {
        handleCurrentUser(function (current) {
            if (current != null) {
                $(".kyc").addClass("modal-show");
                loadKycPage();
            } else {
                window.location.replace(config.hostUrl + "/login");
            }
        });
    } else {
        $("#web-tab-kyc-details").click(function (e) {
            e.preventDefault();
            loadKycPage();
        });
    }
});

function loadKycPage() {
    setKycStatus();

    $.ajax({
          method: "POST",
          contentType : "application/json",
          url: config.denchApiUrl + "/api/v1/customerfacing/customers/documents/search",
          data: "{}",
          dataType: "json",
          success: function (data) {
              var html = "";
              for (var i in data.content) {
                  html += getDocumentHtml(data.content[i]);
              }
              $("#uploaded-documents-list").html(html);
          },
          error: function(xhr, textStatus, errorThrown) {
             showErrorMessage(translations.kyc_load_failed);
          }
    });

    $("#upload-kyc").on('click', function (e) {
        $("#upload-kyc").val('');
    });

    $("#upload-kyc").on('change', function (e) {
        var source = URL.createObjectURL(e.target.files[0]);
        $("#output").attr('src', source);
        $('#preview').css("display", "block");
        var filename = $('#upload-kyc').val().split('\\').pop();
        $('.kyc-img-name').html("<div class='image-name'>" + filename + "</div>");
        if (e.target.files[0].size > FILE_SIZE_LIMIT) {
            $('.kyc-img-size').html('<i class="icon-close_btn"></i>' + (e.target.files[0].size/1048576).toFixed(2) + ' mb')
        } else {
            $('.kyc-img-size').html('<i class="icon-tick"></i>' + (e.target.files[0].size/1048576).toFixed(2) + ' mb')
        }
        $("#closePreview").css('display', 'block');
		if (!isMobileDevice) {
			$("#closePreview").css('display', 'inline-block');
		 }
        kycFiles = e.target.files;
    });

    $("#uploadKycBtn").click(function() {
        if (kycFiles != null && kycFiles[0].size > FILE_SIZE_LIMIT) {
            showErrorMessage(translations.kyc_validation_file_exceeds_limit);
            return;
        }
        if (kycFiles != null) {
            var customerId = $("#customerid").val();
            var type = $("#kycType").val();

            var oMyForm = new FormData();
            oMyForm.append("file", kycFiles[0]);

            $.ajax({
                 url : config.denchApiUrl + "/api/v1/customerfacing/customers/documents?documentType=" + type,
                 data : oMyForm,
                 type : "POST",
                 enctype: 'multipart/form-data',
                 processData: false,
                 contentType:false,
                 success : function(response) {
                     var html = getDocumentHtml(response);
                     $("#uploaded-documents-list").append(html);
                     kycFiles = null;
                     closePreview();
                     showSuccessMessage(translations.kyc_upload_success)
                 },
                 error : function(request, status, thrownError) {
                     showErrorMessage(translations.kyc_upload_failed)
                 }
            });
        } else {
            showErrorMessage(translations.kyc_validation_no_file_selected)
        }
    });

    $("body").on('click touchend', '.delete-document', function(e) {
       documentToDelete = this;
       documentToDeleteId = $(this).data('documentid');
       showConfirmationModal(translations.delete_document_message, deleteDocument);
    });

    $("body").on('click', '.document-link', function(e) {
        e.preventDefault();
        source = $(this).attr('href');
        $("#output").attr('src', source);
        $('.kyc-img-name').html("");
        $('.kyc-img-size').empty();
        $("#preview").css('display', 'block');
        $("#closePreview").css('display', 'block');
		if (!isMobileDevice) {
			$("#closePreview").css('display', 'inline-block');
		 }
        kycFiles = null;
    });

    $("#closePreview").click(function (){
        closePreview();
    })
}

function getDocumentHtml(document) {
    var html = '';
    var previewUrl = config.denchApiUrl + '/api/v1/customerfacing/' + document.loadUrl;
    if (!isMobileDevice) {
        html =
            '<div class="uploaded-history-img">' +
                '<div class="identity-type">' + getDocumentTypeUi(document.type) + '</div>' +
                '<a href="' + previewUrl + '" class="document-link ">' + document.fileName + '</a>' +
                '<a class="delete-document" data-documentid="' + document.id + '"><i class="icon-close_btn"></i></a>' +
            '</div>';
    } else {
        html =
            '<div class="kyc-uploaded-img">' +
              '<a href="' + previewUrl + '" class="document-link">' + document.fileName + '</a>' +
              '<a class="delete-document" data-documentid="' + document.id + '"><i class="icon-close_btn"></i></a>' +
            '</div>';
    }
    return html;
}

function getDocumentTypeUi(documentType) {
    return $("#kycType option[value='" + documentType + "']").text();
}

function setKycStatus() {
    var kycStatus = window.currentUser.kycVerified;
    var kycStatusClass = '';
    var kycIconClass = '';
    var kycLabelTranslation = '';
    if (kycStatus == "VERIFIED") {
        kycIconClass = "icon-checked";
        kycStatusClass = "kyc-status-verified";
        kycLabelTranslation = translations.kyc_verified;
    } else if (kycStatus == "NOT_VERIFIED") {
        kycIconClass = "icon-error";
        kycStatusClass = "kyc-status-not-verified";
        kycLabelTranslation = translations.kyc_notverified;
    } else if (kycStatus == "IN_PROGRESS") {
        kycIconClass = "icon-info";
        kycStatusClass = "kyc-status-in-progress";
        kycLabelTranslation = translations.kyc_inprogress;
    }
    $("#kycstatus").html('<i class="' + kycIconClass + '"></i>' + kycLabelTranslation);
    $("#kycstatus").addClass(kycStatusClass);
}

function closePreview() {
    $("#output").attr("src", "");
    $("#preview").css('display', 'none');
    $('.kyc-img-name').html("");
    $('.kyc-img-size').empty();
    $("#closePreview").css('display', 'none');
    kycFiles = null;
}

function deleteDocument() {
    $.ajax({
      method: "DELETE",
      url: config.denchApiUrl + "/api/v1/customerfacing/customers/documents/" + documentToDeleteId,
      success: function (response) {
         $(documentToDelete).parent().remove();
         documentToDeleteId = null;
         documentToDelete = null;
         closePreview();
      },
      error: function(xhr, textStatus, errorThrown) {
         documentToDelete = null;
         documentToDeleteId = null;
         showErrorMessage(translations.kyc_remove_failed);
      }
   });
}