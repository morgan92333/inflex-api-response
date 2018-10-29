import protobuf from 'protobufjs';

import response from './response';
import { createClassName } from './helpers';

var checkRequest = function (protoFile, res, req, next) {
    let protoName = protoFile.match(/([^\/]+)$/)[0],
        protoFilePath = protoFile + '.proto',

        root = new protobuf.Root();

    root.load(protoFilePath, { keepCase: true })
        .then(function(root) { 
            let protoClass = createClassName(protoName);

            var AwesomeMessage = root.lookupType(protoClass);
        
            var json = req.body;

            let errMsg = AwesomeMessage.verify(json);

            if (errMsg) {
                return response(req, res)
                    .fail()
                    .request(error => {
                        error['detail'] = 'Proto buffer error: ' + errMsg;
                    });
            }
        
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

            req.body = msg;

            next();
        })
        .catch(err => {
            if (err)
                throw err;
        });
}

export default function (proto) {
    return function (req, res, next) {
        checkRequest(proto, res, req, next);
    }
}