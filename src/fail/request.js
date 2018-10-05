var httpCode = function () {
    return 422;
}

var getResponse = function (response) {
    return response || 'helper.invalid_request';
}

export default function () {
    return {
        'httpCode' : httpCode,

        'getResponse' : getResponse
    };
}