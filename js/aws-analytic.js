aws_identity_pool = 'us-east-1:27108e8b-5c4d-45f3-b5a0-408b23261db5'
AWS.config.region = 'us-east-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: aws_identity_pool,
});


let AwsAnalytic = function () {
    let firehose = new AWS.Firehose(),
        uuidLocalStorageKey = 'analytic_uuid',
        userIdLocalStorageKey = 'analytic_user_id',
        prodHost = '4homefitness';

    let getUrlParams = function () {
        return Object.fromEntries(new URLSearchParams(window.location.search).entries());
    }

    let getCookies = function () {
        return document.cookie.split('; ').reduce(function (prev, current) {
            const [name, value] = current.split('=');
            prev[name] = value;
            return prev
        }, {});
    }

    let getDeviceType = function () {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return "tablet";
        }
        if (
            /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
                ua
            )
        ) {
            return "mobile";
        }
        return "desktop";
    }

    let getBrowserInfo = function () {
        let module = {
            options: [],
            header: [navigator.platform, navigator.userAgent, navigator.appVersion, navigator.vendor, window.opera],
            dataos: [
                { name: 'Windows Phone', value: 'Windows Phone', version: 'OS' },
                { name: 'Windows', value: 'Win', version: 'NT' },
                { name: 'iPhone', value: 'iPhone', version: 'OS' },
                { name: 'iPad', value: 'iPad', version: 'OS' },
                { name: 'Kindle', value: 'Silk', version: 'Silk' },
                { name: 'Android', value: 'Android', version: 'Android' },
                { name: 'PlayBook', value: 'PlayBook', version: 'OS' },
                { name: 'BlackBerry', value: 'BlackBerry', version: '/' },
                { name: 'Macintosh', value: 'Mac', version: 'OS X' },
                { name: 'Linux', value: 'Linux', version: 'rv' },
                { name: 'Palm', value: 'Palm', version: 'PalmOS' }
            ],
            databrowser: [
                { name: 'Chrome', value: 'Chrome', version: 'Chrome' },
                { name: 'Firefox', value: 'Firefox', version: 'Firefox' },
                { name: 'Safari', value: 'Safari', version: 'Version' },
                { name: 'Internet Explorer', value: 'MSIE', version: 'MSIE' },
                { name: 'Opera', value: 'Opera', version: 'Opera' },
                { name: 'BlackBerry', value: 'CLDC', version: 'CLDC' },
                { name: 'Mozilla', value: 'Mozilla', version: 'Mozilla' }
            ],
            init: function () {
                let agent = this.header.join(' '),
                    os = this.matchItem(agent, this.dataos),
                    browser = this.matchItem(agent, this.databrowser);

                return { os: os, browser: browser };
            },
            matchItem: function (string, data) {
                let i = 0,
                    j = 0,
                    regex,
                    regexv,
                    match,
                    matches,
                    version;

                for (i = 0; i < data.length; i += 1) {
                    regex = new RegExp(data[i].value, 'i');
                    match = regex.test(string);
                    if (match) {
                        regexv = new RegExp(data[i].version + '[- /:;]([\\d._]+)', 'i');
                        matches = string.match(regexv);
                        version = '';
                        if (matches) { if (matches[1]) { matches = matches[1]; } }
                        if (matches) {
                            matches = matches.split(/[._]+/);
                            for (j = 0; j < matches.length; j += 1) {
                                if (j === 0) {
                                    version += matches[j] + '.';
                                } else {
                                    version += matches[j];
                                }
                            }
                        } else {
                            version = '0';
                        }
                        return {
                            name: data[i].name,
                            version: parseFloat(version)
                        };
                    }
                }
                return { name: 'unknown', version: 0 };
            }
        };

        let e = module.init();

        return  {
            'os.name': e.os.name,
            'os.version': e.os.version,
            'browser.name': e.browser.name,
            'browser.version': e.browser.version
        }
    }

    let isStageEnv = function () {
        return document.location.hostname.indexOf(prodHost) === -1;
    }

    this.getUserId = function () {
        return localStorage.getItem(userIdLocalStorageKey) || null;
    }

    this.getAwsId = () => {
        return AWS.config.credentials.getPromise().then(res => {
            return AWS.config.credentials.identityId;
        })
    }

    this.getReleaseDate = function () {
        return localStorage.getItem('release_date') || null
    }

    this.setUserId = function (value) {
        return localStorage.setItem(userIdLocalStorageKey, value);
    }

    this.getUuid = function () {
        let uuid = localStorage.getItem(uuidLocalStorageKey)

        if (uuid) {
            return uuid
        }

        uuid = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
        localStorage.setItem(uuidLocalStorageKey, uuid);

        return uuid;
    }

    this.trackEvent = async function (eventName, eventJson = {}) {
        let urlParams = getUrlParams();

        eventJson['event_type'] = eventName;
        Object.assign(eventJson, {
            host: window.location.hostname,
            url: window.location.pathname,
            fragment: urlParams.hasOwnProperty('step') ? urlParams.step : '',
            screen_height: window.screen.height,
            screen_width: window.screen.width,
            ab_test_name: Testania.getABtestName(),
            device_type: getDeviceType(),
            timestamp: Date.now(),
            mode: isStageEnv() ? 'stage' : 'prod',
            lang: navigator.language,
            agent: navigator.userAgent,
            referrer: document.referrer,
            browser_info: getBrowserInfo(),
            uuid: this.getUuid(),
            user_id: this.getUserId(),
            aws_id: await this.getAwsId(),
            release_date: this.getReleaseDate()
        });

        if (Object.keys(urlParams).length) {
            eventJson['url_params'] = urlParams;
        }

        let cookies = getCookies();

        if (Object.keys(cookies).length) {
            eventJson['cookies'] = cookies;
        }
        let params = {
            DeliveryStreamName: 'webmc_web',
            Record: {Data: JSON.stringify(eventJson)+'\n'}
        };

        firehose.putRecord(params, function(err, data) {
            if (isStageEnv()) {
                if (err) {
                    console.log(`Error while sending ${eventName}`)
                    console.log(err, err.stack);
                } else {
                    console.log(`Event ${eventName} successfully sent.`);
                    console.log('Data:', eventJson)
                }
            }
        });
    }
}

let AwsAnalyticTracker = new AwsAnalytic();


