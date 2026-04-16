Object.defineProperty(exports, '__esModule', {
  value: true
});

var SEMANTIC_TYPE_RULES = {
  CTRL: ['规则', '边界', '项目管理学', '共建人生系统', '稳定行动', '负责', '执行型', '长期稳定'],
  'ATM-er': ['礼物', '实用型', '惊喜', '陪你', '想见你', '高质量陪伴', '处理麻烦'],
  'Dior-s': ['抽象型', '随机刷新副本', '发疯', '也想找人陪', '云淡风轻'],
  BOSS: ['能力和担当', '系统', '长期', '规则先立', '守护型'],
  'THAN-K': ['温柔和真心', '治愈', '温柔到老', '每件小事', '沟通和共情'],
  'OH-NO': ['你别多想', '脑内', '弹幕', '高风险', '心跳'],
  GOGO: ['想见你', '随机', '冲', '发疯', '副本'],
  SEXY: ['心跳', '一见钟情', '第一版合同', '可爱'],
  'LOVE-R': ['相信爱', '治愈', '温柔', '忍不住就爱了'],
  MUM: ['高质量陪伴', '共情', '接住我', '修修补补'],
  FAKE: ['观察一阵', '沟通感受', '云淡风轻'],
  OJBK: ['信你一次', '除非没法修', '先修', '大家都恋爱'],
  MALO: ['弹幕刷屏', '发疯', '玄学', '概率论'],
  'JOKE-R': ['小猫认错图', '台阶', '抽象'],
  'WOC!': ['发疯', '弹幕', '玄学+概率论', '心跳'],
  'THIN-K': ['价值观一致', '规则先立', '边界讲清楚', '项目管理学', '复盘'],
  SHIT: ['分手', '负责', '说散', '失信和反复'],
  ZZZZ: ['安静有秩序', '清醒型', '猫头鹰', '信一点'],
  POOR: ['长期相处', '长期稳定', '共建', '稳定行动'],
  MONK: ['安静有秩序', '边界', '清醒型', '长期相处'],
  IMSB: ['脑内已经连载', '云淡风轻', '说散', '我也想找人陪'],
  SOLO: ['接住我', '冷暴力', '已读不回', '打扫你留下的光'],
  FUCK: ['一起发疯', '随机刷新副本', '玄学', '弹幕刷屏'],
  DEAD: ['不信', '长期相处', '负责', '稳定'],
  IMFW: ['可爱', '真心', '想找人陪', '相信爱'],
  HHHH: ['玄学+概率论', '抽象型', '弹幕刷屏', '发疯']
};

function buildSemanticScores(answers) {
  var scores = {};
  Object.keys(SEMANTIC_TYPE_RULES).forEach(function(code) {
    scores[code] = 0;
  });

  questions.forEach(function(q) {
    var selectedValue = answers[q.id];
    if (selectedValue === undefined) return;
    var selectedOption = q.options.find(function(opt) {
      return opt.value === Number(selectedValue);
    });
    if (!selectedOption || !selectedOption.label) return;
    var label = String(selectedOption.label);
    Object.keys(SEMANTIC_TYPE_RULES).forEach(function(code) {
      var keywords = SEMANTIC_TYPE_RULES[code];
      for (var i = 0; i < keywords.length; i++) {
        if (label.indexOf(keywords[i]) !== -1) {
          scores[code] += 1;
          break;
        }
      }
    });
  });

  return scores;
}

exports.computeResult = function(answers) {
  var rawScores = {};
  var levels = {};
  
  Object.keys(dimensionMeta).forEach(function(key) {
    rawScores[key] = 0;
  });
  
  questions.forEach(function(q) {
    rawScores[q.dim] += Number(answers[q.id] || 0);
  });
  
  Object.entries(rawScores).forEach(function(entry) {
    var dim = entry[0];
    var score = entry[1];
    levels[dim] = score <= 3 ? 'L' : score === 4 ? 'M' : 'H';
  });
  
  var finalLevels = dimensionOrder.map(function(dim) {
    return letterToNumber(levels[dim]);
  });
  var semanticScores = buildSemanticScores(answers);
  
  var rankedTypes = NORMAL_TYPES.map(function(type) {
    var patternArray = type.pattern.replace(/-/g, '').split('').map(letterToNumber);
    var distance = 0;
    var exact = 0;
    
    for (var i = 0; i < patternArray.length; i++) {
      var diff = Math.abs(finalLevels[i] - patternArray[i]);
      distance += diff;
      if (diff === 0) exact += 1;
    }
    
    var semanticBoost = semanticScores[type.code] || 0;
    var adjustedDistance = Math.max(0, distance - semanticBoost * 0.35);
    var similarity = Math.max(0, Math.min(100, Math.round(100 * (1 - adjustedDistance / 30))));
    
    return Object.assign({}, type, TYPE_LIBRARY[type.code], {
      distance: distance,
      adjustedDistance: adjustedDistance,
      exact: exact,
      similarity: similarity,
      semanticBoost: semanticBoost
    });
  }).sort(function(a, b) {
    if (a.adjustedDistance !== b.adjustedDistance) return a.adjustedDistance - b.adjustedDistance;
    if (b.semanticBoost !== a.semanticBoost) return b.semanticBoost - a.semanticBoost;
    if (b.exact !== a.exact) return b.exact - a.exact;
    return b.similarity - a.similarity;
  });
  
  var bestNormal = rankedTypes[0];
  var isDrunk = answers.drink_gate_q2 === 2;
  var modeKicker = '你的主恋爱类型';
  var badge = '匹配度 ' + bestNormal.similarity + '% · 精准命中 ' + bestNormal.exact + '/15 维';
  var sub = '维度命中度较高，当前结果可视为你的第一情侣画像。';
  var special = false;
  var secondaryType = null;
  var finalType;
  
  if (isDrunk) {
    finalType = TYPE_LIBRARY.DRUNK;
    secondaryType = bestNormal;
    modeKicker = '隐藏恋爱形态已激活';
    badge = '匹配度 100% · 酒精异常因子已接管';
    sub = '乙醇亲和性过强，系统已直接跳过常规恋爱审判。';
    special = true;
  } else if (bestNormal.similarity < 60) {
    finalType = TYPE_LIBRARY.HHHH;
    modeKicker = '系统抽象兜底';
    badge = '标准恋爱类型库最高匹配仅 ' + bestNormal.similarity + '%';
    sub = '标准恋爱类型库对你的脑回路集体罢工了，于是系统把你强制分配给了 LOLP。';
    special = true;
  } else {
    finalType = bestNormal;
  }
  
  return {
    rawScores: rawScores,
    levels: levels,
    ranked: rankedTypes,
    bestNormal: bestNormal,
    finalType: finalType,
    modeKicker: modeKicker,
    badge: badge,
    sub: sub,
    special: special,
    secondaryType: secondaryType
  };
};

exports.shuffle = function(array) {
  var arr = [].concat(array);
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = [arr[j], arr[i]];
    arr[i] = temp[0];
    arr[j] = temp[1];
  }
  return arr;
};

var dimensionMeta = {
  S1: {
    name: 'S1 自尊自信',
    model: '自我模型'
  },
  S2: {
    name: 'S2 自我清晰度',
    model: '自我模型'
  },
  S3: {
    name: 'S3 核心价值',
    model: '自我模型'
  },
  E1: {
    name: 'E1 依恋安全感',
    model: '情感模型'
  },
  E2: {
    name: 'E2 情感投入度',
    model: '情感模型'
  },
  E3: {
    name: 'E3 边界与依赖',
    model: '情感模型'
  },
  A1: {
    name: 'A1 世界观倾向',
    model: '态度模型'
  },
  A2: {
    name: 'A2 规则与灵活度',
    model: '态度模型'
  },
  A3: {
    name: 'A3 人生意义感',
    model: '态度模型'
  },
  Ac1: {
    name: 'Ac1 动机导向',
    model: '行动驱力模型'
  },
  Ac2: {
    name: 'Ac2 决策风格',
    model: '行动驱力模型'
  },
  Ac3: {
    name: 'Ac3 执行模式',
    model: '行动驱力模型'
  },
  So1: {
    name: 'So1 社交主动性',
    model: '社交模型'
  },
  So2: {
    name: 'So2 人际边界感',
    model: '社交模型'
  },
  So3: {
    name: 'So3 表达与真实度',
    model: '社交模型'
  }
};
exports.dimensionMeta = dimensionMeta;

var questions = [{
  id: 'q1',
  dim: 'S1',
  text: '你发了一条“晚安”，对方只回了一个“。”，你会？',
  options: [{
    label: '句号？这是冷暴力前摇吧。',
    value: 1
  }, {
    label: '先观察，不急着下结论。',
    value: 2
  }, {
    label: '可能困到手滑，我先睡。',
    value: 3
  }]
}, {
  id: 'q2',
  dim: 'S1',
  text: '准备见喜欢的人前，你通常会？',
  options: [{
    label: '换三套衣服后宣布“我今天好丑”。',
    value: 1
  }, {
    label: '选一套顺眼的，稳定发挥。',
    value: 2
  }, {
    label: '自信出门，今天由我发光。',
    value: 3
  }]
}, {
  id: 'q3',
  dim: 'S2',
  text: '恋爱里，你更接近哪种“真实状态”？',
  options: [{
    label: '容易被对方情绪带着走，自己先放后面。',
    value: 1
  }, {
    label: '大体稳定，但会根据关系阶段微调。',
    value: 2
  }, {
    label: '自我边界和需求很清楚，不容易跑偏。',
    value: 3
  }]
}, {
  id: 'q4',
  dim: 'S2',
  text: '恋爱中你最想被看见的是？',
  options: [{
    label: '我的能力和担当。',
    value: 1
  }, {
    label: '我的温柔和真心。',
    value: 2
  }, {
    label: '我的可爱和奇怪脑回路。',
    value: 3
  }]
}, {
  id: 'q5',
  dim: 'S3',
  text: '你理想中的恋爱分工更像？',
  options: [{
    label: '我负责情绪价值，你负责现实闯关。',
    value: 1
  }, {
    label: '双人轮班，谁状态好谁带飞。',
    value: 2
  }, {
    label: '并肩作战，恋爱和人生都要升级。',
    value: 3
  }]
}, {
  id: 'q6',
  dim: 'S3',
  text: '你更接受哪种浪漫？',
  options: [{
    label: '“我帮你把麻烦都处理了”。',
    value: 1
  }, {
    label: '“我记得你说过的每件小事”。',
    value: 2
  }, {
    label: '“今天没理由，就是想见你”。',
    value: 3
  }]
}, {
  id: 'q7',
  dim: 'E1',
  text: '对象说“你别多想”，你会：',
  options: [{
    label: '行，那我们把边界讲清楚。',
    value: 1
  }, {
    label: '好，我信你一次。',
    value: 2
  }, {
    label: '我嘴上“嗯嗯”，脑内已经连载16集。',
    value: 3
  }]
}, {
  id: 'q8',
  dim: 'E1',
  text: '你在关系里的安全感来源是？',
  options: [{
    label: '明确承诺和稳定行动。',
    value: 1
  }, {
    label: '及时回应和高质量陪伴。',
    value: 2
  }, {
    label: '对方在我发疯时还能接住我。',
    value: 3
  }]
}, {
  id: 'q9',
  dim: 'E2',
  text: '对象突然情绪低落，你第一反应是？',
  options: [{
    label: '先抱抱，再说“我在”。',
    value: 1
  }, {
    label: '先问原因，再一起想办法。',
    value: 2
  }, {
    label: '立刻安排治愈计划，执行。',
    value: 3
  }]
}, {
  id: 'q10',
  dim: 'E2',
  text: '对象说“想你了”，你会怎么回？',
  options: [{
    label: '嗯（内心放烟花，表面装稳重）。',
    value: 1
  }, {
    label: '我也想你，附赠一个猫猫头。',
    value: 2
  }, {
    label: '定位发我，我现在就闪现。',
    value: 3
  }]
}, {
  id: 'q11',
  dim: 'E3',
  text: '对象和异性朋友走得近，你会：',
  options: [{
    label: '直接谈边界，规则先立。',
    value: 1
  }, {
    label: '观察一阵，再沟通感受。',
    value: 2
  }, {
    label: '表面云淡风轻，内心弹幕刷屏。',
    value: 3
  }]
}, {
  id: 'q12',
  dim: 'E3',
  text: '周末最佳恋爱模式是？',
  options: [{
    label: '24小时贴贴，连空气都要一起吸。',
    value: 1
  }, {
    label: '半天约会半天各自回血。',
    value: 2
  }, {
    label: '各忙各的，晚上汇报今日可爱。',
    value: 3
  }]
}, {
  id: 'q13',
  dim: 'A1',
  text: '你相信一见钟情吗？',
  options: [{
    label: '不信，长期相处才见真章。',
    value: 1
  }, {
    label: '信一点，但要靠后续经营。',
    value: 2
  }, {
    label: '信，心跳是第一版合同。',
    value: 3
  }]
}, {
  id: 'q14',
  dim: 'A1',
  text: '你更相信哪种爱情叙事？',
  options: [{
    label: '先现实磨合，再谈灵魂共振。',
    value: 1
  }, {
    label: '一半天意，一半经营。',
    value: 2
  }, {
    label: '命运会把对的人推到我面前。',
    value: 3
  }]
}, {
  id: 'q15',
  dim: 'A2',
  text: '纪念日安排临时变动时，你会？',
  options: [{
    label: '计划被打乱，灵魂也跟着掉线。',
    value: 1
  }, {
    label: '先抱怨两句，再一起改方案。',
    value: 2
  }, {
    label: '没事，浪漫本来就该随机刷新。',
    value: 3
  }]
}, {
  id: 'q16',
  dim: 'A2',
  text: '约会地点你更偏好：',
  options: [{
    label: '安静有秩序的地方。',
    value: 1
  }, {
    label: '温馨可聊天的地方。',
    value: 2
  }, {
    label: '随机刷新副本，走哪算哪。',
    value: 3
  }]
}, {
  id: 'q17',
  dim: 'A3',
  text: '你认为长久关系最重要的是？',
  options: [{
    label: '价值观一致。',
    value: 1
  }, {
    label: '沟通和共情。',
    value: 2
  }, {
    label: '愿意一起修修补补。',
    value: 3
  }]
}, {
  id: 'q18',
  dim: 'A3',
  text: '你期待的爱情结局是：',
  options: [{
    label: '共建人生系统，长期稳定。',
    value: 1
  }, {
    label: '彼此治愈，温柔到老。',
    value: 2
  }, {
    label: '一起发疯，也一起回家。',
    value: 3
  }]
}, {
  id: 'q19',
  dim: 'Ac1',
  text: '吵架后你更像哪类人？',
  options: [{
    label: '当晚复盘，不睡觉也要解决。',
    value: 1
  }, {
    label: '先冷静，再认真沟通。',
    value: 2
  }, {
    label: '先发小猫认错图，再找台阶。',
    value: 3
  }]
}, {
  id: 'q20',
  dim: 'Ac1',
  text: '关系出现矛盾时，你更像哪种处理方式？',
  options: [{
    label: '先降温，避免情绪误伤。',
    value: 1
  }, {
    label: '边聊边梳理问题，当场止损。',
    value: 2
  }, {
    label: '直接开诚布公，把结论聊清楚。',
    value: 3
  }]
}, {
  id: 'q21',
  dim: 'Ac2',
  text: '你对“分手”两个字的态度：',
  options: [{
    label: '不轻易说，一说就要负责。',
    value: 1
  }, {
    label: '除非没法修，否则先修。',
    value: 2
  }, {
    label: '嘴上说散，心里还在打扫你留下的光。',
    value: 3
  }]
}, {
  id: 'q22',
  dim: 'Ac2',
  text: '你觉得恋爱最像哪门学科：',
  options: [{
    label: '项目管理学。',
    value: 1
  }, {
    label: '情绪沟通学。',
    value: 2
  }, {
    label: '玄学+概率论。',
    value: 3
  }]
}, {
  id: 'q23',
  dim: 'Ac3',
  text: '纪念日礼物你更偏向？',
  options: [{
    label: '实用型，能天天用最香。',
    value: 1
  }, {
    label: '仪式感，哪怕小也要有惊喜。',
    value: 2
  }, {
    label: '抽象型，送一个“陪你看落日会员”。',
    value: 3
  }]
}, {
  id: 'q24',
  dim: 'Ac3',
  text: '你在恋爱里执行承诺的状态更像？',
  options: [{
    label: '想到就做，忘了就下次。',
    value: 1
  }, {
    label: '大部分能做到，偶尔摆烂。',
    value: 2
  }, {
    label: '说到做到，我的话自带追踪码。',
    value: 3
  }]
}, {
  id: 'q25',
  dim: 'So1',
  text: '双人聚会突然变十人大局，你会？',
  options: [{
    label: '我和奶茶先隐身。',
    value: 1
  }, {
    label: '能聊就聊，聊累就发呆。',
    value: 2
  }, {
    label: '来都来了，我来当气氛发动机。',
    value: 3
  }]
}, {
  id: 'q26',
  dim: 'So1',
  text: '对象朋友第一次见你，你通常？',
  options: [{
    label: '礼貌微笑，话不超过十句。',
    value: 1
  }, {
    label: '正常社交，稳中带皮。',
    value: 2
  }, {
    label: '五分钟内打成一片，顺便加群。',
    value: 3
  }]
}, {
  id: 'q27',
  dim: 'So2',
  text: '你最不能接受对象哪点？',
  options: [{
    label: '失信和反复。',
    value: 1
  }, {
    label: '冷暴力和敷衍。',
    value: 2
  }, {
    label: '已读不回还发朋友圈。',
    value: 3
  }]
}, {
  id: 'q28',
  dim: 'So2',
  text: '对象想看你手机时，你会？',
  options: [{
    label: '给看，但希望彼此也有边界。',
    value: 1
  }, {
    label: '看情况，先问清楚原因。',
    value: 2
  }, {
    label: '不行，信任不是翻聊天记录。',
    value: 3
  }]
}, {
  id: 'q29',
  dim: 'So3',
  text: '你表达“我在意你”的方式更像？',
  options: [{
    label: '直说：我想你了，也想见你。',
    value: 1
  }, {
    label: '会表达，但会挑时机和语气。',
    value: 2
  }, {
    label: '不太说，用行动慢慢证明。',
    value: 3
  }]
}, {
  id: 'q30',
  dim: 'So3',
  text: '最后一个问题：你为什么还愿意恋爱？',
  options: [{
    label: '遇到了一个人，忍不住就爱了。',
    value: 1
  }, {
    label: '大家都恋爱，我也想找人陪。',
    value: 2
  }, {
    label: '相信爱。',
    value: 3
  }]
}];
exports.questions = questions;

exports.specialQuestions = [{
  id: 'drink_gate_q1',
  special: true,
  kind: 'drink_gate',
  text: '你约会时最离不开什么？',
  options: [{
    label: '氛围感和仪式感',
    value: 1
  }, {
    label: '聊天和散步',
    value: 2
  }, {
    label: '小酌两杯，微醺更会说情话',
    value: 3
  }, {
    label: '一起健身，心率同频',
    value: 4
  }]
}, {
  id: 'drink_gate_q2',
  special: true,
  kind: 'drink_trigger',
  text: '如果对象说“今晚不醉不归”，你会？',
  options: [{
    label: '浅喝一点，快乐就好',
    value: 1
  }, {
    label: '开盖就是人生，今晚我和酒神共舞',
    value: 2
  }]
}];

var TYPE_LIBRARY = {
  CTRL: { code: 'ALFA', cn: 'S系霸道总裁', intro: '开会、恋爱、接吻都要走流程。', desc: '你在关系里像一个会写甘特图的总裁。约会前有预案，吵架后有复盘，亲密时有战略。你的爱不是“随便啦”，而是“本季度我们幸福KPI必须达标”。对象只要不跑路，通常会被你稳稳安排进未来蓝图。你偶尔会把浪漫也做成项目管理，连拥抱都像签收单，但偏偏这种笨拙的认真最戳人。深夜里你也会悄悄焦虑：万一我控制得太多，会不会把爱变成考核。' },
  'ATM-er': { code: 'GIFT', cn: '氪金骑士', intro: '你负责买单，我负责爱你。', desc: '你恋爱时最常说的话是“我来吧”。不是炫富，是你把照顾当成本能。奶茶、打车、礼物、时间、情绪价值，统统在线支付。你是移动付费系统，也是感情里的安全气囊。你最抽象的技能是“把破防瞬间结算成红包转账”，一边生气一边说“先把饭吃了”。只是偶尔你也会在账单般的关系里怀疑：我被爱的是我本人，还是我永不欠费的温柔。' },
  'Dior-s': { code: 'LAZY', cn: '摆烂甜心', intro: '不卷，但会爱。', desc: '你是“躺着也能谈恋爱”的天赋型选手。不会硬凹人设，不喜欢无效内耗，恋爱主打自然流。你嘴上说“都行”，但真遇到对的人，会在细节里偷偷认真。别人以为你佛，其实你只是把情绪调成了省电模式，关键时刻一秒满格。你会用最懒的姿势讲最真心的话，比如“我懒得换人了，就你吧”，听起来很摆，实际上很浪漫。' },
  BOSS: { code: 'KING', cn: '恋爱CEO', intro: '这个家，我来上市。', desc: '你有强烈掌舵欲，情绪稳定、执行力强，碰到问题第一反应是“解决它”。对象在你身边会有种被带飞的安全感。副作用是偶尔像上司查岗，建议适当增加“撒娇模块”。你会把“我们以后”讲得像融资路演，逻辑完整、目标清晰、连风险提示都写好了。可你心里最柔软的一句其实是：我这么拼，只是怕你跟着我吃苦。' },
  'THAN-K': { code: 'AWWW', cn: '夸夸恋人', intro: '谢谢你出现在我的剧本里。', desc: '你是恋爱里的正向反馈永动机。对象做了小事你也会认真夸，连“记得带伞”都能夸成史诗级温柔。和你在一起，生活像开了柔光滤镜，连堵车都能被你翻译成“多陪伴了十分钟”。你能把一句“晚安”回成三段情书，把一碗泡面夸成米其林限定。抽象的是你永远乐观，浪漫的是你从不敷衍，伤感的是你常常把坏情绪自己吞掉。' },
  'OH-NO': { code: 'ALRM', cn: '预警雷达', intro: '我不是多想，我是早想。', desc: '你在关系里对风险极其敏锐。对象语气变了0.5度，你已经开始做应急预案。你不是不爱，是太怕失去。只要学会把“脑补灾难片”改成“及时沟通”，幸福会更稳。你的大脑像24小时值班保安，风吹草动都能响警报，连“嗯”字都能分析出八个情绪版本。别人笑你戏多，你却在夜里偷偷难过：我不是不信你，我只是怕自己又输一次。' },
  GOGO: { code: 'RUSH', cn: '冲锋恋人', intro: '想你？现在见。', desc: '你是行动派，不玩暧昧玄学。喜欢就追，想见就约，矛盾就聊，主打一个不拖沓。你让爱情有速度也有温度。偶尔可以慢一点，让对象也享受下“被等一等”的浪漫。你常常在别人还在编辑消息时已经打到楼下，像恋爱界闪送骑手。抽象的是你冲得快，动人的是你从不打空枪，每一次“我来了”都是真的来了。' },
  SEXY: { code: 'GLOW', cn: '人间荷尔蒙', intro: '你一出现，BGM自动响起。', desc: '你是氛围感制造机，眼神、语气、步伐都像开了恋爱滤镜。你不一定刻意撩，但总能让人心跳加速。对象会有一种“我真的捡到宝了”的恍惚感。你路过便利店都像红毯现场，喝口水都像广告片慢镜头。可真正高级的地方不是外放魅力，而是你会在热闹散场后，把那个人的手握得更紧。' },
  'LOVE-R': { code: 'BARD', cn: '浪漫诗人', intro: '爱是我唯一母语。', desc: '你对爱情有很高感知力，一句晚安都能写出内心旁白。你会记住纪念日、天气、对方皱眉的角度。你让关系充满仪式与诗意，建议偶尔也别忘了按时吃饭。你能把普通周三过成电影彩蛋，把地铁站分别写成散文结尾。抽象的是你总在脑内配乐，浪漫的是你真的会为一个拥抱走很远，伤感的是你太会共情，连风都能让你想念。' },
  MUM: { code: 'CARE', cn: '恋爱妈咪', intro: '宝，外套穿好。', desc: '你是超级照顾型恋人，能察觉对象没说出口的不安。你会提醒吃饭、催睡觉、备药、递纸巾，温柔得像人形保温杯。记得把同款温柔分一点给自己。你最常见的超能力是“对方还没说，你已经做了”，像爱情里的提前量大师。可别忘了你也可以偶尔当小孩，被哄一次、被偏爱一次、被认真接住一次。' },
  FAKE: { code: 'MASK', cn: '千面情人', intro: '看人切频道，精准适配。', desc: '你社交适配能力极强，在恋爱里也懂得根据场景调整表达。和你在一起不会尴尬，但偶尔会让人猜“哪个你才是最真实的你”。试着多暴露一点真心，关系会更深。你能在三秒内从“搞笑搭子”切到“成熟伴侣”，像情绪变速箱一样丝滑。抽象的是你面面俱到，浪漫的是你愿意为一个人卸下模式，哪怕只是一点点。' },
  OJBK: { code: 'CHLL', cn: '佛系伴侣', intro: '都可以，但别失联。', desc: '你不爱争输赢，很多事都能让一步。你给对象很高自由度，是低压恋爱天花板。只是遇到关键议题时，记得表达真实立场，别把“包容”变成“隐身”。你的“都行”不是敷衍，是把琐事从关系里清理出去。只是再淡定的人也有想被坚定选择的瞬间，别怕开口说“这次我有点在意”。' },
  MALO: { code: 'MONY', cn: '快乐吗喽', intro: '恋爱可以，先整点乐子。', desc: '你在关系里重视好玩和新鲜，脑洞大、点子多，约会永远不无聊。你会把平凡日子过成轻喜剧。唯一风险是节奏太跳，偶尔也要给稳定感补点货。你能把买菜演成密室逃脱，把散步走成综艺花絮。抽象的是你随时开节目，浪漫的是你努力让对方在你身边一直笑，哪怕你自己偶尔也在硬撑。' },
  'JOKE-R': { code: 'CLOW', cn: '嘴硬小丑', intro: '我在逗你，其实在爱你。', desc: '你擅长用玩笑化解尴尬，也容易把脆弱藏进段子里。对象会被你逗笑，也会想更懂你。你不是不深情，只是表达器默认是“喜剧模式”。你最会的不是搞笑，而是把双方从尴尬边缘拉回来。可当所有人都笑的时候，你也会在安静那一秒想：如果我不搞笑了，还会不会被好好爱。' },
  'WOC!': { code: 'WOAH', cn: '震惊体恋人', intro: '卧槽你也太可爱了吧！', desc: '你情绪表达直接且浓烈，开心就夸上天，不爽就当场“卧槽”。你让关系非常有生命力，像实时弹幕恋爱。注意控制输出音量，避免把浪漫演成新闻联播。你是那种会在深夜突然发语音“我刚想到你就笑出声”的人，情绪来得快也真。抽象的是你像烟花，浪漫的是你每次炸开都在照亮同一个人。' },
  'THIN-K': { code: 'MIND', cn: '理性军师', intro: '先分析，再拥抱。', desc: '你会认真评估关系里的信息、情绪与边界，像恋爱版策略顾问。你不轻易上头，但一旦确认，就很稳。建议在分析之外，给感性留一点上场时间。你擅长在混乱时给出结构化答案，像给爱情加了防抖。抽象的是你连吵架都能总结重点，浪漫的是你每次讲完道理，最后都会补一句“我还是站你这边”。' },
  SHIT: { code: 'SPCY', cn: '暴躁暖男/女', intro: '嘴上嫌弃，手上宠你。', desc: '你是“语言攻击，行动治愈”型恋人。嘴里吐槽对象迷糊，转头把事全做好。你不擅长腻歪，但关键时刻永远在。你的爱有点凶，但很实在。你会边骂边修好坏掉的充电线，边叹气边把人护在身后。抽象的是你台词像反派，剧情却总是英雄救场。' },
  ZZZZ: { code: 'SLEP', cn: '睡神伴侣', intro: '先睡会儿，醒了继续爱。', desc: '你不是冷淡，你只是电量管理大师。消息回得慢，但该出现时不会缺席。你擅长在低功耗模式维持稳定关系，是“安静但可靠”的恋爱选手。你把“秒回”换成“准时在”，把热闹换成长久。伤感一点说，你总怕自己给得不够多；浪漫一点说，你一直在用最稳的节奏陪同一个人到天亮。' },
  POOR: { code: 'FOCS', cn: '专注型恋人', intro: '我不广撒网，我只深挖你。', desc: '你把注意力集中给最重要的人，社交面不大，但投入很深。你不喜欢花里胡哨，更在乎一起把日子过扎实。你是“少说漂亮话，多做靠谱事”的代表。别人以为你木，你其实是把浪漫藏进了重复的小事：记得口味、记得日期、记得那句随口说过的话。抽象的是你像老派系统，浪漫的是你从不掉线。' },
  MONK: { code: 'ZENN', cn: '禁欲系高僧', intro: '爱你，但请保持一米禅意。', desc: '你非常重视边界和独处，恋爱也要保留精神自留地。对象可能会觉得你清冷，但懂你的人会知道：你不是无情，你是慢热到需要焚香静心。你像一间安静书房，不喧哗却有温度。抽象的是你连心动都像打坐，浪漫的是一旦你主动靠近，那一步就特别值钱。' },
  IMSB: { code: 'WAVR', cn: '纠结王者', intro: '想冲又怕翻车。', desc: '你内心常年上演“大胆示爱”与“原地撤退”双线作战。你并不缺爱，只是怕给错人。你需要一个能接住你犹豫的人，让你慢慢从“脑内恋爱”走到“现实牵手”。你会把一句“在吗”删了又写，像在做高风险投资决策。抽象的是你心里已经结婚三次，现实里还在打招呼；浪漫的是你一旦确认，就会非常认真。' },
  SOLO: { code: 'HEDG', cn: 'M系刺猬恋人', intro: '靠近我，但别太快。', desc: '你渴望亲密，也害怕受伤，所以会先竖起刺。你对关系很认真，只是信任建立慢。遇到耐心又稳定的对象时，你会从“防御模式”切到“全糖模式”。你不是高冷，是在确认安全。抽象的是你嘴上“别来烦我”，转头又会记住对方所有偏好；伤感的是你曾被辜负过，浪漫的是你依然愿意再试一次。' },
  FUCK: { code: 'WILD', cn: '野生恋人', intro: '我爱得很野，但不是乱来。', desc: '你不喜欢被定义，恋爱风格自由、直接、生命力爆棚。你讨厌套路，喜欢真实碰撞。和你恋爱像在公路电影里兜风，刺激、热烈、很难忘。你会在凌晨说走就走，也会在雨里大笑着说“活着真好”。抽象的是你像没装消音器的心脏，浪漫的是你所有失控都只对同一个人温柔。' },
  DEAD: { code: 'CALM', cn: '低欲系情人', intro: '情绪省电，但心还在。', desc: '你看起来淡淡的，不太主动制造戏剧冲突。你不追求轰轰烈烈，更偏爱平稳长线。只要对象理解你的表达方式，这段关系会像老火慢炖，越久越香。你不是没有爱意，只是不爱喧哗。抽象的是你把“我爱你”压缩成“到家说一声”，伤感的是很少人读得懂这份安静，浪漫的是懂的人会一直留在你身边。' },
  IMFW: { code: 'SOFT', cn: '小鸟依人甜豆', intro: '嘴上废物，心里全是你。', desc: '你敏感、真诚、容易认真，偶尔会自我怀疑。你需要明确的偏爱，也会回报超额的依赖和信任。你不是废物，你只是把心门开得太大。你会因为一句“辛苦了”开心很久，也会因为一句冷淡悄悄失眠。抽象的是你情绪像棉花糖忽大忽小，浪漫的是你一旦被温柔对待，就会把整颗心都交出来。' },
  HHHH: { code: 'LOLP', cn: '抽象恋爱体', intro: '哈哈哈哈哈你这恋爱脑回路太野了。', desc: '系统努力了，但没完全看懂你。你的恋爱风格像量子态：可甜可飒可疯可静，一秒切换。恭喜你成为“无法被标准标签驯服”的抽象艺术家。你今天可以写诗，明天可以摆烂，后天又突然成熟得像情感导师。抽象是你的表面，浪漫是你的底色，伤感是你偶尔深夜看月亮时不说的话。' },
  DRUNK: { code: 'TIPS', cn: '微醺情圣', intro: '三分醉意，七分情话。', desc: '你在酒精场域的魅力会指数上升，平时说不出口的话，微醺后都变诗。你可能是局上最会讲情话的人，也可能是第二天最会后悔的人。适量浪漫，别让宿醉接管爱情。你会在举杯时像英雄，在清晨时像哲学家，下午又像失忆患者翻聊天记录。抽象的是你酒后宇宙级真诚，浪漫的是你醉到摇晃还记得把外套披在对方肩上。' }
};
exports.TYPE_LIBRARY = TYPE_LIBRARY;

exports.TYPE_IMAGES = {
  IMSB: './image/IMSB.png',
  BOSS: './image/BOSS.png',
  MUM: './image/MUM.png',
  FAKE: './image/FAKE.png',
  'Dior-s': './image/Dior-s.jpg',
  DEAD: './image/DEAD.png',
  ZZZZ: './image/ZZZZ.png',
  GOGO: './image/GOGO.png',
  FUCK: './image/FUCK.png',
  CTRL: './image/CTRL.png',
  HHHH: './image/HHHH.png',
  SEXY: './image/SEXY.png',
  OJBK: './image/OJBK.png',
  'JOKE-R': './image/JOKE-R.jpg',
  POOR: './image/POOR.png',
  'OH-NO': './image/OH-NO.png',
  MONK: './image/MONK.png',
  SHIT: './image/SHIT.png',
  'THAN-K': './image/THAN-K.png',
  MALO: './image/MALO.png',
  'ATM-er': './image/ATM-er.png',
  'THIN-K': './image/THIN-K.png',
  SOLO: './image/SOLO.png',
  'LOVE-R': './image/LOVE-R.png',
  'WOC!': './image/WOC.png',
  DRUNK: './image/DRUNK.png',
  IMFW: './image/IMFW.png'
};

var NORMAL_TYPES = [{
      code: 'CTRL',
  pattern: 'HHH-HMH-MHH-HHH-MHM'
}, {
      code: 'ATM-er',
  pattern: 'HHH-HHM-HHH-HMH-MHL'
}, {
      code: 'Dior-s',
  pattern: 'MHM-MMH-MHM-HMH-LHL'
}, {
      code: 'BOSS',
  pattern: 'HHH-HMH-MMH-HHH-LHL'
}, {
      code: 'THAN-K',
  pattern: 'MHM-HMM-HHM-MMH-MHL'
}, {
      code: 'OH-NO',
  pattern: 'HHL-LMH-LHH-HHM-LHL'
}, {
      code: 'GOGO',
  pattern: 'HHM-HMH-MMH-HHH-MHM'
}, {
      code: 'SEXY',
  pattern: 'HMH-HHL-HMM-HMM-HLH'
}, {
      code: 'LOVE-R',
  pattern: 'MLH-LHL-HLH-MLM-MLH'
}, {
      code: 'MUM',
  pattern: 'MMH-MHL-HMM-LMM-HLL'
}, {
      code: 'FAKE',
  pattern: 'HLM-MML-MLM-MLM-HLH'
}, {
      code: 'OJBK',
  pattern: 'MMH-MMM-HML-LMM-MML'
}, {
      code: 'MALO',
  pattern: 'MLH-MHM-MLH-MLH-LMH'
}, {
      code: 'JOKE-R',
  pattern: 'LLH-LHL-LML-LLL-MLM'
}, {
      code: 'WOC!',
  pattern: 'HHL-HMH-MMH-HHM-LHH'
}, {
      code: 'THIN-K',
  pattern: 'HHL-HMH-MLH-MHM-LHH'
}, {
      code: 'SHIT',
  pattern: 'HHL-HLH-LMM-HHM-LHH'
}, {
      code: 'ZZZZ',
  pattern: 'MHL-MLH-LML-MML-LHM'
}, {
      code: 'POOR',
  pattern: 'HHL-MLH-LMH-HHH-LHL'
}, {
      code: 'MONK',
  pattern: 'HHL-LLH-LLM-MML-LHM'
}, {
      code: 'IMSB',
  pattern: 'LLM-LMM-LLL-LLL-MLM'
}, {
      code: 'SOLO',
  pattern: 'LML-LLH-LHL-LML-LHM'
}, {
      code: 'FUCK',
  pattern: 'MLL-LHL-LLM-MLL-HLH'
}, {
      code: 'DEAD',
  pattern: 'LLL-LLM-LML-LLL-LHM'
}, {
      code: 'IMFW',
  pattern: 'LLH-LHL-LML-LLL-MLL'
}];
exports.NORMAL_TYPES = NORMAL_TYPES;

exports.DIM_EXPLANATIONS = {
  S1: {
        L: '对自己下手比别人还狠，夸你两句你都想先验明真伪。',
        M: '自信值随天气波动，顺风能飞，逆风先缩。',
        H: '心里对自己大致有数，不太会被路人一句话打散。'
  },
  S2: {
        L: '内心频道雪花较多，常在"我是谁"里循环缓存。',
        M: '平时还能认出自己，偶尔也会被情绪临时换号。',
        H: '对自己的脾气、欲望和底线都算门儿清。'
  },
  S3: {
        L: '更在意舒服和安全，没必要天天给人生开冲刺模式。',
        M: '想上进，也想躺会儿，价值排序经常内部开会。',
        H: '很容易被目标、成长或某种重要信念推着往前。'
  },
  E1: {
        L: '感情里警报器灵敏，已读不回都能脑补到大结局。',
        M: '一半信任，一半试探，感情里常在心里拉锯。',
        H: '更愿意相信关系本身，不会被一点风吹草动吓散。'
  },
  E2: {
        L: '感情投入偏克制，心门不是没开，是门禁太严。',
        M: '会投入，但会给自己留后手，不至于全盘梭哈。',
        H: '一旦认定就容易认真，情绪和精力都给得很足。'
  },
  E3: {
        L: '容易黏人也容易被黏，关系里的温度感很重要。',
        M: '亲密和独立都要一点，属于可调节型依赖。',
        H: '空间感很重要，再爱也得留一块属于自己的地。'
  },
  A1: {
        L: '看世界自带防御滤镜，先怀疑，再靠近。',
        M: '既不天真也不彻底阴谋论，观望是你的本能。',
        H: '更愿意相信人性和善意，遇事不急着把世界判死刑。'
  },
  A2: {
        L: '规则能绕就绕，舒服和自由往往排在前面。',
        M: '该守的时候守，该变通的时候也不死磕。',
        H: '秩序感较强，能按流程来就不爱即兴炸场。'
  },
  A3: {
        L: '意义感偏低，容易觉得很多事都像在走过场。',
        M: '偶尔有目标，偶尔也想摆烂，人生观处于半开机。',
        H: '做事更有方向，知道自己大概要往哪边走。'
  },
  Ac1: {
        L: '做事先考虑别翻车，避险系统比野心更先启动。',
        M: '有时想赢，有时只想别麻烦，动机比较混合。',
        H: '更容易被成果、成长和推进感点燃。'
  },
  Ac2: {
        L: '做决定前容易多转几圈，脑内会议常常超时。',
        M: '会想，但不至于想死机，属于正常犹豫。',
        H: '拍板速度快，决定一下就不爱回头磨叽。'
  },
  Ac3: {
        L: '执行力和死线有深厚感情，越晚越像要觉醒。',
        M: '能做，但状态看时机，偶尔稳偶尔摆。',
        H: '推进欲比较强，事情不落地心里都像卡了根刺。'
  },
  So1: {
        L: '社交启动慢热，主动出击这事通常得攒半天气。',
        M: '有人来就接，没人来也不硬凑，社交弹性一般。',
        H: '更愿意主动打开场子，在人群里不太怕露头。'
  },
  So2: {
        L: '关系里更想亲近和融合，熟了就容易把人划进内圈。',
        M: '既想亲近又想留缝，边界感看对象调节。',
        H: '边界感偏强，靠太近会先本能性后退半步。'
  },
  So3: {
        L: '表达更直接，心里有啥基本不爱绕。',
        M: '会看气氛说话，真实和体面通常各留一点。',
        H: '对不同场景的自我切换更熟练，真实感会分层发放。'
  }
};

var dimensionOrder = ['S1', 'S2', 'S3', 'E1', 'E2', 'E3', 'A1', 'A2', 'A3', 'Ac1', 'Ac2', 'Ac3', 'So1', 'So2', 'So3'];
exports.dimensionOrder = dimensionOrder;

function letterToNumber(letter) {
  return { L: 1, M: 2, H: 3 }[letter];
}

exports.DRUNK_TRIGGER_QUESTION_ID = 'drink_gate_q2';
