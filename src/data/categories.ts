export type ChildCategory = {
  slug: string;
  label: string;
  description: string;
  kind: "notes" | "tool";
};

export type ParentCategory = {
  slug: string;
  label: string;
  description: string;
  children: ChildCategory[];
};

export const categories: ParentCategory[] = [
  {
    slug: "xmu",
    label: "我与厦大",
    description: "关于厦大里的项目、校园生活，以及毕业前想认真完成的一些事情。",
    children: [
      {
        slug: "campus-projects",
        label: "My Compass",
        description: "和厦大有关的项目经历、校园日常、活动与阶段性记录。",
        kind: "notes"
      },
      {
        slug: "fifty-before-graduation",
        label: "毕业前的 50 件事",
        description: "给自己留下一个更具体、更有仪式感的毕业前清单。",
        kind: "notes"
      }
    ]
  },
  {
    slug: "daily-life",
    label: "日常生活",
    description: "关于普通日子、出门玩耍和那些值得被轻轻记下的生活片段。",
    children: [
      {
        slug: "daily-notes",
        label: "日常记录",
        description: "普通的一天、天气变化、小片段和临时冒出来的想法。",
        kind: "notes"
      },
      {
        slug: "outings",
        label: "出去玩",
        description: "出门散步、短途旅行、城市探索和轻量出行。",
        kind: "notes"
      }
    ]
  },
  {
    slug: "personal-ledger",
    label: "娱乐小站",
    description: "放一些轻量小工具、小实验，以及你想单独收纳的实用网页内容。",
    children: [
      {
        slug: "device-costs",
        label: "电子产品均价",
        description: "记录电脑、手机等设备的购买价格、持有天数与日均成本。",
        kind: "tool"
      },
      {
        slug: "small-expenses",
        label: "拼图游戏",
        description: "这里会慢慢收纳一些轻量娱乐项目，首个项目是离线可玩的拼图游戏。",
        kind: "tool"
      }
    ]
  }
];
