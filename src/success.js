import protobuf from 'protobufjs';

import { getConfig } from './config';

import accepted from './success/accepted';
import created from './success/created';
import response from './success/response';
import simple from './success/simple';
import another from './success/another';

function createProtoResponse (res, req, protoFile, apiHttpCode, apiResponse) {
    let protoName = protoFile.match(/([^\/]+)$/)[0],
        protoFilePath = protoFile + '.proto',

        root = new protobuf.Root();

    root.load(protoFilePath, { keepCase: true })
        .then(function(root) {
            let protoClass = protoName.charAt(0).toUpperCase() + protoName.slice(1);

            var AwesomeMessage = root.lookupType(protoClass);
        
            var json = {
                'success' : false
            };

            if (apiResponse)
                json['response'] = apiResponse;

            let errMsg = AwesomeMessage.verify(json);

            if (errMsg)
                throw Error(errMsg);
        
            let message = AwesomeMessage.create(json),
                buffer  = AwesomeMessage.encode(message).finish();

            var msg;

            try {
                msg = AwesomeMessage.decode(buffer);
            } catch (e) {
                if (e instanceof protobuf.util.ProtocolError) {
                    console.log(e);
                    return;
                    // e.instance holds the so far decoded message with missing required fields
                } else {
                    console.log(e);
                    return;
                }
            }

            AwesomeMessage.toObject(msg, {
                longs: Number,
                enums: String,
                bytes: String
            });        

            res
                .status(apiHttpCode)
                .json(msg);

            let logger = getConfig('log.success');
        
            if (logger)
                logger(req, msg);
        });
}

export default function (req, res, protoFile, resp = null) {
    let defaultResponseType = function (apiResponse) {
        let resp = response();

        createProtoResponse(
            res, 
            req,
            protoFile, 
            resp.httpCode(),
            resp.getResponse(apiResponse)
        );
    };

    if (resp) {
        defaultResponseType(resp);
    } else {
        return {
            'response' : defaultResponseType, 
            'accepted' : () => {
                let resp = accepted();

                res
                    .status(resp.httpCode())
                    .json({});
            }, 
            'created' : (apiResponse) => {
                let resp = created();

                return createProtoResponse(
                    res, 
                    req,
                    protoFile, 
                    resp.httpCode(),
                    resp.getResponse(apiResponse)
                );
            }, 
            'another' : (apiResponse) => {
                let resp = another();

                return createProtoResponse(
                    res, 
                    req,
                    protoFile, 
                    resp.httpCode(),
                    resp.getResponse(apiResponse)
                );
            },
            'simple' : () => {
                let resp = simple();

                return createProtoResponse(
                    res, 
                    req,
                    protoFile, 
                    resp.httpCode()
                );
            }
        }
    }
}