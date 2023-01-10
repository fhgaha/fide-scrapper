"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const axios_1 = __importDefault(require("axios"));
const jsdom_1 = require("jsdom");
function fetchPage(url) {
    const HTMLData = axios_1.default
        .get(url)
        .then(res => res.data)
        .catch((error) => {
        var _a;
        console.error(`There was an error with ${(_a = error.config) === null || _a === void 0 ? void 0 : _a.url}.`);
        console.error(error.toJSON());
    });
    return HTMLData;
}
function fetchFromWebOrCache(url, ignoreCache = false) {
    return __awaiter(this, void 0, void 0, function* () {
        // If the cache folder doesn't exist, create it
        const path = (0, path_1.resolve)('./', '.cache');
        const exists = (0, fs_1.existsSync)('.cache');
        if (!(0, fs_1.existsSync)('.cache')) {
            (0, fs_1.mkdirSync)('.cache');
        }
        console.log(`Getting data for ${url}...`);
        if (!ignoreCache &&
            (0, fs_1.existsSync)(
            // resolve(__dirname, `.cache/${Buffer.from(url).toString('base64')}.html`),
            `.cache/${Buffer.from(url).toString('base64')}.html`)) {
            console.log(`I read ${url} from cache`);
            const HTMLData = yield (0, promises_1.readFile)(
            // resolve(__dirname, `.cache/${Buffer.from(url).toString('base64')}.html`),
            `.cache/${Buffer.from(url).toString('base64')}.html`, { encoding: 'utf8' });
            const dom = new jsdom_1.JSDOM(HTMLData);
            return dom.window.document;
        }
        else {
            console.log(`I fetched ${url} fresh`);
            const HTMLData = yield fetchPage(url);
            if (!ignoreCache && HTMLData) {
                (0, promises_1.writeFile)(
                // resolve(__dirname, `.cache/${Buffer.from(url).toString('base64')}.html`),
                `.cache/${Buffer.from(url).toString('base64')}.html`, HTMLData, { encoding: 'utf8' });
            }
            const dom = new jsdom_1.JSDOM(HTMLData);
            return dom.window.document;
        }
    });
}
function extractData(document) {
    const writingLinks = Array.from(document.querySelectorAll('.titleline a'));
    return writingLinks.map(link => {
        return {
            title: link.text,
            url: link.href,
        };
    });
}
function saveData(filename, data) {
    if (!(0, fs_1.existsSync)((0, path_1.resolve)(__dirname, 'data'))) {
        (0, fs_1.mkdirSync)('data');
    }
    (0, promises_1.writeFile)((0, path_1.resolve)(__dirname, `data/${filename}.json`), JSON.stringify(data), {
        encoding: 'utf8',
    });
}
function getAll() {
    return __awaiter(this, void 0, void 0, function* () {
        const document = yield fetchFromWebOrCache('https://news.ycombinator.com/', true);
        const data = extractData(document);
        return data;
    });
}
exports.default = { getAll };
//# sourceMappingURL=scrapper.js.map