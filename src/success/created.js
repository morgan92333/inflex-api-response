var httpCode = function () {
    return 201;
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