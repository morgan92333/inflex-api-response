import protobuf from 'protobufjs';

import response from './response';

var checkRequest = function (res, req, next) {
    let protoFilePath = protoFile.replace('.', '/');

    protoFilePath = '/var/www/deckathlon/api/request/' + protoFilePath + '.proto';
 
    protobuf.load(protoFilePath, function(err, root) {
        if (err)
            throw err;

        var AwesomeMessage = root.lookupType(protoFile.charAt(0).toUpperCase() + protoFile.slice(1));
     
        var json = req.body;

        let errMsg = AwesomeMessage.verify(json);

        if (errMsg) {
            return response()
                .fail(res)
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
    });
}

export default function (proto) {
    return function (res, req, next) {
        checkRequest(proto, res, req, next);
    }
}