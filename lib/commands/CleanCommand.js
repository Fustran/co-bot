"use strict"
var Argument = require("../Argument.js");
var Command = require("../Command.js");
var Sounds = require('../models/sounds.js');
var path = require('path');
var config = require('../../config.js');
var mongoose = require('mongoose');
class CleanCommand extends Command {
    constructor() {
        super('clean', ['c', 'cleaner'], null);
        var args = [
            new Argument('all', null, this.all),
            new Argument('bot', null, this.bot),
            new Argument('user', null, this.user),
        ];
        this._args = args;
    }

    bot(message, args) {
        return new Promise((resolve, reject) => {
            let bot = message.client;
            if (typeof args[0] == "undefined")
                return resolve("Argument must be # of messages to search");
            if (args[0] <= 200 && args[0] > 0)
                bot.getChannelLogs(message.channel, args[0], {
                    before: message
                }).then(messages => {
                    let count = 0;
                    for (var i = 0; i < messages.length; i++) {
                        if (messages[i].author.username == "pleb-bot") {
                            bot.deleteMessage(messages[i]).catch(err => reject(err));
                            count++;
                        }
                    }
                    resolve("Deleted " + count + " bot messages.");
                }).catch(err => reject(err));
            else
                resolve(args[0] + " is an invalid search amount, must be between 0 and 200");


        });
    }
    all(message, args) {
        return new Promise((resolve, reject) => {
            let bot = message.client;
            if (args[0].length < 3)
                return resolve(args[0] + " is too broad. Please enter a search with at least three characters.");
            if (typeof args[1] == "undefined")
                return resolve("Second argument must be # of messages to search");
            if (args[1] <= 100 && args[1] > 0)
                bot.getChannelLogs(message.channel, args[1], {
                    before: message
                }).then(messages => {
                    let count = 0;
                    for (var i = 0; i < messages.length; i++) {
                        if (messages[i].content.includes(args[0])) {
                            bot.deleteMessage(messages[i]).catch(err => console.log(err));
                            count++;
                        }
                    }
                    resolve("Deleted " + count + " messages containing \"" + args[0] + "\"");
                }).catch(err => console.error(err));
            else
                resolve(args[1] + " is an invalid search amount, must be between 0 and 100");
        });
    }
    user(message, args) {
        return new Promise((resolve, reject) => {
            let bot = message.client;
            if (typeof args[0] == "undefined")
                return resolve("First argument must be a username");
            if (typeof args[1] == "undefined")
                return resolve("Second argument must be # of messages to search");
            if (args[1] <= 25 && args[1] > 0)
                bot.getChannelLogs(message.channel, 50, {
                    before: message
                }).then(messages => {
                    let count = 0;
                    for (var i = 0; i < messages.length; i++) {
                        if (messages[i].author.username == args[0]) {
                            bot.deleteMessage(messages[i]).catch(err => console.log(err));
                            count++;
                        }
                    }
                    resolve("Deleted " + count + " messages from *" + args[0] + "*");
                }).catch(err => console.error(err));
            else
                resolve(args[1] + " is an invalid search amount, must be between 0 and 25");
        });
    }
}
module.exports = new CleanCommand();