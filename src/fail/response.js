var httpCode = function () {
    return 200;
}

var getResponse = function (response) {
    return response;
}

export default function () {
    return {
        'httpCode' : httpCode,

        'getResponse' : getResponse
    };
}