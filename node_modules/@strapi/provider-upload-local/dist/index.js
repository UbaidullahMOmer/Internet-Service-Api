"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const stream_1 = require("stream");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const utils_1 = __importDefault(require("@strapi/utils"));
const { PayloadTooLargeError } = utils_1.default.errors;
const { kbytesToBytes, bytesToHumanReadable } = utils_1.default.file;
const UPLOADS_FOLDER_NAME = 'uploads';
module.exports = {
    init({ sizeLimit: providerOptionsSizeLimit } = {}) {
        // TODO V5: remove providerOptions sizeLimit
        if (providerOptionsSizeLimit) {
            process.emitWarning('[deprecated] In future versions, "sizeLimit" argument will be ignored from upload.config.providerOptions. Move it to upload.config');
        }
        // Ensure uploads folder exists
        const uploadPath = path_1.default.resolve(strapi.dirs.static.public, UPLOADS_FOLDER_NAME);
        if (!fs_extra_1.default.pathExistsSync(uploadPath)) {
            throw new Error(`The upload folder (${uploadPath}) doesn't exist or is not accessible. Please make sure it exists.`);
        }
        return {
            checkFileSize(file, options) {
                const { sizeLimit } = options ?? {};
                // TODO V5: remove providerOptions sizeLimit
                if (providerOptionsSizeLimit) {
                    if (kbytesToBytes(file.size) > providerOptionsSizeLimit)
                        throw new PayloadTooLargeError(`${file.name} exceeds size limit of ${bytesToHumanReadable(providerOptionsSizeLimit)}.`);
                }
                else if (sizeLimit) {
                    if (kbytesToBytes(file.size) > sizeLimit)
                        throw new PayloadTooLargeError(`${file.name} exceeds size limit of ${bytesToHumanReadable(sizeLimit)}.`);
                }
            },
            uploadStream(file) {
                if (!file.stream) {
                    return Promise.reject(new Error('Missing file stream'));
                }
                const { stream } = file;
                return new Promise((resolve, reject) => {
                    (0, stream_1.pipeline)(stream, fs_1.default.createWriteStream(path_1.default.join(uploadPath, `${file.hash}${file.ext}`)), (err) => {
                        if (err) {
                            return reject(err);
                        }
                        file.url = `/${UPLOADS_FOLDER_NAME}/${file.hash}${file.ext}`;
                        resolve();
                    });
                });
            },
            upload(file) {
                if (!file.buffer) {
                    return Promise.reject(new Error('Missing file buffer'));
                }
                const { buffer } = file;
                return new Promise((resolve, reject) => {
                    // write file in public/assets folder
                    fs_1.default.writeFile(path_1.default.join(uploadPath, `${file.hash}${file.ext}`), buffer, (err) => {
                        if (err) {
                            return reject(err);
                        }
                        file.url = `/${UPLOADS_FOLDER_NAME}/${file.hash}${file.ext}`;
                        resolve();
                    });
                });
            },
            delete(file) {
                return new Promise((resolve, reject) => {
                    const filePath = path_1.default.join(uploadPath, `${file.hash}${file.ext}`);
                    if (!fs_1.default.existsSync(filePath)) {
                        resolve("File doesn't exist");
                        return;
                    }
                    // remove file from public/assets folder
                    fs_1.default.unlink(filePath, (err) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    });
                });
            },
        };
    },
};
//# sourceMappingURL=index.js.map