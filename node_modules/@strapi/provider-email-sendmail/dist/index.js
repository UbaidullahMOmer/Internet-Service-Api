"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const sendmail_1 = __importDefault(require("sendmail"));
const utils_1 = __importDefault(require("@strapi/utils"));
module.exports = {
    init(providerOptions, settings) {
        const sendmail = (0, sendmail_1.default)({
            silent: true,
            ...providerOptions,
        });
        return {
            send(options) {
                return new Promise((resolve, reject) => {
                    const { from, to, cc, bcc, replyTo, subject, text, html, ...rest } = options;
                    const msg = {
                        from: from || settings.defaultFrom,
                        to,
                        cc,
                        bcc,
                        replyTo: replyTo || settings.defaultReplyTo,
                        subject,
                        text,
                        html,
                        ...rest,
                    };
                    sendmail(utils_1.default.removeUndefined(msg), (err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                });
            },
        };
    },
};
//# sourceMappingURL=index.js.map