export type LinkIcon = "xiaohongshu" | "globe" | "spark" | "gallery";

export type ExternalLink = {
  name: string;
  url: string;
  icon: LinkIcon;
  description: string;
  iconImageSrc?: string;
};

export const externalLinks: ExternalLink[] = [
  {
    name: "小红书：咕叽咕叽",
    url: "https://www.xiaohongshu.com/user/profile/65336faa000000000200d5fa",
    icon: "xiaohongshu",
    description: "研究生阶段持续分享考研经验、备考方法与相关内容整理的小红书账号。",
    iconImageSrc: "/images/icons/小红书图标-optimized.png"
  },
  {
    name: "个人小站",
    url: "https://example.com/",
    icon: "globe",
    description: "你自己的其他网站或实验项目。"
  },
  {
    name: "项目记录",
    url: "https://github.com/",
    icon: "spark",
    description: "这个模块基于 GitHub 和 Codex 持续整理与开发。",
    iconImageSrc: "/images/icons/github图标-optimized.png"
  },
  {
    name: "灵感收集",
    url: "https://example.com/inspirations",
    icon: "gallery",
    description: "一个更偏收藏、图文整理的外部入口。"
  }
];
