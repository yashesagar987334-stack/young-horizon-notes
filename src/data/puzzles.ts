export type PuzzleEntry = {
  slug: string;
  title: string;
  description: string;
  imageSrc: string;
};

// 后续新增拼图时：
// 1. 把图片放到 public/images/puzzles/
// 2. 在这里新增一项配置
export const puzzleEntries: PuzzleEntry[] = [
  {
    slug: "jiageng-statue",
    title: "嘉庚像",
    description: "先从熟悉的校园记忆开始，慢慢把画面拼回来。",
    imageSrc: "/images/puzzles/嘉庚像.png"
  },
  {
    slug: "furong-lakeside",
    title: "芙蓉湖畔",
    description: "把湖边这一幕拆成九块，再安静地拼回完整。",
    imageSrc: "/images/puzzles/芙蓉湖畔.png"
  }
];
