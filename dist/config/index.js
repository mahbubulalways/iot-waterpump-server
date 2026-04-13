"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), ".env") });
exports.Config = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT || 5000,
    DATABASE_URL: process.env.DATABASE_URL,
    MAIL_SENDER_ADDRESS: process.env.MAIL_SENDER_ADDRESS,
    MAIL_PASSWORD: process.env.MAIL_PASSWORD,
};
