import protobuf from 'protobufjs';

import { getConfig } from './config';
import { createClassName } from './helpers';

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
            var protoClass = createClassName(protoName),

                protoResponse = root.lookupType(protoClass),
            
                json = {
                    'success' : true
                };

            if (apiResponse)
                json['response'] = apiResponse;

            let errMsg = protoResponse.verify(json);

            if (errMsg)
                throw Error(errMsg);
        
            let message = protoResponse.create(json),

                logger = getConfig('log.success');

            if (req.get('Content-type') === 'application/json') {
                let buffer  = protoResponse.encode(message).finish(),

                    msg;

                try {
                    msg = protoResponse.decode(buffer);
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

                protoResponse.toObject(msg, {
                    longs: Number,
                    enums: String,
                    bytes: String
                });        

                res
                    .status(apiHttpCode)
                    .json(msg);
            
                if (logger) logger(req, msg, protoFilePath);
            } else {
                if (logger) logger(req, json, protoFilePath);

                res.send(protoResponse.encode(message).finish());
            }
        });
}

export default function (req, res, protoFile, resp = null) {
    let defaultResponseType = function (apiResponse) {
        let r = response();

        createProtoResponse(
            res, 
            req,
            protoFile, 
            r.httpCode(),
            r.getResponse(apiResponse)
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