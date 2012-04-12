/*jslint white:false plusplus:false browser:true nomen:false */
/*globals paste */

/**
 * @compilation_level ADVANCED_OPTIMIZATIONS
 *
 * Polyfill Module
 *
 * @requires paste
 * @module paste/io/formdata
 *
 * Specification: http://www.w3.org/TR/XMLHttpRequest/#formdata
 *
 */

paste['define']('paste.io.formdata', function () {
    var APPEND_KEY = 'append',
        SUPPORTED_FORM_NODE_NAMES = ['input', 'textarea', 'select', 'button', 'datalist', 'keygen', 'output'],
        $slice = Array['prototype']['slice'],
        $w = window,
        $math = Math,
        $rand = $math['random'],
        S4 = function () {
            return (((1 + $rand()) * 0x10000) | 0)['toString'](16)['substring'](1);
        };

    if ($w['FormData']) {
        return $w['FormData'];
    }

    /**
     * @param {HTMLFormElement} [form]
     * @constructor
     *
     * Let fd be a new FormData object.
     * If form is given, set fd's entries to the result of constructing the form data set for form.
     * Return fd.
     */
    function PasteIOFormData(form) {
        this['boundary'] = '--------FormDataPolyfillBoundary' + (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
        this._fields = [];

        if (form && form['nodeName']['toLowerCase']() === 'form') {
            var htmlCollection,
                htmlCollectionLen,
                fieldLen = SUPPORTED_FORM_NODE_NAMES['length'],
                formFields = [],
                field,
                fieldName,
                fieldNodeName,
                fieldType,
                fieldFilesLen,
                fieldFiles,
                fieldFile,
                fieldSelectedOptionsLen,
                fieldSelectedOptions;
            while (fieldLen--) {
                htmlCollection = form['getElementsByTagName'](SUPPORTED_FORM_NODE_NAMES[fieldLen]);
                if ($slice && htmlCollection instanceof Object) {
                    formFields = formFields['concat']($slice['call'](htmlCollection), formFields);
                } else {
                    htmlCollectionLen = htmlCollection['length'];
                    while(htmlCollectionLen--) {
                        formFields.push(htmlCollection[htmlCollectionLen]);
                    }
                }
            }

            fieldLen = formFields['length'];

            while (fieldLen--) {
                field = formFields[fieldLen];
                fieldName = field['name'];

                if (!fieldName) {
                    continue;
                }

                fieldNodeName = field['nodeName']['toLowerCase']();
                fieldType = field['getAttribute']('type');
                if (fieldNodeName === 'input' && (fieldType === 'radio' || fieldNodeName === 'checkbox') && !field['checked']) {
                    continue;
                }

                if (field['hasAttribute']('files')) {
                    fieldFiles = field['files'];
                    fieldFilesLen = fieldFiles.length;
                    while (fieldFilesLen--) {
                        fieldFile = fieldFiles[fieldFilesLen];
                        this[APPEND_KEY](fieldName, fieldFile, fieldFile['name']);
                    }

                    continue;
                }

                if (field['hasAttribute']('value') || 'value' in field) {
                    this[APPEND_KEY](fieldName, field['value']);

                    continue;
                }

                fieldSelectedOptions = field['selectedOptions'];
                if (fieldSelectedOptions) {
                    fieldSelectedOptionsLen = fieldSelectedOptions['length'];
                    while (fieldSelectedOptionsLen--) {
                        this[APPEND_KEY](fieldName, fieldSelectedOptions[fieldSelectedOptionsLen]['value'])
                    }

                    continue;
                }

                fieldSelectedOptions = field['options'];
                if (fieldSelectedOptions) {
                    fieldSelectedOptionsLen = fieldSelectedOptions['length'];
                    while (fieldSelectedOptionsLen--) {
                        if (fieldSelectedOptions[fieldSelectedOptionsLen]['selected']) {
                            this[APPEND_KEY](fieldName, fieldSelectedOptions[fieldSelectedOptionsLen]['value'])
                        }
                    }
                }
            }
        }
    }

    /**
     * @param {DOMString} name
     * @param {Blob} value
     * @param {DOMString} [filename]
     *
     * Set its name to name.
     * Set its value to value.
     * Set its type to "text" if value is a string and "file" if it is a Blob.
     * If its type is "file" set its filename to "blob".
     * If its type is "file" and value is a File whose name attribute is not the empty string, set entry's filename to the attribute's value.
     * If the filename parameter is not omitted set entry's filename to filename.
     *
     * @todo NB: file upload (blob) is untested
     */
    PasteIOFormData['prototype'][APPEND_KEY] = function (name, value, filename) {
        if (filename) {
            this._fields['push']([name, value, filename]);
            return;
        }

        this._fields['push']([name, value]);
    };

    PasteIOFormData['prototype']['encode'] = function () {
        var body = '',
            $boundary = this['boundary'],
            $fields = this._fields,
            il = $fields['length'],
            field,
            file;
        while (il--) {
            body += '--' + $boundary + '\r\n';
            field = $fields[il];
            file = field[1];
            if (file['name']) {
                body += 'Content-Disposition: form-data; name="' + field[0] + '"; filename="' + (field[2] || file['name']) + '"\r\n';
                body += 'Content-Type: ' + file['type'] + '\r\n\r\n';
                body += file['getAsBinary']() + '\r\n';
            } else {
                body += 'Content-Disposition: form-data; name="' + field[0] + '";\r\n\r\n';
                body += field[1] + '\r\n';
            }
        }
        body += '--' + $boundary + '--';
        return body;
    };

    $w['PasteIOFormData'] = PasteIOFormData;

    return PasteIOFormData;
});