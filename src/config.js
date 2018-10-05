import _ from 'lodash';

const defaultSettings = {
    'log' : {
        'success' : (req, response) => {

        },

        'fail' : (req, error) => {

        }
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