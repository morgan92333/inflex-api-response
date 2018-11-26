import protobuf from 'protobufjs';

import { get as getError } from './errors';
import { getConfig } from './config';
import { createClassName } from './helpers';

import authentication from './fail/authentication';
import internal from './fail/internal';
import method from './fail/method';
import notFound from './fail/not-found';
import response from './fail/response';
import request from './fail/request';

function createResponse (protoFile, res, req, errorCode, apiHttpCode, custom) {
    let logger = getConfig('log.fail');

    if (typeof errorCode !== 'string') {
        if (!logger) {
            console.error('Invalid error code');
            console.error(errorCode);
        } else {
            logger(req, 'Invalid error code');
            logger(req, errorCode);
        }
        process.exit();
        return;
    }

    var error = getError(errorCode),
        prefixCode;

    let explode = errorCode.split('.');

    if (explode.length != 2) {
        console.log('Invalid error code: ' + errorCode);

        return errorResponse(req, res, {
            "code" : '',
            "type" : '',
            "title" : 'Invalid error code',
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

    if (!prefixCode) {
        console.error('ERROR: Missing prefix_code from addError');

        prefixCode = '--';
    }

    let code = 
        apiHttpCode.toString() 
        + prefixCode.toString() 
        + error['code'].toString(),

        
        json = {
            "code" : code,
            "type" : '',
            "title" : error['title'],
            "detail" : error['detail']
        };

    json.type = ''; //Route

    if (custom)
        custom(json);

    errorResponse(req, res, protoFile, json);
}

function errorResponse (req, res, protoFile, json) {
    let protoName = protoFile.match(/([^\/]+)$/)[0],
        protoFilePath = protoFile + '.proto';

    var logger = getConfig('log.fail'),

        root = new protobuf.Root();

    json = {
        'success' : false,
        'error' : json
    };

    root.load(protoFilePath, { keepCase: true })
        .then(function(root) {
            let protoError = root.lookupType(createClassName(protoName)),
                    
                message = protoError.create(json);

            if (req.get('Content-type') === 'application/json') {
                let buffer  = protoError.encode(message).finish(),

                    msg = protoError.decode(buffer),
                    
                    apiHttpCode = json.error.code 
                        ? json.error.code.substr(0, 3) 
                        : 200;

                protoError.toObject(msg);        

                res
                    .status(apiHttpCode)
                    .json(msg);
            } else
                res.send(protoError.encode(message).finish());

            if (logger)
                logger(req, json.error, protoFilePath);
        });
}

export default function (res, req, protoFile, code = null) { 
    let defaultResponseType = (code, custom) => {
        let resp = response();

        createResponse(
            protoFile,
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
                    protoFile,
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
                    protoFile,
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
                    protoFile,
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
                    protoFile,
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
                    protoFile,
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
                    protoFile,
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