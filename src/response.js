import success from './success';
import fail from './fail';
import { add as addError } from './errors';

export default function (res) {
    return {
        'success' : (protoFile, apiResponse) => {
            return success(res, protoFile, apiResponse);
        },

        'fail' : (code) => {
            return fail(res, code);
        },

        'addError' : (key, value) => {
            addError(key, value);
        }
    };
}