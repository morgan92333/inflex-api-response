import protobuf from 'protobufjs';
import _ from 'lodash';

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
        
            var body  = req.body,
                query = req.query,
                
                json = _.merge(body, query);

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

            var newBody  = {},
                newQuery = {};

            if (msg && msg.$type && msg.$type._fieldsArray) {
                for (let field of msg.$type._fieldsArray) {
                    if (typeof req.query[field.name] !== 'undefined')
                        newQuery[field.name] = req.query[field.name];
                    else if (typeof req.body[field.name] !== 'undefined')
                        newBody[field.name] = req.body[field.name];
                }

                req.body  = newBody;
                req.query = newQuery;
            } else
                console.error('_fieldsArray not found in protobuff');

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