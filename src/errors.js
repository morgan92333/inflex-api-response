import _ from 'lodash';

var definedErrors = {
    'helper' : {
        'prefix_code' : '00',
        'invalid_request' : {
            "code" : '01',
            "title" : "Invalid request",
            "detail" : "Invalid request"
        },
        'not_found' : {
            "code" : '02',
            "title" : "Url not found",
            "detail" : "Url not found"
        },
        'method_allow' : {
            "code" : '03',
            "title" : "Method not allowed",
            "detail" : "Method not allowed"
        },
        'something_bad' : {
            "code" : '04',
            "title" : "Something bad",
            "detail" : "Something bad"
        }
    },
    'json_response' : {
        'prefix_code' : '00',
        'error_not_defined' : {
            "code" : '00',
            "title" : "Undefined error",
            "detail" : "This error is not defined, please contact developers"
        }
    }
};

export function get (key) {
    return _.get(definedErrors, key);
}

export function add (key, value) {
    definedErrors = _.set(definedErrors, key, value);

    console.log(definedErrors);
}