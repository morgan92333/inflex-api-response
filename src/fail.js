import { get as getError } from './errors';

import authentication from './fail/authentication';
import internal from './fail/internal';
import method from './fail/method';
import notFound from './fail/not-found';
import response from './fail/response';
import request from './fail/request';

function createResponse (res, errorCode, apiHttpCode, custom) {
    var error = getError(errorCode),
        prefixCode;

    let explode = errorCode.split('.');

    if (explode.length != 2) {
        console.log('Invalid error code: ' + errorCode);

        return res
            .status(200)
            .json({
                'error' : true,
                "code" : '',
                "type" : '',
                "title" : '',
                "detail" : ''
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
            'error' : true,
            "code" : code,
            "type" : '',
            "title" : error['title'],
            "detail" : error['detail']
        };

    json.type = ''; //Route

    if (custom)
        custom(json);

    //_log('Response error: ' . $data['title'] . ' ['.$code.']', 'error');

    res
        .status(apiHttpCode)
        .json(json);
}

export default function (res, code = null) { 
    let defaultResponseType = (code, custom) => {
        let resp = response();

        createResponse(
            res, 
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
                    code,
                    httpCode,
                    custom
                );
            },
            'request' : (custom, code) => {
                let resp = request();

                createResponse(
                    res, 
                    resp.getResponse(code),
                    resp.httpCode(),
                    custom
                );
            },
            'authentication' : (code, custom) => {
                let resp = authentication();

                createResponse(
                    res, 
                    resp.getResponse(code),
                    resp.httpCode(),
                    custom
                );
            },
            'internal' : (code, custom) => {
                let resp = internal();

                createResponse(
                    res, 
                    resp.getResponse(code),
                    resp.httpCode(),
                    custom
                );
            },
            'method' : (code, custom) => {
                let resp = method();

                createResponse(
                    res, 
                    resp.getResponse(code),
                    resp.httpCode(),
                    custom
                );
            },
            'notFound' : (code, custom) => {
                let resp = notFound();

                createResponse(
                    res, 
                    resp.getResponse(code),
                    resp.httpCode(),
                    custom
                );
            },
            'response' : defaultResponseType
        }
    }
};