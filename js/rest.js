let RestApi = function () {
    let parameters = null;
    let initState = false;
    let retryCount = 0;

    const maxRetryCount = 10;

    const requestHeaders = {
        'x-api-key': null,
        'client-version': null,
        'token': null,
        'version': 1,
        'language': 'en',
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'platform': 3
    };

    const endpoints = {
        'signUp': {
            'endpoint': '/sign-up',
            'method': 'POST'
        },
        'getTestaniaFlow': {
            'endpoint': '/get-flow',
            'method': 'GET',
            'cacheTTL': 604800,
            getHost: function () { return parameters.TESTANIA_HOST; },
            getHeaders: function () {
                return {
                    'x-api-key': parameters.TESTANIA_X_API_KEY,
                    'project': 'homemc-web'
                }
            }
        },
        'createPayment': {
            'endpoint': '/payments/init-payment',
            'method': 'POST'
        },
        'validatePayment': {
            'endpoint': '/payments/validate',
            'method': 'POST'
        },
        'trainingMaterials': {
            'endpoint': '/training-material',
            'method': 'GET'
        },
        'user': {
            'endpoint': '/user',
            'method': 'GET'
        },
        'userUpdate': {
            'endpoint': '/user',
            'method': 'POST'
        },
        'deepLink': {
            'endpoint': '/user/auth-deeplink',
            'method': 'GET'
        },
        'validateEmail': {
            'endpoint': '/user/validate-email',
            'method': 'POST'
        },
        'logAdBlock': {
            'endpoint': '/log-ad-block',
            'method': 'GET'
        },
        'sendGuides': {
            'endpoint': '/web-send-guides',
            'method': 'GET'
        },
        'migrate': {
            'endpoint': '/migrate',
            'method': 'GET',
            getHost: function () { return parameters.WEB_HOST; },
            getHeaders: function () { return {'x-api-key': parameters.WEB_X_API_KEY} }
        }
    };

    this.init = function () {
        getParameters();
    }

    this.signUp = function(params, successCallbackFn) {
        sendRequest(
            endpoints.signUp,
            params,
            successCallbackFn
        );
    }

    this.getTestaniaFlow = function(successCallbackFn, failCallbackFn) {
        sendRequest(
            endpoints.getTestaniaFlow,
            {},
            successCallbackFn,
            failCallbackFn
        );
    }

    this.createPayment = function(params, successCallbackFn) {
        sendRequest(
            endpoints.createPayment,
            params,
            successCallbackFn
        );
    }

    this.validatePayment = function(params, successCallbackFn) {
        sendRequest(
            endpoints.validatePayment,
            params,
            successCallbackFn
        );
    }

    this.trainingMaterials = function(successCallbackFn) {
        sendRequest(
            endpoints.trainingMaterials,
            {},
            successCallbackFn
        );
    }

    this.user = function(successCallbackFn, failCallbackFn) {
        sendRequest(
            endpoints.user,
            {},
            successCallbackFn,
            failCallbackFn
        );
    }

    this.sendGuides = function(successCallbackFn, failCallbackFn) {
        sendRequest(
            endpoints.sendGuides,
            {},
            successCallbackFn,
            failCallbackFn
        );
    }

    this.userUpdate = function(params, successCallbackFn, failCallbackFn) {
        sendRequest(
            endpoints.userUpdate,
            params,
            successCallbackFn,
            failCallbackFn
        );
    }

    this.deepLink = function(successCallbackFn, failCallbackFn) {
        sendRequest(
            endpoints.deepLink,
            {},
            successCallbackFn,
            failCallbackFn
        );
    }

    this.migrate = function(successCallbackFn, failCallbackFn) {
        sendRequest(
            endpoints.migrate,
            {},
            successCallbackFn,
            failCallbackFn
        );
    }

    this.validateEmail = function(data, successCallbackFn, failCallbackFn) {
        sendRequest(
            endpoints.validateEmail,
            data,
            successCallbackFn,
            failCallbackFn
        );
    }

    this.logAdBlock = function(data) {
        endpoints.logAdBlock.endpoint += '/' + data;

        sendRequest(
            endpoints.logAdBlock
        );
    };

    this.setUserToken = function(token) {
        setHeader('token', token);
    }

    this.setLanguage = function(language) {
        setHeader('language', language);
    }

    let setHeader = function(key, value) {
        requestHeaders[key] = value;
    }

    let getParameters = function () {
        $.getJSON("parameters.json", function (data) {
            initState = true;
            parameters = data;

            localStorage.setItem(
                'client-version',
                localStorage.getItem('client-version') || parameters['CLIENT_VERSION']
            );
            localStorage.setItem(
                'release_date',
                parameters['RELEASE_DATE']
            );
            setHeader('x-api-key', parameters['X_API_KEY']);
        });
    }

    let logError = function(message) {
        console.log('Error:' + message);
    }

    let logDebug = function(message) {
        console.log('Debug:' + message);
    }

    let getObjectLength = function(obj) {
        let size = 0, key;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }

        return size;
    }

    let getCachedResult = function(endpointObj) {
        const key = 'rest_' + endpointObj.method.toLowerCase() +
            endpointObj.endpoint.replace('/', '_');

        let result = localStorage.getItem(key);

        if (result != undefined) {
            result = JSON.parse(result);
            const timeNow = Math.floor(Date.now() / 1000);

            if (result['expiredAt'] && timeNow >= result['expiredAt']) {
                logDebug('Cache result expired');
                localStorage.removeItem(key);

                return undefined;
            }

            return result;
        }
    }

    let setCachedResult = function(endpointObj, result) {
        const key = 'rest_' + endpointObj.method.toLowerCase() +
            endpointObj.endpoint.replace('/', '_');

        if (getObjectLength(result)) {
            result['expiredAt'] = Math.floor(Date.now() / 1000) + endpointObj.cacheTTL;
        }

        localStorage.setItem(key, JSON.stringify(result));
    }

    let parseResponseHeaders = function(strHeaders) {
        let result = {};

        if (!strHeaders) {
            return result;
        }

        let lines = strHeaders.split("\r\n");

        if (lines.length) {
            for (let i=0; i < lines.length; i++) {
                let keyValue = lines[i].split(':');

                if (keyValue.length == 2) {
                    result[jQuery.trim(keyValue[0])] = jQuery.trim(keyValue[1]);
                }
            }
        }

        return result;
    }

    let sendRequest = function (endpointObj, requestBody, successCallbackFn, failCallbackFn) {
        if (!initState) {
            if (retryCount <= maxRetryCount) {
                setTimeout(function () {
                    sendRequest(endpointObj, requestBody, successCallbackFn, failCallbackFn)
                    retryCount++;
                }, 500)

                logDebug('initState=false');
                logDebug('retry');
            } else {
                logError('Initialization timed out');
            }

            return;
        }

        if (endpointObj["cacheTTL"]) {
            const cachedResult = getCachedResult(endpointObj);

            if (cachedResult != undefined) {
                logDebug('Get result from cache');

                successCallbackFn(200, cachedResult);
                return;
            }
        }

        logDebug('Send request');

        retryCount = 0;
        let requestBodyParams = requestBody;

        if (endpointObj.method != 'GET' && getObjectLength(requestBody)) {
            requestBodyParams = JSON.stringify(requestBody);
        }

        requestHeaders['client-version'] = localStorage.getItem('client-version');

        let headers = Object.assign({}, requestHeaders);

        $.ajax({
            type: endpointObj.method,
            url: (endpointObj.getHost ? endpointObj.getHost() : parameters['HOST']) + endpointObj.endpoint,
            headers: endpointObj.getHeaders ? Object.assign(headers, endpointObj.getHeaders()) : headers,
            data: requestBodyParams,
            contentType: 'application/json',
            success: function (data, status, xhr) {
                if (endpointObj["cacheTTL"]) {
                  setCachedResult(endpointObj, data);
                }

                if (successCallbackFn) {
                    successCallbackFn(xhr.status, data, parseResponseHeaders(xhr.getAllResponseHeaders()));
                }
            },
            error: function (xhr, status, error) {
                logError('Api call returned status - ' + xhr.status);

                if (failCallbackFn) {
                    failCallbackFn(xhr.status, {}, parseResponseHeaders(xhr.getAllResponseHeaders()));
                }
            }
        });
    }
}

let restApiInstance = new RestApi();
restApiInstance.init();