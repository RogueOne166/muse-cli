import { Message, MessageEmbed } from 'discord.js';
import { client } from '../../index';
import { Command } from '../../lib/commands/Command';
import { CommandExecutor } from '../../lib/commands/CommandExecutor';

const COMMAND_NAME = 'help';

@Command({
    name: COMMAND_NAME,
    usage: '[command:string]',
    description: '',
    category: 'Miscellaneous'
})
class Help implements CommandExecutor {

    execute = async (message: Message, args: string[]): Promise<boolean> => {

        const prefix = client.$config.prefix;
        const help = client.$commands.get(COMMAND_NAME);
        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setThumbnail(client.user!.avatarURL()!)
            .setFooter(`Requested by ${message.author.tag}`)
            .setTimestamp();

        if (args.length === 0) {

            const categories = [...new Set(client.$commands.map(command => command.info.category))];

            embed.setTitle('-= COMMAND LIST =-');
            embed.setDescription([
                `**Prefix:** \`${prefix}\``,
                `<> : Required | [] : Optional`,
                `Use \`${prefix}${help?.info.name} ${help?.info.usage}\` to view command help with more detail.`
            ].join('\n'));

            let categorisedCommands;

            for (const category of categories) {
                categorisedCommands = client.$commands.filter(cmd => cmd.info.category === category);
                embed.addField(category || 'Other', categorisedCommands.map(cmd => `\`${cmd.info.name}\``).join(', '));
            }

            message.channel.send(embed);
            return true;

        }

        const command = client.$commands.get(args[0]) || client.$commands.get(client.$aliases.get(args[0])!);
        if (!command) return await this.execute(message, []);

        const aliasesPresent = typeof command.info.aliases !== 'undefined' && command.info.aliases.length > 0;
        const permissionsRequired = typeof command.info.permissions !== 'undefined' && command.info.permissions.length > 0;

        embed.setTitle(`${command.info.name.toUpperCase()} COMMAND`);
        embed.setDescription([
            `${command.info.description || 'No description has been set'}`,
            `Permissions required: ${permissionsRequired ? `\`${command.info.permissions!.join(' | ')}\`` : '`None`'}`
        ].join('\n'));

        embed.addField('Usage', `\`${prefix}${command.info.name}${command.info.usage !== '' ? ` ${command.info.usage}` : ''}\``);
        embed.addField('Aliases', `${aliasesPresent ? command.info.aliases!.map(alias => `\`${alias}\``).join(', ') : '\`None\`'}`);

        message.channel.send(embed);

        return true;
    }

}