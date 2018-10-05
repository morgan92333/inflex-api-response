var httpCode = function () {
    return 500;
}

var getResponse = function (response) {
    return response || 'helper.something_bad';
}

export default function () {
    return {
        'httpCode' : httpCode,

        'getResponse' : getResponse
    };
}