import { ActionRowBuilder, CacheType, ChatInputCommandInteraction, CommandInteractionOptionResolver, MessageContextMenuCommandInteraction, MessageFlags, ModalBuilder, ModalSubmitInteraction, SlashCommandBuilder, TextInputBuilder, TextInputStyle, UserContextMenuCommandInteraction } from "discord.js";
import { Command, CommandDependency } from ".";
import { BatchProgressStatus } from "../../types/image_generation_ai";

const customID = {
    preset: 'preset',
    prompt: 'prompt',
}

export class GenerateImageCommand implements Command {
    constructor(private readonly dependency: CommandDependency) {}

    public input = new SlashCommandBuilder()
        .setName('generate-image')
        .setDescription('Generate an image based on a prompt')
        .toJSON();

    async command(interaction: ChatInputCommandInteraction<CacheType> | MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction | ModalSubmitInteraction) {
        const flags = MessageFlags.SuppressEmbeds;
        try {
            if (interaction.isChatInputCommand()) {
                const modal = new ModalBuilder()
                    .setCustomId('generate-image')
                    .setTitle('Generate Image');

                const promptInput = new TextInputBuilder()
                    .setCustomId(customID.prompt)
                    .setRequired(true)
                    .setLabel("Enter your prompt?")
                    .setPlaceholder("Describe the image you want to generate")
                    .setStyle(TextInputStyle.Paragraph);

                const row = new ActionRowBuilder()
                    .addComponents(promptInput);

                modal.addComponents(row as any);

                await interaction.showModal(modal);

            } else if (interaction.isModalSubmit()) {
                await interaction.deferReply({});

                const presets = await this.dependency.imageGenerationAIService.getPresets();
                const preset = presets.find(({ is_default }) => is_default) || presets[0];
                if (!preset) {
                    throw new Error('No default preset found');
                }

                const prompt = interaction.fields.getTextInputValue(customID.prompt);

                const imageURLs = await this.dependency.imageGenerationAIService.generateImage(prompt, preset, async (status, process) => {
                    switch (status) {
                        case BatchProgressStatus.Waiting:
                            await interaction.editReply({ content: `Waiting...` });
                            break;
                        case BatchProgressStatus.Processing:
                            await interaction.editReply({ content: `Completed ${process}%` });
                            break;
                        case BatchProgressStatus.Canceled:
                            throw new Error('Image generation was canceled');
                    }
                })

                await interaction.editReply({ content: `**prompt**: ${prompt}\n${imageURLs.join('\n')}` });
            }

        } catch (error) {
            console.error('Error in generate-image command:', error);
            try {
                await interaction.deferReply({ ephemeral: true });
            } catch (error) {
                console.error('Error deferring reply:', error);
            }
            await interaction.followUp({ flags, content: `${error}` });
        }

    }
}
