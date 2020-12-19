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
const express = require('express');
function activate(context) {
    console.log('Congratulations, your extension "furui" is now active!');
    context.subscriptions.push(vscode.commands.registerCommand('furui.login', () => {
        const app = express();
        app.get('/getToken', (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                let token = req.query.access_token;
                const resultbackend = yield axios_1.default({
                    method: 'get',
                    url: `http://localhost:3000/user`,
                    headers: {
                        accept: 'application/json',
                        Authorization: `token ${token}`
                    }
                });
                context.globalState.update("token", token);
                vscode.window.showInformationMessage('Successfully Logged In: ' + resultbackend.data.login);
                console.log(resultbackend.data);
                res.send("Logged In");
                console.log("Server closed");
                server.close();
            }
            catch (error) {
                console.log(error);
            }
        }));
        var server = app.listen(5000, () => {
            console.log("Server listening on port : 5000");
        });
        vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(`http://localhost:3000/auth/github`));
    }));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map