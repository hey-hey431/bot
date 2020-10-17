import { FireMessage } from "../../../lib/extensions/message";
import { FireGuild } from "../../../lib/extensions/guild";
import { Language } from "../../../lib/util/language";
import { Listener } from "../../../lib/util/listener";
import { Command } from "../../../lib/util/command";
import { Module } from "../../../lib/util/module";
import { Argument } from "discord-akairo";

export default class Reload extends Command {
  constructor() {
    super("reload", {
      description: (language: Language) =>
        language.get("RELOAD_COMMAND_DESCRIPTION"),
      clientPermissions: ["ADD_REACTIONS"],
      args: [
        {
          id: "module",
          type: Argument.union("command", "language", "listener", "module", [
            "*",
          ]),
          default: null,
          required: true,
        },
      ],
      ownerOnly: true,
    });
  }

  async exec(
    message: FireMessage,
    args: { module?: Command | Language | Listener | Module | "*" }
  ) {
    if (!args.module) return await message.error();
    if (args.module == "*") {
      try {
        [
          this.client.commandHandler,
          this.client.languages,
          this.client.listenerHandler,
          this.client.modules,
        ].forEach((handler) => handler.reloadAll());
        this.client.guilds.cache.forEach((g: FireGuild) =>
          this.updateGuildLanguage(g)
        );
        return await message.success();
      } catch {
        return await message.error();
      }
    }
    try {
      args.module.reload();
      if (args.module instanceof Language) {
        this.client.guilds.cache
          .filter(
            (g: FireGuild) => g.language.id == (args.module as Language).id
          )
          .forEach((g: FireGuild) => this.updateGuildLanguage(g));
      }
      return await message.success();
    } catch {
      return await message.error();
    }
  }

  updateGuildLanguage(guild: FireGuild) {
    guild.language = this.client.getLanguage(guild.language.id);
  }
}
