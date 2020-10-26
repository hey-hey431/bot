import {
  Guild,
  Structures,
  TextChannel,
  MessageEmbed,
  MessageEmbedOptions,
} from "discord.js";
import { Language } from "../util/language";
import { FireMember } from "./guildmember";
import { Fire } from "../Fire";
import { Settings } from "../util/settings";

export class FireGuild extends Guild {
  client: Fire;
  owner: FireMember;
  settings: Settings;
  language: Language;

  constructor(client: Fire, data: object) {
    super(client, data);
    this.settings = new Settings(client, this);
    this.language = client.getLanguage(
      this.settings.get("utils.language", "en-US")
    );
  }

  isPublic() {
    return (
      !!this.client.settings.get(this.id, "utils.public", false) ||
      this.features.includes("DISCOVERABLE")
    );
  }

  getDiscoverableData() {
    let splash = "https://i.imgur.com/jWRMBRd.png";
    if (this.splash)
      splash = this.splashURL({
        size: 2048,
        format: "png",
      }).replace("size=2048", "size=320");
    else if (this.discoverySplash)
      splash = this.discoverySplashURL({
        size: 2048,
        format: "png",
      }).replace("size=2048", "size=320");
    const icon = this.iconURL({
      format: this.icon.startsWith("a_") ? "gif" : "png",
      size: 128,
    });
    return {
      name: this.name,
      id: this.id,
      icon,
      splash,
      vanity: `https://discover.inv.wtf/${this.id}`,
      members: this.memberCount,
    };
  }

  getMember(name: string): FireMember | null {
    const username = name.split("#")[0];
    const member = this.members.cache.find(
      (member) =>
        member.toString().toLowerCase() == name.toLowerCase() ||
        member.displayName?.toLowerCase() == username.toLowerCase() ||
        member.user.username?.toLowerCase() == username.toLowerCase()
    );

    return member ? (member as FireMember) : null;
  }

  async fetchMember(name: string): Promise<FireMember | null> {
    const member = this.getMember(name);

    if (member) {
      return member;
    } else {
      const fetchedMembers = await this.members.fetch({
        user: this.members.cache.size ? [...this.members.cache.array()] : [],
        query: name,
        limit: 1,
      });

      return fetchedMembers.first() as FireMember | null;
    }
  }

  async actionLog(log: string | MessageEmbed | MessageEmbedOptions) {
    const channel = this.channels.cache.get(this.settings.get("log.action"));
    if (!channel || channel.type != "text") return;
    return await (channel as TextChannel).send(log);
  }

  async modLog(log: string | MessageEmbed | MessageEmbedOptions) {
    const channel = this.channels.cache.get(
      this.settings.get("log.moderation")
    );
    if (!channel || channel.type != "text") return;
    return await (channel as TextChannel).send(log);
  }
}

Structures.extend("Guild", () => FireGuild);
