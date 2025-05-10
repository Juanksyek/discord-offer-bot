"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.extractProductInfo = extractProductInfo;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
function extractProductInfo(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
        const asin = asinMatch === null || asinMatch === void 0 ? void 0 : asinMatch[1];
        if (!asin)
            throw new Error('ASIN no encontrado en la URL');
        const { data: html } = yield axios_1.default.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });
        const $ = cheerio.load(html);
        const name = $('#productTitle').text().trim();
        const priceText = $('#corePriceDisplay_desktop_feature_div .a-offscreen').first().text().replace(/[^0-9.]/g, '') ||
            $('.a-price .a-offscreen').first().text().replace(/[^0-9.]/g, '');
        const image = $('#landingImage').attr('src') || $('#imgTagWrapperId img').attr('src');
        const price = parseFloat(priceText);
        if (!name || !price || !image) {
            console.log('DEBUG info:', { name, price, image });
            throw new Error('No se pudo obtener info del producto');
        }
        return {
            asin,
            name,
            price,
            image,
            url
        };
    });
}
