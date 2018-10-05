var httpCode = function () {
    return 404;
}

var getResponse = function (response) {
    return 'helper.method_allow';
}

export default function () {
    return {
        'httpCode' : httpCode,

        'getResponse' : getResponse
    };
}