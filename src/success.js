import protobuf from 'protobufjs';

import accepted from './success/accepted';
import created from './success/created';
import response from './success/response';
import simple from './success/simple';
import another from './success/another';

function createProtoResponse (res, protoFile, apiHttpCode, apiResponse) {
    let protoFilePath = protoFile.replace('.', '/');

    protoFilePath = '/var/www/deckathlon/api/protobuf/response/' + protoFilePath + '.proto';
 
    protobuf.load(protoFilePath, function(err, root) {
        if (err)
            throw err;

        var AwesomeMessage = root.lookupType(protoFile.charAt(0).toUpperCase() + protoFile.slice(1));
     
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
    });
}

export default function (res, protoFile, resp = null) {
    let defaultResponseType = function (apiResponse) {
        let resp = response();

        createProtoResponse(
            res, 
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
            'created' : () => {
                let resp = created();

                return createProtoResponse(
                    res, 
                    protoFile, 
                    resp.httpCode(),
                    resp.getResponse()
                );
            }, 
            'another' : () => {
                let resp = another();

                return createProtoResponse(
                    res, 
                    protoFile, 
                    resp.httpCode(),
                    resp.getResponse()
                );
            },
            'simple' : () => {
                let resp = simple();

                return createProtoResponse(
                    res, 
                    protoFile, 
                    resp.httpCode()
                );
            }
        }
    }
}