const mongoose = require('mongoose');
const {
    Command,
    Argument,
    ArgumentType
} = require('djs-cc');
const mm = require('musicmetadata');

const Sound = require('../../models/sounds.js');
const config = require('../../../config.js');
const fileManager = require('../../fileManager.js');

module.exports = class SoundCommand extends Command {
    constructor() {
        super({
            name: 'sound',
            aliases: ['s'],
            description: 'Manages sounds',
            usage: 'sound add soundname',
            args: [new Argument({
                name: 'operation',
                type: ArgumentType.String,
                required: true,
            }), new Argument({
                name: 'sound',
                type: ArgumentType.String,
                required: true
            })]
        });
    }
    async run(msg, args) {
        if (args.get('operation') === 'add') {
            let attachment = msg.attachments.first();
            if (attachment) {
                var id = mongoose.Types.ObjectId();
                var fileType = attachment.name.substring(attachment.name.lastIndexOf('.'));
                await fileManager.download(attachment.url, id + fileType);
                const metadata = await fileManager.getMetadata(id + fileType);
                var sound = new Sound({
                    _id: id,
                    key: args.get('sound'),
                    filename: id + fileType,
                    user: msg.author.id,
                    date: new Date(),
                    duration: metadata.duration
                });
                try {
                    sound = await sound.save();
                    sound = await sound.populate('user', 'username').execPopulate();
                    msg.reply("Sound added");
                } catch (e) {
                    if (e.code == 11000) {
                        fileManager.remove(id + fileType);
                        msg.reply("Sound already exists");
                    } else {
                        console.log(e);
                        throw e;
                    }
                }
            } else {
                msg.reply("This command must be used in the comment of an attachment.");
            }
        } else if (args.get('operation') === 'remove') {
            let sound = await Sound.findOneAndRemove({
                "key": {
                    $regex: new RegExp("^" + args.get('sound').toLowerCase() + "$", "i")
                }
            });
            if (sound) {
                await fileManager.remove(sound.name);
                console.log(`Sound ${sound.key} removed by: ${msg.author.username}`);
                msg.reply(`${sound.key} has been removed`);
            } else {
                msg.reply(`${args.get('sound')} not found`);
            }
        } else {
            msg.reply('Invalid operation! (options are: add, remove)');
        }
    }
}