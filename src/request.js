import protobuf from 'protobufjs';
import _ from 'lodash';


import response from './response';
import { getConfig } from './config';
import { createClassName } from './helpers';

var checkRequest = function (protoFile, res, req, next) {
    let protoName = protoFile.match(/([^\/]+)$/)[0],
        protoFilePath = protoFile + '.proto',

        root = new protobuf.Root();

    root.load(protoFilePath, { keepCase: true })
        .then(function(root) { 
            var protoClass   = createClassName(protoName),
                protoRequest = root.lookupType(protoClass),
        
                buffer;

            if (req.is('application/octet-stream')) {
                buffer = req.raw;
            } else {
                let body  = req.body,
                    query = req.query,
                    
                    json = _.merge(body, query),

                    message = protoRequest.create(json);

                try {
                    buffer  = protoRequest.encode(message).finish();
                } catch (e) {
                    return response(req, res)
                        .fail()
                        .request(error => {
                            error['title'] = e.toString().replace(/[\"]+/g, '');
                            error['detail'] = JSON.stringify({ body : body, query : query }).replace(/[\"]+/g, '');
                        });
                }
            }

            var msg;

            try {
                msg = protoRequest.decode(buffer);
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

            protoRequest.toObject(msg, {
                longs: Number,
                enums: String,
                bytes: String
            });

            let logger = getConfig('log.request');
    
            if (logger) logger(req, msg);

            var newBody  = {},
                newQuery = {};

            if (msg && msg.$type && msg.$type._fieldsArray) {
                for (let field of msg.$type._fieldsArray) {
                    if (typeof req.query[field.name] !== 'undefined')
                        newQuery[field.name] = req.query[field.name];
                    else if (msg[field.name])
                        newBody[field.name] = msg[field.name];
                }

                req.body  = newBody;
                req.query = newQuery;
            } else
                console.error('_fieldsArray not found in protobuff');

            let errMsg = protoRequest.verify(_.merge(newBody, newQuery));

            if (errMsg) {
                return response(req, res)
                    .fail()
                    .request(error => {
                        error['title']  = 'Protobuffer error';
                        error['detail'] = errMsg;
                    });
            } else
                next();
        })
        .catch(err => {
            if (err)
                throw err;
        });
}

export default function (proto) {
    return function (req, res, next) {
        if (!req.is('application/octet-stream')) 
            return checkRequest(proto, res, req, next);

        var data = [];

        req.on('data', function(chunk) {
            data.push(chunk);
        });

        req.on('end', function() {
            if (data.length <= 0 )
                return checkRequest(proto, res, req, next);

            data = Buffer.concat(data);
            
            //console.log('Received buffer', data);

            req.raw = data

            checkRequest(proto, res, req, next);
        });
    }
}