# Description

The current version is a prototype. For the time being I have used only my own projects according to predefined rules. Currently, I only work with ExpressJs.

Description later

## How to use ##

```sh
var fullLocationOfProtoFile = protoFile('response.login');
var date = Math.floor(Date.now() / 1000);

response(req, res)
    .success(fullLocationOfProtoFile)
    .response({
        'teszt' : 'dorottya',
        'elek' : date,
        'phone' : {
            'number' : 'teszt',
            'type' : 1
        }
    });

response(req, res)
    .fail()
    .request(error => {
        error['detail'] = 'Proto buffer error: ' + 'Dorottya';
    });

response(req, res)
    .success(fullLocationOfProtoFile)
    .response({
        'teszt' : 'dorottya',
        'elek' : date,
        'phone' : {
            'number' : 'teszt',
            'type' : 1
        }
    });

response(req, res)
    .success(fullLocationOfProtoFile)
    .created({
        'teszt' : 'dorottya',
        'elek' : date,
        'phone' : {
            'number' : 'teszt',
            'type' : 1
        }
    });

response(req, res)
    .success(fullLocationOfProtoFile)
    .accepted();

response(req, res)
    .success(fullLocationOfProtoFile, {
        'test' : 'dorottya',
        'elek' : date,
        'phone' : {
            'number' : 'teszt',
            'type' : 1
        }
    });
```

License
----

MIT