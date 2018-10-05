var httpCode = function () {
    return 404;
}

var getResponse = function (response) {
    return 'helper.not_found';
}

export default function () {
    return {
        'httpCode' : httpCode,

        'getResponse' : getResponse
    };
}