var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@neon/realtime/node_modules/postgres-array/index.js
var require_postgres_array = __commonJS({
  "node_modules/@neon/realtime/node_modules/postgres-array/index.js"(exports) {
    "use strict";
    var BACKSLASH = "\\";
    var DQUOT = '"';
    var LBRACE = "{";
    var RBRACE = "}";
    var LBRACKET = "[";
    var EQUALS = "=";
    var COMMA = ",";
    var NULL_STRING = "NULL";
    function makeParseArrayWithTransform(transform) {
      const haveTransform = transform != null;
      return function parseArray2(str) {
        const rbraceIndex = str.length - 1;
        if (rbraceIndex === 1) {
          return [];
        }
        if (str[rbraceIndex] !== RBRACE) {
          throw new Error("Invalid array text - must end with }");
        }
        let position = 0;
        if (str[position] === LBRACKET) {
          position = str.indexOf(EQUALS) + 1;
        }
        if (str[position++] !== LBRACE) {
          throw new Error("Invalid array text - must start with {");
        }
        const output = [];
        let current = output;
        const stack = [];
        let currentStringStart = position;
        let currentString = "";
        let expectValue = true;
        for (; position < rbraceIndex; ++position) {
          let char = str[position];
          if (char === DQUOT) {
            currentStringStart = ++position;
            let dquot = str.indexOf(DQUOT, currentStringStart);
            let backSlash = str.indexOf(BACKSLASH, currentStringStart);
            while (backSlash !== -1 && backSlash < dquot) {
              position = backSlash;
              const part2 = str.slice(currentStringStart, position);
              currentString += part2;
              currentStringStart = ++position;
              if (dquot === position++) {
                dquot = str.indexOf(DQUOT, position);
              }
              backSlash = str.indexOf(BACKSLASH, position);
            }
            position = dquot;
            const part = str.slice(currentStringStart, position);
            currentString += part;
            current.push(haveTransform ? transform(currentString) : currentString);
            currentString = "";
            expectValue = false;
          } else if (char === LBRACE) {
            const newArray = [];
            current.push(newArray);
            stack.push(current);
            current = newArray;
            currentStringStart = position + 1;
            expectValue = true;
          } else if (char === COMMA) {
            expectValue = true;
          } else if (char === RBRACE) {
            expectValue = false;
            const arr = stack.pop();
            if (arr === void 0) {
              throw new Error("Invalid array text - too many '}'");
            }
            current = arr;
          } else if (expectValue) {
            currentStringStart = position;
            while ((char = str[position]) !== COMMA && char !== RBRACE && position < rbraceIndex) {
              ++position;
            }
            const part = str.slice(currentStringStart, position--);
            current.push(
              part === NULL_STRING ? null : haveTransform ? transform(part) : part
            );
            expectValue = false;
          } else {
            throw new Error("Was expecting delimeter");
          }
        }
        return output;
      };
    }
    var parseArray = makeParseArrayWithTransform();
    exports.parse = (source, transform) => transform != null ? makeParseArrayWithTransform(transform)(source) : parseArray(source);
  }
});

// node_modules/base64-js/index.js
var require_base64_js = __commonJS({
  "node_modules/base64-js/index.js"(exports) {
    "use strict";
    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray2;
    exports.fromByteArray = fromByteArray;
    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }
    var i;
    var len;
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
    function getLens(b64) {
      var len2 = b64.length;
      if (len2 % 4 > 0) {
        throw new Error("Invalid string. Length must be a multiple of 4");
      }
      var validLen = b64.indexOf("=");
      if (validLen === -1) validLen = len2;
      var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
      return [validLen, placeHoldersLen];
    }
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function toByteArray2(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
      var i2;
      for (i2 = 0; i2 < len2; i2 += 4) {
        tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
        arr[curByte++] = tmp >> 16 & 255;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 2) {
        tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 1) {
        tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      return arr;
    }
    function tripletToBase64(num) {
      return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
    }
    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i2 = start; i2 < end; i2 += 3) {
        tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
        output.push(tripletToBase64(tmp));
      }
      return output.join("");
    }
    function fromByteArray(uint8) {
      var tmp;
      var len2 = uint8.length;
      var extraBytes = len2 % 3;
      var parts2 = [];
      var maxChunkLength = 16383;
      for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
        parts2.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
      }
      if (extraBytes === 1) {
        tmp = uint8[len2 - 1];
        parts2.push(
          lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
        );
      } else if (extraBytes === 2) {
        tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
        parts2.push(
          lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
        );
      }
      return parts2.join("");
    }
  }
});

// node_modules/@neon/realtime/dist/client/postgres/oids.js
var pgTypeOids = Object.freeze({
  bool: 16,
  bytea: 17,
  char: 18,
  name: 19,
  int8: 20,
  int2: 21,
  int4: 23,
  text: 25,
  oid: 26,
  json: 114,
  xml: 142,
  point: 600,
  lseg: 601,
  path: 602,
  box: 603,
  polygon: 604,
  line: 628,
  cidr: 650,
  macaddr8: 774,
  money: 790,
  float4: 700,
  float8: 701,
  circle: 718,
  macaddr: 829,
  inet: 869,
  bpchar: 1042,
  varchar: 1043,
  date: 1082,
  time: 1083,
  timestamp: 1114,
  timestamptz: 1184,
  interval: 1186,
  timetz: 1266,
  bit: 1560,
  varbit: 1562,
  numeric: 1700,
  uuid: 2950,
  pgLsn: 3220,
  jsonb: 3802,
  cstring: 2275,
  jsonArray: 199,
  boolArray: 1e3,
  byteaArray: 1001,
  charArray: 1002,
  nameArray: 1003,
  int2Array: 1005,
  int4Array: 1007,
  textArray: 1009,
  int8Array: 1016,
  pointArray: 1017,
  lsegArray: 1018,
  pathArray: 1019,
  boxArray: 1020,
  float4Array: 1021,
  float8Array: 1022,
  polygonArray: 1027,
  oidArray: 1028,
  macaddrArray: 1040,
  inetArray: 1041,
  bpcharArray: 1014,
  varcharArray: 1015,
  dateArray: 1182,
  timeArray: 1183,
  timestampArray: 1115,
  timestamptzArray: 1185,
  intervalArray: 1187,
  numericArray: 1231,
  timetzArray: 1270,
  bitArray: 1561,
  varbitArray: 1563,
  uuidArray: 2951,
  pgLsnArray: 3221,
  jsonbArray: 3807,
  lineArray: 629,
  cidrArray: 651,
  circleArray: 719,
  macaddr8Array: 775,
  moneyArray: 791,
  xmlArray: 143,
  cstringArray: 1263
});
var arrayTypeEntries = [
  [pgTypeOids.jsonArray, {
    elementOid: pgTypeOids.json,
    delimiter: ","
  }],
  [pgTypeOids.boolArray, {
    elementOid: pgTypeOids.bool,
    delimiter: ","
  }],
  [pgTypeOids.byteaArray, {
    elementOid: pgTypeOids.bytea,
    delimiter: ","
  }],
  [pgTypeOids.charArray, {
    elementOid: pgTypeOids.char,
    delimiter: ","
  }],
  [pgTypeOids.nameArray, {
    elementOid: pgTypeOids.name,
    delimiter: ","
  }],
  [pgTypeOids.int2Array, {
    elementOid: pgTypeOids.int2,
    delimiter: ","
  }],
  [pgTypeOids.int4Array, {
    elementOid: pgTypeOids.int4,
    delimiter: ","
  }],
  [pgTypeOids.textArray, {
    elementOid: pgTypeOids.text,
    delimiter: ","
  }],
  [pgTypeOids.int8Array, {
    elementOid: pgTypeOids.int8,
    delimiter: ","
  }],
  [pgTypeOids.pointArray, {
    elementOid: pgTypeOids.point,
    delimiter: ","
  }],
  [pgTypeOids.lsegArray, {
    elementOid: pgTypeOids.lseg,
    delimiter: ","
  }],
  [pgTypeOids.pathArray, {
    elementOid: pgTypeOids.path,
    delimiter: ","
  }],
  [pgTypeOids.boxArray, {
    elementOid: pgTypeOids.box,
    delimiter: ";"
  }],
  [pgTypeOids.float4Array, {
    elementOid: pgTypeOids.float4,
    delimiter: ","
  }],
  [pgTypeOids.float8Array, {
    elementOid: pgTypeOids.float8,
    delimiter: ","
  }],
  [pgTypeOids.polygonArray, {
    elementOid: pgTypeOids.polygon,
    delimiter: ","
  }],
  [pgTypeOids.oidArray, {
    elementOid: pgTypeOids.oid,
    delimiter: ","
  }],
  [pgTypeOids.macaddrArray, {
    elementOid: pgTypeOids.macaddr,
    delimiter: ","
  }],
  [pgTypeOids.inetArray, {
    elementOid: pgTypeOids.inet,
    delimiter: ","
  }],
  [pgTypeOids.bpcharArray, {
    elementOid: pgTypeOids.bpchar,
    delimiter: ","
  }],
  [pgTypeOids.varcharArray, {
    elementOid: pgTypeOids.varchar,
    delimiter: ","
  }],
  [pgTypeOids.dateArray, {
    elementOid: pgTypeOids.date,
    delimiter: ","
  }],
  [pgTypeOids.timeArray, {
    elementOid: pgTypeOids.time,
    delimiter: ","
  }],
  [pgTypeOids.timestampArray, {
    elementOid: pgTypeOids.timestamp,
    delimiter: ","
  }],
  [pgTypeOids.timestamptzArray, {
    elementOid: pgTypeOids.timestamptz,
    delimiter: ","
  }],
  [pgTypeOids.intervalArray, {
    elementOid: pgTypeOids.interval,
    delimiter: ","
  }],
  [pgTypeOids.numericArray, {
    elementOid: pgTypeOids.numeric,
    delimiter: ","
  }],
  [pgTypeOids.timetzArray, {
    elementOid: pgTypeOids.timetz,
    delimiter: ","
  }],
  [pgTypeOids.bitArray, {
    elementOid: pgTypeOids.bit,
    delimiter: ","
  }],
  [pgTypeOids.varbitArray, {
    elementOid: pgTypeOids.varbit,
    delimiter: ","
  }],
  [pgTypeOids.uuidArray, {
    elementOid: pgTypeOids.uuid,
    delimiter: ","
  }],
  [pgTypeOids.pgLsnArray, {
    elementOid: pgTypeOids.pgLsn,
    delimiter: ","
  }],
  [pgTypeOids.jsonbArray, {
    elementOid: pgTypeOids.jsonb,
    delimiter: ","
  }],
  [pgTypeOids.lineArray, {
    elementOid: pgTypeOids.line,
    delimiter: ","
  }],
  [pgTypeOids.cidrArray, {
    elementOid: pgTypeOids.cidr,
    delimiter: ","
  }],
  [pgTypeOids.circleArray, {
    elementOid: pgTypeOids.circle,
    delimiter: ","
  }],
  [pgTypeOids.macaddr8Array, {
    elementOid: pgTypeOids.macaddr8,
    delimiter: ","
  }],
  [pgTypeOids.moneyArray, {
    elementOid: pgTypeOids.money,
    delimiter: ","
  }],
  [pgTypeOids.xmlArray, {
    elementOid: pgTypeOids.xml,
    delimiter: ","
  }],
  [pgTypeOids.cstringArray, {
    elementOid: pgTypeOids.cstring,
    delimiter: ","
  }]
];
var postgresArrayTypes = new Map(arrayTypeEntries);

// node_modules/@neon/realtime/dist/client/postgres/date.js
var DATE_PATTERN = /^(\d{4,})-(\d{2})-(\d{2})(?:\s+(BC))?$/;
var TIMESTAMP_PATTERN = /^(\d{4,})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?(?:\s+(BC))?$/;
var TIMESTAMPTZ_PATTERN = /^(\d{4,})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?([+-])(\d{2})(?::?(\d{2}))?(?::?(\d{2}))?(?:\s+(BC))?$/;
function parsePostgresDate(value) {
  const infinity = parseInfinity(value);
  if (infinity !== void 0) return infinity;
  const match = DATE_PATTERN.exec(value);
  if (!match) throw new Error("Invalid PostgreSQL date value");
  return localDate({
    year: match[4] === "BC" ? 1 - Number(match[1]) : Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  });
}
function parsePostgresTimestamp(value) {
  const infinity = parseInfinity(value);
  if (infinity !== void 0) return infinity;
  const match = TIMESTAMP_PATTERN.exec(value);
  if (!match) throw new Error("Invalid PostgreSQL timestamp value");
  return localDate(parts(match));
}
function parsePostgresTimestampWithTimeZone(value) {
  const infinity = parseInfinity(value);
  if (infinity !== void 0) return infinity;
  const match = TIMESTAMPTZ_PATTERN.exec(value);
  if (!match) throw new Error("Invalid PostgreSQL timestamptz value");
  const parsed = parts(match);
  assertDateParts(parsed, "timestamptz");
  const sign = match[8] === "+" ? 1 : -1;
  const offsetHours = Number(match[9]);
  const offsetMinutes = Number(match[10] ?? 0);
  const offsetRemainderSeconds = Number(match[11] ?? 0);
  if (offsetHours > 15 || offsetMinutes > 59 || offsetRemainderSeconds > 59) throw new Error("Invalid PostgreSQL timestamptz offset");
  const offsetSeconds = (offsetHours * 60 * 60 + offsetMinutes * 60 + offsetRemainderSeconds) * sign;
  const result = /* @__PURE__ */ new Date(0);
  result.setUTCFullYear(parsed.year, parsed.month, parsed.day);
  result.setUTCHours(parsed.hour, parsed.minute, parsed.second, parsed.millisecond);
  result.setTime(result.getTime() - offsetSeconds * 1e3);
  assertValidDate(result, "timestamptz");
  return result;
}
function parsePostgresJsDate(value) {
  const match = DATE_PATTERN.exec(value);
  if (!match || match[4]) throw new Error("Invalid PostgreSQL date value");
  const parsed = {
    year: Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  };
  assertDateParts(parsed, "date");
  const result = /* @__PURE__ */ new Date(0);
  result.setUTCFullYear(parsed.year, parsed.month, parsed.day);
  result.setUTCHours(0, 0, 0, 0);
  assertValidDate(result, "date");
  return result;
}
function parts(match) {
  const rawYear = Number(match[1]);
  return {
    year: match.at(-1) === "BC" ? 1 - rawYear : rawYear,
    month: Number(match[2]) - 1,
    day: Number(match[3]),
    hour: Number(match[4] ?? 0),
    minute: Number(match[5] ?? 0),
    second: Number(match[6] ?? 0),
    millisecond: Number((match[7] ?? "").padEnd(3, "0").slice(0, 3) || 0)
  };
}
function localDate(value) {
  assertDateParts(value, "date or timestamp");
  const result = /* @__PURE__ */ new Date(0);
  result.setFullYear(value.year, value.month, value.day);
  result.setHours(value.hour, value.minute, value.second, value.millisecond);
  assertValidDate(result, "date or timestamp");
  return result;
}
function assertDateParts(value, type) {
  const maxDay = [
    31,
    isLeapYear(value.year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
  ][value.month] ?? 0;
  if (value.month < 0 || value.month > 11 || value.day < 1 || value.day > maxDay || value.hour < 0 || value.hour > 23 || value.minute < 0 || value.minute > 59 || value.second < 0 || value.second > 59) throw new Error(`Invalid PostgreSQL ${type} value`);
}
function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function assertValidDate(value, type) {
  if (!Number.isFinite(value.getTime())) throw new Error(`Invalid PostgreSQL ${type} value`);
}
function parseInfinity(value) {
  if (value === "infinity") return Infinity;
  if (value === "-infinity") return -Infinity;
}

// node_modules/@neon/realtime/dist/client/postgres/parsers.js
var import_postgres_array = __toESM(require_postgres_array(), 1);
function defineParsers(parsers) {
  return Object.freeze({ ...parsers });
}
var nodePostgresParsers = defineParsers({
  [pgTypeOids.bool]: parseBoolean,
  [pgTypeOids.bytea]: (value) => value,
  [pgTypeOids.int2]: (value) => parseInteger(value, -32768, 32767, "int2"),
  [pgTypeOids.int4]: (value) => parseInteger(value, -2147483648, 2147483647, "int4"),
  [pgTypeOids.int8]: parseInt8,
  [pgTypeOids.oid]: (value) => parseInteger(value, 0, 4294967295, "oid"),
  [pgTypeOids.float4]: (value) => parseFloatValue(value, "float4"),
  [pgTypeOids.float8]: (value) => parseFloatValue(value, "float8"),
  [pgTypeOids.numeric]: parseNumeric,
  [pgTypeOids.json]: parseJson,
  [pgTypeOids.jsonb]: parseJson,
  [pgTypeOids.date]: parsePostgresDate,
  [pgTypeOids.timestamp]: parsePostgresTimestamp,
  [pgTypeOids.timestamptz]: parsePostgresTimestampWithTimeZone
});
var postgresJsParsers = defineParsers({ [pgTypeOids.date]: parsePostgresJsDate });
function createParserRegistry(overrides) {
  const parsers = /* @__PURE__ */ new Map();
  const overridden = /* @__PURE__ */ new Set();
  addParsers(parsers, nodePostgresParsers, void 0);
  addParsers(parsers, overrides, overridden);
  return Object.freeze({ parse(oid, value) {
    const arrayType = postgresArrayTypes.get(oid);
    if (arrayType && arrayType.delimiter === "," && !overridden.has(oid)) {
      if (typeof value !== "string") throw new Error("PostgreSQL arrays require pg_text input");
      return (0, import_postgres_array.parse)(value, (element) => {
        if (arrayType.elementOid === pgTypeOids.bytea) return parseWith(parsers, arrayType.elementOid, decodeBytea(element));
        return parseWith(parsers, arrayType.elementOid, element);
      });
    }
    return parseWith(parsers, oid, value);
  } });
}
function addParsers(target, source, overridden) {
  if (source === void 0) return;
  if (source === null || typeof source !== "object" || Array.isArray(source)) throw new TypeError("Realtime parsers must be an OID-keyed object");
  for (const [key, parser] of Object.entries(source)) {
    if (!/^[1-9][0-9]*$/.test(key)) throw new TypeError(`Invalid PostgreSQL parser OID ${JSON.stringify(key)}`);
    const oid = Number(key);
    if (!Number.isSafeInteger(oid) || oid > 4294967295) throw new TypeError(`Invalid PostgreSQL parser OID ${JSON.stringify(key)}`);
    if (typeof parser !== "function") throw new TypeError(`PostgreSQL parser for OID ${oid} must be a function`);
    target.set(oid, parser);
    overridden?.add(oid);
  }
}
function parseWith(parsers, oid, value) {
  const parser = parsers.get(oid);
  if (!parser) return value;
  return parser(value);
}
function parseBoolean(value) {
  if (value === "t") return true;
  if (value === "f") return false;
  throw new Error("Invalid PostgreSQL bool value");
}
function parseInteger(value, minimum, maximum, type) {
  if (!/^-?(?:0|[1-9][0-9]*)$/.test(value)) throw new Error(`Invalid PostgreSQL ${type} value`);
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) throw new Error(`Invalid PostgreSQL ${type} value`);
  return parsed;
}
function parseInt8(value) {
  if (!/^-?(?:0|[1-9][0-9]*)$/.test(value)) throw new Error("Invalid PostgreSQL int8 value");
  const parsed = BigInt(value);
  if (parsed < -9223372036854775808n || parsed > 9223372036854775807n) throw new Error("Invalid PostgreSQL int8 value");
  return value;
}
function parseFloatValue(value, type) {
  if (value === "NaN") return NaN;
  if (value === "Infinity") return Infinity;
  if (value === "-Infinity") return -Infinity;
  if (!/^[+-]?(?:(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)$/.test(value)) throw new Error(`Invalid PostgreSQL ${type} value`);
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid PostgreSQL ${type} value`);
  return parsed;
}
function parseNumeric(value) {
  if (value !== "NaN" && value !== "Infinity" && value !== "-Infinity" && !/^[+-]?(?:(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)$/.test(value)) throw new Error("Invalid PostgreSQL numeric value");
  return value;
}
function parseJson(value) {
  return JSON.parse(value);
}
function decodeBytea(value) {
  if (!/^\\x(?:[0-9a-fA-F]{2})*$/.test(value)) throw new Error("Invalid PostgreSQL bytea value");
  const bytes = new Uint8Array((value.length - 2) / 2);
  for (let index = 0; index < bytes.length; index += 1) bytes[index] = Number.parseInt(value.slice(2 + index * 2, 4 + index * 2), 16);
  return bytes;
}

// node_modules/@neon/realtime/dist/client/diagnostics/catalog.js
var EVENT_CATALOG = {
  client_closed: {
    level: "info",
    message: "Realtime client closed"
  },
  connection_attempt_started: {
    level: "debug",
    message: "Realtime connection attempt started"
  },
  connection_failed: {
    level: "error",
    message: "Realtime connection failed permanently"
  },
  connection_heartbeat_ping_sent: {
    level: "debug",
    message: "Realtime heartbeat ping sent"
  },
  connection_heartbeat_pong_received: {
    level: "debug",
    message: "Realtime heartbeat pong received"
  },
  connection_heartbeat_timeout: {
    level: "debug",
    message: "Realtime connection heartbeat timed out"
  },
  connection_lost: {
    level: "warn",
    message: "Realtime connection was lost; reconnecting"
  },
  connection_publication_committed: {
    level: "debug",
    message: "Realtime publication committed"
  },
  connection_ready: {
    level: "info",
    message: "Realtime connection is ready"
  },
  connection_reconnect_exhausted: {
    level: "error",
    message: "Realtime reconnect policy was exhausted"
  },
  connection_reconnect_scheduled: {
    level: "debug",
    message: "Realtime reconnect scheduled"
  },
  connection_recovered: {
    level: "info",
    message: "Realtime connection recovered"
  },
  connection_stable: {
    level: "debug",
    message: "Realtime connection is stable"
  },
  query_expired: {
    level: "warn",
    message: "The query expired"
  },
  query_refresh_callback_failed: {
    level: "warn",
    message: "Realtime query refresh callback failed; retrying"
  },
  query_refresh_callback_started: {
    level: "debug",
    message: "Realtime query refresh callback started"
  },
  query_refresh_callback_succeeded: {
    level: "debug",
    message: "Realtime query refresh callback succeeded"
  },
  query_refresh_scheduled: {
    level: "debug",
    message: "Realtime query refresh scheduled"
  },
  query_refresh_stopped: {
    level: "error",
    message: "Realtime query refresh stopped permanently"
  },
  subscription_admitted: {
    level: "debug",
    message: "Realtime subscription admitted"
  },
  subscription_failed: {
    level: "error",
    message: "Realtime subscription failed permanently"
  },
  subscription_listener_failed: {
    level: "warn",
    message: "A Realtime subscription listener failed"
  },
  subscription_live: {
    level: "info",
    message: "Realtime subscription is live"
  },
  subscription_renewal_failed: {
    level: "warn",
    message: "Realtime subscription renewal failed"
  },
  subscription_renewal_started: {
    level: "debug",
    message: "Realtime subscription renewal started"
  },
  subscription_renewed: {
    level: "info",
    message: "Realtime subscription renewed"
  },
  subscription_reset_required: {
    level: "debug",
    message: "Realtime subscription requires a new baseline sync"
  },
  subscription_retry_scheduled: {
    level: "debug",
    message: "Realtime subscription retry scheduled"
  },
  subscription_row_decoding_failed: {
    level: "error",
    message: "Realtime could not decode a subscription row"
  },
  subscription_baseline_sync_completed: {
    level: "debug",
    message: "Realtime subscription baseline sync completed"
  },
  subscription_baseline_sync_started: {
    level: "debug",
    message: "Realtime subscription baseline sync started"
  },
  subscription_started: {
    level: "debug",
    message: "Realtime subscription started"
  },
  subscription_state_changed: {
    level: "debug",
    message: "Realtime subscription state changed"
  },
  subscription_unsubscribed: {
    level: "debug",
    message: "Realtime subscription unsubscribed"
  }
};
var LEVEL_PRIORITY = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// node_modules/@neon/realtime/dist/client/diagnostics/dispatcher.js
function createDiagnosticDispatcher(logger) {
  const entries = [];
  let scheduled = false;
  return (entry) => {
    entries.push(entry);
    if (scheduled) return;
    scheduled = true;
    scheduleMicrotask(() => {
      scheduled = false;
      for (const queued of entries.splice(0)) try {
        const result = logger(queued);
        if (isPromiseLike(result)) Promise.resolve(result).catch(ignoreLoggerFailure);
      } catch {
      }
    });
  };
}
var ignoreLoggerFailure = () => void 0;
function isPromiseLike(value) {
  return typeof value === "object" && value !== null || typeof value === "function" ? typeof value.then === "function" : false;
}
function logToConsole(entry) {
  if (typeof console === "undefined") return;
  (console[entry.level] ?? console.log).call(console, entry);
}
var scheduleMicrotask = typeof queueMicrotask === "function" ? queueMicrotask : (callback) => {
  Promise.resolve().then(callback);
};

// node_modules/@neon/realtime/dist/client/diagnostics/projector.js
var noop = () => void 0;
var SILENT_REFRESH_EVENTS = Object.freeze({
  scheduled: noop,
  callbackStarted: noop,
  callbackSucceeded: noop,
  callbackFailed: noop,
  stopped: noop
});
var SILENT_SUBSCRIPTION_EVENTS = Object.freeze({
  refresh: SILENT_REFRESH_EVENTS,
  started: noop,
  admitted: noop,
  retryScheduled: noop,
  renewalStarted: noop,
  renewalFailed: noop,
  renewed: noop,
  unsubscribed: noop,
  live: noop,
  failed: noop,
  queryUnavailable: noop,
  listenerFailed: noop,
  stateChanged: noop,
  baselineSyncStarted: noop,
  baselineSyncCompleted: noop,
  resetRequired: noop
});
var SILENT_CONNECTION_EVENTS = Object.freeze({
  attemptStarted: noop,
  ready: noop,
  lost: noop,
  reconnectScheduled: noop,
  reconnectExhausted: noop,
  stable: noop,
  heartbeatPingSent: noop,
  heartbeatPongReceived: noop,
  heartbeatTimedOut: noop,
  publicationCommitted: noop,
  failed: noop,
  episodeEnded: noop
});
var SILENT_CLIENT_EVENTS = Object.freeze({
  connection: SILENT_CONNECTION_EVENTS,
  createSubscription: () => SILENT_SUBSCRIPTION_EVENTS,
  closed: noop
});
function createClientEventSink(options) {
  const level = options.logLevel ?? "silent";
  if (!(level === "silent" || Object.hasOwn(LEVEL_PRIORITY, level))) throw new TypeError(`Invalid Realtime log level: ${String(level)}`);
  if (options.logger !== void 0 && typeof options.logger !== "function") throw new TypeError("Realtime logger must be a function");
  if (level === "silent") return SILENT_CLIENT_EVENTS;
  const emit = createEmitter(level, createDiagnosticDispatcher(options.logger ?? logToConsole));
  let nextSubscriptionId = 0;
  let everReady = false;
  let outageStartedAt;
  let reconnectAttempt;
  const connection = {
    attemptStarted: () => emit("connection_attempt_started", optionalAttempt(reconnectAttempt)),
    ready: () => {
      const outageStart = outageStartedAt;
      if (everReady && outageStart !== void 0) emit("connection_recovered", {
        ...optionalAttempt(reconnectAttempt),
        durationMs: Math.max(0, Date.now() - outageStart)
      });
      else emit("connection_ready", optionalAttempt(reconnectAttempt));
      everReady = true;
      outageStartedAt = void 0;
    },
    lost: (error, activeSubscriptionCount) => {
      if (outageStartedAt !== void 0) return;
      outageStartedAt = Date.now();
      const coordinatorError = isDiagnosticError(error) ? error : void 0;
      emit("connection_lost", {
        activeSubscriptionCount,
        ...coordinatorError ? {
          code: coordinatorError.code,
          retryable: coordinatorError.retryable
        } : {},
        ...error === void 0 ? {} : { error }
      });
    },
    reconnectScheduled: (attempt, delayMs) => {
      reconnectAttempt = attempt;
      emit("connection_reconnect_scheduled", {
        attempt,
        delayMs
      });
    },
    reconnectExhausted: (error) => emit("connection_reconnect_exhausted", errorMetadata(error)),
    stable: () => {
      reconnectAttempt = void 0;
      emit("connection_stable", {});
    },
    heartbeatPingSent: () => emit("connection_heartbeat_ping_sent", {}),
    heartbeatPongReceived: () => emit("connection_heartbeat_pong_received", {}),
    heartbeatTimedOut: () => emit("connection_heartbeat_timeout", {}),
    publicationCommitted: (bodyCount) => emit("connection_publication_committed", { bodyCount }),
    failed: (error) => emit("connection_failed", errorMetadata(error)),
    episodeEnded: () => {
      outageStartedAt = void 0;
      reconnectAttempt = void 0;
    }
  };
  Object.freeze(connection);
  return Object.freeze({
    connection,
    createSubscription: () => createSubscriptionEventSink(`s${++nextSubscriptionId}`, emit),
    closed: () => emit("client_closed", {})
  });
}
function createEmitter(configuredLevel, dispatch) {
  return (event, metadata) => {
    const definition = EVENT_CATALOG[event];
    if (LEVEL_PRIORITY[definition.level] > LEVEL_PRIORITY[configuredLevel]) return;
    dispatch(Object.freeze({
      ...metadata,
      level: definition.level,
      event,
      message: definition.message,
      timestamp: Date.now()
    }));
  };
}
function createSubscriptionEventSink(subscriptionId, emit) {
  const metadata = { subscriptionId };
  const refresh = {
    scheduled: (delayMs, expiresAt) => emit("query_refresh_scheduled", {
      ...metadata,
      delayMs,
      expiresAt
    }),
    callbackStarted: () => emit("query_refresh_callback_started", metadata),
    callbackSucceeded: () => emit("query_refresh_callback_succeeded", metadata),
    callbackFailed: (error) => emit("query_refresh_callback_failed", {
      ...metadata,
      error
    }),
    stopped: (error) => emit("query_refresh_stopped", {
      ...metadata,
      error
    })
  };
  Object.freeze(refresh);
  let renewalPending = false;
  return Object.freeze({
    refresh,
    started: () => emit("subscription_started", metadata),
    admitted: () => emit("subscription_admitted", metadata),
    retryScheduled: (code, attempt, delayMs) => emit("subscription_retry_scheduled", {
      ...metadata,
      code,
      attempt,
      delayMs
    }),
    renewalStarted: () => {
      if (renewalPending) return;
      renewalPending = true;
      emit("subscription_renewal_started", metadata);
    },
    renewalFailed: (error) => {
      renewalPending = false;
      emit("subscription_renewal_failed", {
        ...metadata,
        error
      });
    },
    renewed: () => {
      renewalPending = false;
      emit("subscription_renewed", metadata);
    },
    unsubscribed: () => emit("subscription_unsubscribed", metadata),
    live: () => emit("subscription_live", metadata),
    failed: (error) => emit(error.code === "parser_error" ? "subscription_row_decoding_failed" : "subscription_failed", {
      ...metadata,
      ...errorMetadata(error)
    }),
    queryUnavailable: (error) => emit("query_expired", {
      ...metadata,
      ...errorMetadata(error)
    }),
    listenerFailed: (error) => emit("subscription_listener_failed", {
      ...metadata,
      error
    }),
    stateChanged: (fromStatus, toStatus) => emit("subscription_state_changed", {
      ...metadata,
      fromStatus,
      toStatus
    }),
    baselineSyncStarted: () => emit("subscription_baseline_sync_started", metadata),
    baselineSyncCompleted: (batchCount) => emit("subscription_baseline_sync_completed", {
      ...metadata,
      batchCount
    }),
    resetRequired: () => emit("subscription_reset_required", metadata)
  });
}
function errorMetadata(error) {
  return {
    code: error.code,
    retryable: error.retryable,
    error
  };
}
function isDiagnosticError(error) {
  return error instanceof Error && "code" in error && typeof error.code === "string" && "retryable" in error && typeof error.retryable === "boolean";
}
function optionalAttempt(attempt) {
  return attempt === void 0 ? {} : { attempt };
}

// node_modules/@neon/realtime/dist/client/diagnostics/subscription-context.js
var subscriptionEvents = /* @__PURE__ */ new WeakMap();
function registerSubscriptionEvents(subscription2, events) {
  if (events !== SILENT_SUBSCRIPTION_EVENTS) subscriptionEvents.set(subscription2, events);
}

// node_modules/@neon/realtime/dist/client/mvcc.js
function parseMvccSnapshot(snapshot) {
  const xmin = BigInt(snapshot.xmin);
  const xmax = BigInt(snapshot.xmax);
  if (xmin > xmax) throw new Error("MVCC xmin exceeds xmax");
  const xip = /* @__PURE__ */ new Set();
  for (const encoded of snapshot.xip) {
    const txid = BigInt(encoded);
    if (txid < xmin || txid >= xmax) throw new Error("MVCC exclusion is outside [xmin, xmax)");
    xip.add(txid);
  }
  return parsedSnapshot(xmin, xmax, xip);
}
function mergeMvccSnapshots(previous, incoming) {
  const [wider, other] = previous.xmax >= incoming.xmax ? [previous, incoming] : [incoming, previous];
  const xmin = previous.xmin > incoming.xmin ? previous.xmin : incoming.xmin;
  const xip = wider.xip.filter((txid) => !other.isVisible(txid));
  if (xmin === wider.xmin && xip.length === wider.xip.length) return wider;
  return parsedSnapshot(xmin, wider.xmax, new Set(xip));
}
function parsedSnapshot(xmin, xmax, exclusions) {
  return Object.freeze({
    xmin,
    xmax,
    xip: Object.freeze([...exclusions]),
    isVisible: (txid) => txid < xmin || txid < xmax && !exclusions.has(txid)
  });
}

// node_modules/@neon/realtime/dist/client/protocol/schema-validator.gen.js
var realtimeSchemaPatterns = Object.freeze({
  "base64Cell": "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/][AQgw]==|[A-Za-z0-9+/]{2}[AEIMQUYcgkosw048]=)?$",
  "heartbeatToken": "^[^\\u0000-\\u001f\\u007f-\\u009f]{1,64}$",
  "rowKey": "^[0-9a-f]{64}$",
  "u64": "^(?:[1-9][0-9]{0,18}|1[0-7][0-9]{18}|18[0-3][0-9]{17}|184[0-3][0-9]{16}|1844[0-5][0-9]{15}|18446[0-6][0-9]{14}|184467[0-3][0-9]{13}|1844674[0-3][0-9]{12}|184467440[0-6][0-9]{10}|1844674407[0-2][0-9]{9}|18446744073[0-6][0-9]{8}|1844674407370[0-8][0-9]{6}|18446744073709[0-4][0-9]{5}|184467440737095[0-4][0-9]{4}|18446744073709550[0-9]{3}|18446744073709551[0-5][0-9]{2}|1844674407370955160[0-9]|1844674407370955161[0-5])$"
});
var validateClientMessage = validate133;
var schema20 = {
  "type": "object",
  "discriminator": { "propertyName": "type" },
  "oneOf": [
    {
      "type": "object",
      "required": [
        "type",
        "request_id",
        "authorization"
      ],
      "properties": {
        "type": { "const": "subscribe" },
        "request_id": { "$ref": "#/$defs/u64" },
        "authorization": {
          "type": "string",
          "minLength": 1,
          "maxLength": 262144
        }
      },
      "additionalProperties": false
    },
    {
      "type": "object",
      "required": [
        "type",
        "live_id",
        "authorization"
      ],
      "properties": {
        "type": { "const": "renew" },
        "live_id": { "$ref": "#/$defs/u64" },
        "authorization": {
          "type": "string",
          "minLength": 1,
          "maxLength": 262144
        }
      },
      "additionalProperties": false
    },
    {
      "type": "object",
      "required": ["type", "live_id"],
      "properties": {
        "type": { "const": "unsubscribe" },
        "live_id": { "$ref": "#/$defs/u64" }
      },
      "additionalProperties": false
    },
    {
      "type": "object",
      "required": ["type", "token"],
      "properties": {
        "type": { "enum": ["ping", "pong"] },
        "token": { "$ref": "#/$defs/heartbeatToken" }
      },
      "additionalProperties": false
    }
  ]
};
var pattern3 = /* @__PURE__ */ new RegExp("^(?:[1-9][0-9]{0,18}|1[0-7][0-9]{18}|18[0-3][0-9]{17}|184[0-3][0-9]{16}|1844[0-5][0-9]{15}|18446[0-6][0-9]{14}|184467[0-3][0-9]{13}|1844674[0-3][0-9]{12}|184467440[0-6][0-9]{10}|1844674407[0-2][0-9]{9}|18446744073[0-6][0-9]{8}|1844674407370[0-8][0-9]{6}|18446744073709[0-4][0-9]{5}|184467440737095[0-4][0-9]{4}|18446744073709550[0-9]{3}|18446744073709551[0-5][0-9]{2}|1844674407370955160[0-9]|1844674407370955161[0-5])$", "u");
function validate54(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  const evaluated0 = validate54.evaluated;
  if (evaluated0.dynamicProps) evaluated0.props = void 0;
  if (evaluated0.dynamicItems) evaluated0.items = void 0;
  if (typeof data === "string") {
    if (!pattern3.test(data)) {
      validate54.errors = [{
        instancePath,
        schemaPath: "#/pattern",
        keyword: "pattern",
        params: { pattern: "^(?:[1-9][0-9]{0,18}|1[0-7][0-9]{18}|18[0-3][0-9]{17}|184[0-3][0-9]{16}|1844[0-5][0-9]{15}|18446[0-6][0-9]{14}|184467[0-3][0-9]{13}|1844674[0-3][0-9]{12}|184467440[0-6][0-9]{10}|1844674407[0-2][0-9]{9}|18446744073[0-6][0-9]{8}|1844674407370[0-8][0-9]{6}|18446744073709[0-4][0-9]{5}|184467440737095[0-4][0-9]{4}|18446744073709550[0-9]{3}|18446744073709551[0-5][0-9]{2}|1844674407370955160[0-9]|1844674407370955161[0-5])$" }
      }];
      return false;
    }
  } else {
    validate54.errors = [{
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "string" }
    }];
    return false;
  }
  validate54.errors = vErrors;
  return true;
}
validate54.evaluated = {
  "dynamicProps": false,
  "dynamicItems": false
};
var pattern4 = /* @__PURE__ */ new RegExp("^[^\\u0000-\\u001f\\u007f-\\u009f]{1,64}$", "u");
function validate58(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  const evaluated0 = validate58.evaluated;
  if (evaluated0.dynamicProps) evaluated0.props = void 0;
  if (evaluated0.dynamicItems) evaluated0.items = void 0;
  if (typeof data === "string") {
    if (!pattern4.test(data)) {
      validate58.errors = [{
        instancePath,
        schemaPath: "#/pattern",
        keyword: "pattern",
        params: { pattern: "^[^\\u0000-\\u001f\\u007f-\\u009f]{1,64}$" }
      }];
      return false;
    }
  } else {
    validate58.errors = [{
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "string" }
    }];
    return false;
  }
  validate58.errors = vErrors;
  return true;
}
validate58.evaluated = {
  "dynamicProps": false,
  "dynamicItems": false
};
var func1 = (value) => {
  let length = 0;
  for (const _codePoint of value) length++;
  return length;
};
function validate133(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate133.evaluated;
  if (evaluated0.dynamicProps) evaluated0.props = void 0;
  if (evaluated0.dynamicItems) evaluated0.items = void 0;
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      const tag0 = data.type;
      if (typeof tag0 == "string") {
        if (tag0 === "subscribe") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing0;
              if (data.type === void 0 && (missing0 = "type") || data.request_id === void 0 && (missing0 = "request_id") || data.authorization === void 0 && (missing0 = "authorization")) {
                validate133.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/0/required",
                  keyword: "required",
                  params: { missingProperty: missing0 }
                }];
                return false;
              } else {
                const _errs4 = errors;
                for (const key0 in data) if (!(key0 === "type" || key0 === "request_id" || key0 === "authorization")) {
                  validate133.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/0/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key0 }
                  }];
                  return false;
                }
                if (_errs4 === errors) {
                  if (data.type !== void 0) {
                    const _errs5 = errors;
                    if ("subscribe" !== data.type) {
                      validate133.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/0/properties/type/const",
                        keyword: "const",
                        params: { allowedValue: "subscribe" }
                      }];
                      return false;
                    }
                    var valid2 = _errs5 === errors;
                  } else var valid2 = true;
                  if (valid2) {
                    if (data.request_id !== void 0) {
                      const _errs6 = errors;
                      if (!validate54(data.request_id, {
                        instancePath: instancePath + "/request_id",
                        parentData: data,
                        parentDataProperty: "request_id",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                        errors = vErrors.length;
                      }
                      var valid2 = _errs6 === errors;
                    } else var valid2 = true;
                    if (valid2) {
                      if (data.authorization !== void 0) {
                        let data2 = data.authorization;
                        const _errs7 = errors;
                        if (errors === _errs7) {
                          if (typeof data2 === "string") {
                            if (func1(data2) > 262144) {
                              validate133.errors = [{
                                instancePath: instancePath + "/authorization",
                                schemaPath: "#/oneOf/0/properties/authorization/maxLength",
                                keyword: "maxLength",
                                params: { limit: 262144 }
                              }];
                              return false;
                            } else if (func1(data2) < 1) {
                              validate133.errors = [{
                                instancePath: instancePath + "/authorization",
                                schemaPath: "#/oneOf/0/properties/authorization/minLength",
                                keyword: "minLength",
                                params: { limit: 1 }
                              }];
                              return false;
                            }
                          } else {
                            validate133.errors = [{
                              instancePath: instancePath + "/authorization",
                              schemaPath: "#/oneOf/0/properties/authorization/type",
                              keyword: "type",
                              params: { type: "string" }
                            }];
                            return false;
                          }
                        }
                        var valid2 = _errs7 === errors;
                      } else var valid2 = true;
                    }
                  }
                }
              }
            } else {
              validate133.errors = [{
                instancePath,
                schemaPath: "#/oneOf/0/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          var props0 = true;
        } else if (tag0 === "renew") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing1;
              if (data.type === void 0 && (missing1 = "type") || data.live_id === void 0 && (missing1 = "live_id") || data.authorization === void 0 && (missing1 = "authorization")) {
                validate133.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/1/required",
                  keyword: "required",
                  params: { missingProperty: missing1 }
                }];
                return false;
              } else {
                const _errs11 = errors;
                for (const key1 in data) if (!(key1 === "type" || key1 === "live_id" || key1 === "authorization")) {
                  validate133.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/1/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key1 }
                  }];
                  return false;
                }
                if (_errs11 === errors) {
                  if (data.type !== void 0) {
                    const _errs12 = errors;
                    if ("renew" !== data.type) {
                      validate133.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/1/properties/type/const",
                        keyword: "const",
                        params: { allowedValue: "renew" }
                      }];
                      return false;
                    }
                    var valid4 = _errs12 === errors;
                  } else var valid4 = true;
                  if (valid4) {
                    if (data.live_id !== void 0) {
                      const _errs13 = errors;
                      if (!validate54(data.live_id, {
                        instancePath: instancePath + "/live_id",
                        parentData: data,
                        parentDataProperty: "live_id",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                        errors = vErrors.length;
                      }
                      var valid4 = _errs13 === errors;
                    } else var valid4 = true;
                    if (valid4) {
                      if (data.authorization !== void 0) {
                        let data5 = data.authorization;
                        const _errs14 = errors;
                        if (errors === _errs14) {
                          if (typeof data5 === "string") {
                            if (func1(data5) > 262144) {
                              validate133.errors = [{
                                instancePath: instancePath + "/authorization",
                                schemaPath: "#/oneOf/1/properties/authorization/maxLength",
                                keyword: "maxLength",
                                params: { limit: 262144 }
                              }];
                              return false;
                            } else if (func1(data5) < 1) {
                              validate133.errors = [{
                                instancePath: instancePath + "/authorization",
                                schemaPath: "#/oneOf/1/properties/authorization/minLength",
                                keyword: "minLength",
                                params: { limit: 1 }
                              }];
                              return false;
                            }
                          } else {
                            validate133.errors = [{
                              instancePath: instancePath + "/authorization",
                              schemaPath: "#/oneOf/1/properties/authorization/type",
                              keyword: "type",
                              params: { type: "string" }
                            }];
                            return false;
                          }
                        }
                        var valid4 = _errs14 === errors;
                      } else var valid4 = true;
                    }
                  }
                }
              }
            } else {
              validate133.errors = [{
                instancePath,
                schemaPath: "#/oneOf/1/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          if (props0 !== true) props0 = true;
        } else if (tag0 === "unsubscribe") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing2;
              if (data.type === void 0 && (missing2 = "type") || data.live_id === void 0 && (missing2 = "live_id")) {
                validate133.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/2/required",
                  keyword: "required",
                  params: { missingProperty: missing2 }
                }];
                return false;
              } else {
                const _errs18 = errors;
                for (const key2 in data) if (!(key2 === "type" || key2 === "live_id")) {
                  validate133.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/2/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key2 }
                  }];
                  return false;
                }
                if (_errs18 === errors) {
                  if (data.type !== void 0) {
                    const _errs19 = errors;
                    if ("unsubscribe" !== data.type) {
                      validate133.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/2/properties/type/const",
                        keyword: "const",
                        params: { allowedValue: "unsubscribe" }
                      }];
                      return false;
                    }
                    var valid6 = _errs19 === errors;
                  } else var valid6 = true;
                  if (valid6) {
                    if (data.live_id !== void 0) {
                      const _errs20 = errors;
                      if (!validate54(data.live_id, {
                        instancePath: instancePath + "/live_id",
                        parentData: data,
                        parentDataProperty: "live_id",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                        errors = vErrors.length;
                      }
                      var valid6 = _errs20 === errors;
                    } else var valid6 = true;
                  }
                }
              }
            } else {
              validate133.errors = [{
                instancePath,
                schemaPath: "#/oneOf/2/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          if (props0 !== true) props0 = true;
        } else if (tag0 === "ping") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing3;
              if (data.type === void 0 && (missing3 = "type") || data.token === void 0 && (missing3 = "token")) {
                validate133.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/3/required",
                  keyword: "required",
                  params: { missingProperty: missing3 }
                }];
                return false;
              } else {
                const _errs23 = errors;
                for (const key3 in data) if (!(key3 === "type" || key3 === "token")) {
                  validate133.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/3/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key3 }
                  }];
                  return false;
                }
                if (_errs23 === errors) {
                  if (data.type !== void 0) {
                    let data8 = data.type;
                    const _errs24 = errors;
                    if (!(data8 === "ping" || data8 === "pong")) {
                      validate133.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/3/properties/type/enum",
                        keyword: "enum",
                        params: { allowedValues: schema20.oneOf[3].properties.type.enum }
                      }];
                      return false;
                    }
                    var valid8 = _errs24 === errors;
                  } else var valid8 = true;
                  if (valid8) {
                    if (data.token !== void 0) {
                      const _errs25 = errors;
                      if (!validate58(data.token, {
                        instancePath: instancePath + "/token",
                        parentData: data,
                        parentDataProperty: "token",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate58.errors : vErrors.concat(validate58.errors);
                        errors = vErrors.length;
                      }
                      var valid8 = _errs25 === errors;
                    } else var valid8 = true;
                  }
                }
              }
            } else {
              validate133.errors = [{
                instancePath,
                schemaPath: "#/oneOf/3/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          if (props0 !== true) props0 = true;
        } else if (tag0 === "pong") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing4;
              if (data.type === void 0 && (missing4 = "type") || data.token === void 0 && (missing4 = "token")) {
                validate133.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/3/required",
                  keyword: "required",
                  params: { missingProperty: missing4 }
                }];
                return false;
              } else {
                const _errs28 = errors;
                for (const key4 in data) if (!(key4 === "type" || key4 === "token")) {
                  validate133.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/3/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key4 }
                  }];
                  return false;
                }
                if (_errs28 === errors) {
                  if (data.type !== void 0) {
                    let data10 = data.type;
                    const _errs29 = errors;
                    if (!(data10 === "ping" || data10 === "pong")) {
                      validate133.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/3/properties/type/enum",
                        keyword: "enum",
                        params: { allowedValues: schema20.oneOf[3].properties.type.enum }
                      }];
                      return false;
                    }
                    var valid10 = _errs29 === errors;
                  } else var valid10 = true;
                  if (valid10) {
                    if (data.token !== void 0) {
                      const _errs30 = errors;
                      if (!validate58(data.token, {
                        instancePath: instancePath + "/token",
                        parentData: data,
                        parentDataProperty: "token",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate58.errors : vErrors.concat(validate58.errors);
                        errors = vErrors.length;
                      }
                      var valid10 = _errs30 === errors;
                    } else var valid10 = true;
                  }
                }
              }
            } else {
              validate133.errors = [{
                instancePath,
                schemaPath: "#/oneOf/3/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          if (props0 !== true) props0 = true;
        } else {
          validate133.errors = [{
            instancePath,
            schemaPath: "#/discriminator",
            keyword: "discriminator",
            params: {
              error: "mapping",
              tag: "type",
              tagValue: tag0
            }
          }];
          return false;
        }
      } else {
        validate133.errors = [{
          instancePath,
          schemaPath: "#/discriminator",
          keyword: "discriminator",
          params: {
            error: "tag",
            tag: "type",
            tagValue: tag0
          }
        }];
        return false;
      }
    } else {
      validate133.errors = [{
        instancePath,
        schemaPath: "#/type",
        keyword: "type",
        params: { type: "object" }
      }];
      return false;
    }
  }
  validate133.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate133.evaluated = {
  "dynamicProps": true,
  "dynamicItems": false
};
var validateServerMessage = validate139;
var schema23 = {
  "type": "object",
  "discriminator": { "propertyName": "type" },
  "oneOf": [
    {
      "type": "object",
      "required": ["type"],
      "properties": { "type": { "const": "ready" } },
      "additionalProperties": false
    },
    {
      "type": "object",
      "required": [
        "type",
        "request_id",
        "live_id",
        "epoch",
        "first_sequence",
        "columns"
      ],
      "properties": {
        "type": { "const": "subscribed" },
        "request_id": { "$ref": "#/$defs/u64" },
        "live_id": { "$ref": "#/$defs/u64" },
        "epoch": { "$ref": "#/$defs/u64" },
        "first_sequence": { "$ref": "#/$defs/u64" },
        "columns": {
          "type": "array",
          "items": { "$ref": "#/$defs/column" }
        }
      },
      "additionalProperties": false
    },
    {
      "type": "object",
      "required": [
        "type",
        "request_id",
        "code",
        "message"
      ],
      "properties": {
        "type": { "const": "subscribe_rejected" },
        "request_id": { "$ref": "#/$defs/u64" },
        "code": { "enum": [
          "authorization_failed",
          "authorization_expired",
          "backend_unavailable",
          "backend_overloaded",
          "upstream_rejected",
          "resource_exhausted",
          "service_unavailable"
        ] },
        "message": { "type": "string" },
        "sqlstate": { "$ref": "#/$defs/sqlstate" },
        "retry_after_ms": { "$ref": "#/$defs/u32" }
      },
      "additionalProperties": false
    },
    {
      "type": "object",
      "required": ["type", "live_id"],
      "properties": {
        "type": { "enum": ["renewed", "unsubscribed"] },
        "live_id": { "$ref": "#/$defs/u64" }
      },
      "additionalProperties": false
    },
    {
      "type": "object",
      "required": [
        "type",
        "live_id",
        "epoch",
        "baseline_sync_attempt",
        "mvcc"
      ],
      "properties": {
        "type": { "const": "baseline_sync_start" },
        "live_id": { "$ref": "#/$defs/u64" },
        "epoch": { "$ref": "#/$defs/u64" },
        "baseline_sync_attempt": { "$ref": "#/$defs/u64" },
        "mvcc": { "$ref": "#/$defs/mvcc" }
      },
      "additionalProperties": false
    },
    {
      "type": "object",
      "required": [
        "type",
        "live_id",
        "epoch",
        "baseline_sync_attempt",
        "index",
        "rows"
      ],
      "properties": {
        "type": { "const": "baseline_sync_batch" },
        "live_id": { "$ref": "#/$defs/u64" },
        "epoch": { "$ref": "#/$defs/u64" },
        "baseline_sync_attempt": { "$ref": "#/$defs/u64" },
        "index": { "$ref": "#/$defs/u32" },
        "rows": {
          "type": "array",
          "items": { "$ref": "#/$defs/row" }
        }
      },
      "additionalProperties": false
    },
    {
      "type": "object",
      "required": [
        "type",
        "live_id",
        "epoch",
        "baseline_sync_attempt",
        "batch_count"
      ],
      "properties": {
        "type": { "const": "baseline_sync_end" },
        "live_id": { "$ref": "#/$defs/u64" },
        "epoch": { "$ref": "#/$defs/u64" },
        "baseline_sync_attempt": { "$ref": "#/$defs/u64" },
        "batch_count": { "$ref": "#/$defs/u32" }
      },
      "additionalProperties": false
    },
    {
      "type": "object",
      "required": ["type", "publication_id"],
      "properties": {
        "type": { "const": "open" },
        "publication_id": { "$ref": "#/$defs/publicationId" }
      },
      "additionalProperties": false
    },
    {
      "type": "object",
      "required": [
        "type",
        "publication_id",
        "index",
        "txids",
        "targets",
        "changes"
      ],
      "properties": {
        "type": { "const": "keyed_results" },
        "publication_id": { "$ref": "#/$defs/publicationId" },
        "index": { "$ref": "#/$defs/u32" },
        "txids": {
          "type": "array",
          "items": { "$ref": "#/$defs/u64" }
        },
        "targets": {
          "type": "array",
          "items": { "$ref": "#/$defs/changeTarget" }
        },
        "changes": {
          "type": "array",
          "items": { "$ref": "#/$defs/change" }
        }
      },
      "additionalProperties": false
    },
    {
      "type": "object",
      "required": [
        "type",
        "publication_id",
        "index",
        "targets"
      ],
      "properties": {
        "type": { "const": "reset_required" },
        "publication_id": { "$ref": "#/$defs/publicationId" },
        "index": { "$ref": "#/$defs/u32" },
        "targets": {
          "type": "array",
          "items": { "$ref": "#/$defs/resetTarget" }
        }
      },
      "additionalProperties": false
    },
    {
      "type": "object",
      "required": [
        "type",
        "publication_id",
        "body_count",
        "frontier"
      ],
      "properties": {
        "type": { "const": "commit" },
        "publication_id": { "$ref": "#/$defs/publicationId" },
        "body_count": { "$ref": "#/$defs/u32" },
        "frontier": {
          "type": "object",
          "required": ["lsn"],
          "properties": { "lsn": {
            "type": "string",
            "pattern": "^(0|[1-9A-F][0-9A-F]{0,7})/(0|[1-9A-F][0-9A-F]{0,7})$"
          } },
          "additionalProperties": false
        }
      },
      "additionalProperties": false
    },
    {
      "type": "object",
      "required": [
        "type",
        "live_id",
        "code",
        "message"
      ],
      "properties": {
        "type": { "const": "subscription_error" },
        "live_id": { "$ref": "#/$defs/u64" },
        "code": { "enum": [
          "authorization_expired",
          "renewal_failed",
          "upstream_cancelled",
          "backend_overloaded",
          "baseline_sync_failed",
          "protocol_error"
        ] },
        "message": { "type": "string" },
        "sqlstate": { "$ref": "#/$defs/sqlstate" },
        "retry_after_ms": { "$ref": "#/$defs/u32" }
      },
      "additionalProperties": false
    },
    {
      "type": "object",
      "required": [
        "type",
        "code",
        "message"
      ],
      "properties": {
        "type": { "const": "connection_error" },
        "code": { "enum": [
          "protocol_error",
          "invalid_payload",
          "message_too_large",
          "resource_exhausted",
          "slow_consumer",
          "heartbeat_timeout",
          "backend_session_lost",
          "backend_protocol_error",
          "fence_failed",
          "internal_error"
        ] },
        "message": { "type": "string" }
      },
      "additionalProperties": false
    },
    {
      "type": "object",
      "required": ["type", "token"],
      "properties": {
        "type": { "enum": ["ping", "pong"] },
        "token": { "$ref": "#/$defs/heartbeatToken" }
      },
      "additionalProperties": false
    },
    {
      "type": "object",
      "$comment": "Ordered installed-processing progress, shared by the connection's subscriptions. Covered changes must precede this message; subscriptions may apply the proof only after their baseline and covered changes are installed.",
      "required": ["type", "mvcc"],
      "properties": {
        "type": { "const": "progress" },
        "mvcc": { "$ref": "#/$defs/mvcc" }
      },
      "additionalProperties": false
    }
  ]
};
var schema24 = {
  "type": "object",
  "required": [
    "name",
    "type_oid",
    "typmod",
    "codec"
  ],
  "properties": {
    "name": { "type": "string" },
    "type_oid": {
      "type": "integer",
      "minimum": 1,
      "maximum": 4294967295
    },
    "typmod": { "$ref": "#/$defs/i32" },
    "codec": { "enum": ["pg_text", "bytes"] }
  },
  "additionalProperties": false
};
function validate68(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  const evaluated0 = validate68.evaluated;
  if (evaluated0.dynamicProps) evaluated0.props = void 0;
  if (evaluated0.dynamicItems) evaluated0.items = void 0;
  if (!(typeof data == "number" && !(data % 1) && !isNaN(data) && isFinite(data))) {
    validate68.errors = [{
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "integer" }
    }];
    return false;
  }
  if (typeof data == "number" && isFinite(data)) {
    if (data > 2147483647 || isNaN(data)) {
      validate68.errors = [{
        instancePath,
        schemaPath: "#/maximum",
        keyword: "maximum",
        params: {
          comparison: "<=",
          limit: 2147483647
        }
      }];
      return false;
    } else if (data < -2147483648 || isNaN(data)) {
      validate68.errors = [{
        instancePath,
        schemaPath: "#/minimum",
        keyword: "minimum",
        params: {
          comparison: ">=",
          limit: -2147483648
        }
      }];
      return false;
    }
  }
  validate68.errors = vErrors;
  return true;
}
validate68.evaluated = {
  "dynamicProps": false,
  "dynamicItems": false
};
function validate67(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate67.evaluated;
  if (evaluated0.dynamicProps) evaluated0.props = void 0;
  if (evaluated0.dynamicItems) evaluated0.items = void 0;
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.name === void 0 && (missing0 = "name") || data.type_oid === void 0 && (missing0 = "type_oid") || data.typmod === void 0 && (missing0 = "typmod") || data.codec === void 0 && (missing0 = "codec")) {
        validate67.errors = [{
          instancePath,
          schemaPath: "#/required",
          keyword: "required",
          params: { missingProperty: missing0 }
        }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) if (!(key0 === "name" || key0 === "type_oid" || key0 === "typmod" || key0 === "codec")) {
          validate67.errors = [{
            instancePath,
            schemaPath: "#/additionalProperties",
            keyword: "additionalProperties",
            params: { additionalProperty: key0 }
          }];
          return false;
        }
        if (_errs1 === errors) {
          if (data.name !== void 0) {
            const _errs2 = errors;
            if (typeof data.name !== "string") {
              validate67.errors = [{
                instancePath: instancePath + "/name",
                schemaPath: "#/properties/name/type",
                keyword: "type",
                params: { type: "string" }
              }];
              return false;
            }
            var valid0 = _errs2 === errors;
          } else var valid0 = true;
          if (valid0) {
            if (data.type_oid !== void 0) {
              let data1 = data.type_oid;
              const _errs4 = errors;
              if (!(typeof data1 == "number" && !(data1 % 1) && !isNaN(data1) && isFinite(data1))) {
                validate67.errors = [{
                  instancePath: instancePath + "/type_oid",
                  schemaPath: "#/properties/type_oid/type",
                  keyword: "type",
                  params: { type: "integer" }
                }];
                return false;
              }
              if (errors === _errs4) {
                if (typeof data1 == "number" && isFinite(data1)) {
                  if (data1 > 4294967295 || isNaN(data1)) {
                    validate67.errors = [{
                      instancePath: instancePath + "/type_oid",
                      schemaPath: "#/properties/type_oid/maximum",
                      keyword: "maximum",
                      params: {
                        comparison: "<=",
                        limit: 4294967295
                      }
                    }];
                    return false;
                  } else if (data1 < 1 || isNaN(data1)) {
                    validate67.errors = [{
                      instancePath: instancePath + "/type_oid",
                      schemaPath: "#/properties/type_oid/minimum",
                      keyword: "minimum",
                      params: {
                        comparison: ">=",
                        limit: 1
                      }
                    }];
                    return false;
                  }
                }
              }
              var valid0 = _errs4 === errors;
            } else var valid0 = true;
            if (valid0) {
              if (data.typmod !== void 0) {
                const _errs6 = errors;
                if (!validate68(data.typmod, {
                  instancePath: instancePath + "/typmod",
                  parentData: data,
                  parentDataProperty: "typmod",
                  rootData,
                  dynamicAnchors
                })) {
                  vErrors = vErrors === null ? validate68.errors : vErrors.concat(validate68.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs6 === errors;
              } else var valid0 = true;
              if (valid0) {
                if (data.codec !== void 0) {
                  let data3 = data.codec;
                  const _errs7 = errors;
                  if (!(data3 === "pg_text" || data3 === "bytes")) {
                    validate67.errors = [{
                      instancePath: instancePath + "/codec",
                      schemaPath: "#/properties/codec/enum",
                      keyword: "enum",
                      params: { allowedValues: schema24.properties.codec.enum }
                    }];
                    return false;
                  }
                  var valid0 = _errs7 === errors;
                } else var valid0 = true;
              }
            }
          }
        }
      }
    } else {
      validate67.errors = [{
        instancePath,
        schemaPath: "#/type",
        keyword: "type",
        params: { type: "object" }
      }];
      return false;
    }
  }
  validate67.errors = vErrors;
  return errors === 0;
}
validate67.evaluated = {
  "props": true,
  "dynamicProps": false,
  "dynamicItems": false
};
var pattern5 = /* @__PURE__ */ new RegExp("^[0-9A-Z]{5}$", "u");
function validate72(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  const evaluated0 = validate72.evaluated;
  if (evaluated0.dynamicProps) evaluated0.props = void 0;
  if (evaluated0.dynamicItems) evaluated0.items = void 0;
  if (typeof data === "string") {
    if (!pattern5.test(data)) {
      validate72.errors = [{
        instancePath,
        schemaPath: "#/pattern",
        keyword: "pattern",
        params: { pattern: "^[0-9A-Z]{5}$" }
      }];
      return false;
    }
  } else {
    validate72.errors = [{
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "string" }
    }];
    return false;
  }
  validate72.errors = vErrors;
  return true;
}
validate72.evaluated = {
  "dynamicProps": false,
  "dynamicItems": false
};
function validate74(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  const evaluated0 = validate74.evaluated;
  if (evaluated0.dynamicProps) evaluated0.props = void 0;
  if (evaluated0.dynamicItems) evaluated0.items = void 0;
  if (!(typeof data == "number" && !(data % 1) && !isNaN(data) && isFinite(data))) {
    validate74.errors = [{
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "integer" }
    }];
    return false;
  }
  if (typeof data == "number" && isFinite(data)) {
    if (data > 4294967295 || isNaN(data)) {
      validate74.errors = [{
        instancePath,
        schemaPath: "#/maximum",
        keyword: "maximum",
        params: {
          comparison: "<=",
          limit: 4294967295
        }
      }];
      return false;
    } else if (data < 0 || isNaN(data)) {
      validate74.errors = [{
        instancePath,
        schemaPath: "#/minimum",
        keyword: "minimum",
        params: {
          comparison: ">=",
          limit: 0
        }
      }];
      return false;
    }
  }
  validate74.errors = vErrors;
  return true;
}
validate74.evaluated = {
  "dynamicProps": false,
  "dynamicItems": false
};
function validate81(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate81.evaluated;
  if (evaluated0.dynamicProps) evaluated0.props = void 0;
  if (evaluated0.dynamicItems) evaluated0.items = void 0;
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.xmin === void 0 && (missing0 = "xmin") || data.xmax === void 0 && (missing0 = "xmax") || data.xip === void 0 && (missing0 = "xip")) {
        validate81.errors = [{
          instancePath,
          schemaPath: "#/required",
          keyword: "required",
          params: { missingProperty: missing0 }
        }];
        return false;
      } else {
        const _errs2 = errors;
        for (const key0 in data) if (!(key0 === "xmin" || key0 === "xmax" || key0 === "xip")) {
          validate81.errors = [{
            instancePath,
            schemaPath: "#/additionalProperties",
            keyword: "additionalProperties",
            params: { additionalProperty: key0 }
          }];
          return false;
        }
        if (_errs2 === errors) {
          if (data.xmin !== void 0) {
            const _errs3 = errors;
            if (!validate54(data.xmin, {
              instancePath: instancePath + "/xmin",
              parentData: data,
              parentDataProperty: "xmin",
              rootData,
              dynamicAnchors
            })) {
              vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs3 === errors;
          } else var valid0 = true;
          if (valid0) {
            if (data.xmax !== void 0) {
              const _errs4 = errors;
              if (!validate54(data.xmax, {
                instancePath: instancePath + "/xmax",
                parentData: data,
                parentDataProperty: "xmax",
                rootData,
                dynamicAnchors
              })) {
                vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                errors = vErrors.length;
              }
              var valid0 = _errs4 === errors;
            } else var valid0 = true;
            if (valid0) {
              if (data.xip !== void 0) {
                let data2 = data.xip;
                const _errs5 = errors;
                if (errors === _errs5) {
                  if (Array.isArray(data2)) {
                    const len0 = data2.length;
                    for (let i0 = 0; i0 < len0; i0++) {
                      const _errs7 = errors;
                      if (!validate54(data2[i0], {
                        instancePath: instancePath + "/xip/" + i0,
                        parentData: data2,
                        parentDataProperty: i0,
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                        errors = vErrors.length;
                      }
                      if (!(_errs7 === errors)) break;
                    }
                  } else {
                    validate81.errors = [{
                      instancePath: instancePath + "/xip",
                      schemaPath: "#/properties/xip/type",
                      keyword: "type",
                      params: { type: "array" }
                    }];
                    return false;
                  }
                }
                var valid0 = _errs5 === errors;
              } else var valid0 = true;
            }
          }
        }
      }
    } else {
      validate81.errors = [{
        instancePath,
        schemaPath: "#/type",
        keyword: "type",
        params: { type: "object" }
      }];
      return false;
    }
  }
  validate81.errors = vErrors;
  return errors === 0;
}
validate81.evaluated = {
  "props": true,
  "dynamicProps": false,
  "dynamicItems": false
};
var pattern6 = /* @__PURE__ */ new RegExp("^[0-9a-f]{64}$", "u");
function validate91(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  const evaluated0 = validate91.evaluated;
  if (evaluated0.dynamicProps) evaluated0.props = void 0;
  if (evaluated0.dynamicItems) evaluated0.items = void 0;
  if (typeof data === "string") {
    if (!pattern6.test(data)) {
      validate91.errors = [{
        instancePath,
        schemaPath: "#/pattern",
        keyword: "pattern",
        params: { pattern: "^[0-9a-f]{64}$" }
      }];
      return false;
    }
  } else {
    validate91.errors = [{
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "string" }
    }];
    return false;
  }
  validate91.errors = vErrors;
  return true;
}
validate91.evaluated = {
  "dynamicProps": false,
  "dynamicItems": false
};
var pattern7 = /* @__PURE__ */ new RegExp("^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/][AQgw]==|[A-Za-z0-9+/]{2}[AEIMQUYcgkosw048]=)?$", "u");
function validate94(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  const evaluated0 = validate94.evaluated;
  if (evaluated0.dynamicProps) evaluated0.props = void 0;
  if (evaluated0.dynamicItems) evaluated0.items = void 0;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    let missing0;
    if (data.base64 === void 0 && (missing0 = "base64")) {
      validate94.errors = [{
        instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: { missingProperty: missing0 }
      }];
      return false;
    } else {
      for (const key0 in data) if (!(key0 === "base64")) {
        validate94.errors = [{
          instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: { additionalProperty: key0 }
        }];
        return false;
      }
      if (data.base64 !== void 0) {
        let data0 = data.base64;
        if (typeof data0 === "string") {
          if (!pattern7.test(data0)) {
            validate94.errors = [{
              instancePath: instancePath + "/base64",
              schemaPath: "#/properties/base64/pattern",
              keyword: "pattern",
              params: { pattern: "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/][AQgw]==|[A-Za-z0-9+/]{2}[AEIMQUYcgkosw048]=)?$" }
            }];
            return false;
          }
        } else {
          validate94.errors = [{
            instancePath: instancePath + "/base64",
            schemaPath: "#/properties/base64/type",
            keyword: "type",
            params: { type: "string" }
          }];
          return false;
        }
      }
    }
  } else {
    validate94.errors = [{
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "object" }
    }];
    return false;
  }
  validate94.errors = vErrors;
  return true;
}
validate94.evaluated = {
  "props": true,
  "dynamicProps": false,
  "dynamicItems": false
};
function validate93(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate93.evaluated;
  if (evaluated0.dynamicProps) evaluated0.props = void 0;
  if (evaluated0.dynamicItems) evaluated0.items = void 0;
  const _errs0 = errors;
  let valid0 = false;
  let passing0 = null;
  const _errs1 = errors;
  if (data !== null) {
    const err0 = {
      instancePath,
      schemaPath: "#/oneOf/0/type",
      keyword: "type",
      params: { type: "null" }
    };
    if (vErrors === null) vErrors = [err0];
    else vErrors.push(err0);
    errors++;
  }
  var _valid0 = _errs1 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
  }
  const _errs3 = errors;
  if (typeof data !== "string") {
    const err1 = {
      instancePath,
      schemaPath: "#/oneOf/1/type",
      keyword: "type",
      params: { type: "string" }
    };
    if (vErrors === null) vErrors = [err1];
    else vErrors.push(err1);
    errors++;
  }
  var _valid0 = _errs3 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
    }
    const _errs5 = errors;
    if (!validate94(data, {
      instancePath,
      parentData,
      parentDataProperty,
      rootData,
      dynamicAnchors
    })) {
      vErrors = vErrors === null ? validate94.errors : vErrors.concat(validate94.errors);
      errors = vErrors.length;
    }
    var _valid0 = _errs5 === errors;
    if (_valid0 && valid0) {
      valid0 = false;
      passing0 = [passing0, 2];
    } else if (_valid0) {
      valid0 = true;
      passing0 = 2;
      var props0 = true;
    }
  }
  if (!valid0) {
    const err2 = {
      instancePath,
      schemaPath: "#/oneOf",
      keyword: "oneOf",
      params: { passingSchemas: passing0 }
    };
    if (vErrors === null) vErrors = [err2];
    else vErrors.push(err2);
    errors++;
    validate93.errors = vErrors;
    return false;
  } else {
    errors = _errs0;
    if (vErrors !== null) {
      if (_errs0) vErrors.length = _errs0;
      else vErrors = null;
    }
  }
  validate93.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate93.evaluated = {
  "dynamicProps": true,
  "dynamicItems": false
};
function validate90(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate90.evaluated;
  if (evaluated0.dynamicProps) evaluated0.props = void 0;
  if (evaluated0.dynamicItems) evaluated0.items = void 0;
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.row_key === void 0 && (missing0 = "row_key") || data.values === void 0 && (missing0 = "values")) {
        validate90.errors = [{
          instancePath,
          schemaPath: "#/required",
          keyword: "required",
          params: { missingProperty: missing0 }
        }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) if (!(key0 === "row_key" || key0 === "values")) {
          validate90.errors = [{
            instancePath,
            schemaPath: "#/additionalProperties",
            keyword: "additionalProperties",
            params: { additionalProperty: key0 }
          }];
          return false;
        }
        if (_errs1 === errors) {
          if (data.row_key !== void 0) {
            const _errs2 = errors;
            if (!validate91(data.row_key, {
              instancePath: instancePath + "/row_key",
              parentData: data,
              parentDataProperty: "row_key",
              rootData,
              dynamicAnchors
            })) {
              vErrors = vErrors === null ? validate91.errors : vErrors.concat(validate91.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else var valid0 = true;
          if (valid0) {
            if (data.values !== void 0) {
              let data1 = data.values;
              const _errs3 = errors;
              if (errors === _errs3) {
                if (Array.isArray(data1)) {
                  const len0 = data1.length;
                  for (let i0 = 0; i0 < len0; i0++) {
                    const _errs5 = errors;
                    if (!validate93(data1[i0], {
                      instancePath: instancePath + "/values/" + i0,
                      parentData: data1,
                      parentDataProperty: i0,
                      rootData,
                      dynamicAnchors
                    })) {
                      vErrors = vErrors === null ? validate93.errors : vErrors.concat(validate93.errors);
                      errors = vErrors.length;
                    }
                    if (!(_errs5 === errors)) break;
                  }
                } else {
                  validate90.errors = [{
                    instancePath: instancePath + "/values",
                    schemaPath: "#/properties/values/type",
                    keyword: "type",
                    params: { type: "array" }
                  }];
                  return false;
                }
              }
              var valid0 = _errs3 === errors;
            } else var valid0 = true;
          }
        }
      }
    } else {
      validate90.errors = [{
        instancePath,
        schemaPath: "#/type",
        keyword: "type",
        params: { type: "object" }
      }];
      return false;
    }
  }
  validate90.errors = vErrors;
  return errors === 0;
}
validate90.evaluated = {
  "props": true,
  "dynamicProps": false,
  "dynamicItems": false
};
function validate102(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  const evaluated0 = validate102.evaluated;
  if (evaluated0.dynamicProps) evaluated0.props = void 0;
  if (evaluated0.dynamicItems) evaluated0.items = void 0;
  if (typeof data === "string") {
    if (func1(data) > 64) {
      validate102.errors = [{
        instancePath,
        schemaPath: "#/maxLength",
        keyword: "maxLength",
        params: { limit: 64 }
      }];
      return false;
    } else if (func1(data) < 1) {
      validate102.errors = [{
        instancePath,
        schemaPath: "#/minLength",
        keyword: "minLength",
        params: { limit: 1 }
      }];
      return false;
    }
  } else {
    validate102.errors = [{
      instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: { type: "string" }
    }];
    return false;
  }
  validate102.errors = vErrors;
  return true;
}
validate102.evaluated = {
  "dynamicProps": false,
  "dynamicItems": false
};
function validate107(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate107.evaluated;
  if (evaluated0.dynamicProps) evaluated0.props = void 0;
  if (evaluated0.dynamicItems) evaluated0.items = void 0;
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.live_id === void 0 && (missing0 = "live_id") || data.epoch === void 0 && (missing0 = "epoch") || data.sequence === void 0 && (missing0 = "sequence")) {
        validate107.errors = [{
          instancePath,
          schemaPath: "#/required",
          keyword: "required",
          params: { missingProperty: missing0 }
        }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) if (!(key0 === "live_id" || key0 === "epoch" || key0 === "sequence")) {
          validate107.errors = [{
            instancePath,
            schemaPath: "#/additionalProperties",
            keyword: "additionalProperties",
            params: { additionalProperty: key0 }
          }];
          return false;
        }
        if (_errs1 === errors) {
          if (data.live_id !== void 0) {
            const _errs2 = errors;
            if (!validate54(data.live_id, {
              instancePath: instancePath + "/live_id",
              parentData: data,
              parentDataProperty: "live_id",
              rootData,
              dynamicAnchors
            })) {
              vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else var valid0 = true;
          if (valid0) {
            if (data.epoch !== void 0) {
              const _errs3 = errors;
              if (!validate54(data.epoch, {
                instancePath: instancePath + "/epoch",
                parentData: data,
                parentDataProperty: "epoch",
                rootData,
                dynamicAnchors
              })) {
                vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                errors = vErrors.length;
              }
              var valid0 = _errs3 === errors;
            } else var valid0 = true;
            if (valid0) {
              if (data.sequence !== void 0) {
                const _errs4 = errors;
                if (!validate54(data.sequence, {
                  instancePath: instancePath + "/sequence",
                  parentData: data,
                  parentDataProperty: "sequence",
                  rootData,
                  dynamicAnchors
                })) {
                  vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs4 === errors;
              } else var valid0 = true;
            }
          }
        }
      }
    } else {
      validate107.errors = [{
        instancePath,
        schemaPath: "#/type",
        keyword: "type",
        params: { type: "object" }
      }];
      return false;
    }
  }
  validate107.errors = vErrors;
  return errors === 0;
}
validate107.evaluated = {
  "props": true,
  "dynamicProps": false,
  "dynamicItems": false
};
function validate112(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate112.evaluated;
  if (evaluated0.dynamicProps) evaluated0.props = void 0;
  if (evaluated0.dynamicItems) evaluated0.items = void 0;
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      const tag0 = data.op;
      if (typeof tag0 == "string") {
        if (tag0 === "upsert") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing0;
              if (data.op === void 0 && (missing0 = "op") || data.row_key === void 0 && (missing0 = "row_key") || data.values === void 0 && (missing0 = "values")) {
                validate112.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/0/required",
                  keyword: "required",
                  params: { missingProperty: missing0 }
                }];
                return false;
              } else {
                const _errs4 = errors;
                for (const key0 in data) if (!(key0 === "op" || key0 === "row_key" || key0 === "values")) {
                  validate112.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/0/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key0 }
                  }];
                  return false;
                }
                if (_errs4 === errors) {
                  if (data.op !== void 0) {
                    const _errs5 = errors;
                    if ("upsert" !== data.op) {
                      validate112.errors = [{
                        instancePath: instancePath + "/op",
                        schemaPath: "#/oneOf/0/properties/op/const",
                        keyword: "const",
                        params: { allowedValue: "upsert" }
                      }];
                      return false;
                    }
                    var valid2 = _errs5 === errors;
                  } else var valid2 = true;
                  if (valid2) {
                    if (data.row_key !== void 0) {
                      const _errs6 = errors;
                      if (!validate91(data.row_key, {
                        instancePath: instancePath + "/row_key",
                        parentData: data,
                        parentDataProperty: "row_key",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate91.errors : vErrors.concat(validate91.errors);
                        errors = vErrors.length;
                      }
                      var valid2 = _errs6 === errors;
                    } else var valid2 = true;
                    if (valid2) {
                      if (data.values !== void 0) {
                        let data2 = data.values;
                        const _errs7 = errors;
                        if (errors === _errs7) {
                          if (Array.isArray(data2)) {
                            const len0 = data2.length;
                            for (let i0 = 0; i0 < len0; i0++) {
                              const _errs9 = errors;
                              if (!validate93(data2[i0], {
                                instancePath: instancePath + "/values/" + i0,
                                parentData: data2,
                                parentDataProperty: i0,
                                rootData,
                                dynamicAnchors
                              })) {
                                vErrors = vErrors === null ? validate93.errors : vErrors.concat(validate93.errors);
                                errors = vErrors.length;
                              }
                              if (!(_errs9 === errors)) break;
                            }
                          } else {
                            validate112.errors = [{
                              instancePath: instancePath + "/values",
                              schemaPath: "#/oneOf/0/properties/values/type",
                              keyword: "type",
                              params: { type: "array" }
                            }];
                            return false;
                          }
                        }
                        var valid2 = _errs7 === errors;
                      } else var valid2 = true;
                    }
                  }
                }
              }
            } else {
              validate112.errors = [{
                instancePath,
                schemaPath: "#/oneOf/0/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          var props1 = true;
        } else if (tag0 === "remove") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing1;
              if (data.op === void 0 && (missing1 = "op") || data.row_key === void 0 && (missing1 = "row_key")) {
                validate112.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/1/required",
                  keyword: "required",
                  params: { missingProperty: missing1 }
                }];
                return false;
              } else {
                const _errs12 = errors;
                for (const key1 in data) if (!(key1 === "op" || key1 === "row_key")) {
                  validate112.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/1/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key1 }
                  }];
                  return false;
                }
                if (_errs12 === errors) {
                  if (data.op !== void 0) {
                    const _errs13 = errors;
                    if ("remove" !== data.op) {
                      validate112.errors = [{
                        instancePath: instancePath + "/op",
                        schemaPath: "#/oneOf/1/properties/op/const",
                        keyword: "const",
                        params: { allowedValue: "remove" }
                      }];
                      return false;
                    }
                    var valid5 = _errs13 === errors;
                  } else var valid5 = true;
                  if (valid5) {
                    if (data.row_key !== void 0) {
                      const _errs14 = errors;
                      if (!validate91(data.row_key, {
                        instancePath: instancePath + "/row_key",
                        parentData: data,
                        parentDataProperty: "row_key",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate91.errors : vErrors.concat(validate91.errors);
                        errors = vErrors.length;
                      }
                      var valid5 = _errs14 === errors;
                    } else var valid5 = true;
                  }
                }
              }
            } else {
              validate112.errors = [{
                instancePath,
                schemaPath: "#/oneOf/1/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          if (props1 !== true) props1 = true;
        } else {
          validate112.errors = [{
            instancePath,
            schemaPath: "#/discriminator",
            keyword: "discriminator",
            params: {
              error: "mapping",
              tag: "op",
              tagValue: tag0
            }
          }];
          return false;
        }
      } else {
        validate112.errors = [{
          instancePath,
          schemaPath: "#/discriminator",
          keyword: "discriminator",
          params: {
            error: "tag",
            tag: "op",
            tagValue: tag0
          }
        }];
        return false;
      }
    } else {
      validate112.errors = [{
        instancePath,
        schemaPath: "#/type",
        keyword: "type",
        params: { type: "object" }
      }];
      return false;
    }
  }
  validate112.errors = vErrors;
  evaluated0.props = props1;
  return errors === 0;
}
validate112.evaluated = {
  "dynamicProps": true,
  "dynamicItems": false
};
function validate119(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate119.evaluated;
  if (evaluated0.dynamicProps) evaluated0.props = void 0;
  if (evaluated0.dynamicItems) evaluated0.items = void 0;
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.live_id === void 0 && (missing0 = "live_id") || data.epoch === void 0 && (missing0 = "epoch") || data.first_sequence === void 0 && (missing0 = "first_sequence")) {
        validate119.errors = [{
          instancePath,
          schemaPath: "#/required",
          keyword: "required",
          params: { missingProperty: missing0 }
        }];
        return false;
      } else {
        const _errs1 = errors;
        for (const key0 in data) if (!(key0 === "live_id" || key0 === "epoch" || key0 === "first_sequence")) {
          validate119.errors = [{
            instancePath,
            schemaPath: "#/additionalProperties",
            keyword: "additionalProperties",
            params: { additionalProperty: key0 }
          }];
          return false;
        }
        if (_errs1 === errors) {
          if (data.live_id !== void 0) {
            const _errs2 = errors;
            if (!validate54(data.live_id, {
              instancePath: instancePath + "/live_id",
              parentData: data,
              parentDataProperty: "live_id",
              rootData,
              dynamicAnchors
            })) {
              vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
              errors = vErrors.length;
            }
            var valid0 = _errs2 === errors;
          } else var valid0 = true;
          if (valid0) {
            if (data.epoch !== void 0) {
              const _errs3 = errors;
              if (!validate54(data.epoch, {
                instancePath: instancePath + "/epoch",
                parentData: data,
                parentDataProperty: "epoch",
                rootData,
                dynamicAnchors
              })) {
                vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                errors = vErrors.length;
              }
              var valid0 = _errs3 === errors;
            } else var valid0 = true;
            if (valid0) {
              if (data.first_sequence !== void 0) {
                const _errs4 = errors;
                if (!validate54(data.first_sequence, {
                  instancePath: instancePath + "/first_sequence",
                  parentData: data,
                  parentDataProperty: "first_sequence",
                  rootData,
                  dynamicAnchors
                })) {
                  vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                  errors = vErrors.length;
                }
                var valid0 = _errs4 === errors;
              } else var valid0 = true;
            }
          }
        }
      }
    } else {
      validate119.errors = [{
        instancePath,
        schemaPath: "#/type",
        keyword: "type",
        params: { type: "object" }
      }];
      return false;
    }
  }
  validate119.errors = vErrors;
  return errors === 0;
}
validate119.evaluated = {
  "props": true,
  "dynamicProps": false,
  "dynamicItems": false
};
var pattern8 = /* @__PURE__ */ new RegExp("^(0|[1-9A-F][0-9A-F]{0,7})/(0|[1-9A-F][0-9A-F]{0,7})$", "u");
function validate139(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate139.evaluated;
  if (evaluated0.dynamicProps) evaluated0.props = void 0;
  if (evaluated0.dynamicItems) evaluated0.items = void 0;
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      const tag0 = data.type;
      if (typeof tag0 == "string") {
        if (tag0 === "ready") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing0;
              if (data.type === void 0 && (missing0 = "type")) {
                validate139.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/0/required",
                  keyword: "required",
                  params: { missingProperty: missing0 }
                }];
                return false;
              } else {
                const _errs4 = errors;
                for (const key0 in data) if (!(key0 === "type")) {
                  validate139.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/0/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key0 }
                  }];
                  return false;
                }
                if (_errs4 === errors) {
                  if (data.type !== void 0) {
                    if ("ready" !== data.type) {
                      validate139.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/0/properties/type/const",
                        keyword: "const",
                        params: { allowedValue: "ready" }
                      }];
                      return false;
                    }
                  }
                }
              }
            } else {
              validate139.errors = [{
                instancePath,
                schemaPath: "#/oneOf/0/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          var props0 = true;
        } else if (tag0 === "subscribed") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing1;
              if (data.type === void 0 && (missing1 = "type") || data.request_id === void 0 && (missing1 = "request_id") || data.live_id === void 0 && (missing1 = "live_id") || data.epoch === void 0 && (missing1 = "epoch") || data.first_sequence === void 0 && (missing1 = "first_sequence") || data.columns === void 0 && (missing1 = "columns")) {
                validate139.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/1/required",
                  keyword: "required",
                  params: { missingProperty: missing1 }
                }];
                return false;
              } else {
                const _errs8 = errors;
                for (const key1 in data) if (!(key1 === "type" || key1 === "request_id" || key1 === "live_id" || key1 === "epoch" || key1 === "first_sequence" || key1 === "columns")) {
                  validate139.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/1/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key1 }
                  }];
                  return false;
                }
                if (_errs8 === errors) {
                  if (data.type !== void 0) {
                    const _errs9 = errors;
                    if ("subscribed" !== data.type) {
                      validate139.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/1/properties/type/const",
                        keyword: "const",
                        params: { allowedValue: "subscribed" }
                      }];
                      return false;
                    }
                    var valid4 = _errs9 === errors;
                  } else var valid4 = true;
                  if (valid4) {
                    if (data.request_id !== void 0) {
                      const _errs10 = errors;
                      if (!validate54(data.request_id, {
                        instancePath: instancePath + "/request_id",
                        parentData: data,
                        parentDataProperty: "request_id",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                        errors = vErrors.length;
                      }
                      var valid4 = _errs10 === errors;
                    } else var valid4 = true;
                    if (valid4) {
                      if (data.live_id !== void 0) {
                        const _errs11 = errors;
                        if (!validate54(data.live_id, {
                          instancePath: instancePath + "/live_id",
                          parentData: data,
                          parentDataProperty: "live_id",
                          rootData,
                          dynamicAnchors
                        })) {
                          vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                          errors = vErrors.length;
                        }
                        var valid4 = _errs11 === errors;
                      } else var valid4 = true;
                      if (valid4) {
                        if (data.epoch !== void 0) {
                          const _errs12 = errors;
                          if (!validate54(data.epoch, {
                            instancePath: instancePath + "/epoch",
                            parentData: data,
                            parentDataProperty: "epoch",
                            rootData,
                            dynamicAnchors
                          })) {
                            vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                            errors = vErrors.length;
                          }
                          var valid4 = _errs12 === errors;
                        } else var valid4 = true;
                        if (valid4) {
                          if (data.first_sequence !== void 0) {
                            const _errs13 = errors;
                            if (!validate54(data.first_sequence, {
                              instancePath: instancePath + "/first_sequence",
                              parentData: data,
                              parentDataProperty: "first_sequence",
                              rootData,
                              dynamicAnchors
                            })) {
                              vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                              errors = vErrors.length;
                            }
                            var valid4 = _errs13 === errors;
                          } else var valid4 = true;
                          if (valid4) {
                            if (data.columns !== void 0) {
                              let data6 = data.columns;
                              const _errs14 = errors;
                              if (errors === _errs14) {
                                if (Array.isArray(data6)) {
                                  const len0 = data6.length;
                                  for (let i0 = 0; i0 < len0; i0++) {
                                    const _errs16 = errors;
                                    if (!validate67(data6[i0], {
                                      instancePath: instancePath + "/columns/" + i0,
                                      parentData: data6,
                                      parentDataProperty: i0,
                                      rootData,
                                      dynamicAnchors
                                    })) {
                                      vErrors = vErrors === null ? validate67.errors : vErrors.concat(validate67.errors);
                                      errors = vErrors.length;
                                    }
                                    if (!(_errs16 === errors)) break;
                                  }
                                } else {
                                  validate139.errors = [{
                                    instancePath: instancePath + "/columns",
                                    schemaPath: "#/oneOf/1/properties/columns/type",
                                    keyword: "type",
                                    params: { type: "array" }
                                  }];
                                  return false;
                                }
                              }
                              var valid4 = _errs14 === errors;
                            } else var valid4 = true;
                          }
                        }
                      }
                    }
                  }
                }
              }
            } else {
              validate139.errors = [{
                instancePath,
                schemaPath: "#/oneOf/1/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          if (props0 !== true) props0 = true;
        } else if (tag0 === "subscribe_rejected") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing2;
              if (data.type === void 0 && (missing2 = "type") || data.request_id === void 0 && (missing2 = "request_id") || data.code === void 0 && (missing2 = "code") || data.message === void 0 && (missing2 = "message")) {
                validate139.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/2/required",
                  keyword: "required",
                  params: { missingProperty: missing2 }
                }];
                return false;
              } else {
                const _errs19 = errors;
                for (const key2 in data) if (!(key2 === "type" || key2 === "request_id" || key2 === "code" || key2 === "message" || key2 === "sqlstate" || key2 === "retry_after_ms")) {
                  validate139.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/2/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key2 }
                  }];
                  return false;
                }
                if (_errs19 === errors) {
                  if (data.type !== void 0) {
                    const _errs20 = errors;
                    if ("subscribe_rejected" !== data.type) {
                      validate139.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/2/properties/type/const",
                        keyword: "const",
                        params: { allowedValue: "subscribe_rejected" }
                      }];
                      return false;
                    }
                    var valid7 = _errs20 === errors;
                  } else var valid7 = true;
                  if (valid7) {
                    if (data.request_id !== void 0) {
                      const _errs21 = errors;
                      if (!validate54(data.request_id, {
                        instancePath: instancePath + "/request_id",
                        parentData: data,
                        parentDataProperty: "request_id",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                        errors = vErrors.length;
                      }
                      var valid7 = _errs21 === errors;
                    } else var valid7 = true;
                    if (valid7) {
                      if (data.code !== void 0) {
                        let data10 = data.code;
                        const _errs22 = errors;
                        if (!(data10 === "authorization_failed" || data10 === "authorization_expired" || data10 === "backend_unavailable" || data10 === "backend_overloaded" || data10 === "upstream_rejected" || data10 === "resource_exhausted" || data10 === "service_unavailable")) {
                          validate139.errors = [{
                            instancePath: instancePath + "/code",
                            schemaPath: "#/oneOf/2/properties/code/enum",
                            keyword: "enum",
                            params: { allowedValues: schema23.oneOf[2].properties.code.enum }
                          }];
                          return false;
                        }
                        var valid7 = _errs22 === errors;
                      } else var valid7 = true;
                      if (valid7) {
                        if (data.message !== void 0) {
                          const _errs23 = errors;
                          if (typeof data.message !== "string") {
                            validate139.errors = [{
                              instancePath: instancePath + "/message",
                              schemaPath: "#/oneOf/2/properties/message/type",
                              keyword: "type",
                              params: { type: "string" }
                            }];
                            return false;
                          }
                          var valid7 = _errs23 === errors;
                        } else var valid7 = true;
                        if (valid7) {
                          if (data.sqlstate !== void 0) {
                            const _errs25 = errors;
                            if (!validate72(data.sqlstate, {
                              instancePath: instancePath + "/sqlstate",
                              parentData: data,
                              parentDataProperty: "sqlstate",
                              rootData,
                              dynamicAnchors
                            })) {
                              vErrors = vErrors === null ? validate72.errors : vErrors.concat(validate72.errors);
                              errors = vErrors.length;
                            }
                            var valid7 = _errs25 === errors;
                          } else var valid7 = true;
                          if (valid7) {
                            if (data.retry_after_ms !== void 0) {
                              const _errs26 = errors;
                              if (!validate74(data.retry_after_ms, {
                                instancePath: instancePath + "/retry_after_ms",
                                parentData: data,
                                parentDataProperty: "retry_after_ms",
                                rootData,
                                dynamicAnchors
                              })) {
                                vErrors = vErrors === null ? validate74.errors : vErrors.concat(validate74.errors);
                                errors = vErrors.length;
                              }
                              var valid7 = _errs26 === errors;
                            } else var valid7 = true;
                          }
                        }
                      }
                    }
                  }
                }
              }
            } else {
              validate139.errors = [{
                instancePath,
                schemaPath: "#/oneOf/2/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          if (props0 !== true) props0 = true;
        } else if (tag0 === "renewed") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing3;
              if (data.type === void 0 && (missing3 = "type") || data.live_id === void 0 && (missing3 = "live_id")) {
                validate139.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/3/required",
                  keyword: "required",
                  params: { missingProperty: missing3 }
                }];
                return false;
              } else {
                const _errs29 = errors;
                for (const key3 in data) if (!(key3 === "type" || key3 === "live_id")) {
                  validate139.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/3/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key3 }
                  }];
                  return false;
                }
                if (_errs29 === errors) {
                  if (data.type !== void 0) {
                    let data14 = data.type;
                    const _errs30 = errors;
                    if (!(data14 === "renewed" || data14 === "unsubscribed")) {
                      validate139.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/3/properties/type/enum",
                        keyword: "enum",
                        params: { allowedValues: schema23.oneOf[3].properties.type.enum }
                      }];
                      return false;
                    }
                    var valid9 = _errs30 === errors;
                  } else var valid9 = true;
                  if (valid9) {
                    if (data.live_id !== void 0) {
                      const _errs31 = errors;
                      if (!validate54(data.live_id, {
                        instancePath: instancePath + "/live_id",
                        parentData: data,
                        parentDataProperty: "live_id",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                        errors = vErrors.length;
                      }
                      var valid9 = _errs31 === errors;
                    } else var valid9 = true;
                  }
                }
              }
            } else {
              validate139.errors = [{
                instancePath,
                schemaPath: "#/oneOf/3/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          if (props0 !== true) props0 = true;
        } else if (tag0 === "unsubscribed") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing4;
              if (data.type === void 0 && (missing4 = "type") || data.live_id === void 0 && (missing4 = "live_id")) {
                validate139.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/3/required",
                  keyword: "required",
                  params: { missingProperty: missing4 }
                }];
                return false;
              } else {
                const _errs34 = errors;
                for (const key4 in data) if (!(key4 === "type" || key4 === "live_id")) {
                  validate139.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/3/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key4 }
                  }];
                  return false;
                }
                if (_errs34 === errors) {
                  if (data.type !== void 0) {
                    let data16 = data.type;
                    const _errs35 = errors;
                    if (!(data16 === "renewed" || data16 === "unsubscribed")) {
                      validate139.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/3/properties/type/enum",
                        keyword: "enum",
                        params: { allowedValues: schema23.oneOf[3].properties.type.enum }
                      }];
                      return false;
                    }
                    var valid11 = _errs35 === errors;
                  } else var valid11 = true;
                  if (valid11) {
                    if (data.live_id !== void 0) {
                      const _errs36 = errors;
                      if (!validate54(data.live_id, {
                        instancePath: instancePath + "/live_id",
                        parentData: data,
                        parentDataProperty: "live_id",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                        errors = vErrors.length;
                      }
                      var valid11 = _errs36 === errors;
                    } else var valid11 = true;
                  }
                }
              }
            } else {
              validate139.errors = [{
                instancePath,
                schemaPath: "#/oneOf/3/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          if (props0 !== true) props0 = true;
        } else if (tag0 === "baseline_sync_start") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing5;
              if (data.type === void 0 && (missing5 = "type") || data.live_id === void 0 && (missing5 = "live_id") || data.epoch === void 0 && (missing5 = "epoch") || data.baseline_sync_attempt === void 0 && (missing5 = "baseline_sync_attempt") || data.mvcc === void 0 && (missing5 = "mvcc")) {
                validate139.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/4/required",
                  keyword: "required",
                  params: { missingProperty: missing5 }
                }];
                return false;
              } else {
                const _errs39 = errors;
                for (const key5 in data) if (!(key5 === "type" || key5 === "live_id" || key5 === "epoch" || key5 === "baseline_sync_attempt" || key5 === "mvcc")) {
                  validate139.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/4/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key5 }
                  }];
                  return false;
                }
                if (_errs39 === errors) {
                  if (data.type !== void 0) {
                    const _errs40 = errors;
                    if ("baseline_sync_start" !== data.type) {
                      validate139.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/4/properties/type/const",
                        keyword: "const",
                        params: { allowedValue: "baseline_sync_start" }
                      }];
                      return false;
                    }
                    var valid13 = _errs40 === errors;
                  } else var valid13 = true;
                  if (valid13) {
                    if (data.live_id !== void 0) {
                      const _errs41 = errors;
                      if (!validate54(data.live_id, {
                        instancePath: instancePath + "/live_id",
                        parentData: data,
                        parentDataProperty: "live_id",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                        errors = vErrors.length;
                      }
                      var valid13 = _errs41 === errors;
                    } else var valid13 = true;
                    if (valid13) {
                      if (data.epoch !== void 0) {
                        const _errs42 = errors;
                        if (!validate54(data.epoch, {
                          instancePath: instancePath + "/epoch",
                          parentData: data,
                          parentDataProperty: "epoch",
                          rootData,
                          dynamicAnchors
                        })) {
                          vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                          errors = vErrors.length;
                        }
                        var valid13 = _errs42 === errors;
                      } else var valid13 = true;
                      if (valid13) {
                        if (data.baseline_sync_attempt !== void 0) {
                          const _errs43 = errors;
                          if (!validate54(data.baseline_sync_attempt, {
                            instancePath: instancePath + "/baseline_sync_attempt",
                            parentData: data,
                            parentDataProperty: "baseline_sync_attempt",
                            rootData,
                            dynamicAnchors
                          })) {
                            vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                            errors = vErrors.length;
                          }
                          var valid13 = _errs43 === errors;
                        } else var valid13 = true;
                        if (valid13) {
                          if (data.mvcc !== void 0) {
                            const _errs44 = errors;
                            if (!validate81(data.mvcc, {
                              instancePath: instancePath + "/mvcc",
                              parentData: data,
                              parentDataProperty: "mvcc",
                              rootData,
                              dynamicAnchors
                            })) {
                              vErrors = vErrors === null ? validate81.errors : vErrors.concat(validate81.errors);
                              errors = vErrors.length;
                            }
                            var valid13 = _errs44 === errors;
                          } else var valid13 = true;
                        }
                      }
                    }
                  }
                }
              }
            } else {
              validate139.errors = [{
                instancePath,
                schemaPath: "#/oneOf/4/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          if (props0 !== true) props0 = true;
        } else if (tag0 === "baseline_sync_batch") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing6;
              if (data.type === void 0 && (missing6 = "type") || data.live_id === void 0 && (missing6 = "live_id") || data.epoch === void 0 && (missing6 = "epoch") || data.baseline_sync_attempt === void 0 && (missing6 = "baseline_sync_attempt") || data.index === void 0 && (missing6 = "index") || data.rows === void 0 && (missing6 = "rows")) {
                validate139.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/5/required",
                  keyword: "required",
                  params: { missingProperty: missing6 }
                }];
                return false;
              } else {
                const _errs47 = errors;
                for (const key6 in data) if (!(key6 === "type" || key6 === "live_id" || key6 === "epoch" || key6 === "baseline_sync_attempt" || key6 === "index" || key6 === "rows")) {
                  validate139.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/5/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key6 }
                  }];
                  return false;
                }
                if (_errs47 === errors) {
                  if (data.type !== void 0) {
                    const _errs48 = errors;
                    if ("baseline_sync_batch" !== data.type) {
                      validate139.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/5/properties/type/const",
                        keyword: "const",
                        params: { allowedValue: "baseline_sync_batch" }
                      }];
                      return false;
                    }
                    var valid15 = _errs48 === errors;
                  } else var valid15 = true;
                  if (valid15) {
                    if (data.live_id !== void 0) {
                      const _errs49 = errors;
                      if (!validate54(data.live_id, {
                        instancePath: instancePath + "/live_id",
                        parentData: data,
                        parentDataProperty: "live_id",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                        errors = vErrors.length;
                      }
                      var valid15 = _errs49 === errors;
                    } else var valid15 = true;
                    if (valid15) {
                      if (data.epoch !== void 0) {
                        const _errs50 = errors;
                        if (!validate54(data.epoch, {
                          instancePath: instancePath + "/epoch",
                          parentData: data,
                          parentDataProperty: "epoch",
                          rootData,
                          dynamicAnchors
                        })) {
                          vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                          errors = vErrors.length;
                        }
                        var valid15 = _errs50 === errors;
                      } else var valid15 = true;
                      if (valid15) {
                        if (data.baseline_sync_attempt !== void 0) {
                          const _errs51 = errors;
                          if (!validate54(data.baseline_sync_attempt, {
                            instancePath: instancePath + "/baseline_sync_attempt",
                            parentData: data,
                            parentDataProperty: "baseline_sync_attempt",
                            rootData,
                            dynamicAnchors
                          })) {
                            vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                            errors = vErrors.length;
                          }
                          var valid15 = _errs51 === errors;
                        } else var valid15 = true;
                        if (valid15) {
                          if (data.index !== void 0) {
                            const _errs52 = errors;
                            if (!validate74(data.index, {
                              instancePath: instancePath + "/index",
                              parentData: data,
                              parentDataProperty: "index",
                              rootData,
                              dynamicAnchors
                            })) {
                              vErrors = vErrors === null ? validate74.errors : vErrors.concat(validate74.errors);
                              errors = vErrors.length;
                            }
                            var valid15 = _errs52 === errors;
                          } else var valid15 = true;
                          if (valid15) {
                            if (data.rows !== void 0) {
                              let data28 = data.rows;
                              const _errs53 = errors;
                              if (errors === _errs53) {
                                if (Array.isArray(data28)) {
                                  const len1 = data28.length;
                                  for (let i1 = 0; i1 < len1; i1++) {
                                    const _errs55 = errors;
                                    if (!validate90(data28[i1], {
                                      instancePath: instancePath + "/rows/" + i1,
                                      parentData: data28,
                                      parentDataProperty: i1,
                                      rootData,
                                      dynamicAnchors
                                    })) {
                                      vErrors = vErrors === null ? validate90.errors : vErrors.concat(validate90.errors);
                                      errors = vErrors.length;
                                    }
                                    if (!(_errs55 === errors)) break;
                                  }
                                } else {
                                  validate139.errors = [{
                                    instancePath: instancePath + "/rows",
                                    schemaPath: "#/oneOf/5/properties/rows/type",
                                    keyword: "type",
                                    params: { type: "array" }
                                  }];
                                  return false;
                                }
                              }
                              var valid15 = _errs53 === errors;
                            } else var valid15 = true;
                          }
                        }
                      }
                    }
                  }
                }
              }
            } else {
              validate139.errors = [{
                instancePath,
                schemaPath: "#/oneOf/5/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          if (props0 !== true) props0 = true;
        } else if (tag0 === "baseline_sync_end") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing7;
              if (data.type === void 0 && (missing7 = "type") || data.live_id === void 0 && (missing7 = "live_id") || data.epoch === void 0 && (missing7 = "epoch") || data.baseline_sync_attempt === void 0 && (missing7 = "baseline_sync_attempt") || data.batch_count === void 0 && (missing7 = "batch_count")) {
                validate139.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/6/required",
                  keyword: "required",
                  params: { missingProperty: missing7 }
                }];
                return false;
              } else {
                const _errs58 = errors;
                for (const key7 in data) if (!(key7 === "type" || key7 === "live_id" || key7 === "epoch" || key7 === "baseline_sync_attempt" || key7 === "batch_count")) {
                  validate139.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/6/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key7 }
                  }];
                  return false;
                }
                if (_errs58 === errors) {
                  if (data.type !== void 0) {
                    const _errs59 = errors;
                    if ("baseline_sync_end" !== data.type) {
                      validate139.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/6/properties/type/const",
                        keyword: "const",
                        params: { allowedValue: "baseline_sync_end" }
                      }];
                      return false;
                    }
                    var valid18 = _errs59 === errors;
                  } else var valid18 = true;
                  if (valid18) {
                    if (data.live_id !== void 0) {
                      const _errs60 = errors;
                      if (!validate54(data.live_id, {
                        instancePath: instancePath + "/live_id",
                        parentData: data,
                        parentDataProperty: "live_id",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                        errors = vErrors.length;
                      }
                      var valid18 = _errs60 === errors;
                    } else var valid18 = true;
                    if (valid18) {
                      if (data.epoch !== void 0) {
                        const _errs61 = errors;
                        if (!validate54(data.epoch, {
                          instancePath: instancePath + "/epoch",
                          parentData: data,
                          parentDataProperty: "epoch",
                          rootData,
                          dynamicAnchors
                        })) {
                          vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                          errors = vErrors.length;
                        }
                        var valid18 = _errs61 === errors;
                      } else var valid18 = true;
                      if (valid18) {
                        if (data.baseline_sync_attempt !== void 0) {
                          const _errs62 = errors;
                          if (!validate54(data.baseline_sync_attempt, {
                            instancePath: instancePath + "/baseline_sync_attempt",
                            parentData: data,
                            parentDataProperty: "baseline_sync_attempt",
                            rootData,
                            dynamicAnchors
                          })) {
                            vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                            errors = vErrors.length;
                          }
                          var valid18 = _errs62 === errors;
                        } else var valid18 = true;
                        if (valid18) {
                          if (data.batch_count !== void 0) {
                            const _errs63 = errors;
                            if (!validate74(data.batch_count, {
                              instancePath: instancePath + "/batch_count",
                              parentData: data,
                              parentDataProperty: "batch_count",
                              rootData,
                              dynamicAnchors
                            })) {
                              vErrors = vErrors === null ? validate74.errors : vErrors.concat(validate74.errors);
                              errors = vErrors.length;
                            }
                            var valid18 = _errs63 === errors;
                          } else var valid18 = true;
                        }
                      }
                    }
                  }
                }
              }
            } else {
              validate139.errors = [{
                instancePath,
                schemaPath: "#/oneOf/6/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          if (props0 !== true) props0 = true;
        } else if (tag0 === "open") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing8;
              if (data.type === void 0 && (missing8 = "type") || data.publication_id === void 0 && (missing8 = "publication_id")) {
                validate139.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/7/required",
                  keyword: "required",
                  params: { missingProperty: missing8 }
                }];
                return false;
              } else {
                const _errs66 = errors;
                for (const key8 in data) if (!(key8 === "type" || key8 === "publication_id")) {
                  validate139.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/7/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key8 }
                  }];
                  return false;
                }
                if (_errs66 === errors) {
                  if (data.type !== void 0) {
                    const _errs67 = errors;
                    if ("open" !== data.type) {
                      validate139.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/7/properties/type/const",
                        keyword: "const",
                        params: { allowedValue: "open" }
                      }];
                      return false;
                    }
                    var valid20 = _errs67 === errors;
                  } else var valid20 = true;
                  if (valid20) {
                    if (data.publication_id !== void 0) {
                      const _errs68 = errors;
                      if (!validate102(data.publication_id, {
                        instancePath: instancePath + "/publication_id",
                        parentData: data,
                        parentDataProperty: "publication_id",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate102.errors : vErrors.concat(validate102.errors);
                        errors = vErrors.length;
                      }
                      var valid20 = _errs68 === errors;
                    } else var valid20 = true;
                  }
                }
              }
            } else {
              validate139.errors = [{
                instancePath,
                schemaPath: "#/oneOf/7/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          if (props0 !== true) props0 = true;
        } else if (tag0 === "keyed_results") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing9;
              if (data.type === void 0 && (missing9 = "type") || data.publication_id === void 0 && (missing9 = "publication_id") || data.index === void 0 && (missing9 = "index") || data.txids === void 0 && (missing9 = "txids") || data.targets === void 0 && (missing9 = "targets") || data.changes === void 0 && (missing9 = "changes")) {
                validate139.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/8/required",
                  keyword: "required",
                  params: { missingProperty: missing9 }
                }];
                return false;
              } else {
                const _errs71 = errors;
                for (const key9 in data) if (!(key9 === "type" || key9 === "publication_id" || key9 === "index" || key9 === "txids" || key9 === "targets" || key9 === "changes")) {
                  validate139.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/8/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key9 }
                  }];
                  return false;
                }
                if (_errs71 === errors) {
                  if (data.type !== void 0) {
                    const _errs72 = errors;
                    if ("keyed_results" !== data.type) {
                      validate139.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/8/properties/type/const",
                        keyword: "const",
                        params: { allowedValue: "keyed_results" }
                      }];
                      return false;
                    }
                    var valid22 = _errs72 === errors;
                  } else var valid22 = true;
                  if (valid22) {
                    if (data.publication_id !== void 0) {
                      const _errs73 = errors;
                      if (!validate102(data.publication_id, {
                        instancePath: instancePath + "/publication_id",
                        parentData: data,
                        parentDataProperty: "publication_id",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate102.errors : vErrors.concat(validate102.errors);
                        errors = vErrors.length;
                      }
                      var valid22 = _errs73 === errors;
                    } else var valid22 = true;
                    if (valid22) {
                      if (data.index !== void 0) {
                        const _errs74 = errors;
                        if (!validate74(data.index, {
                          instancePath: instancePath + "/index",
                          parentData: data,
                          parentDataProperty: "index",
                          rootData,
                          dynamicAnchors
                        })) {
                          vErrors = vErrors === null ? validate74.errors : vErrors.concat(validate74.errors);
                          errors = vErrors.length;
                        }
                        var valid22 = _errs74 === errors;
                      } else var valid22 = true;
                      if (valid22) {
                        if (data.txids !== void 0) {
                          let data40 = data.txids;
                          const _errs75 = errors;
                          if (errors === _errs75) {
                            if (Array.isArray(data40)) {
                              const len2 = data40.length;
                              for (let i2 = 0; i2 < len2; i2++) {
                                const _errs77 = errors;
                                if (!validate54(data40[i2], {
                                  instancePath: instancePath + "/txids/" + i2,
                                  parentData: data40,
                                  parentDataProperty: i2,
                                  rootData,
                                  dynamicAnchors
                                })) {
                                  vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                                  errors = vErrors.length;
                                }
                                if (!(_errs77 === errors)) break;
                              }
                            } else {
                              validate139.errors = [{
                                instancePath: instancePath + "/txids",
                                schemaPath: "#/oneOf/8/properties/txids/type",
                                keyword: "type",
                                params: { type: "array" }
                              }];
                              return false;
                            }
                          }
                          var valid22 = _errs75 === errors;
                        } else var valid22 = true;
                        if (valid22) {
                          if (data.targets !== void 0) {
                            let data42 = data.targets;
                            const _errs78 = errors;
                            if (errors === _errs78) {
                              if (Array.isArray(data42)) {
                                const len3 = data42.length;
                                for (let i3 = 0; i3 < len3; i3++) {
                                  const _errs80 = errors;
                                  if (!validate107(data42[i3], {
                                    instancePath: instancePath + "/targets/" + i3,
                                    parentData: data42,
                                    parentDataProperty: i3,
                                    rootData,
                                    dynamicAnchors
                                  })) {
                                    vErrors = vErrors === null ? validate107.errors : vErrors.concat(validate107.errors);
                                    errors = vErrors.length;
                                  }
                                  if (!(_errs80 === errors)) break;
                                }
                              } else {
                                validate139.errors = [{
                                  instancePath: instancePath + "/targets",
                                  schemaPath: "#/oneOf/8/properties/targets/type",
                                  keyword: "type",
                                  params: { type: "array" }
                                }];
                                return false;
                              }
                            }
                            var valid22 = _errs78 === errors;
                          } else var valid22 = true;
                          if (valid22) {
                            if (data.changes !== void 0) {
                              let data44 = data.changes;
                              const _errs81 = errors;
                              if (errors === _errs81) {
                                if (Array.isArray(data44)) {
                                  const len4 = data44.length;
                                  for (let i4 = 0; i4 < len4; i4++) {
                                    const _errs83 = errors;
                                    if (!validate112(data44[i4], {
                                      instancePath: instancePath + "/changes/" + i4,
                                      parentData: data44,
                                      parentDataProperty: i4,
                                      rootData,
                                      dynamicAnchors
                                    })) {
                                      vErrors = vErrors === null ? validate112.errors : vErrors.concat(validate112.errors);
                                      errors = vErrors.length;
                                    }
                                    if (!(_errs83 === errors)) break;
                                  }
                                } else {
                                  validate139.errors = [{
                                    instancePath: instancePath + "/changes",
                                    schemaPath: "#/oneOf/8/properties/changes/type",
                                    keyword: "type",
                                    params: { type: "array" }
                                  }];
                                  return false;
                                }
                              }
                              var valid22 = _errs81 === errors;
                            } else var valid22 = true;
                          }
                        }
                      }
                    }
                  }
                }
              }
            } else {
              validate139.errors = [{
                instancePath,
                schemaPath: "#/oneOf/8/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          if (props0 !== true) props0 = true;
        } else if (tag0 === "reset_required") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing10;
              if (data.type === void 0 && (missing10 = "type") || data.publication_id === void 0 && (missing10 = "publication_id") || data.index === void 0 && (missing10 = "index") || data.targets === void 0 && (missing10 = "targets")) {
                validate139.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/9/required",
                  keyword: "required",
                  params: { missingProperty: missing10 }
                }];
                return false;
              } else {
                const _errs86 = errors;
                for (const key10 in data) if (!(key10 === "type" || key10 === "publication_id" || key10 === "index" || key10 === "targets")) {
                  validate139.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/9/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key10 }
                  }];
                  return false;
                }
                if (_errs86 === errors) {
                  if (data.type !== void 0) {
                    const _errs87 = errors;
                    if ("reset_required" !== data.type) {
                      validate139.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/9/properties/type/const",
                        keyword: "const",
                        params: { allowedValue: "reset_required" }
                      }];
                      return false;
                    }
                    var valid27 = _errs87 === errors;
                  } else var valid27 = true;
                  if (valid27) {
                    if (data.publication_id !== void 0) {
                      const _errs88 = errors;
                      if (!validate102(data.publication_id, {
                        instancePath: instancePath + "/publication_id",
                        parentData: data,
                        parentDataProperty: "publication_id",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate102.errors : vErrors.concat(validate102.errors);
                        errors = vErrors.length;
                      }
                      var valid27 = _errs88 === errors;
                    } else var valid27 = true;
                    if (valid27) {
                      if (data.index !== void 0) {
                        const _errs89 = errors;
                        if (!validate74(data.index, {
                          instancePath: instancePath + "/index",
                          parentData: data,
                          parentDataProperty: "index",
                          rootData,
                          dynamicAnchors
                        })) {
                          vErrors = vErrors === null ? validate74.errors : vErrors.concat(validate74.errors);
                          errors = vErrors.length;
                        }
                        var valid27 = _errs89 === errors;
                      } else var valid27 = true;
                      if (valid27) {
                        if (data.targets !== void 0) {
                          let data49 = data.targets;
                          const _errs90 = errors;
                          if (errors === _errs90) {
                            if (Array.isArray(data49)) {
                              const len5 = data49.length;
                              for (let i5 = 0; i5 < len5; i5++) {
                                const _errs92 = errors;
                                if (!validate119(data49[i5], {
                                  instancePath: instancePath + "/targets/" + i5,
                                  parentData: data49,
                                  parentDataProperty: i5,
                                  rootData,
                                  dynamicAnchors
                                })) {
                                  vErrors = vErrors === null ? validate119.errors : vErrors.concat(validate119.errors);
                                  errors = vErrors.length;
                                }
                                if (!(_errs92 === errors)) break;
                              }
                            } else {
                              validate139.errors = [{
                                instancePath: instancePath + "/targets",
                                schemaPath: "#/oneOf/9/properties/targets/type",
                                keyword: "type",
                                params: { type: "array" }
                              }];
                              return false;
                            }
                          }
                          var valid27 = _errs90 === errors;
                        } else var valid27 = true;
                      }
                    }
                  }
                }
              }
            } else {
              validate139.errors = [{
                instancePath,
                schemaPath: "#/oneOf/9/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          if (props0 !== true) props0 = true;
        } else if (tag0 === "commit") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing11;
              if (data.type === void 0 && (missing11 = "type") || data.publication_id === void 0 && (missing11 = "publication_id") || data.body_count === void 0 && (missing11 = "body_count") || data.frontier === void 0 && (missing11 = "frontier")) {
                validate139.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/10/required",
                  keyword: "required",
                  params: { missingProperty: missing11 }
                }];
                return false;
              } else {
                const _errs95 = errors;
                for (const key11 in data) if (!(key11 === "type" || key11 === "publication_id" || key11 === "body_count" || key11 === "frontier")) {
                  validate139.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/10/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key11 }
                  }];
                  return false;
                }
                if (_errs95 === errors) {
                  if (data.type !== void 0) {
                    const _errs96 = errors;
                    if ("commit" !== data.type) {
                      validate139.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/10/properties/type/const",
                        keyword: "const",
                        params: { allowedValue: "commit" }
                      }];
                      return false;
                    }
                    var valid30 = _errs96 === errors;
                  } else var valid30 = true;
                  if (valid30) {
                    if (data.publication_id !== void 0) {
                      const _errs97 = errors;
                      if (!validate102(data.publication_id, {
                        instancePath: instancePath + "/publication_id",
                        parentData: data,
                        parentDataProperty: "publication_id",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate102.errors : vErrors.concat(validate102.errors);
                        errors = vErrors.length;
                      }
                      var valid30 = _errs97 === errors;
                    } else var valid30 = true;
                    if (valid30) {
                      if (data.body_count !== void 0) {
                        const _errs98 = errors;
                        if (!validate74(data.body_count, {
                          instancePath: instancePath + "/body_count",
                          parentData: data,
                          parentDataProperty: "body_count",
                          rootData,
                          dynamicAnchors
                        })) {
                          vErrors = vErrors === null ? validate74.errors : vErrors.concat(validate74.errors);
                          errors = vErrors.length;
                        }
                        var valid30 = _errs98 === errors;
                      } else var valid30 = true;
                      if (valid30) {
                        if (data.frontier !== void 0) {
                          let data54 = data.frontier;
                          const _errs99 = errors;
                          if (errors === _errs99) {
                            if (data54 && typeof data54 == "object" && !Array.isArray(data54)) {
                              let missing12;
                              if (data54.lsn === void 0 && (missing12 = "lsn")) {
                                validate139.errors = [{
                                  instancePath: instancePath + "/frontier",
                                  schemaPath: "#/oneOf/10/properties/frontier/required",
                                  keyword: "required",
                                  params: { missingProperty: missing12 }
                                }];
                                return false;
                              } else {
                                const _errs101 = errors;
                                for (const key12 in data54) if (!(key12 === "lsn")) {
                                  validate139.errors = [{
                                    instancePath: instancePath + "/frontier",
                                    schemaPath: "#/oneOf/10/properties/frontier/additionalProperties",
                                    keyword: "additionalProperties",
                                    params: { additionalProperty: key12 }
                                  }];
                                  return false;
                                }
                                if (_errs101 === errors) {
                                  if (data54.lsn !== void 0) {
                                    let data55 = data54.lsn;
                                    if (errors === errors) {
                                      if (typeof data55 === "string") {
                                        if (!pattern8.test(data55)) {
                                          validate139.errors = [{
                                            instancePath: instancePath + "/frontier/lsn",
                                            schemaPath: "#/oneOf/10/properties/frontier/properties/lsn/pattern",
                                            keyword: "pattern",
                                            params: { pattern: "^(0|[1-9A-F][0-9A-F]{0,7})/(0|[1-9A-F][0-9A-F]{0,7})$" }
                                          }];
                                          return false;
                                        }
                                      } else {
                                        validate139.errors = [{
                                          instancePath: instancePath + "/frontier/lsn",
                                          schemaPath: "#/oneOf/10/properties/frontier/properties/lsn/type",
                                          keyword: "type",
                                          params: { type: "string" }
                                        }];
                                        return false;
                                      }
                                    }
                                  }
                                }
                              }
                            } else {
                              validate139.errors = [{
                                instancePath: instancePath + "/frontier",
                                schemaPath: "#/oneOf/10/properties/frontier/type",
                                keyword: "type",
                                params: { type: "object" }
                              }];
                              return false;
                            }
                          }
                          var valid30 = _errs99 === errors;
                        } else var valid30 = true;
                      }
                    }
                  }
                }
              }
            } else {
              validate139.errors = [{
                instancePath,
                schemaPath: "#/oneOf/10/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          if (props0 !== true) props0 = true;
        } else if (tag0 === "subscription_error") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing13;
              if (data.type === void 0 && (missing13 = "type") || data.live_id === void 0 && (missing13 = "live_id") || data.code === void 0 && (missing13 = "code") || data.message === void 0 && (missing13 = "message")) {
                validate139.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/11/required",
                  keyword: "required",
                  params: { missingProperty: missing13 }
                }];
                return false;
              } else {
                const _errs106 = errors;
                for (const key13 in data) if (!(key13 === "type" || key13 === "live_id" || key13 === "code" || key13 === "message" || key13 === "sqlstate" || key13 === "retry_after_ms")) {
                  validate139.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/11/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key13 }
                  }];
                  return false;
                }
                if (_errs106 === errors) {
                  if (data.type !== void 0) {
                    const _errs107 = errors;
                    if ("subscription_error" !== data.type) {
                      validate139.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/11/properties/type/const",
                        keyword: "const",
                        params: { allowedValue: "subscription_error" }
                      }];
                      return false;
                    }
                    var valid33 = _errs107 === errors;
                  } else var valid33 = true;
                  if (valid33) {
                    if (data.live_id !== void 0) {
                      const _errs108 = errors;
                      if (!validate54(data.live_id, {
                        instancePath: instancePath + "/live_id",
                        parentData: data,
                        parentDataProperty: "live_id",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate54.errors : vErrors.concat(validate54.errors);
                        errors = vErrors.length;
                      }
                      var valid33 = _errs108 === errors;
                    } else var valid33 = true;
                    if (valid33) {
                      if (data.code !== void 0) {
                        let data58 = data.code;
                        const _errs109 = errors;
                        if (!(data58 === "authorization_expired" || data58 === "renewal_failed" || data58 === "upstream_cancelled" || data58 === "backend_overloaded" || data58 === "baseline_sync_failed" || data58 === "protocol_error")) {
                          validate139.errors = [{
                            instancePath: instancePath + "/code",
                            schemaPath: "#/oneOf/11/properties/code/enum",
                            keyword: "enum",
                            params: { allowedValues: schema23.oneOf[11].properties.code.enum }
                          }];
                          return false;
                        }
                        var valid33 = _errs109 === errors;
                      } else var valid33 = true;
                      if (valid33) {
                        if (data.message !== void 0) {
                          const _errs110 = errors;
                          if (typeof data.message !== "string") {
                            validate139.errors = [{
                              instancePath: instancePath + "/message",
                              schemaPath: "#/oneOf/11/properties/message/type",
                              keyword: "type",
                              params: { type: "string" }
                            }];
                            return false;
                          }
                          var valid33 = _errs110 === errors;
                        } else var valid33 = true;
                        if (valid33) {
                          if (data.sqlstate !== void 0) {
                            const _errs112 = errors;
                            if (!validate72(data.sqlstate, {
                              instancePath: instancePath + "/sqlstate",
                              parentData: data,
                              parentDataProperty: "sqlstate",
                              rootData,
                              dynamicAnchors
                            })) {
                              vErrors = vErrors === null ? validate72.errors : vErrors.concat(validate72.errors);
                              errors = vErrors.length;
                            }
                            var valid33 = _errs112 === errors;
                          } else var valid33 = true;
                          if (valid33) {
                            if (data.retry_after_ms !== void 0) {
                              const _errs113 = errors;
                              if (!validate74(data.retry_after_ms, {
                                instancePath: instancePath + "/retry_after_ms",
                                parentData: data,
                                parentDataProperty: "retry_after_ms",
                                rootData,
                                dynamicAnchors
                              })) {
                                vErrors = vErrors === null ? validate74.errors : vErrors.concat(validate74.errors);
                                errors = vErrors.length;
                              }
                              var valid33 = _errs113 === errors;
                            } else var valid33 = true;
                          }
                        }
                      }
                    }
                  }
                }
              }
            } else {
              validate139.errors = [{
                instancePath,
                schemaPath: "#/oneOf/11/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          if (props0 !== true) props0 = true;
        } else if (tag0 === "connection_error") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing14;
              if (data.type === void 0 && (missing14 = "type") || data.code === void 0 && (missing14 = "code") || data.message === void 0 && (missing14 = "message")) {
                validate139.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/12/required",
                  keyword: "required",
                  params: { missingProperty: missing14 }
                }];
                return false;
              } else {
                const _errs116 = errors;
                for (const key14 in data) if (!(key14 === "type" || key14 === "code" || key14 === "message")) {
                  validate139.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/12/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key14 }
                  }];
                  return false;
                }
                if (_errs116 === errors) {
                  if (data.type !== void 0) {
                    const _errs117 = errors;
                    if ("connection_error" !== data.type) {
                      validate139.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/12/properties/type/const",
                        keyword: "const",
                        params: { allowedValue: "connection_error" }
                      }];
                      return false;
                    }
                    var valid35 = _errs117 === errors;
                  } else var valid35 = true;
                  if (valid35) {
                    if (data.code !== void 0) {
                      let data63 = data.code;
                      const _errs118 = errors;
                      if (!(data63 === "protocol_error" || data63 === "invalid_payload" || data63 === "message_too_large" || data63 === "resource_exhausted" || data63 === "slow_consumer" || data63 === "heartbeat_timeout" || data63 === "backend_session_lost" || data63 === "backend_protocol_error" || data63 === "fence_failed" || data63 === "internal_error")) {
                        validate139.errors = [{
                          instancePath: instancePath + "/code",
                          schemaPath: "#/oneOf/12/properties/code/enum",
                          keyword: "enum",
                          params: { allowedValues: schema23.oneOf[12].properties.code.enum }
                        }];
                        return false;
                      }
                      var valid35 = _errs118 === errors;
                    } else var valid35 = true;
                    if (valid35) {
                      if (data.message !== void 0) {
                        const _errs119 = errors;
                        if (typeof data.message !== "string") {
                          validate139.errors = [{
                            instancePath: instancePath + "/message",
                            schemaPath: "#/oneOf/12/properties/message/type",
                            keyword: "type",
                            params: { type: "string" }
                          }];
                          return false;
                        }
                        var valid35 = _errs119 === errors;
                      } else var valid35 = true;
                    }
                  }
                }
              }
            } else {
              validate139.errors = [{
                instancePath,
                schemaPath: "#/oneOf/12/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          if (props0 !== true) props0 = true;
        } else if (tag0 === "ping") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing15;
              if (data.type === void 0 && (missing15 = "type") || data.token === void 0 && (missing15 = "token")) {
                validate139.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/13/required",
                  keyword: "required",
                  params: { missingProperty: missing15 }
                }];
                return false;
              } else {
                const _errs123 = errors;
                for (const key15 in data) if (!(key15 === "type" || key15 === "token")) {
                  validate139.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/13/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key15 }
                  }];
                  return false;
                }
                if (_errs123 === errors) {
                  if (data.type !== void 0) {
                    let data65 = data.type;
                    const _errs124 = errors;
                    if (!(data65 === "ping" || data65 === "pong")) {
                      validate139.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/13/properties/type/enum",
                        keyword: "enum",
                        params: { allowedValues: schema23.oneOf[13].properties.type.enum }
                      }];
                      return false;
                    }
                    var valid37 = _errs124 === errors;
                  } else var valid37 = true;
                  if (valid37) {
                    if (data.token !== void 0) {
                      const _errs125 = errors;
                      if (!validate58(data.token, {
                        instancePath: instancePath + "/token",
                        parentData: data,
                        parentDataProperty: "token",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate58.errors : vErrors.concat(validate58.errors);
                        errors = vErrors.length;
                      }
                      var valid37 = _errs125 === errors;
                    } else var valid37 = true;
                  }
                }
              }
            } else {
              validate139.errors = [{
                instancePath,
                schemaPath: "#/oneOf/13/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          if (props0 !== true) props0 = true;
        } else if (tag0 === "pong") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing16;
              if (data.type === void 0 && (missing16 = "type") || data.token === void 0 && (missing16 = "token")) {
                validate139.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/13/required",
                  keyword: "required",
                  params: { missingProperty: missing16 }
                }];
                return false;
              } else {
                const _errs128 = errors;
                for (const key16 in data) if (!(key16 === "type" || key16 === "token")) {
                  validate139.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/13/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key16 }
                  }];
                  return false;
                }
                if (_errs128 === errors) {
                  if (data.type !== void 0) {
                    let data67 = data.type;
                    const _errs129 = errors;
                    if (!(data67 === "ping" || data67 === "pong")) {
                      validate139.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/13/properties/type/enum",
                        keyword: "enum",
                        params: { allowedValues: schema23.oneOf[13].properties.type.enum }
                      }];
                      return false;
                    }
                    var valid39 = _errs129 === errors;
                  } else var valid39 = true;
                  if (valid39) {
                    if (data.token !== void 0) {
                      const _errs130 = errors;
                      if (!validate58(data.token, {
                        instancePath: instancePath + "/token",
                        parentData: data,
                        parentDataProperty: "token",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate58.errors : vErrors.concat(validate58.errors);
                        errors = vErrors.length;
                      }
                      var valid39 = _errs130 === errors;
                    } else var valid39 = true;
                  }
                }
              }
            } else {
              validate139.errors = [{
                instancePath,
                schemaPath: "#/oneOf/13/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          if (props0 !== true) props0 = true;
        } else if (tag0 === "progress") {
          if (errors === errors) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
              let missing17;
              if (data.type === void 0 && (missing17 = "type") || data.mvcc === void 0 && (missing17 = "mvcc")) {
                validate139.errors = [{
                  instancePath,
                  schemaPath: "#/oneOf/14/required",
                  keyword: "required",
                  params: { missingProperty: missing17 }
                }];
                return false;
              } else {
                const _errs134 = errors;
                for (const key17 in data) if (!(key17 === "type" || key17 === "mvcc")) {
                  validate139.errors = [{
                    instancePath,
                    schemaPath: "#/oneOf/14/additionalProperties",
                    keyword: "additionalProperties",
                    params: { additionalProperty: key17 }
                  }];
                  return false;
                }
                if (_errs134 === errors) {
                  if (data.type !== void 0) {
                    const _errs135 = errors;
                    if ("progress" !== data.type) {
                      validate139.errors = [{
                        instancePath: instancePath + "/type",
                        schemaPath: "#/oneOf/14/properties/type/const",
                        keyword: "const",
                        params: { allowedValue: "progress" }
                      }];
                      return false;
                    }
                    var valid41 = _errs135 === errors;
                  } else var valid41 = true;
                  if (valid41) {
                    if (data.mvcc !== void 0) {
                      const _errs136 = errors;
                      if (!validate81(data.mvcc, {
                        instancePath: instancePath + "/mvcc",
                        parentData: data,
                        parentDataProperty: "mvcc",
                        rootData,
                        dynamicAnchors
                      })) {
                        vErrors = vErrors === null ? validate81.errors : vErrors.concat(validate81.errors);
                        errors = vErrors.length;
                      }
                      var valid41 = _errs136 === errors;
                    } else var valid41 = true;
                  }
                }
              }
            } else {
              validate139.errors = [{
                instancePath,
                schemaPath: "#/oneOf/14/type",
                keyword: "type",
                params: { type: "object" }
              }];
              return false;
            }
          }
          if (props0 !== true) props0 = true;
        } else {
          validate139.errors = [{
            instancePath,
            schemaPath: "#/discriminator",
            keyword: "discriminator",
            params: {
              error: "mapping",
              tag: "type",
              tagValue: tag0
            }
          }];
          return false;
        }
      } else {
        validate139.errors = [{
          instancePath,
          schemaPath: "#/discriminator",
          keyword: "discriminator",
          params: {
            error: "tag",
            tag: "type",
            tagValue: tag0
          }
        }];
        return false;
      }
    } else {
      validate139.errors = [{
        instancePath,
        schemaPath: "#/type",
        keyword: "type",
        params: { type: "object" }
      }];
      return false;
    }
  }
  validate139.errors = vErrors;
  evaluated0.props = props0;
  return errors === 0;
}
validate139.evaluated = {
  "dynamicProps": true,
  "dynamicItems": false
};

// node_modules/@neon/realtime/dist/client/protocol/codec.js
var UTF8 = new TextEncoder();
var validateClientMessage2 = validateClientMessage;
var validateServerMessage2 = validateServerMessage;
var ProtocolError = class extends Error {
  constructor(message) {
    super(`Invalid Realtime protocol message: ${message}`);
    this.name = "ProtocolError";
  }
};
function encodeClientMessage(message) {
  assertSchema(validateClientMessage2, message);
  validateClientUtf8Limits(message);
  return JSON.stringify(message);
}
function decodeServerFrame(text) {
  try {
    rejectDuplicateKeys(text);
  } catch (error) {
    if (error instanceof ProtocolError) throw error;
    throw new ProtocolError("not valid JSON");
  }
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw new ProtocolError("not valid JSON");
  }
  assertSchema(validateServerMessage2, value);
  const message = value;
  validateServerUtf8Limits(message);
  let mvcc;
  if (message.type === "baseline_sync_start" || message.type === "progress") try {
    mvcc = parseMvccSnapshot(message.mvcc);
  } catch (error) {
    throw new ProtocolError(error instanceof Error ? error.message : "invalid MVCC proof");
  }
  return Object.freeze({
    message: freezeWireValue(message),
    mvcc
  });
}
function freezeWireValue(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freezeWireValue(child);
  return Object.freeze(value);
}
function assertSchema(validator, value) {
  if (!validator(value)) throw new ProtocolError(formatSchemaError(validator.errors));
}
function formatSchemaError(errors) {
  const base64Error = errors?.find((error2) => schemaPattern(error2) === realtimeSchemaPatterns.base64Cell);
  if (base64Error !== void 0) return `${jsonPointerPath(base64Error.instancePath)} is not canonical base64`;
  const cellShapeError = errors?.find((error2) => error2.keyword === "oneOf" && /\/values\/[0-9]+$/u.test(error2.instancePath));
  if (cellShapeError !== void 0) return `${jsonPointerPath(cellShapeError.instancePath)} is not a valid wire cell`;
  const error = errors?.[0];
  if (error === void 0) return "does not match the protocol schema";
  const path = jsonPointerPath(error.instancePath);
  if (error.keyword === "discriminator") {
    const tag = typeof error.params.tag === "string" ? error.params.tag : "type";
    const tagValue = error.params.tagValue;
    return tagValue === void 0 ? `${path} is missing ${tag}` : `${path} has unknown ${tag} ${JSON.stringify(tagValue)}`;
  }
  if (error.keyword === "required") return `${path} is missing ${String(error.params.missingProperty)}`;
  if (error.keyword === "additionalProperties") return `${path} has unexpected field ${String(error.params.additionalProperty)}`;
  if (schemaPattern(error) === realtimeSchemaPatterns.u64) return `${path} is not a canonical positive uint64`;
  if (schemaPattern(error) === realtimeSchemaPatterns.rowKey) return `${path} is not a lowercase 32-byte hex digest`;
  if (schemaPattern(error) === realtimeSchemaPatterns.heartbeatToken) return `${path} is not a valid heartbeat token`;
  if (path.endsWith("frontier.lsn")) return `${path} is not canonical`;
  if (error.keyword === "type") return `${path} must be ${String(error.params.type)}`;
  if (error.keyword === "enum" || error.keyword === "const") return `${path} has an unknown value`;
  if (error.keyword === "minimum" || error.keyword === "maximum") return `${path} is outside its numeric bounds`;
  if (error.keyword === "pattern") return `${path} is outside its format or length bounds`;
  return `${path} ${error.message ?? "does not match the protocol schema"}`;
}
function schemaPattern(error) {
  return typeof error.params.pattern === "string" ? error.params.pattern : void 0;
}
function jsonPointerPath(pointer) {
  if (pointer === "") return "message";
  return pointer.slice(1).split("/").map((segment) => segment.replaceAll("~1", "/").replaceAll("~0", "~")).reduce((path, segment) => {
    if (/^[0-9]+$/u.test(segment)) return `${path}[${segment}]`;
    return path === "" ? segment : `${path}.${segment}`;
  }, "");
}
function validateClientUtf8Limits(message) {
  switch (wireString(message, "type")) {
    case "subscribe":
    case "renew":
      assertMaxUtf8Bytes(wireString(message, "authorization"), "authorization", 262144);
      break;
    case "ping":
    case "pong":
      assertMaxUtf8Bytes(wireString(message, "token"), "token", 64);
  }
}
function validateServerUtf8Limits(message) {
  switch (wireString(message, "type")) {
    case "open":
    case "keyed_results":
    case "reset_required":
    case "commit":
      assertMaxUtf8Bytes(wireString(message, "publication_id"), "publication_id", 64);
      break;
    case "ping":
    case "pong":
      assertMaxUtf8Bytes(wireString(message, "token"), "token", 64);
  }
}
function assertMaxUtf8Bytes(value, field, maximum) {
  if (utf8ByteLength(value) > maximum) throw new ProtocolError(`${field} exceeds its UTF-8 byte limit`);
}
function wireString(value, field) {
  return value[field];
}
function utf8ByteLength(value) {
  return UTF8.encode(value).byteLength;
}
function rejectDuplicateKeys(text) {
  const objects = [];
  for (let index = 0; index < text.length; index += 1) {
    const token = text[index];
    if (token === "{") objects.push(/* @__PURE__ */ new Set());
    else if (token === "[") objects.push(void 0);
    else if (token === "}" || token === "]") objects.pop();
    else if (token === '"') {
      const start = index;
      index += 1;
      while (index < text.length && text[index] !== '"') {
        if (text[index] === "\\") index += 1;
        index += 1;
      }
      let after = index + 1;
      while (after < text.length && /\s/u.test(text.charAt(after))) after += 1;
      if (text[after] !== ":") continue;
      const keys = objects.at(-1);
      if (keys === void 0) throw new ProtocolError("object key appears outside an object");
      const key = JSON.parse(text.slice(start, index + 1));
      if (keys.has(key)) throw new ProtocolError("duplicate object key");
      keys.add(key);
    }
  }
}

// node_modules/@neon/realtime/dist/client/protocol/messages.js
var REALTIME_SUBPROTOCOL = "neon.realtime.v1";

// node_modules/@neon/realtime/dist/client/reconciliation/reconciler.js
var SILENT_RECONCILIATION_EVENTS = Object.freeze({ publicationCommitted: () => void 0 });
var BaselineSyncPublicationReconciler = class {
  events;
  targets = /* @__PURE__ */ new Map();
  publication;
  constructor(events = SILENT_RECONCILIATION_EVENTS) {
    this.events = events;
  }
  add(input) {
    if (this.targets.has(input.liveId)) throw new ProtocolError("duplicate live ID");
    this.targets.set(input.liveId, {
      target: input.target,
      lifecycle: input.lifecycle,
      columnCount: input.columnCount,
      active: true,
      epoch: BigInt(input.epoch),
      nextSequence: BigInt(input.firstSequence),
      backlog: [],
      live: false
    });
  }
  /**
  * Stop local delivery while retaining protocol state until unsubscribe is
  * acknowledged.
  */
  deactivate(liveId) {
    const state = this.target(liveId);
    if (!state.active) return;
    state.active = false;
    state.baselineSync = void 0;
    this.releaseBacklog(state);
    state.live = false;
    this.publication?.batches.delete(liveId);
    this.publication?.resets.delete(liveId);
  }
  remove(liveId) {
    const state = this.targets.get(liveId);
    if (!state) return;
    this.releaseBacklog(state);
    this.publication?.batches.delete(liveId);
    this.publication?.resets.delete(liveId);
    this.targets.delete(liveId);
  }
  clear() {
    this.targets.clear();
    this.publication = void 0;
  }
  accept(message, mvcc) {
    if (this.publication && (message.type === "baseline_sync_start" || message.type === "baseline_sync_batch" || message.type === "baseline_sync_end")) throw new ProtocolError("baseline sync interrupted a publication");
    switch (message.type) {
      case "progress":
        this.progress(mvcc ?? parseMvccSnapshot(message.mvcc));
        return;
      case "baseline_sync_start":
        this.baselineSyncStart(message);
        return;
      case "baseline_sync_batch":
        this.baselineSyncBatch(message);
        return;
      case "baseline_sync_end":
        this.baselineSyncEnd(message);
        return;
      case "open":
        this.publicationOpen(message.publication_id);
        return;
      case "keyed_results":
        this.keyedResults(message);
        return;
      case "reset_required":
        this.stageReset(message);
        return;
      case "commit":
        this.publicationCommit(message.publication_id, message.body_count);
        return;
    }
  }
  progress(mvcc) {
    if (this.publication) throw new ProtocolError("progress interrupted a publication");
    for (const state of this.targets.values()) if (state.active && state.live) state.target.applyProgress(mvcc);
  }
  baselineSyncStart(message) {
    const state = this.target(message.live_id);
    if (!state.active) return;
    const version = baselineSyncVersion(message.epoch, message.baseline_sync_attempt);
    if (version.epoch < state.epoch || isOlder(version, state.latestBaselineSync)) return;
    if (version.epoch !== state.epoch || sameVersion(version, state.latestBaselineSync) || state.live) throw new ProtocolError("invalid baseline sync start");
    state.latestBaselineSync = version;
    state.baselineSync = {
      version,
      mvcc: message.mvcc,
      nextBatch: 0,
      rows: [],
      rowKeys: /* @__PURE__ */ new Set()
    };
    state.target.baselineSyncStarted();
  }
  baselineSyncBatch(message) {
    const state = this.target(message.live_id);
    if (!state.active) return;
    const version = baselineSyncVersion(message.epoch, message.baseline_sync_attempt);
    if (version.epoch < state.epoch || isOlder(version, state.latestBaselineSync)) return;
    const baselineSync = state.baselineSync;
    if (version.epoch !== state.epoch || !baselineSync || !sameVersion(version, baselineSync.version) || message.index !== baselineSync.nextBatch) throw new ProtocolError("invalid baseline sync batch");
    for (const row of message.rows) {
      if (row.values.length !== state.columnCount) throw new ProtocolError("baseline sync row arity does not match columns");
      if (baselineSync.rowKeys.has(row.row_key)) throw new ProtocolError("baseline sync contains a duplicate row key");
      baselineSync.rowKeys.add(row.row_key);
      baselineSync.rows.push(row);
    }
    baselineSync.nextBatch += 1;
  }
  baselineSyncEnd(message) {
    const state = this.target(message.live_id);
    if (!state.active) return;
    const version = baselineSyncVersion(message.epoch, message.baseline_sync_attempt);
    if (version.epoch < state.epoch || isOlder(version, state.latestBaselineSync)) return;
    const baselineSync = state.baselineSync;
    if (version.epoch !== state.epoch || !baselineSync || !sameVersion(version, baselineSync.version) || message.batch_count !== baselineSync.nextBatch) throw new ProtocolError("invalid baseline sync end");
    const replay = state.backlog;
    const rows = Object.freeze([...baselineSync.rows]);
    state.baselineSync = void 0;
    this.releaseBacklog(state);
    try {
      state.target.installReset(rows);
      for (const batch of replay) if (batch.changes.length > 0) state.target.applyBatch(batch.changes);
    } catch (error) {
      state.active = false;
      state.live = false;
      state.target.decodeFailed(error);
      return;
    }
    state.target.baselineSyncCompleted(message.batch_count);
    state.target.publishReset(rows, baselineSync.mvcc);
    for (const batch of replay) state.target.publishBatch(batch);
    state.live = true;
    state.lifecycle?.baselineCompleted();
    state.target.caughtUp();
  }
  publicationOpen(publicationId) {
    if (this.publication) throw new ProtocolError("overlapping publication");
    this.publication = {
      id: publicationId,
      nextBody: 0,
      batches: /* @__PURE__ */ new Map(),
      resets: /* @__PURE__ */ new Map()
    };
  }
  keyedResults(message) {
    const publication = this.publicationBody(message.publication_id, message.index);
    const bodyTargets = /* @__PURE__ */ new Set();
    for (const target of message.targets) {
      const state = this.target(target.live_id);
      if (bodyTargets.has(target.live_id)) throw new ProtocolError("invalid publication target");
      bodyTargets.add(target.live_id);
      if (!state.active) continue;
      const sequence = BigInt(target.sequence);
      const existing = publication.batches.get(target.live_id);
      if (publication.resets.has(target.live_id) || state.epoch !== BigInt(target.epoch) || state.nextSequence !== sequence || existing && (existing.nextSequence !== sequence + 1n || !sameStrings(existing.txids, message.txids))) throw new ProtocolError("invalid publication target");
      for (const change of message.changes) if (change.op === "upsert" && change.values.length !== state.columnCount) throw new ProtocolError("publication row arity does not match columns");
      if (existing) existing.changes.push(...message.changes);
      else publication.batches.set(target.live_id, {
        changes: [...message.changes],
        txids: message.txids,
        nextSequence: sequence + 1n
      });
    }
  }
  stageReset(message) {
    const publication = this.publicationBody(message.publication_id, message.index);
    for (const target of message.targets) {
      const state = this.target(target.live_id);
      if (!state.active) continue;
      const epoch = BigInt(target.epoch);
      if (epoch <= state.epoch || publication.batches.has(target.live_id) || publication.resets.has(target.live_id)) throw new ProtocolError("invalid reset target");
      publication.resets.set(target.live_id, {
        epoch,
        firstSequence: BigInt(target.first_sequence)
      });
    }
  }
  publicationCommit(publicationId, bodyCount) {
    const publication = this.publication;
    if (!publication || publication.id !== publicationId || publication.nextBody !== bodyCount) throw new ProtocolError("invalid publication commit");
    this.publication = void 0;
    const immediate = [];
    for (const [liveId, staged] of publication.batches) {
      const state = this.target(liveId);
      state.nextSequence = staged.nextSequence;
      const batch = Object.freeze({
        changes: Object.freeze([...staged.changes]),
        txids: Object.freeze([...staged.txids])
      });
      if (state.live) immediate.push({
        state,
        batch
      });
      else state.backlog.push(batch);
    }
    const resetStates = [];
    for (const [liveId, reset] of publication.resets) {
      const state = this.target(liveId);
      state.epoch = reset.epoch;
      state.nextSequence = reset.firstSequence;
      state.latestBaselineSync = void 0;
      state.baselineSync = void 0;
      this.releaseBacklog(state);
      state.live = false;
      resetStates.push(state);
    }
    const installed = [];
    const failed = [];
    for (const entry of immediate) try {
      entry.state.target.applyBatch(entry.batch.changes);
      installed.push(entry);
    } catch (error) {
      entry.state.active = false;
      entry.state.live = false;
      failed.push({
        state: entry.state,
        error
      });
    }
    this.events.publicationCommitted(bodyCount);
    for (const state of resetStates) {
      state.lifecycle?.interrupted();
      state.target.resetRequired();
    }
    for (const { state, error } of failed) state.target.decodeFailed(error);
    for (const { state, batch } of installed) state.target.publishBatch(batch);
  }
  publicationBody(publicationId, index) {
    const publication = this.publication;
    if (!publication || publication.id !== publicationId || publication.nextBody !== index) throw new ProtocolError("invalid publication body");
    publication.nextBody += 1;
    return publication;
  }
  releaseBacklog(state) {
    state.backlog = [];
  }
  target(liveId) {
    const target = this.targets.get(liveId);
    if (!target) throw new ProtocolError("unknown live ID");
    return target;
  }
};
function baselineSyncVersion(epoch, attempt) {
  return {
    epoch: BigInt(epoch),
    attempt: BigInt(attempt)
  };
}
function sameVersion(left, right) {
  return right !== void 0 && left.epoch === right.epoch && left.attempt === right.attempt;
}
function isOlder(candidate, current) {
  return current !== void 0 && (candidate.epoch < current.epoch || candidate.epoch === current.epoch && candidate.attempt < current.attempt);
}
function sameStrings(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

// node_modules/@neon/realtime/dist/client/connection/heartbeat.js
var DEFAULT_IDLE_MS = 2e4;
var DEFAULT_TIMEOUT_MS = 1e4;
var ConnectionHeartbeat = class {
  callbacks;
  idleMs;
  timeoutMs;
  setTimer;
  clearTimer;
  idleTimer;
  timeoutTimer;
  generation = 0;
  nextToken = 1;
  active = false;
  constructor(options, callbacks) {
    this.callbacks = callbacks;
    this.idleMs = positiveSafeInteger(options.idleMs ?? DEFAULT_IDLE_MS, "heartbeat.idleMs");
    this.timeoutMs = positiveSafeInteger(options.timeoutMs ?? DEFAULT_TIMEOUT_MS, "heartbeat.timeoutMs");
    this.setTimer = options.setTimer ?? ((callback, delayMs) => setTimeout(callback, delayMs));
    this.clearTimer = options.clearTimer ?? ((handle) => clearTimeout(handle));
  }
  start() {
    this.active = true;
    this.armIdleTimer();
  }
  /** Any valid inbound message proves that the peer is still processing. */
  received() {
    if (!this.active) return;
    this.armIdleTimer();
  }
  stop() {
    this.active = false;
    this.clearTimers();
  }
  armIdleTimer() {
    this.clearTimers();
    const generation = this.generation;
    this.idleTimer = this.setTimer(() => {
      if (!this.active || generation !== this.generation) return;
      this.idleTimer = void 0;
      if (!this.callbacks.sendPing(`c${this.nextToken++}`) || !this.active || generation !== this.generation) return;
      this.timeoutTimer = this.setTimer(() => {
        if (!this.active || generation !== this.generation) return;
        this.timeoutTimer = void 0;
        this.callbacks.timedOut();
      }, this.timeoutMs);
    }, this.idleMs);
  }
  clearTimers() {
    this.generation += 1;
    if (this.idleTimer !== void 0) this.clearTimer(this.idleTimer);
    if (this.timeoutTimer !== void 0) this.clearTimer(this.timeoutTimer);
    this.idleTimer = void 0;
    this.timeoutTimer = void 0;
  }
};
function positiveSafeInteger(value, name) {
  if (!Number.isSafeInteger(value) || value <= 0) throw new RangeError(`${name} must be a positive safe integer`);
  return value;
}

// node_modules/@neon/realtime/dist/client/connection/timer.js
var MAX_TIMEOUT_MS = 2 ** 31 - 1;
function monotonicNow() {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}
function setDeadlineTimer(callback, delayMs, clearTimer = (handle) => clearTimeout(handle)) {
  const deadline = monotonicNow() + delayMs;
  let active = true;
  let cancelInterval = () => {
  };
  const schedule = (remainingMs) => {
    const handle = setTimeout(() => {
      if (!active) return;
      const remaining = deadline - monotonicNow();
      if (remaining > 0) schedule(remaining);
      else {
        active = false;
        callback();
      }
    }, Math.min(MAX_TIMEOUT_MS, Math.ceil(remainingMs)));
    cancelInterval = () => clearTimer(handle);
  };
  schedule(delayMs);
  return () => {
    if (!active) return;
    active = false;
    cancelInterval();
  };
}

// node_modules/@neon/realtime/dist/client/connection/reconnect.js
var ReconnectBackoff = class {
  stabilityMs;
  baseMs;
  capMs;
  maxAttempts;
  maxElapsedMs;
  unbounded;
  overloadJitterCapMs;
  random;
  now;
  setTimerImpl;
  attempt = 0;
  exponent = 0;
  startedAt;
  constructor(options = {}) {
    this.baseMs = positiveSafeInteger2(options.baseMs ?? 1e3, "reconnect.baseMs");
    this.capMs = positiveSafeInteger2(options.capMs ?? 6e4, "reconnect.capMs");
    if (this.baseMs > this.capMs) throw new RangeError("reconnect.baseMs must not exceed reconnect.capMs");
    this.stabilityMs = positiveSafeInteger2(options.stabilityMs ?? 3e4, "reconnect.stabilityMs");
    this.unbounded = options.unbounded ?? (options.maxAttempts === void 0 && options.maxElapsedMs === void 0);
    this.maxAttempts = positiveSafeInteger2(options.maxAttempts ?? 20, "reconnect.maxAttempts");
    this.maxElapsedMs = positiveSafeInteger2(options.maxElapsedMs ?? 9e5, "reconnect.maxElapsedMs");
    this.overloadJitterCapMs = positiveSafeInteger2(options.overloadJitterCapMs ?? 3e4, "reconnect.overloadJitterCapMs");
    const configuredRandom = options.random ?? Math.random;
    let firstRandom = unitInterval(configuredRandom(), "reconnect.random");
    this.random = () => {
      if (firstRandom !== void 0) {
        const value = firstRandom;
        firstRandom = void 0;
        return value;
      }
      return unitInterval(configuredRandom(), "reconnect.random");
    };
    const configuredNow = options.now ?? monotonicNow;
    let lastNow = nonnegativeFinite(configuredNow(), "reconnect.now");
    this.now = () => {
      const sampled = nonnegativeFinite(configuredNow(), "reconnect.now");
      lastNow = Math.max(lastNow, sampled);
      return lastNow;
    };
    const clearTimer = options.clearTimer ?? ((handle) => clearTimeout(handle));
    this.setTimerImpl = (callback, delayMs) => {
      if (!options.setTimer) return setDeadlineTimer(callback, delayMs, clearTimer);
      let active = true;
      const handle = options.setTimer(() => {
        if (!active) return;
        active = false;
        callback();
      }, delayMs);
      return () => {
        if (!active) return;
        active = false;
        clearTimer(handle);
      };
    };
  }
  get active() {
    return this.startedAt !== void 0;
  }
  next(retryAfterMs) {
    const now = this.now();
    this.startedAt ??= now;
    const elapsedMs = now - this.startedAt;
    if (!this.unbounded && (this.attempt >= this.maxAttempts || elapsedMs >= this.maxElapsedMs)) return;
    const remainingMs = this.unbounded ? Number.POSITIVE_INFINITY : this.maxElapsedMs - elapsedMs;
    let delayMs;
    if (retryAfterMs === void 0) {
      delayMs = Math.min(equalJitterDelayMs(this.exponent, this.baseMs, this.capMs, this.random), remainingMs);
      this.exponent += 1;
    } else {
      const hint = Math.max(retryAfterMs, 100);
      const ceiling = Math.max(hint, Math.min(2 * hint, this.overloadJitterCapMs));
      delayMs = hint + this.random() * (ceiling - hint);
    }
    this.attempt += 1;
    return Object.freeze({
      attempt: this.attempt,
      delayMs,
      remainingMs
    });
  }
  reset() {
    this.attempt = 0;
    this.exponent = 0;
    this.startedAt = void 0;
  }
  setTimer(callback, delayMs) {
    return this.setTimerImpl(callback, delayMs);
  }
  clearTimer(handle) {
    handle();
  }
};
function equalJitterDelayMs(attempt, baseMs, capMs, random) {
  const half = Math.min(capMs, baseMs * 2 ** attempt) / 2;
  return half + unitInterval(random(), "reconnect.random") * half;
}
function positiveSafeInteger2(value, name) {
  if (!Number.isSafeInteger(value) || value <= 0) throw new RangeError(`${name} must be a positive safe integer`);
  return value;
}
function unitInterval(value, name) {
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError(`${name} must return a finite number in [0, 1)`);
  return value;
}
function nonnegativeFinite(value, name) {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${name} must return a non-negative finite number`);
  return value;
}

// node_modules/@neon/realtime/dist/client/connection/subscription-recovery.js
var SubscriptionRecovery = class {
  options;
  callbacks;
  episode;
  stabilityGeneration = 0;
  constructor(options, callbacks) {
    this.options = options;
    this.callbacks = callbacks;
  }
  get waiting() {
    return this.episode?.waiting ?? false;
  }
  /** Returns false when recovery is disabled or its policy is exhausted. */
  retry(error, retryAfterMs) {
    if (this.options === false) return false;
    this.interrupted();
    let episode;
    let attempt;
    try {
      const options = typeof this.options === "object" ? this.options : {};
      episode = this.episode ??= {
        backoff: new ReconnectBackoff(options),
        error,
        waiting: false
      };
      episode.error = error;
      attempt = episode.backoff.next(retryAfterMs);
    } catch {
      this.cancel();
      return false;
    }
    if (!attempt) {
      this.cancel();
      return false;
    }
    if (episode.delayTimer !== void 0) episode.backoff.clearTimer(episode.delayTimer);
    episode.waiting = true;
    if (episode.deadlineTimer === void 0 && Number.isFinite(attempt.remainingMs)) episode.deadlineTimer = setDeadlineTimer(() => {
      if (this.episode !== episode) return;
      this.cancel();
      this.callbacks.exhausted(episode.error);
    }, attempt.remainingMs);
    episode.delayTimer = episode.backoff.setTimer(() => {
      if (this.episode !== episode || !episode.waiting) return;
      episode.delayTimer = void 0;
      episode.waiting = false;
      this.callbacks.resubscribe();
    }, attempt.delayMs);
    this.callbacks.scheduled(error.code, attempt.attempt, attempt.delayMs);
    return true;
  }
  /** Admission alone does not establish stability; a complete baseline does. */
  baselineCompleted() {
    const episode = this.episode;
    if (!episode || episode.waiting) return;
    this.interrupted();
    const generation = this.stabilityGeneration;
    episode.stabilityTimer = episode.backoff.setTimer(() => {
      if (this.episode === episode && this.stabilityGeneration === generation) this.cancel();
    }, episode.backoff.stabilityMs);
  }
  /** Socket loss, query replacement, and baseline resets preserve the episode. */
  interrupted() {
    this.stabilityGeneration += 1;
    const episode = this.episode;
    if (episode?.stabilityTimer !== void 0) {
      episode.backoff.clearTimer(episode.stabilityTimer);
      episode.stabilityTimer = void 0;
    }
  }
  cancel() {
    this.interrupted();
    const episode = this.episode;
    if (!episode) return;
    this.episode = void 0;
    if (episode.delayTimer !== void 0) episode.backoff.clearTimer(episode.delayTimer);
    if (episode.deadlineTimer !== void 0) episode.deadlineTimer();
  }
};

// node_modules/@neon/realtime/dist/client/connection/coordinator.js
var SOCKET_CONNECTING = 0;
var SOCKET_OPEN = 1;
var SOCKET_CLOSING = 2;
var SOCKET_CLOSED = 3;
var SOCKET_CLOSE_GRACE_MS = 1e3;
var NORMAL_CLOSE = 1e3;
var APPLICATION_CLOSE = 4e3;
var ConnectionCoordinatorError = class extends Error {
  code;
  retryable;
  sqlState;
  constructor(code, retryable, message, options) {
    super(message, options);
    this.code = code;
    this.retryable = retryable;
    this.name = "ConnectionCoordinatorError";
    this.sqlState = options?.sqlState;
  }
};
var ManagedSubscription = class {
  query;
  callbacks;
  events;
  recovery;
  state = "active";
  requestId;
  requestedCapability;
  acceptedCapability;
  liveId;
  renewing;
  queuedRenewals = [];
  constructor(query, callbacks, events, recovery) {
    this.query = query;
    this.callbacks = callbacks;
    this.events = events;
    this.recovery = recovery;
  }
  /** Forget a detached wire attempt, preserving renewals for re-admission. */
  resetWire() {
    this.recovery.interrupted();
    this.requestId = void 0;
    this.requestedCapability = void 0;
    this.acceptedCapability = void 0;
    this.liveId = void 0;
    if (this.renewing) {
      this.queuedRenewals.unshift(this.renewing);
      this.renewing = void 0;
    }
  }
};
var ConnectionCoordinator = class {
  options;
  managedSubscriptions = /* @__PURE__ */ new Set();
  activeSubscriptions = /* @__PURE__ */ new Set();
  pendingRequests = /* @__PURE__ */ new Map();
  liveSubscriptions = /* @__PURE__ */ new Map();
  detachingLiveIds = /* @__PURE__ */ new Set();
  reconciler;
  webSocketFactory;
  reconnect;
  heartbeat;
  events;
  socket;
  reconnectTimer;
  reconnectDeadlineTimer;
  stabilityTimer;
  reconnectGeneration = 0;
  reconnectEpisodeGeneration = 0;
  requestId = 0n;
  ready = false;
  disposed = false;
  terminalConnection;
  pendingConnectionError;
  constructor(options) {
    this.options = options;
    if (!options.url) throw new Error("Realtime requires a WebSocket URL");
    this.events = options.events ?? SILENT_CLIENT_EVENTS;
    this.reconciler = new BaselineSyncPublicationReconciler(this.events === SILENT_CLIENT_EVENTS ? void 0 : this.reconciliationEvents());
    this.webSocketFactory = options.webSocketFactory ?? defaultWebSocketFactory;
    if (options.reconnect !== false) {
      const reconnectOptions = options.reconnect === true || options.reconnect === void 0 ? {} : options.reconnect;
      this.reconnect = new ReconnectBackoff(reconnectOptions);
    }
    if (options.heartbeat !== false) {
      const heartbeatOptions = options.heartbeat === true || options.heartbeat === void 0 ? {} : options.heartbeat;
      this.heartbeat = new ConnectionHeartbeat(heartbeatOptions, {
        sendPing: (token) => {
          const sent = this.send({
            type: "ping",
            token
          });
          if (sent) this.events.connection.heartbeatPingSent();
          return sent;
        },
        timedOut: () => {
          this.events.connection.heartbeatTimedOut();
          this.pendingConnectionError = new ConnectionCoordinatorError("heartbeat_timeout", true, "Realtime connection heartbeat timed out");
          this.closeSocket(APPLICATION_CLOSE, "heartbeat timeout");
        }
      });
    }
  }
  subscribe(query, callbacks) {
    if (this.disposed) throw new Error("Realtime client is closed");
    validateSealedQuery(query);
    const events = callbacks.events ?? this.events.createSubscription();
    const managed = new ManagedSubscription(query, callbacks, events, new SubscriptionRecovery(this.options.reconnect, {
      resubscribe: () => this.sendSubscribe(managed),
      exhausted: (error) => this.failLocalSubscription(managed, error),
      scheduled: (code, attempt, delayMs) => events.retryScheduled(code, attempt, delayMs)
    }));
    this.managedSubscriptions.add(managed);
    this.activeSubscriptions.add(managed);
    managed.events.started();
    if (this.terminalConnection) this.failSubscription(managed, this.terminalConnection);
    else {
      this.connect();
      if (this.ready) this.sendSubscribe(managed);
    }
    return Object.freeze({
      renew: (replacement) => this.renew(managed, replacement),
      fail: (error) => this.failLocalSubscription(managed, error),
      unsubscribe: () => this.unsubscribe(managed)
    });
  }
  close() {
    if (this.disposed) return;
    this.disposed = true;
    this.cancelReconnectEpisode();
    const error = /* @__PURE__ */ new Error("Realtime client is closed");
    for (const subscription2 of this.managedSubscriptions) {
      subscription2.recovery.cancel();
      this.rejectRenewals(subscription2, error);
    }
    this.managedSubscriptions.clear();
    this.activeSubscriptions.clear();
    this.pendingRequests.clear();
    this.liveSubscriptions.clear();
    this.detachingLiveIds.clear();
    this.reconciler.clear();
    this.closeSocket(NORMAL_CLOSE, "client closed");
  }
  renew(subscription2, query) {
    validateSealedQuery(query);
    if (subscription2.state === "closed") return Promise.reject(/* @__PURE__ */ new Error("Live-query subscription is closed"));
    if (subscription2.state === "failed" || this.terminalConnection) return Promise.reject(new ConnectionCoordinatorError("connection_lost", false, "Realtime connection cannot recover"));
    subscription2.query = query;
    this.rejectQueuedRenewals(subscription2, new ConnectionCoordinatorError("renewal_superseded", false, "Live-query renewal was superseded by a newer sealed query"));
    const renewal = promiseWithResolvers();
    const pending = {
      query,
      resolve: () => renewal.resolve(),
      reject: renewal.reject
    };
    subscription2.queuedRenewals.push(pending);
    if (subscription2.state === "awaiting_query") {
      subscription2.state = "active";
      this.activeSubscriptions.add(subscription2);
      subscription2.callbacks.connecting();
      this.connect();
      if (this.ready) this.sendSubscribe(subscription2);
      return renewal.promise;
    }
    this.sendNextRenewal(subscription2);
    return renewal.promise;
  }
  unsubscribe(subscription2) {
    if (subscription2.state === "closed") return;
    subscription2.recovery.cancel();
    subscription2.state = "closed";
    this.managedSubscriptions.delete(subscription2);
    this.activeSubscriptions.delete(subscription2);
    subscription2.events.unsubscribed();
    this.rejectRenewals(subscription2, /* @__PURE__ */ new Error("Live-query subscription is closed"));
    if (subscription2.liveId) {
      this.reconciler.deactivate(subscription2.liveId);
      this.liveSubscriptions.delete(subscription2.liveId);
      this.detachingLiveIds.add(subscription2.liveId);
      this.send({
        type: "unsubscribe",
        live_id: subscription2.liveId
      });
    }
    if (this.activeSubscriptions.size === 0) {
      this.cancelReconnectEpisode();
      this.closeSocket(NORMAL_CLOSE, "no active subscriptions");
    }
  }
  connect() {
    if (this.disposed || this.terminalConnection || this.socket?.readyState === SOCKET_CONNECTING || this.socket?.readyState === SOCKET_OPEN) return;
    this.cancelReconnect();
    this.ready = false;
    this.events.connection.attemptStarted();
    let socket;
    try {
      socket = this.webSocketFactory(this.options.url, REALTIME_SUBPROTOCOL);
    } catch (error) {
      this.noteConnectionLost(error);
      this.scheduleReconnect();
      return;
    }
    this.socket = socket;
    socket.addEventListener("message", (event) => {
      if (this.socket !== socket) return;
      if (typeof event.data !== "string") {
        this.protocolFailure("server sent a non-text frame");
        return;
      }
      this.receive(event.data);
    });
    socket.addEventListener("close", () => {
      if (this.socket !== socket) return;
      this.heartbeat?.stop();
      this.socket = void 0;
      this.disconnected();
    });
    socket.addEventListener("error", () => {
      if (this.socket === socket) this.closeSocket(APPLICATION_CLOSE, "connection failed");
    });
  }
  receive(text) {
    try {
      const frame = decodeServerFrame(text);
      this.heartbeat?.received();
      this.route(frame.message, frame.mvcc);
    } catch (error) {
      this.protocolFailure(error instanceof Error ? error.message : "invalid server message");
    }
  }
  route(message, mvcc) {
    if (!this.ready) {
      if (message.type === "ping") {
        this.send({
          type: "pong",
          token: message.token
        });
        return;
      }
      if (message.type !== "ready") throw new ProtocolError("expected ready as the first server message");
      this.ready = true;
      this.events.connection.ready();
      this.pendingConnectionError = void 0;
      this.heartbeat?.start();
      this.armReconnectStability(this.socket);
      for (const subscription2 of this.activeSubscriptions) this.sendSubscribe(subscription2);
      return;
    }
    switch (message.type) {
      case "ready":
        throw new ProtocolError("received duplicate ready");
      case "subscribed":
        this.admitted(message);
        return;
      case "subscribe_rejected":
        this.rejected(message);
        return;
      case "renewed":
        this.renewed(message.live_id);
        return;
      case "unsubscribed":
        this.unsubscribed(message.live_id);
        return;
      case "subscription_error":
        this.subscriptionError(message);
        return;
      case "connection_error":
        this.connectionError(message.code, message.message);
        return;
      case "ping":
        this.send({
          type: "pong",
          token: message.token
        });
        return;
      case "pong":
        this.events.connection.heartbeatPongReceived();
        return;
      case "baseline_sync_start":
      case "baseline_sync_batch":
      case "baseline_sync_end":
      case "open":
      case "keyed_results":
      case "reset_required":
      case "commit":
      case "progress":
        this.reconciler.accept(message, mvcc);
        return;
    }
  }
  admitted(message) {
    const subscription2 = this.pendingRequests.get(message.request_id);
    if (!subscription2 || subscription2.liveId || this.liveSubscriptions.has(message.live_id)) throw new ProtocolError("invalid subscription admission");
    this.pendingRequests.delete(message.request_id);
    subscription2.requestId = void 0;
    if (subscription2.state === "closed" || subscription2.state === "failed") {
      this.reconciler.add({
        liveId: message.live_id,
        epoch: message.epoch,
        firstSequence: message.first_sequence,
        columnCount: message.columns.length,
        target: subscription2.callbacks.reconciliation
      });
      this.reconciler.deactivate(message.live_id);
      this.detachingLiveIds.add(message.live_id);
      this.send({
        type: "unsubscribe",
        live_id: message.live_id
      });
      return;
    }
    if (subscription2.state !== "active") throw new ProtocolError("admitted an inactive subscription");
    const acceptedCapability = subscription2.requestedCapability;
    if (!acceptedCapability) throw new ProtocolError("admitted a subscription without a sealed query");
    subscription2.liveId = message.live_id;
    subscription2.acceptedCapability = acceptedCapability;
    this.liveSubscriptions.set(message.live_id, subscription2);
    subscription2.callbacks.admitted(message.columns);
    this.reconciler.add({
      liveId: message.live_id,
      epoch: message.epoch,
      firstSequence: message.first_sequence,
      columnCount: message.columns.length,
      target: subscription2.callbacks.reconciliation,
      lifecycle: subscription2.recovery
    });
    if (acceptedCapability === subscription2.query.capability) this.resolveRenewals(subscription2);
    else if (subscription2.queuedRenewals.length > 0) this.sendNextRenewal(subscription2);
    subscription2.requestedCapability = void 0;
    subscription2.events.admitted();
  }
  rejected(message) {
    const subscription2 = this.pendingRequests.get(message.request_id);
    if (!subscription2) throw new ProtocolError("unknown subscribe request ID");
    this.pendingRequests.delete(message.request_id);
    subscription2.requestId = void 0;
    if (subscription2.state === "closed" || subscription2.state === "failed") return;
    if (message.code === "backend_overloaded" || message.code === "backend_unavailable" || message.code === "resource_exhausted") {
      this.retrySubscription(subscription2, message);
      return;
    }
    const replacementRequired = requiresReplacementQuery(message.code);
    const error = new ConnectionCoordinatorError(message.code, replacementRequired, message.message, { sqlState: message.sqlstate });
    if (replacementRequired) {
      this.awaitReplacementQuery(subscription2, subscription2.requestedCapability, error);
      return;
    }
    this.failSubscription(subscription2, error);
  }
  renewed(liveId) {
    const subscription2 = this.liveSubscriptions.get(liveId);
    if (!subscription2?.renewing) throw new ProtocolError("unexpected renewal response");
    const renewal = subscription2.renewing;
    subscription2.renewing = void 0;
    subscription2.acceptedCapability = renewal.query.capability;
    renewal.resolve();
    subscription2.events.renewed();
    this.sendNextRenewal(subscription2);
  }
  unsubscribed(liveId) {
    if (this.detachingLiveIds.delete(liveId)) {
      this.reconciler.remove(liveId);
      return;
    }
    const subscription2 = this.liveSubscriptions.get(liveId);
    if (!subscription2) throw new ProtocolError("unknown unsubscribed live ID");
    this.liveSubscriptions.delete(liveId);
    this.reconciler.remove(liveId);
    subscription2.liveId = void 0;
    if (subscription2.state !== "closed") throw new ProtocolError("server detached an active subscription");
  }
  subscriptionError(message) {
    const { live_id: liveId, code, sqlstate: sqlState } = message;
    if (this.detachingLiveIds.has(liveId)) return;
    const subscription2 = this.liveSubscriptions.get(liveId);
    if (!subscription2) throw new ProtocolError("unknown subscription error live ID");
    if (code === "backend_overloaded" || code === "upstream_cancelled") {
      this.retrySubscription(subscription2, message);
      return;
    }
    const replacementRequired = requiresReplacementQuery(code);
    const error = new ConnectionCoordinatorError(code, replacementRequired, message.message, { sqlState });
    if (replacementRequired) {
      this.awaitReplacementQuery(subscription2, subscription2.acceptedCapability, error);
      return;
    }
    this.failSubscription(subscription2, error);
  }
  /** Retry subscribe_rejected and subscription_error with optional hint. */
  retrySubscription(subscription2, message) {
    const error = new ConnectionCoordinatorError(message.code, false, message.message, { sqlState: message.sqlstate });
    if (!subscription2.recovery.retry(error, message.retry_after_ms)) {
      this.failSubscription(subscription2, error);
      return;
    }
    if (subscription2.requestId) this.pendingRequests.delete(subscription2.requestId);
    if (subscription2.liveId) {
      this.liveSubscriptions.delete(subscription2.liveId);
      this.reconciler.remove(subscription2.liveId);
    }
    subscription2.resetWire();
    subscription2.callbacks.connecting();
  }
  connectionError(code, message) {
    if ([
      "resource_exhausted",
      "slow_consumer",
      "heartbeat_timeout",
      "backend_session_lost",
      "fence_failed",
      "internal_error"
    ].includes(code)) {
      this.pendingConnectionError = new ConnectionCoordinatorError(code, true, message);
      this.closeSocket(APPLICATION_CLOSE, message);
    } else this.failConnection(new ConnectionCoordinatorError(code, false, message));
  }
  sendSubscribe(subscription2) {
    if (subscription2.state !== "active" || !this.ready || subscription2.recovery.waiting || subscription2.requestId || subscription2.liveId) return;
    this.requestId += 1n;
    const requestId = this.requestId.toString();
    subscription2.requestId = requestId;
    subscription2.requestedCapability = subscription2.query.capability;
    this.pendingRequests.set(requestId, subscription2);
    if (subscription2.queuedRenewals.length > 0) subscription2.events.renewalStarted();
    this.send({
      type: "subscribe",
      request_id: requestId,
      authorization: subscription2.query.capability
    });
  }
  sendNextRenewal(subscription2) {
    if (subscription2.state !== "active" || subscription2.renewing || !subscription2.liveId || !this.ready) return;
    const renewal = subscription2.queuedRenewals.shift();
    if (!renewal) return;
    subscription2.renewing = renewal;
    subscription2.events.renewalStarted();
    this.send({
      type: "renew",
      live_id: subscription2.liveId,
      authorization: renewal.query.capability
    });
  }
  disconnected() {
    this.ready = false;
    this.cancelStabilityTimer();
    this.pendingRequests.clear();
    this.liveSubscriptions.clear();
    this.detachingLiveIds.clear();
    this.reconciler.clear();
    if (!this.disposed && !this.terminalConnection && this.activeSubscriptions.size > 0) this.noteConnectionLost(this.pendingConnectionError);
    for (const subscription2 of this.activeSubscriptions) {
      subscription2.resetWire();
      subscription2.callbacks.connecting();
    }
    if (!this.disposed && !this.terminalConnection && this.activeSubscriptions.size > 0) this.scheduleReconnect();
  }
  scheduleReconnect() {
    if (!this.reconnect) {
      this.reconnectExhausted();
      return;
    }
    let attempt;
    try {
      attempt = this.reconnect.next();
    } catch {
      this.reconnectExhausted();
      return;
    }
    if (!attempt) {
      this.reconnectExhausted();
      return;
    }
    this.events.connection.reconnectScheduled(attempt.attempt, attempt.delayMs);
    if (this.reconnectDeadlineTimer === void 0 && Number.isFinite(attempt.remainingMs)) {
      const episodeGeneration = ++this.reconnectEpisodeGeneration;
      this.reconnectDeadlineTimer = setDeadlineTimer(() => {
        this.reconnectDeadlineTimer = void 0;
        if (episodeGeneration === this.reconnectEpisodeGeneration && this.reconnect?.active) this.reconnectExhausted();
      }, attempt.remainingMs);
    }
    const generation = ++this.reconnectGeneration;
    this.reconnectTimer = this.reconnect.setTimer(() => {
      if (generation !== this.reconnectGeneration || this.disposed || this.terminalConnection || this.activeSubscriptions.size === 0) return;
      this.reconnectTimer = void 0;
      this.connect();
    }, attempt.delayMs);
  }
  armReconnectStability(socket) {
    if (!socket || !this.reconnect?.active) return;
    this.cancelStabilityTimer();
    const episodeGeneration = this.reconnectEpisodeGeneration;
    this.stabilityTimer = this.reconnect.setTimer(() => {
      if (episodeGeneration !== this.reconnectEpisodeGeneration || this.socket !== socket || !this.ready) return;
      this.stabilityTimer = void 0;
      this.reconnect?.reset();
      this.cancelReconnectDeadline();
      this.events.connection.stable();
    }, this.reconnect.stabilityMs);
  }
  reconnectExhausted() {
    if (this.terminalConnection) return;
    const error = new ConnectionCoordinatorError("connection_lost", false, "Realtime connection could not be restored");
    this.events.connection.reconnectExhausted(error);
    this.terminateConnection(error);
  }
  failSubscription(subscription2, error) {
    this.terminateSubscription(subscription2, error, () => subscription2.events.failed(error));
  }
  terminateSubscription(subscription2, error, beforeCallbacks) {
    subscription2.recovery.cancel();
    subscription2.state = "failed";
    this.activeSubscriptions.delete(subscription2);
    if (subscription2.requestId) this.pendingRequests.delete(subscription2.requestId);
    if (subscription2.liveId) {
      this.liveSubscriptions.delete(subscription2.liveId);
      this.reconciler.remove(subscription2.liveId);
    }
    subscription2.resetWire();
    this.rejectRenewals(subscription2, error);
    beforeCallbacks?.();
    subscription2.callbacks.failed(error);
  }
  failLocalSubscription(subscription2, error) {
    if (subscription2.state === "failed" || subscription2.state === "closed") return;
    subscription2.recovery.cancel();
    subscription2.state = "failed";
    this.activeSubscriptions.delete(subscription2);
    const liveId = subscription2.liveId;
    if (liveId) {
      this.reconciler.deactivate(liveId);
      this.liveSubscriptions.delete(liveId);
      this.detachingLiveIds.add(liveId);
      this.send({
        type: "unsubscribe",
        live_id: liveId
      });
    }
    subscription2.resetWire();
    this.rejectRenewals(subscription2, error);
    subscription2.events.failed(error);
    subscription2.callbacks.failed(error);
    if (this.activeSubscriptions.size === 0) {
      this.cancelReconnectEpisode();
      this.closeSocket(NORMAL_CLOSE, "no active subscriptions");
    }
  }
  awaitReplacementQuery(subscription2, rejectedCapability, error) {
    this.activeSubscriptions.delete(subscription2);
    if (subscription2.requestId) this.pendingRequests.delete(subscription2.requestId);
    if (subscription2.liveId) {
      this.liveSubscriptions.delete(subscription2.liveId);
      this.reconciler.remove(subscription2.liveId);
    }
    subscription2.resetWire();
    subscription2.events.queryUnavailable(error);
    subscription2.callbacks.queryUnavailable();
    if (rejectedCapability !== void 0 && subscription2.query.capability !== rejectedCapability) {
      subscription2.state = "active";
      this.activeSubscriptions.add(subscription2);
      subscription2.callbacks.connecting();
      this.connect();
      if (this.ready) this.sendSubscribe(subscription2);
      return;
    }
    subscription2.state = "awaiting_query";
    this.rejectRenewals(subscription2, error);
  }
  protocolFailure(message) {
    this.failConnection(new ConnectionCoordinatorError("protocol_error", false, message));
  }
  failConnection(error) {
    if (this.terminalConnection) return;
    this.events.connection.failed(error);
    this.terminateConnection(error);
  }
  terminateConnection(error) {
    this.terminalConnection = error;
    this.cancelReconnectEpisode();
    const subscriptions = [...this.managedSubscriptions].filter((subscription2) => subscription2.state === "active" || subscription2.state === "awaiting_query");
    for (const subscription2 of subscriptions) this.terminateSubscription(subscription2, error);
    this.closeSocket(APPLICATION_CLOSE, "protocol failure");
  }
  rejectRenewals(subscription2, error) {
    subscription2.renewing?.reject(error);
    subscription2.renewing = void 0;
    this.rejectQueuedRenewals(subscription2, error);
  }
  rejectQueuedRenewals(subscription2, error) {
    for (const renewal of subscription2.queuedRenewals) renewal.reject(error);
    subscription2.queuedRenewals = [];
  }
  resolveRenewals(subscription2) {
    const renewed = subscription2.renewing !== void 0 || subscription2.queuedRenewals.length > 0;
    subscription2.renewing?.resolve();
    subscription2.renewing = void 0;
    for (const renewal of subscription2.queuedRenewals) renewal.resolve();
    subscription2.queuedRenewals = [];
    if (renewed) subscription2.events.renewed();
  }
  send(message) {
    if (!this.socket || this.socket.readyState !== SOCKET_OPEN) return false;
    this.socket.send(encodeClientMessage(message));
    return true;
  }
  closeSocket(code, reason) {
    this.heartbeat?.stop();
    const socket = this.socket;
    if (!socket) return;
    let forceCloseTimer;
    socket.addEventListener("close", () => {
      if (forceCloseTimer !== void 0) clearTimeout(forceCloseTimer);
      forceCloseTimer = void 0;
    });
    this.socket = void 0;
    try {
      if (socket.readyState < SOCKET_CLOSING) socket.close(code, reason);
      const terminate = socket.terminate?.bind(socket);
      if (terminate && socket.readyState < SOCKET_CLOSED) forceCloseTimer = setTimeout(() => {
        forceCloseTimer = void 0;
        if (socket.readyState < SOCKET_CLOSED) terminate();
      }, SOCKET_CLOSE_GRACE_MS);
    } finally {
      this.disconnected();
    }
  }
  cancelReconnect() {
    this.reconnectGeneration += 1;
    if (this.reconnectTimer !== void 0) this.reconnect?.clearTimer(this.reconnectTimer);
    this.reconnectTimer = void 0;
  }
  cancelStabilityTimer() {
    if (this.stabilityTimer !== void 0) this.reconnect?.clearTimer(this.stabilityTimer);
    this.stabilityTimer = void 0;
  }
  cancelReconnectDeadline() {
    this.reconnectEpisodeGeneration += 1;
    if (this.reconnectDeadlineTimer !== void 0) this.reconnectDeadlineTimer();
    this.reconnectDeadlineTimer = void 0;
  }
  cancelReconnectEpisode() {
    this.cancelReconnect();
    this.cancelStabilityTimer();
    this.cancelReconnectDeadline();
    this.reconnect?.reset();
    this.pendingConnectionError = void 0;
    this.events.connection.episodeEnded();
  }
  noteConnectionLost(error) {
    this.events.connection.lost(error, this.activeSubscriptions.size);
  }
  reconciliationEvents() {
    return { publicationCommitted: (bodyCount) => this.events.connection.publicationCommitted(bodyCount) };
  }
};
function defaultWebSocketFactory(url, protocols) {
  return new WebSocket(url, protocols);
}
function validateSealedQuery(query) {
  if (!query || typeof query.capability !== "string" || !query.capability) throw new Error("Invalid sealed live query");
}
function requiresReplacementQuery(code) {
  return code === "authorization_expired";
}
function promiseWithResolvers() {
  let resolve;
  let reject;
  return {
    promise: new Promise((resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    }),
    resolve,
    reject
  };
}

// node_modules/@neon/realtime/dist/client/base64.js
var import_base64_js = __toESM(require_base64_js(), 1);
function decodeBase64(value) {
  return (0, import_base64_js.toByteArray)(value);
}

// node_modules/@neon/realtime/dist/client/sealed-query.js
function validateSealedQuery2(query) {
  if (!query || typeof query.capability !== "string" || !validCompactJweHeader(query.capability) || typeof query.queryFingerprint !== "string" || !/^[0-9a-f]{64}$/.test(query.queryFingerprint) || !Number.isSafeInteger(query.expiresAt) || query.expiresAt <= 0) throw new Error("Invalid sealed live query");
}
function validCompactJweHeader(capability) {
  try {
    const segments = capability.split(".");
    if (segments.length !== 5 || segments[1] !== "" || segments.some((part, index) => index !== 1 && !part)) return false;
    const encodedHeader = segments[0];
    if (!encodedHeader) return false;
    const header = JSON.parse(decodeAscii(decodeBase64Url(encodedHeader)));
    return isRecord(header) && Object.keys(header).sort().join(",") === "alg,enc,v" && header.alg === "dir" && header.enc === "A256GCM" && header.v === 1;
  } catch {
    return false;
  }
}
function decodeAscii(value) {
  let decoded = "";
  for (const byte of value) {
    if (byte > 127) throw new Error();
    decoded += String.fromCharCode(byte);
  }
  return decoded;
}
function decodeBase64Url(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error();
  const standard = value.replace(/-/g, "+").replace(/_/g, "/");
  return decodeBase64(standard + "=".repeat((4 - standard.length % 4) % 4));
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// node_modules/@neon/realtime/dist/client/postgres/value-decoder.js
var PostgresValueParserError = class extends Error {
  columnName;
  oid;
  constructor(column, cause) {
    super(`Realtime could not parse result column ${JSON.stringify(column.name)} (PostgreSQL type OID ${column.type_oid})`, { cause });
    this.name = "PostgresValueParserError";
    this.columnName = column.name;
    this.oid = column.type_oid;
  }
};
function validateColumns(columns) {
  if (columns.length === 0) throw new ProtocolError("Live query has no result columns");
  const names = /* @__PURE__ */ new Set();
  for (const column of columns) {
    if (!column.name || names.has(column.name)) throw new ProtocolError("Realtime result columns must have unique names");
    const requiredCodec = column.type_oid === pgTypeOids.bytea ? "bytes" : "pg_text";
    if (column.codec !== requiredCodec) throw new ProtocolError(`PostgreSQL type OID ${column.type_oid} requires the ${requiredCodec} codec`);
    names.add(column.name);
  }
}
function decodeRow(values, columns, parsers) {
  if (values.length !== columns.length) throw new ProtocolError("Realtime row does not match its result columns");
  return Object.freeze(Object.fromEntries(values.map((cell, index) => {
    const column = columns[index];
    if (!column) throw new ProtocolError("Realtime row does not match its result columns");
    return [column.name, decodeCell(cell, column, parsers)];
  })));
}
function decodeCell(cell, column, parsers) {
  if (cell === null) return null;
  let input;
  if (column.codec === "pg_text") {
    if (typeof cell !== "string") throw new ProtocolError("Realtime received bytes for a text column");
    input = cell;
  } else {
    if (typeof cell === "string") throw new ProtocolError("Realtime received text for a binary column");
    try {
      input = decodeBase64(cell.base64);
    } catch (cause) {
      throw new ProtocolError(cause instanceof Error ? cause.message : "Invalid base64 result value");
    }
  }
  try {
    return parsers.parse(column.type_oid, input);
  } catch (cause) {
    throw new PostgresValueParserError(column, cause);
  }
}

// node_modules/@neon/realtime/dist/client/row-waiter.js
function waitForRows(subscription2, matches, timeout) {
  if (timeout !== void 0 && (!Number.isFinite(timeout) || timeout < 0)) return Promise.reject(/* @__PURE__ */ new Error("Live-query row timeout must be a non-negative number"));
  return new Promise((resolve, reject) => {
    let settled = false;
    let unsubscribe = () => void 0;
    let timer;
    const cleanup = () => {
      unsubscribe();
      if (timer !== void 0) clearTimeout(timer);
    };
    const succeed = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };
    const fail = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };
    const inspect = (snapshot) => {
      try {
        if (snapshot.data !== void 0 && matches(snapshot.data)) {
          succeed();
          return;
        }
      } catch (error) {
        fail(error);
        return;
      }
      if (snapshot.status === "error") fail(snapshot.error);
      else if (snapshot.status === "closed") fail(/* @__PURE__ */ new Error("Live-query subscription is closed"));
    };
    unsubscribe = subscription2.onChange(inspect);
    if (timeout !== void 0) timer = setTimeout(() => fail(/* @__PURE__ */ new Error("Timed out waiting for live-query rows")), timeout);
    inspect(subscription2.getSnapshot());
  });
}

// node_modules/@neon/realtime/dist/client/transaction-tracker.js
var MAX_RECENT_TXIDS = 1e3;
var TransactionTracker = class {
  recent = /* @__PURE__ */ new Set();
  recentOrder = [];
  waiting = /* @__PURE__ */ new Map();
  visibility;
  closed = false;
  closeError;
  wait = async (txid, timeout) => {
    const normalized = normalizeTxid(txid);
    if (timeout !== void 0 && (!Number.isFinite(timeout) || timeout < 0)) throw new Error("Live-query transaction timeout must be a non-negative number");
    if (this.closed) throw this.closeError ?? /* @__PURE__ */ new Error("Live-query subscription is closed");
    if (this.recent.has(normalized.text) || this.visibility?.isVisible(normalized.value)) return;
    return new Promise((resolve, reject) => {
      const waiter = {
        resolve,
        reject,
        timer: timeout === void 0 ? void 0 : setTimeout(() => {
          this.remove(normalized.text, waiter);
          reject(/* @__PURE__ */ new Error(`Timed out waiting for live-query transaction ${normalized.text}`));
        }, timeout)
      };
      const waiters = this.waiting.get(normalized.text) ?? /* @__PURE__ */ new Set();
      waiters.add(waiter);
      this.waiting.set(normalized.text, waiters);
    });
  };
  seen(txid) {
    if (this.closed) return;
    const normalized = normalizeTxid(txid).text;
    if (!this.recent.has(normalized)) {
      this.recent.add(normalized);
      this.recentOrder.push(normalized);
      while (this.recentOrder.length > MAX_RECENT_TXIDS) {
        const oldest = this.recentOrder.shift();
        if (oldest !== void 0) this.recent.delete(oldest);
      }
    }
    this.resolve(normalized);
  }
  /** Record an installed snapshot and resolve every visible wait. */
  applySnapshot(snapshot) {
    if (this.closed) return;
    this.applyProgress(parseMvccSnapshot(snapshot));
  }
  /** Record progress only after every covered change has been installed. */
  applyProgress(snapshot) {
    if (this.closed) return;
    this.visibility = this.visibility ? mergeMvccSnapshots(this.visibility, snapshot) : snapshot;
    for (const txid of this.waiting.keys()) if (this.visibility.isVisible(BigInt(txid))) this.resolve(txid);
  }
  close(error = /* @__PURE__ */ new Error("Live-query subscription is closed")) {
    if (this.closed) return;
    this.closed = true;
    this.closeError = error;
    for (const waiters of this.waiting.values()) for (const waiter of waiters) {
      if (waiter.timer !== void 0) clearTimeout(waiter.timer);
      waiter.reject(error);
    }
    this.waiting.clear();
    this.recent.clear();
    this.recentOrder.length = 0;
    this.visibility = void 0;
  }
  remove(txid, waiter) {
    const waiters = this.waiting.get(txid);
    if (!waiters) return;
    waiters.delete(waiter);
    if (waiters.size === 0) this.waiting.delete(txid);
  }
  resolve(txid) {
    const waiters = this.waiting.get(txid);
    if (!waiters) return;
    this.waiting.delete(txid);
    for (const waiter of waiters) {
      if (waiter.timer !== void 0) clearTimeout(waiter.timer);
      waiter.resolve();
    }
  }
};
function normalizeTxid(txid) {
  if (typeof txid !== "string" || !/^\d+$/.test(txid)) throw new Error("Live-query transaction ID must be a decimal string");
  const parsed = BigInt(txid);
  if (parsed > 18446744073709551615n) throw new Error("Live-query transaction ID exceeds uint64");
  return {
    text: parsed.toString(),
    value: parsed
  };
}

// node_modules/@neon/realtime/dist/client/subscription.js
var PublicLiveQueryError = class extends Error {
  code;
  retryable;
  sqlState;
  constructor(code, retryable, message = `Live query failed: ${code}`, options) {
    super(message, options);
    this.code = code;
    this.retryable = retryable;
    this.name = "LiveQueryError";
    this.sqlState = options?.sqlState;
  }
};
var Subscription = class {
  owner;
  query;
  materialized;
  parsers;
  events;
  state;
  snapshot;
  rows;
  initialized;
  columns;
  stagedReset;
  appliedBatches = /* @__PURE__ */ new Map();
  updateListeners = /* @__PURE__ */ new Set();
  stateListeners = /* @__PURE__ */ new Set();
  changeListeners = /* @__PURE__ */ new Set();
  transactions = new TransactionTracker();
  closed = false;
  constructor(owner, query, materialized, parsers, initialData, events) {
    this.owner = owner;
    this.query = query;
    this.materialized = materialized;
    this.parsers = parsers;
    this.events = events;
    if (materialized) this.rows = new Map((initialData ?? []).map((row, index) => [`preloaded:${index}`, row]));
    this.initialized = initialData !== void 0;
    this.state = connectingState;
    this.snapshot = this.makeSnapshot();
  }
  currentQuery() {
    return this.query;
  }
  replaceSealedQuery(query) {
    this.query = query;
  }
  renewalFailed(error) {
    this.events.renewalFailed(error);
  }
  admit(columns) {
    validateColumns(columns);
    this.columns = columns;
  }
  getState = () => this.state;
  getSnapshot = () => this.snapshot;
  onUpdate = (listener) => listen(this.updateListeners, listener);
  onStateChange = (listener) => listen(this.stateListeners, listener);
  awaitTxId = (txid, timeout) => this.transactions.wait(txid, timeout);
  awaitRows = (matches, timeout) => {
    if (!this.materialized) return Promise.reject(/* @__PURE__ */ new Error("Raw live-query subscriptions do not expose rows"));
    return waitForRows(this, matches, timeout);
  };
  onChange = (listener) => {
    if (!this.materialized) throw new Error("Raw live-query subscriptions do not expose snapshots");
    return listen(this.changeListeners, listener);
  };
  renew = (query) => {
    if (this.closed) return Promise.reject(/* @__PURE__ */ new Error("Live-query subscription is closed"));
    if (query.queryFingerprint !== this.query.queryFingerprint) return Promise.reject(/* @__PURE__ */ new Error("Live-query renewal must be for the same query"));
    const precedingState = this.state.status === "error" || this.state.status === "stale" ? this.state : void 0;
    if (precedingState) this.setLifecycle(connectingState);
    return this.owner.renew(this, query).catch((error) => {
      if (precedingState && this.state.status !== "error") this.setLifecycle(precedingState);
      throw error;
    });
  };
  unsubscribe = () => {
    if (this.closed) return;
    this.owner.unsubscribe(this);
  };
  baselineSyncStarted() {
    if (this.closed) return;
    this.events.baselineSyncStarted();
  }
  installReset(wireRows) {
    if (this.closed) return;
    const rows = this.decodeReset(wireRows);
    this.stagedReset = {
      rows,
      materializedRows: this.rows ? new Map(rows.map(({ rowId, row }) => [rowId, row])) : void 0
    };
  }
  applyBatch(wireChanges) {
    if (this.closed) return;
    const changes = Object.freeze(wireChanges.map((change) => {
      if (change.op === "remove") return Object.freeze({
        type: "remove",
        rowId: change.row_key
      });
      const row = decodeRow(change.values, this.requireColumns(), this.requireParsers());
      return Object.freeze({
        type: "upsert",
        rowId: change.row_key,
        row
      });
    }));
    const targetRows = this.stagedReset?.materializedRows ?? this.rows;
    for (const change of changes) if (change.type === "remove") targetRows?.delete(change.rowId);
    else targetRows?.set(change.rowId, change.row);
    this.appliedBatches.set(wireChanges, changes);
    if (!this.stagedReset) this.snapshot = this.makeSnapshot();
  }
  decodeFailed(error) {
    if (!(error instanceof PostgresValueParserError)) throw error;
    this.appliedBatches.clear();
    this.stagedReset = void 0;
    this.owner.parserFailed(this, error);
  }
  publishReset(_wireRows, mvcc) {
    if (this.closed) return;
    const staged = this.stagedReset;
    if (!staged) throw new Error("Realtime published an uninstalled reset");
    if (this.rows && staged.materializedRows) {
      this.rows.clear();
      for (const [rowId, row] of staged.materializedRows) this.rows.set(rowId, row);
    }
    this.stagedReset = void 0;
    this.initialized = true;
    this.snapshot = this.makeSnapshot();
    this.transactions.applySnapshot(mvcc);
    this.notify(this.updateListeners, Object.freeze({
      type: "rows",
      rows: staged.rows
    }));
  }
  publishBatch(batch) {
    if (this.closed) return;
    const changes = batch.changes.length === 0 ? Object.freeze([]) : this.appliedBatches.get(batch.changes);
    if (!changes) throw new Error("Realtime published an unapplied batch");
    this.appliedBatches.delete(batch.changes);
    const info = Object.freeze({ txids: batch.txids });
    this.notify(this.updateListeners, Object.freeze({
      type: "changes",
      changes,
      batch: info
    }));
    if (this.materialized && this.state.status === "live") this.notify(this.changeListeners, this.snapshot);
    for (const txid of batch.txids) this.transactions.seen(txid);
  }
  applyProgress(mvcc) {
    this.transactions.applyProgress(mvcc);
  }
  caughtUp() {
    if (this.closed) return;
    const becameLive = this.state.status !== "live";
    this.setLifecycle(Object.freeze({
      status: "live",
      error: void 0
    }), false, becameLive ? () => this.events.live() : void 0);
    if (this.materialized) this.notify(this.changeListeners, this.snapshot);
  }
  baselineSyncCompleted(batchCount) {
    if (this.closed) return;
    this.events.baselineSyncCompleted(batchCount);
  }
  resetRequired() {
    if (this.closed) return;
    this.events.resetRequired();
  }
  connecting() {
    this.resetSynchronization();
    this.setLifecycle(connectingState);
  }
  queryUnavailable() {
    this.resetSynchronization();
    this.setLifecycle(staleState);
  }
  fail(error) {
    const publicError = new PublicLiveQueryError(error.code, error.retryable, error.message, {
      cause: error.cause,
      sqlState: error.sqlState
    });
    this.transactions.close(publicError);
    this.setLifecycle(Object.freeze({
      status: "error",
      error: publicError
    }));
  }
  markClosed() {
    if (this.closed) return;
    this.closed = true;
    this.transactions.close();
    this.setLifecycle(Object.freeze({
      status: "closed",
      error: void 0
    }));
  }
  decodeReset(wireRows) {
    const columns = this.requireColumns();
    const rowIds = /* @__PURE__ */ new Set();
    return Object.freeze(wireRows.map((wireRow) => {
      if (rowIds.has(wireRow.row_key)) throw new Error("Duplicate Realtime row ID");
      rowIds.add(wireRow.row_key);
      return Object.freeze({
        rowId: wireRow.row_key,
        row: decodeRow(wireRow.values, columns, this.requireParsers())
      });
    }));
  }
  requireColumns() {
    if (!this.columns) throw new Error("Live-query subscription is not admitted");
    return this.columns;
  }
  requireParsers() {
    return this.parsers;
  }
  resetSynchronization() {
    this.columns = void 0;
    this.appliedBatches.clear();
    this.stagedReset = void 0;
  }
  setLifecycle(state, publishChange = true, beforeListeners) {
    if (this.closed && state.status !== "closed") return;
    if (sameState(this.state, state)) return;
    const previousStatus = this.state.status;
    this.state = state;
    this.snapshot = this.makeSnapshot();
    this.events.stateChanged(previousStatus, state.status);
    beforeListeners?.();
    this.notify(this.stateListeners, this.state);
    if (publishChange && this.materialized) this.notify(this.changeListeners, this.snapshot);
  }
  notify(listeners, ...args) {
    for (const listener of [...listeners]) try {
      listener(...args);
    } catch (error) {
      this.events.listenerFailed(error);
    }
  }
  makeSnapshot() {
    const data = this.materialized && this.rows && this.initialized ? Object.freeze([...this.rows.values()]) : void 0;
    return Object.freeze({
      ...this.state,
      data
    });
  }
};
var connectingState = Object.freeze({
  status: "connecting",
  error: void 0
});
var staleState = Object.freeze({
  status: "stale",
  error: void 0
});
function sameState(left, right) {
  return left.status === right.status && left.error === right.error;
}
function listen(listeners, listener) {
  listeners.add(listener);
  let active = true;
  return () => {
    if (!active) return;
    active = false;
    listeners.delete(listener);
  };
}

// node_modules/@neon/realtime/dist/client/realtime-client.js
var RealtimeClientImpl = class {
  coordinator;
  handles = /* @__PURE__ */ new Map();
  disposed = false;
  parsers;
  events;
  constructor(options) {
    this.events = createClientEventSink(options);
    this.coordinator = new ConnectionCoordinator({
      url: options.url,
      events: this.events,
      webSocketFactory: options.webSocketFactory
    });
    this.parsers = createParserRegistry(options.parsers);
  }
  subscribe(query, options) {
    if (this.disposed) throw new Error("Realtime client is closed");
    validateSealedQuery2(query);
    const materialized = options?.materialize !== false;
    const events = this.events.createSubscription();
    const initialData = materialized ? options?.initialData : void 0;
    const subscription2 = new Subscription(this, query, materialized, this.parsers, initialData, events);
    registerSubscriptionEvents(subscription2, events);
    const handle = this.coordinator.subscribe(query, {
      events,
      reconciliation: subscription2,
      admitted: (columns) => subscription2.admit(columns),
      connecting: () => subscription2.connecting(),
      queryUnavailable: () => subscription2.queryUnavailable(),
      failed: (error) => subscription2.fail(error)
    });
    this.handles.set(subscription2, handle);
    return subscription2;
  }
  async renew(subscription2, query) {
    validateSealedQuery2(query);
    const handle = this.handles.get(subscription2);
    if (!handle) throw new Error("Live-query subscription is closed");
    try {
      await handle.renew(query);
      subscription2.replaceSealedQuery(query);
    } catch (error) {
      if (subscription2.getState().status !== "closed" && (!(error instanceof ConnectionCoordinatorError) || error.retryable)) subscription2.renewalFailed(error);
      throw error;
    }
  }
  unsubscribe(subscription2) {
    const handle = this.handles.get(subscription2);
    if (!handle) return;
    this.handles.delete(subscription2);
    handle.unsubscribe();
    subscription2.markClosed();
  }
  parserFailed(subscription2, cause) {
    const handle = this.handles.get(subscription2);
    if (!handle) return;
    handle.fail(new ConnectionCoordinatorError("parser_error", false, cause.message, { cause: cause.cause }));
  }
  close() {
    if (this.disposed) return;
    this.disposed = true;
    for (const subscription2 of this.handles.keys()) subscription2.markClosed();
    this.handles.clear();
    this.coordinator.close();
    this.events.closed();
  }
};
function createRealtimeClient(options) {
  return new RealtimeClientImpl(options);
}

// frontend/realtime.js
var status = document.querySelector("#realtime-status");
var realtimeClient;
var subscription;
var renewalTimer;
var lastTotal;
async function fetchSealedQuery() {
  const response = await fetch("/api/neon/realtime-query", { credentials: "same-origin" });
  if (response.status === 401) {
    window.location.replace("/login");
    throw new Error("Sign in to connect live updates.");
  }
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Could not connect live dashboard updates.");
  }
  return payload;
}
function scheduleRenewal(sealedQuery) {
  clearTimeout(renewalTimer);
  renewalTimer = setTimeout(async () => {
    let next;
    try {
      next = await fetchSealedQuery();
    } catch (error) {
      status.dataset.state = "error";
      status.textContent = `${error.message} Retrying\u2026`;
      renewalTimer = setTimeout(() => scheduleRenewal(sealedQuery), 1e3);
      return;
    }
    try {
      await subscription.renew(next.sealed_query);
      scheduleRenewal(next.sealed_query);
    } catch (error) {
      status.dataset.state = "error";
      status.textContent = `Live updates stopped: ${error.message}`;
      clearTimeout(renewalTimer);
    }
  }, Math.max(0, sealedQuery.expiresAt - Date.now() - 1e4));
}
async function connectLiveDashboard() {
  const initial = await fetchSealedQuery();
  realtimeClient = createRealtimeClient({ url: initial.realtime_url });
  subscription = realtimeClient.subscribe(initial.sealed_query);
  subscription.onChange(({ data, status: state, error }) => {
    if (state === "error") {
      status.dataset.state = "error";
      status.textContent = `Live updates stopped: ${error.message}`;
      clearTimeout(renewalTimer);
      return;
    }
    status.dataset.state = state === "live" ? "live" : "";
    status.textContent = state === "live" ? "Live dashboard updates connected" : "Connecting live updates\u2026";
    const total = data?.[0]?.total;
    if (typeof total === "number") {
      if (lastTotal !== void 0 && total !== lastTotal) {
        window.dispatchEvent(new Event("campusly:realtime-update"));
      }
      lastTotal = total;
    }
  });
  scheduleRenewal(initial.sealed_query);
  window.addEventListener("pagehide", () => {
    clearTimeout(renewalTimer);
    subscription.unsubscribe();
    realtimeClient.close();
  }, { once: true });
}
connectLiveDashboard().catch((error) => {
  status.dataset.state = "error";
  status.textContent = `Live updates unavailable: ${error.message}`;
});
