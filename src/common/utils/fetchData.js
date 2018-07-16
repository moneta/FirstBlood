import { isPlainObject } from 'lodash';
import qs from 'qs';

const PREFIX = '';

export const GET = 'GET';
export const POST = 'POST';
export const PUT = 'PUT';
export const DELETE = 'DELETE';

export function checkStatus(response) {
  if (response.ok) {
    return response;
  }

  const contentType = response.headers.get('Content-Type');

  if (contentType === 'application/json') {
    try {
      return response.json().then((err) => {
        if (typeof err === 'string') throw err;
        throw err && (err.message || err.msg || 'Unknown Error!');
      });
    } catch (ex) {
      throw ex;
    }
  }

  throw response.statusText;
}

/**
 * This method is intended for encoding *key* or *value* parts of query component. We need a custom
 * method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
 * encoded per http://tools.ietf.org/html/rfc3986:
 *    query         = *( pchar / "/" / "?" )
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriQuery(val, pctEncodeSpaces) {
  return encodeURIComponent(val)
    .replace(/%40/gi, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%3B/gi, ';')
    .replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
}

/**
 * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
 * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
 * segments:
 *    segment       = *pchar
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriSegment(val) {
  return encodeUriQuery(val, true)
    .replace(/%26/gi, '&')
    .replace(/%3D/gi, '=')
    .replace(/%2B/gi, '+');
}
/**
 *
 * @param actionUrl {string}
 * @param options {object} Options for fetch
 * @param options.params {object} path params /url/:param => /url/my_param
 * @param options.method {string} http method
 * @param options.headers {object} headers
 * @param options.body {any} body to send
 * @param options.nocheck {boolean} without checkStatus function
 * @param options.query {object} query object { a: 'b' } => ?a=b
 * @param options.local {boolean} default true, if false we get full url without prefix
 */
export default function fetchData(actionUrl, options = {}) {
  const headers = new Headers();
  const urlParams = {};

  let url = actionUrl; // one good thing from angular...
  const urlParts = url.split(/\W/);
  urlParts.forEach((param) => {
    if (!(new RegExp('^\\d+$').test(param)) && param &&
      (new RegExp('(^|[^\\\\]):' + param + '(\\W|$)').test(url))) {
      urlParams[param] = {
        isQueryParamValue: (new RegExp('\\?.*=:' + param + '(?:\\W|$)')).test(url),
      };
    }
  });
  url = url.replace(/\\:/g, ':');

  const params = options.params || {};

  Object.keys(urlParams).forEach((urlParam) => {
    const val = params[urlParam];
    const paramInfo = urlParams[urlParam];
    let encodedVal;
    if (val !== '') {
      if (paramInfo.isQueryParamValue) {
        encodedVal = encodeUriQuery(val, true);
      } else {
        encodedVal = encodeUriSegment(val);
      }
      url = url.replace(new RegExp(':' + urlParam + '(\\W|$)', 'g'), (match, p1) => encodedVal + p1);
    }
  });


  const method = options.method || GET;

  let content = options.body;
  if ((method === POST || method === PUT || method === DELETE) && typeof options.body === 'object') {
    headers.append('content-type', 'application/json;charset=UTF-8');
    headers.append('accept', 'application/json, text/plain, */*');
    content = JSON.stringify(options.body);
  }

  if (window.sessionId) {
    headers.append('sessionId', window.sessionId);
  }

  if (isPlainObject(options.headers)) {
    options.headers.forEach((key, value) => headers.append(key, value));
  }

  // arrayFormat: repeact = 'a=b&a=c'
  const query = qs.stringify(options.query, { skipNulls: true, arrayFormat: 'repeat' });

  // if not local use full url
  const fetchUrl = (options.local !== false ? PREFIX : '') + url + (query ? '?' + query : '');

  const opts = {
    method,
    // mode: 'no-cors',
    cache: 'no-cache', // Turn off caching
    credentials: 'same-origin', // To automatically send cookies for the current domain
    headers,
    body: content,
  };

  const promise = window.fetch(fetchUrl, opts)
    .catch((e) => { // if server is down we get TypeError: Failed to Fetch (this is not good for user)
      if (e instanceof Error) {
        throw Error('Can\'t access server, server is probably down! (' + e + ')');
      }
    });

  if (!options.nocheck) {
    return promise.then(checkStatus);
  }

  return promise;
}
