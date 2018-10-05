var httpCode = function () {
    return 204;
}

var getResponse = function () {
    console.log('ERROR: You cant send data in "accepted" response.');
    process.exit();
}

export default function () {
    return {
        'httpCode' : httpCode,

        'getResponse' : getResponse
    };
}