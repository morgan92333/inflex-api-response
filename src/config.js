import _ from 'lodash';

const defaultSettings = {
    'log' : {
        'success' : null,
        'fail' : null,
        'request' : null,
        'response' : null
    }
};
var settings = defaultSettings;

export function setConfig (cnf) {
    settings = _.merge(defaultSettings, cnf);
}

export function getConfig (key) {
    return _.get(settings, key);
}

export function changeConfig (key, value) {
    _.set(settings, key, value);
}