import success from './success';
import fail from './fail';
import { setConfig } from './config';
import { add as addError } from './errors';

function hasResponseAndRequest(res, req) {
    if (!res) {
        console.log(res);
        console.log('ERROR: You need send Express response for response(req, res)');
        process.exit();
    } else if (!req) {
        console.log('ERROR: You need send Express request for response(req, res)');
        process.exit();
    }
}

export default function (req = null, res = null) {

    return {
        'success' : (protoFile, apiResponse) => {
            hasResponseAndRequest(req, res);

            return success(req, res, protoFile, apiResponse);
        },

        'fail' : (code) => {
            hasResponseAndRequest(req, res);

            if (code && typeof code !== 'string') {
                console.log('ERROR: Invalid code for fail response');
                process.exit();
            }

            return fail(res, req, code);
        },

        'addError' : (key, value) => {
            addError(key, value);
        },

        'setConfig' : (config) => {
            setConfig(config);
        }
    };
}