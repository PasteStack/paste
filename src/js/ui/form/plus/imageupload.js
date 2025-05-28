/*jslint white:false plusplus:false browser:true nomen:false */
/*globals Globals, paste */

/**
 * @requires paste
 * @requires paste/dom
 * @requires paste/util
 * @requires paste/event
 * @requires paste/io
 * @requires paste/guid
 * @requires polyfills/focusinout
 * @requires paste/formdata
 * @module paste/ui/form/plus/imageupload
 */
paste.define(
    'paste.ui.form.plus.imageupload',
    [
        'paste.dom',
        'paste.util',
        'paste.event',
        'paste.io',
        'paste.guid',
        'polyfills.focusinout',
        'paste.formdata'
    ],
    function (imageupload, dom, util, event, io, guid, _focusinout, FormData) {
        'use strict';

        var moduleGuid = guid.Guid.create(),
            HAS_MESSAGE_ATTR= moduleGuid + '$imageUploadHasMessage',
            IS_LOADING_ATTR= moduleGuid + '$imageUploadIsLoading',
            ERROR_DATA_ATTR = 'data-image-upload-error-message',
            LOADING_DATA_VAL = 'image-upload-loading',
            LOADING_DATA_ATTR = 'data-' + LOADING_DATA_VAL,
            FILE_ID_ATTR = moduleGuid + '$imageUploadFileId',
            MESSAGE_ID_ATTR = moduleGuid + '$imageUploadMessageId',
            URI_VALUE_ID_ATTR = moduleGuid + '$imageUploadUriValueId',
            PREVIEW_DEFAULT_SRC_ATTR = 'data-image-upload-default-src',
            PREVIEW_ID = moduleGuid + '$imageUploadPreviewId',
            IFRAME_ID = moduleGuid + '-iframeFallback',

            formEl,
            forms = document['getElementsByTagName']('form'),
            formLen = forms['length'],

            fileChangeSubscriptions = {},
            uriValueChangeEvents = {},
            previewLoadedEvents = {},
            previewLoadErrorEvents = {},

            message,

            preview,
            previewSrc,
            previewBounds,

            fileInput,
            fileInputFormData,
            fileInputForm,
            fileInputFormValue,
            fileInputFormTarget,
            fileInputFormIFrame,
            fileInputFormIFrameSubscription,
            getFileInputForm = function (fileInput) {
                var __ret = fileInput.parentNode;
                while (__ret) {
                    if (__ret.nodeName.toLowerCase() === 'form') {
                        break;
                    }

                    try {
                        __ret = __ret.parentNode;
                        if (!__ret.tagName || __ret.tagName.toLowerCase() === 'body') {
                            break;
                        }
                    } catch (ex) {
                        break;
                    }
                }
                return __ret
            },
            fileInputFormIFrameHandler = function () {
                var content, fileChangeSub, clonedFileField, bindingId;
                fileInputForm = getFileInputForm(this);

                fileInputForm.setAttribute('action', fileInputFormValue || (window.location + ''));
                fileInputForm.setAttribute('target', fileInputFormTarget || '');

                if (fileInputFormIFrameSubscription) {
                    fileInputFormIFrameSubscription['dispose']();
                    fileInputFormIFrameSubscription = null;
                }

                if (fileInputFormIFrame.contentDocument) {
                    content = fileInputFormIFrame.contentDocument.body.innerHTML;
                } else if (fileInputFormIFrame.contentWindow) {
                    content = fileInputFormIFrame.contentWindow.document.body.innerHTML;
                } else if (fileInputFormIFrame.document) {
                    content = fileInputFormIFrame.document.body.innerHTML;
                }

                if (content) {
                    try {
                        fileUploadSuccessHandler(this, JSON.parse(content));
                    } catch (e) {
                    }
                }

                bindingId = this[moduleGuid];
                fileChangeSub = fileChangeSubscriptions[bindingId];
                if (fileChangeSub) {
                    fileChangeSub['dispose']();
                    delete fileChangeSubscriptions[bindingId];
                }

                clonedFileField = this.cloneNode(true);

                // make sure expando props are set
                clonedFileField[moduleGuid] = bindingId;
                setIdReferences(clonedFileField, this[FILE_ID_ATTR], this[PREVIEW_ID], this[URI_VALUE_ID_ATTR], this[MESSAGE_ID_ATTR]);
                fileChangeSubscriptions[bindingId] = new event.Event.Subscription('change', clonedFileField, fileChangeHandler);

                this.replaceNode(clonedFileField, this);
                clonedFileField.blur();

                fileInputFormIFrame.parentNode.removeChild(fileInputFormIFrame);
                fileInputFormIFrame = null;
            },
            fileChangeHandler = function (e) {
                fileInput = event.Event.getEventTarget(e);
                if (!fileInput.files) {
                    fileInputForm = getFileInputForm(fileInput);

                    if (!fileInputFormIFrame) {
                        fileInputFormIFrame = document.createElement('iframe');
                        fileInputFormIFrame.id = IFRAME_ID;
                        fileInputFormIFrame.name = IFRAME_ID;
                        fileInputFormIFrame.style.position = 'absolute';
                        fileInputFormIFrame.style.top = '-9999em';
                        fileInputFormIFrame.style.left = '-9999em';
                        fileInputFormIFrame.style.width = '0';
                        fileInputFormIFrame.style.height = '0';
                        fileInputFormIFrame.style.border = '0';

                        fileInputForm.parentNode.appendChild(fileInputFormIFrame);

                        if (fileInputFormIFrameSubscription) {
                            fileInputFormIFrameSubscription['dispose']();
                            //noinspection JSUnusedAssignment
                            fileInputFormIFrameSubscription = null;
                        }

                        fileInputFormIFrameSubscription = event['bind']('load', fileInputFormIFrame, fileInputFormIFrameHandler, fileInput);

                        fileInputFormValue = fileInputForm.getAttribute('action');
                        fileInputFormTarget = fileInputForm.getAttribute('target');
                        fileInputForm.setAttribute('action', fileInput.getAttribute('data-image-upload-action'));
                        fileInputForm.setAttribute('target', fileInputFormIFrame.name);
                        fileInputForm.submit();
                    }
                } else if (fileInput.files.length > 0) {
                    fileInputFormData = new FormData();
                    fileInputFormData.append(fileInput.getAttribute('data-image-upload-param') || fileInput.name, fileInput.files[0]);

                    fileInput[IS_LOADING_ATTR] = true;
                    fileInput.setAttribute(LOADING_DATA_ATTR, LOADING_DATA_VAL);
                    message.setAttribute(LOADING_DATA_ATTR, LOADING_DATA_VAL);

                    io.post(
                        fileInput.getAttribute('data-image-upload-action'),
                        fileInputFormData,
                        function ($fileInput) {
                            return function (r) {
                                return fileUploadSuccessHandler($fileInput, r);
                            };
                        }(fileInput),
                        function ($fileInput) {
                            return function (r) {
                                return fileUploadFailureHandler($fileInput, r);
                            };
                        }(fileInput));
                }
            },
            fileUploadSuccessHandler = function ($fileInput, r) {
                uriValueInput = dom.get($fileInput[URI_VALUE_ID_ATTR]);
                uriValueInput.value = r['data'];

                message = ($fileInput[HAS_MESSAGE_ATTR]) ? dom.get($fileInput[MESSAGE_ID_ATTR]) : null;
                if (message && $fileInput[HAS_MESSAGE_ATTR]) {
                    message.removeAttribute(ERROR_DATA_ATTR);
                    $fileInput[HAS_MESSAGE_ATTR] = false;
                }

                uriValueChangeEvents[uriValueInput[moduleGuid]].fire();
            },
            fileUploadFailureHandler = function ($fileInput, r) {
                message = dom.get($fileInput[MESSAGE_ID_ATTR]);

                if (r && r['meta'] && r['meta']['error_detail']) {
                    message.setAttribute(ERROR_DATA_ATTR, r['meta']['error_detail']);
                } else {
                    message.setAttribute(ERROR_DATA_ATTR, 'Error uploading image');
                }

                $fileInput[HAS_MESSAGE_ATTR] = true;

                uriValueInput = dom.get($fileInput[URI_VALUE_ID_ATTR]);
                uriValueInput.value = '';
                uriValueChangeEvents[uriValueInput[moduleGuid]].fire();
            },

            uriValueInput,
            uriValuePrefix,
            uriValueChangeHandler = function (e) {
                uriValueInput = event.Event.getEventTarget(e);
                preview = dom.get(uriValueInput[PREVIEW_ID]);
                previewBounds = dom.Bounds.fromElement(preview);
                uriValuePrefix = preview.getAttribute('data-image-url-prefix');

                previewSrc = preview['src'];
                if (uriValuePrefix && uriValueInput.value) {
                    preview.src = uriValuePrefix + ((util.stringStartsWith(uriValueInput.value, '/')) ? '' : '/') + uriValueInput.value
                } else if (preview[PREVIEW_DEFAULT_SRC_ATTR]) {
                    preview.src = preview[PREVIEW_DEFAULT_SRC_ATTR];
                } else {
                    preview.src = '';
                }

                if (previewSrc == preview.src) {
                    previewLoadedEvents[uriValueInput[moduleGuid]].fire()
                }
            },

            previewLoadedHandler = function (e) {
                preview = event.Event.getEventTarget(e);
                fileInput = dom.get(preview[FILE_ID_ATTR]);
                if (fileInput[IS_LOADING_ATTR]) {
                    message = dom.get(preview[MESSAGE_ID_ATTR]);
                    message.removeAttribute(LOADING_DATA_ATTR);
                    fileInput.removeAttribute(LOADING_DATA_ATTR);
                    fileInput[IS_LOADING_ATTR] = false;
                }
            },

            setIdReferences = function (field, fileId, previewId, uriValueId, messageId) {
                field[FILE_ID_ATTR] = fileId;
                field[URI_VALUE_ID_ATTR] = uriValueId;
                field[PREVIEW_ID] = previewId;
                field[MESSAGE_ID_ATTR] = messageId;
            },

            bindingGuid,
            bindFileField = function (field, form) {
                var preview, uriValue;
                if (moduleGuid in field) {
                } else {
                    if (!form) {
                        form = field;
                        while (form) {
                            if (form.tagName.toLowerCase() === 'form') {
                                break;
                            }

                            try {
                                form = form.parentNode;
                                if (!form.nodeName || form.nodeName.toLowerCase() === 'body') {
                                    form = null;
                                }
                            } catch (ex) {
                                form = null;
                                throw new Error('Error finding parent form');
                            }
                        }
                    }

                    bindingGuid = guid.Guid.create();

                    if (form[moduleGuid]) {
                        form[moduleGuid] += (',' + bindingGuid);
                    } else {
                        form[moduleGuid] = bindingGuid;
                    }

                    field[moduleGuid] = bindingGuid;
                    field.id = field.id || guid.Guid.create();

                    preview = dom.querySelector('[data-image-upload-preview][data-image-upload-for="' + field.id + '"]', form);
                    preview.id = preview.id || guid.Guid.create();
                    preview[PREVIEW_DEFAULT_SRC_ATTR] = preview.getAttribute(PREVIEW_DEFAULT_SRC_ATTR) || preview.src;
                    preview[moduleGuid] = bindingGuid;

                    uriValue = dom.querySelector('[data-image-upload-uri][data-image-upload-for="' + field.id + '"]', form);
                    uriValue.id = uriValue.id || guid.Guid.create();
                    uriValue[moduleGuid] = bindingGuid;

                    message = dom.querySelector('[data-image-upload-message][data-image-upload-for="' + field.id + '"]', form);
                    message.id = message.id || guid.Guid.create();
                    message[moduleGuid] = bindingGuid;

                    setIdReferences(field, field.id, preview.id, uriValue.id, message.id);
                    setIdReferences(preview, field.id, preview.id, uriValue.id, message.id);
                    setIdReferences(uriValue, field.id, preview.id, uriValue.id, message.id);
                    setIdReferences(message, field.id, preview.id, uriValue.id, message.id);

                    fileChangeSubscriptions[bindingGuid] = new event.Event.Subscription('change', field, fileChangeHandler);
                    uriValueChangeEvents[bindingGuid] = new event.Event(uriValue, 'change', true, true);
                    uriValueChangeEvents[bindingGuid].subscribe(uriValueChangeHandler);

                    previewLoadedEvents[bindingGuid] = new event.Event(preview, 'load');
                    previewLoadedEvents[bindingGuid].subscribe(previewLoadedHandler);

                    previewLoadErrorEvents[bindingGuid] = new event.Event(preview, 'error');
                    previewLoadErrorEvents[bindingGuid].subscribe(previewLoadedHandler);

                }
            },
            bind = function (field, form) {
                var fields;
                if (field && field.nodeName.toLowerCase() === 'form') {
                    form = field;
                    fields = dom.get('input[type="file"][data-image-upload-action]', form);
                    util.each(fields, function (field) {
                        bindFileField(field, form)
                    });
                } else if (field && field.nodeName.toLowerCase() === 'input' && field.type === 'file') {
                    bindFileField(field, form);
                }
            };

        while (formLen--) {
            formEl = forms[formLen];
            bind(formEl, formEl);
        }

        return {
            'bind': bind
        }
    }
);
