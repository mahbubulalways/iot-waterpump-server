"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const config_1 = require("../config");
const sendResponse = (res, payload) => {
    const { success, message, statusCode, data } = payload;
    return res.status(statusCode).json({
        success,
        statusCode,
        message,
        data: config_1.Config.NODE_ENV === "development" ? data : null,
    });
};
exports.sendResponse = sendResponse;
