'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.authClient = undefined;

var _storage = require('./storage');

var _storage2 = _interopRequireDefault(_storage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var authClient = exports.authClient = function authClient(loginApiUrl) {
    var noAccessPage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '/login';


    return function (type, params) {
        if (type === 'AUTH_LOGIN') {
            var request = new Request(loginApiUrl, {
                method: 'POST',
                body: JSON.stringify(params),
                headers: new Headers({ 'Content-Type': 'application/json' })
            });
            return fetch(request).then(function (response) {
                if (response.status < 200 || response.status >= 300) {
                    throw new Error(response.statusText);
                }
                return response.json();
            }).then(function (response) {
                if (!response.status) {
                    throw new Error(response.message);
                }
                _storage2.default.save('lbtoken', response.data, response.data.ttl);
            });
        }
        if (type === 'AUTH_LOGOUT') {
            _storage2.default.remove('lbtoken');
            return Promise.resolve();
        }
        if (type === 'AUTH_ERROR') {
            var status = params.status;

            if (status === 401 || status === 403) {
                _storage2.default.remove('lbtoken');
                return Promise.reject();
            }
            return Promise.resolve();
        }
        if (type === 'AUTH_CHECK') {
            var token = _storage2.default.load('lbtoken');
            if (token && token.token) {
                return Promise.resolve();
            } else {
                _storage2.default.remove('lbtoken');
                return Promise.reject({ redirectTo: noAccessPage });
            }
        }
        if (type === 'AUTH_GET_PERMISSIONS') {
            var _token = _storage2.default.load('lbtoken');
            if (_token && _token.token) {
                return Promise.resolve(_token.roles);
            } else {
                _storage2.default.remove('lbtoken');
                return Promise.reject({ redirectTo: noAccessPage });
            }
        }
        return Promise.reject('Unkown method');
    };
};