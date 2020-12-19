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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const axios_1 = require("axios");
const express = require("express");
function activate(context) {
    console.log('Congratulations, your extension "furui" is now active!');
    context.subscriptions.push(vscode.commands.registerCommand("furui.login", () => {
        const app = express();
        app.get("/getToken", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let token = req.query.access_token;
                const resultbackend = yield axios_1.default({
                    method: "get",
                    url: `http://localhost:3000/user`,
                    headers: {
                        accept: "application/json",
                        Authorization: `token ${token}`,
                    },
                });
                if (resultbackend.data.success) {
                    context.globalState.update("token", token);
                    vscode.window.showInformationMessage("Successfully Logged In: " + resultbackend.data.login);
                    console.log(resultbackend.data);
                    res.send("Logged In");
                }
                else {
                    vscode.window.showInformationMessage("Login Failed");
                    res.send("Login Failed");
                }
            }
            catch (error) {
                res.send(error);
                console.log(error);
            }
            console.log("Server closed");
            server.close();
        }));
        var server = app.listen(5000, () => {
            console.log("Server listening on port : 5000");
        });
        vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(`http://localhost:3000/auth/github`));
    }));
    context.subscriptions.push(vscode.commands.registerCommand("furui.addCode", () => __awaiter(this, void 0, void 0, function* () {
        let text;
        const window = vscode.window;
        const editor = window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            if (selection) {
                const originalText = editor.document.getText(selection);
                if (originalText.length > 0) {
                    console.log(originalText);
                    text = originalText;
                }
            }
        }
        vscode.window
            .showInputBox({
            placeHolder: "Title for code",
            prompt: "Type a title for code",
            value: "",
        })
            .then((value) => __awaiter(this, void 0, void 0, function* () {
            vscode.window
                .showInputBox({
                placeHolder: "Enter tags",
                prompt: "Enter tags",
                value: "",
            })
                .then((valueTag) => __awaiter(this, void 0, void 0, function* () {
                console.log(value);
                let arrTag;
                if (valueTag) {
                    arrTag = valueTag.split(" ");
                }
                else {
                    arrTag = new Array();
                }
                let data = {
                    title: value,
                    code: text,
                    tags: arrTag,
                };
                try {
                    let token = context.globalState.get("token");
                    let result = yield axios_1.default.post(`http://localhost:3000/code`, data, {
                        headers: {
                            "content-type": "application/json",
                            Authorization: `token ${token}`,
                        },
                    });
                    if (result.data.success) {
                        vscode.window.showInformationMessage("Successfully added code to database");
                    }
                    else {
                        vscode.window.showInformationMessage("Error : Code could not added");
                    }
                }
                catch (error) {
                    console.log(error);
                }
            }));
        }));
    })));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map