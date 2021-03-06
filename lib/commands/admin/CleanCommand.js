const {
    Command,
    Argument,
    ArgumentType
} = require('djs-cc');

module.exports = class CleanCommand extends Command {
    constructor() {
        super({
            name: 'clean-chat',
            aliases: ['clean', 'clear'],
            description: 'Cleans messages from chat',
            usage: 'clean-chat @user 20',
            args: [
                new Argument({
                    name: 'user',
                    type: ArgumentType.User,
                    required: true
                }),
                new Argument({
                    name: 'numMessages',
                    type: ArgumentType.Integer,
                    required: false,
                    default: 50
                })
            ]
        });
    }
    hasPermission(msg) {
        return msg.guild && msg.member.hasPermission('ADMINISTRATOR');
    }

    async run(msg, args) {
        var messages = await msg.channel.messages.last(args.get('numMessages'));
        var p;
        messages = messages.filter((msg) => msg.author.id == args.get('user').id);
        if (messages.length > 1)
            p = msg.channel.bulkDelete(messages);
        else if (messages.length === 1)
            p = messages[0].delete().then((a) => "Deleted one message");
        if (p)
            p.then(msg.reply("Deleted " + messages.length + " messages"));
        else
            msg.reply("No messages found");
    }
}