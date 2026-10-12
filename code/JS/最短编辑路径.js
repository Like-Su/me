class ShortestEditPath {
  /**
   * 计算两个字符串之间的最短编辑路径
   * 支持：插入、删除、替换
   */
  edit(source, target) {
    const m = source.length;
    const n = target.length;

    // dp[i][j]：source 前 i 个字符转换为 target 前 j 个字符的最少操作数
    const dp = Array.from({ length: m + 1 }, () =>
      Array(n + 1).fill(0)
    );
    

    // 初始化：空字符串转换为目标字符串，需要插入 j 次
    for (let j = 0; j <= n; j++) {
      dp[0][j] = j;
    }

    // 初始化：源字符串转换为空字符串，需要删除 i 次
    for (let i = 0; i <= m; i++) {
      dp[i][0] = i;
    }
    

    // 动态规划
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (source[i - 1] === target[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,     // 删除
            dp[i][j - 1] + 1,     // 插入
            dp[i - 1][j - 1] + 1  // 替换
          );
        }
      }
    }

    // 回溯：还原具体编辑步骤
    const operations = [];
    let i = m;
    let j = n;

    while (i > 0 || j > 0) {
      // 字符相同，不需要编辑
      if (
        i > 0 &&
        j > 0 &&
        source[i - 1] === target[j - 1] &&
        dp[i][j] === dp[i - 1][j - 1]
      ) {
        i--;
        j--;
      } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
        operations.push({
          type: "删除",
          char: source[i - 1],
          index: i - 1,
        });
        i--;
      } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
        operations.push({
          type: "插入",
          char: target[j - 1],
          index: i,
        });
        j--;
      } else {
        operations.push({
          type: "替换",
          from: source[i - 1],
          to: target[j - 1],
          index: i - 1,
        });
        i--;
        j--;
      }
    }

    operations.reverse();

    return {
      distance: dp[m][n],
      operations,
    };
  }

  /**
   * 命令行纠错入口
   * commands：候选命令列表
   */
  constructor(commands = ["git add .", "git status", "git commit"]) {
    this.commands = commands;
  }

  suggest(input) {
    const results = this.commands
      .map((command) => ({
        command,
        ...this.edit(input, command),
      }))
      .sort((a, b) => a.distance - b.distance);

    return results[0];
  }

  editPath(input) {
    const result = this.suggest(input);

    console.log(`输入命令：${input}`);
    console.log(`推荐命令：${result.command}`);
    console.log(`编辑距离：${result.distance}`);
    console.log("编辑步骤：", result.operations);

    return result;
  }
}

// 测试
const shortestEditPath = new ShortestEditPath();

shortestEditPath.editPath("git ada .");