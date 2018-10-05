import { get as getError } from './errors';
import { getConfig } from './config';

import authentication from './fail/authentication';
import internal from './fail/internal';
import method from './fail/method';
import notFound from './fail/not-found';
import response from './fail/response';
import request from './fail/request';

function createResponse (res, req, errorCode, apiHttpCode, custom) {
    var error = getError(errorCode),
        prefixCode;

    let explode = errorCode.split('.');

    if (explode.length != 2) {
        console.log('Invalid error code: ' + errorCode);

        return res
            .status(200)
            .json({
                'success' : false,
                'error' : {
                    "code" : '',
                    "type" : '',
                    "title" : '',
                    "detail" : ''
                }
            });
    }

    let group           = explode[0],
        errorName       = explode[1];

    if (!error) {
        console.log('This log: ' + errorCode + ' is not defined in errors.php');

        error      = getError('json_response.error_not_defined');
        prefixCode = getError('json_response.prefix_code');
    } else {
        prefixCode = getError(group + '.prefix_code');
    }

    let code = 
        apiHttpCode.toString() 
        + prefixCode.toString() 
        + error['code'].toString(),

        
        json = {
            'success' : false,
            'error' : {
                "code" : code,
                "type" : '',
                "title" : error['title'],
                "detail" : error['detail']
            }
        };

    json.error.type = ''; //Route

    if (custom)
        custom(json.error);

    res
        .status(apiHttpCode)
        .json(json);

    let logger = getConfig('log.fail');

    if (logger)
        logger(req, json.error);
}

export default function (res, req, code = null) { 
    let defaultResponseType = (code, custom) => {
        let resp = response();

        createResponse(
            res, 
            req,
            code,
            resp.httpCode(),
            custom
        );
    };

    if (code) {
        defaultResponseType(code);
    } else {
        return {
            'custom' : (code, custom, httpCode = 200) => {
                createResponse(
                    res, 
                    req,
                    code,
                    httpCode,
                    custom
                );
            },
            'request' : (custom, code) => {
                let resp = request();

                createResponse(
                    res, 
                    req,
                    resp.getResponse(code),
                    resp.httpCode(),
                    custom
                );
            },
            'authentication' : (code, custom) => {
                let resp = authentication();

                createResponse(
                    res, 
                    req,
                    resp.getResponse(code),
                    resp.httpCode(),
                    custom
                );
            },
            'internal' : (code, custom) => {
                let resp = internal();

                createResponse(
                    res, 
                    req,
                    resp.getResponse(code),
                    resp.httpCode(),
                    custom
                );
            },
            'method' : (code, custom) => {
                let resp = method();

                createResponse(
                    res, 
                    req,
                    resp.getResponse(code),
                    resp.httpCode(),
                    custom
                );
            },
            'notFound' : (code, custom) => {
                let resp = notFound();

                createResponse(
                    res, 
                    req,
                    resp.getResponse(code),
                    resp.httpCode(),
                    custom
                );
            },
            'response' : defaultResponseType
        }
    }
};