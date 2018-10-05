var httpCode = function () {
    return 200;
}

var getResponse = function () {
    console.log('ERROR: You cant send data in "simple" response.');
    process.exit();
}

export default function () {
    return {
        'httpCode' : httpCode,

        'getResponse' : getResponse
    };
}