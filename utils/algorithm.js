Object.defineProperty(exports, '__esModule', {
  value: true
});

var SEMANTIC_TYPE_RULES = {
  CTRL: ['规则先立', '边界讲清楚', '项目管理学', '必须当天解决', '说到做到', '驷马难追'],
  'ATM-er': ['实用型', '天天用', '处理麻烦', '小礼物', '记得我喜欢'],
  'Dior-s': ['发不发都无所谓', '没事', '随机感', '走不到也体面告别'],
  BOSS: ['先考虑现实', '计划被打乱', '直接谈边界', '绝对的信任', '忠诚专一'],
  'THAN-K': ['互相站在对方', '温馨可聊天', '开心', '心意', '有惊喜'],
  'OH-NO': ['冷暴力前摇', '肯定有猫腻', '福尔摩斯', '弹幕刷屏', '受伤+生气'],
  GOGO: ['走哪算哪', '热闹', '随机', '出去吃吃吃', '拍拍拍'],
  SEXY: ['第一眼', '心动感', '突然就和那个他对视上了', '想见你'],
  'LOVE-R': ['忍不住就爱了', '相信爱', '心动', '仪式感'],
  MUM: ['先抱怨两句', '再一起改方案', '不急着下结论', '先问清楚原因'],
  FAKE: ['表面云淡风轻', '观察一阵', '回想他为什么', '看情况'],
  OJBK: ['有最好', '没有也不强求', '小事随缘', '发不发都无所谓'],
  MALO: ['打游戏', '小烧烤', '撒娇耍赖', 'Plan B', '我自己也能快乐'],
  'JOKE-R': ['嘴上说说而已', '撒娇耍赖', '发朋友圈', '耍赖'],
  'WOC!': ['肯定有猫腻', '福尔摩斯', '突然', '很突然'],
  'THIN-K': ['先考虑现实', '灵魂共振', '回想', '冷静', '复盘'],
  SHIT: ['非常失望生气', '冷战', '敷衍', '吵架'],
  ZZZZ: ['呆在家', '安静有秩序', '各忙各的', '私人空间'],
  POOR: ['长期相处', '经济稳', '家庭和睦', '不折腾', '不内耗'],
  MONK: ['私人空间', '不需要', '日常更重要', '不爱报备'],
  IMSB: ['会疯', '会慌', '伤心', '哪里不合适', '误会到散'],
  SOLO: ['冷淡到散', '误会到散', '现实到散', '冷暴力'],
  FUCK: ['随机副本', '走哪算哪', '热闹', '出门', '突然'],
  DEAD: ['体面告别', '不轻易说', '负责', '忠诚'],
  IMFW: ['我今天好丑', '受伤', '感动', '陪', '想找人陪'],
  HHHH: ['玄学+概率论', '大家都恋爱', '随机感', '猫腻']
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
  var modeKicker = '你的主恋爱类型';
  var badge = '匹配度 ' + bestNormal.similarity + '% · 精准命中 ' + bestNormal.exact + '/15 维';
  var sub = '维度命中度较高，当前结果可视为你的第一情侣画像。';
  var special = false;
  var secondaryType = null;
  var finalType;
  
  if (bestNormal.similarity < 60) {
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
  id: 'q3',
  dim: 'S2',
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
  id: 'q4',
  dim: 'S2',
  text: '对象说“你别多想”，你会：',
  options: [{
    label: '行，那我们把边界讲清楚。',
    value: 1
  }, {
    label: '好，我信你一次。',
    value: 2
  }, {
    label: '肯定有猫腻，先稳住，悄悄变身福尔摩斯',
    value: 3
  }]
}, {
  id: 'q5',
  dim: 'S3',
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
  id: 'q6',
  dim: 'S3',
  text: '周末最佳恋爱模式是？',
  options: [{
    label: '呆在家打游戏',
    value: 1
  }, {
    label: '出去吃吃吃，拍拍拍',
    value: 2
  }, {
    label: '各忙各的，晚上再吃顿小烧烤',
    value: 3
  }]
}, {
  id: 'q7',
  dim: 'E1',
  text: '你相信一见钟情吗？',
  options: [{
    label: '不信，长期相处才见真章。',
    value: 1
  }, {
    label: '信一点，但要靠后续经营。',
    value: 2
  }, {
    label: '信，就喜欢第一眼带来的心动感。',
    value: 3
  }]
}, {
  id: 'q8',
  dim: 'E1',
  text: '你更相信哪种爱情叙事？',
  options: [{
    label: '先考虑现实情况，再谈感情灵魂。',
    value: 1
  }, {
    label: '一半天意，一半经营。',
    value: 2
  }, {
    label: '某天突然就很想出门，突然就和那个他对视上了。',
    value: 3
  }]
}, {
  id: 'q9',
  dim: 'E2',
  text: '纪念日安排临时变动时，你会？',
  options: [{
    label: '计划被打乱，一整天心情都不好了。',
    value: 1
  }, {
    label: '先抱怨两句，再一起改方案。',
    value: 2
  }, {
    label: '觉得没事，有时候也可以来点随机感。',
    value: 3
  }]
}, {
  id: 'q10',
  dim: 'E2',
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
  id: 'q11',
  dim: 'E3',
  text: '你认为长久关系最重要的是？',
  options: [{
    label: '灵魂伴侣，必须要特别懂我。',
    value: 1
  }, {
    label: '两个人都能互相站在对方的方位考虑。',
    value: 2
  }, {
    label: '绝对的信任和忠诚专一',
    value: 3
  }]
}, {
  id: 'q12',
  dim: 'E3',
  text: '你期待的爱情结局是：',
  options: [{
    label: '哪怕岁月平淡，也要永远有心动、有仪式感。',
    value: 1
  }, {
    label: '三观合、经济稳、家庭和睦，不折腾不内耗。',
    value: 2
  }, {
    label: '能走到最后就相守，走不到也体面告别，只要过程真心，结局怎样都接受。',
    value: 3
  }]
}, {
  id: 'q13',
  dim: 'A1',
  text: '吵架后你更像哪类人？',
  options: [{
    label: '必须当天解决。',
    value: 1
  }, {
    label: '冷战，然后莫名其妙和好。',
    value: 2
  }, {
    label: '先冷静，自己复盘一下，再好好找对方沟通。',
    value: 3
  }]
}, {
  id: 'q14',
  dim: 'A1',
  text: '你对“分手”两个字的态度：',
  options: [{
    label: '不轻易说，一说就要负责。',
    value: 1
  }, {
    label: '非常失望生气时才会说。',
    value: 2
  }, {
    label: '嘴上说说而已，实际上是想跟他撒娇耍赖。',
    value: 3
  }]
}, {
  id: 'q15',
  dim: 'A2',
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
  id: 'q16',
  dim: 'A2',
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
  id: 'q17',
  dim: 'A3',
  text: '你在恋爱里执行承诺的状态更像？',
  options: [{
    label: '想到就做，忘了就下次。',
    value: 1
  }, {
    label: '大部分能做到，偶尔摆烂。',
    value: 2
  }, {
    label: '说到做到，君子一言驷马难追。',
    value: 3
  }]
}, {
  id: 'q18',
  dim: 'A3',
  text: '双人聚会突然变十人大局，你会？',
  options: [{
    label: '会很i很不自在。',
    value: 1
  }, {
    label: '表面还是会融入集体，心里很惋惜约会泡汤了。',
    value: 2
  }, {
    label: '来都来了，人多就是热闹。',
    value: 3
  }]
}, {
  id: 'q19',
  dim: 'Ac1',
  text: '你最不能接受对象哪点？',
  options: [{
    label: '管得多，让你一点自由都没有。',
    value: 1
  }, {
    label: '吵架就冷暴力，有时候还很敷衍',
    value: 2
  }, {
    label: '已读不回还发朋友圈。',
    value: 3
  }]
}, {
  id: 'q20',
  dim: 'Ac1',
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
  id: 'q21',
  dim: 'Ac2',
  text: '你更害怕哪种分开？',
  options: [{
    label: '冷淡到散。',
    value: 1
  }, {
    label: '误会到散。',
    value: 2
  }, {
    label: '现实到散。',
    value: 3
  }]
}, {
  id: 'q22',
  dim: 'Ac2',
  text: '你对“恋爱仪式感”的理解？',
  options: [{
    label: '必须有，不然像没谈。',
    value: 1
  }, {
    label: '有最好，没有也不强求。',
    value: 2
  }, {
    label: '不需要，日常更重要。',
    value: 3
  }]
}, {
  id: 'q23',
  dim: 'Ac3',
  text: '你对“异地恋”的态度？',
  options: [{
    label: '不行，我会疯。',
    value: 1
  }, {
    label: '试试，但要高频沟通和随时报备。',
    value: 2
  }, {
    label: '可以，很相信对方的人品和忠诚，彼此信任。',
    value: 3
  }]
}, {
  id: 'q24',
  dim: 'Ac3',
  text: '如果对象突然说“我们不合适”，你会？',
  options: [{
    label: '很伤心，觉得很突然：我哪里不合适？',
    value: 1
  }, {
    label: '冷静，回想他为什么突然说这句话',
    value: 2
  }, {
    label: '很潇洒：我值得更好的',
    value: 3
  }]
}, {
  id: 'q25',
  dim: 'So1',
  text: '会希望对方在朋友圈发你吗？',
  options: [{
    label: '必须的，公开不是基础吗。',
    value: 1
  }, {
    label: '偶尔纪念日等日子要发一下。',
    value: 2
  }, {
    label: '发不发都无所谓，周围朋友都知道对方就好了。',
    value: 3
  }]
}, {
  id: 'q26',
  dim: 'So1',
  text: '对象突然很黏，你会？',
  options: [{
    label: '我就喜欢粘人的。',
    value: 1
  }, {
    label: '可爱但要适量。',
    value: 2
  }, {
    label: '会有点压力，很需要私人空间。',
    value: 3
  }]
}, {
  id: 'q27',
  dim: 'So2',
  text: '你对“报备”的态度更像？',
  options: [{
    label: '不报备我会慌，像没信号。',
    value: 1
  }, {
    label: '大事报，小事随缘。',
    value: 2
  }, {
    label: '不爱报备，但会主动告知关键行程。',
    value: 3
  }]
}, {
  id: 'q28',
  dim: 'So2',
  text: '对象临时爽约，你第一反应？',
  options: [{
    label: '受伤+生气：是不是不在乎我？',
    value: 1
  }, {
    label: '理解但失落：下次提前说就好。',
    value: 2
  }, {
    label: '立刻安排 Plan B：我自己也能快乐。',
    value: 3
  }]
}, {
  id: 'q29',
  dim: 'So3',
  text: '对象送你一个很普通的小东西，你会？',
  options: [{
    label: '立刻感动：你居然记得我喜欢这个。',
    value: 1
  }, {
    label: '开心：小礼物也算心意。',
    value: 2
  }, {
    label: '还行：但我更在乎你平时怎么对我。',
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

exports.specialQuestions = [];

var TYPE_LIBRARY = {
  CTRL: { code: 'BORD', cn: '边界总设计师', intro: '规则先立，安全先行。', desc: '你属于“先把规则讲明白再谈浪漫”的类型。遇到模糊关系会主动拉线，怕的不是争吵，而是没边界导致反复内耗。你在爱里追求可持续，不爱情绪赌博。别人会觉得你理性过头，但真正懂你的人知道，你的克制其实是对关系最深的负责。你像恋爱里的产品经理，会把“我们”拆成愿景、路径和验收标准：听上去不够甜，可长期来看最不容易烂尾。你并不是不会心动，你只是希望心动有去处、承诺有兑现、未来有落点。' },
  'ATM-er': { code: 'KNGT', cn: '骑士', intro: '爱是可兑现的细节。', desc: '你不爱空话，喜欢把在意落实成“看得见摸得着”的照顾。礼物、实用、记住对方偏好，这些在你眼里都不是表演，而是关系里的稳定输出。你不一定最会说情话，却很会在关键时刻补位。你的浪漫像日常供电，安静但不断电。你会记得对方喝什么、怕什么、缺什么，把“我爱你”翻译成一个又一个可执行动作。有人会嫌你不够戏剧化，但真正和你在一起的人会发现，被你爱过的人，生活会变得更容易。' },
  'Dior-s': { code: 'LITE', cn: '轻恋爱选手', intro: '不折腾，但不敷衍。', desc: '你对恋爱的理解偏松弛：不硬凹仪式，不为小事上头，能过就过，能笑就笑。你看起来“都行”，但不是摆烂，而是把精力放在真正重要的事上。你擅长让关系降噪，少一点内耗，多一点呼吸感。你很懂“舒服地在一起”比“看起来很相爱”更难也更高级。和你谈恋爱像在傍晚散步，不喧闹，却能让人慢慢把心放下来。' },
  BOSS: { code: 'SHEL', cn: '执伞人', intro: '谈爱，也谈落地。', desc: '你在关系中有明显的“掌舵倾向”，重视现实可行性、长期规划和执行力。你不喜欢情绪空转，遇到问题会倾向先定方案再修关系。你的优势是稳、准、扛事，短板是偶尔忘了柔软表达。学会在计划里留点温度，你会更无敌。你像恋爱中的“应急预案中心”，风浪一来你先撑伞，不会先哭。只是别总把“我来扛”说成“你别管”，偶尔示弱一点，反而会让爱更近。' },
  'THAN-K': { code: 'FLOW', cn: '细水长欢', intro: '爱在细节里回响。', desc: '你相信关系不是靠一次心动，而是靠长期经营。你会看见对方的努力，愿意给予回应和鼓励。你对“互相站位思考”有天然天赋，吵架也尽量不伤人。你不是最炸裂的恋人，却是最让人想长期相处的人。你擅长把锋利的话变成可被接住的表达，把“你错了”改成“我们怎么更好”。你的浪漫不吵，但回头看会发现，你一直在认真保护这段关系。' },
  'OH-NO': { code: 'ALRT', cn: '风险预警员', intro: '我不是多想，我是在防翻车。', desc: '你对异常信号极其敏感：句号、已读不回、语气变化都能触发预警。你不是不爱，而是怕再受伤，所以会先防御再靠近。你的判断力很强，但容易把“可能”当“事实”。如果你能把脑内推演换成当面沟通，关系质量会明显提升。你像感情里的雷达站，风还没起你就先听见了远处的轰鸣。这个能力能帮你避坑，但也会让你疲惫；学会把怀疑变成提问，你会被更温柔地理解。' },
  GOGO: { code: 'VIBE', cn: '灵动因子', intro: '走啊，别等气氛。', desc: '你在爱里偏即兴，喜欢说走就走、边走边看。你把关系里的新鲜感拉满，能把普通周末过出旅行感。你不怕变化，甚至享受变化。只要补一点稳定承诺，你会是“有趣又可靠”的稀缺型伴侣。你天生会给关系加氧，让“日常”不至于变“流程”。你的课题是：在自由里也给对方一点可预期，让惊喜不变成惊吓。' },
  SEXY: { code: 'SPRK', cn: '心动捕手', intro: '你负责让第一眼有电。', desc: '你很懂“心动感”的价值，氛围和化学反应在你这里很重要。你会被感觉打动，也很会制造感觉。你不是肤浅，而是相信情绪真实。只是当热度过去后，别忘了补上长期经营的能力，关系才会从好看变耐用。你是那种会让对方“重新注意到世界变亮了”的人，连普通对视都像电影镜头。把你的热烈和稳定绑定在一起，你会成为又迷人又安心的存在。' },
  'LOVE-R': { code: 'POEM', cn: '浪漫诗人', intro: '愿意相信爱这件事。', desc: '你对爱情保有诗意和期待，即使看过现实，也愿意给真心二次机会。你重视心动和仪式，愿意把平淡日子过成纪念日。你可能会偶尔理想化关系，但你也有强大的修复力。你的存在，能让别人重新相信温柔。你会认真收藏两个人的细小瞬间，把它们当成抵御生活粗糙感的证据。你不是天真，你只是知道人间很硬，所以更要把爱说得柔软一点。' },
  MUM: { code: 'ANCH', cn: '定心丸', intro: '我先接住你，再谈对错。', desc: '你擅长在关系里做情绪缓冲垫。对方低落时你先安抚，冲突时你先降温。你很会“看见人”，也很会给安全感。要注意的是，别把自己长期放在第二位；真正健康的亲密，也需要你被照顾。你像关系里的软垫，大家都靠你落地，却很少问你疼不疼。请记得，你的温柔不是义务，能被反向拥抱的温柔，才会长久。' },
  FAKE: { code: 'CHAM', cn: '变色龙', intro: '我会看场合说话。', desc: '你对关系场景变化适应力很强，知道什么时候该直接、什么时候该留白。你不是虚伪，而是高情商防碰撞。你的优势是“稳定过关”，风险是“真实表达不足”。当你愿意袒露脆弱，亲密度会大幅上升。你像一个会自动调节音量的人，任何场面都不至于失控。只是最亲密的人不是观众，不需要你永远体面，偶尔不完美，反而更真。' },
  OJBK: { code: 'ZENL', cn: '佛系爱人', intro: '能过就过，不硬刚。', desc: '你在恋爱里很少为小事起冲突，包容度高，情绪阈值也高。你更关注整体关系是否舒适，而不是每一回合输赢。你像关系里的减震器。唯一要注意：关键问题别总“算了”，该表达时要表达。你的厉害之处是让爱回归生活，而不是回归辩论赛。可如果总是你在让步，最后“和平”会变“委屈”，温柔也需要边界。' },
  MALO: { code: 'ZEST', cn: '调味师', intro: '恋爱也要有好玩的部分。', desc: '你擅长让关系不无聊，能把平凡瞬间变成笑点。你有梗、有松弛、有感染力，适合长期相处中的“情绪保鲜”。别人的烦恼在你这儿常常会被化解成可处理的问题。只要你愿意在认真时更坚定，关系会更稳更深。你像恋爱里的快乐供应站，连吵架都能被你拐成和好现场。记得在逗笑别人之外，也告诉对方你真正害怕什么，关系会更有深度。' },
  'JOKE-R': { code: 'TSUN', cn: '嘴硬分子', intro: '嘴上打岔，心里在意。', desc: '你对“分手”等重话有时会嘴快，其实更多是情绪表达和撒娇试探。你并不想真的结束，只是希望被重视、被确认。你在关系里很有戏感，但也容易被误读。学会把“试探”改成“直说”，你会少走很多弯路。你是“嘴上：随便你；心里：快来哄我”本体，反差可爱但风险也高。把可爱留着，把误伤降下来，你会收获更稳定的偏爱。' },
  'WOC!': { code: 'IMAG', cn: '联想家', intro: '我直觉很准，也很会联想。', desc: '你对关系张力很敏感，容易快速捕捉到不对劲。你的直觉常常有用，但也容易放大焦虑。你适合有透明沟通和稳定回应的关系。被认真解释时你会很快软下来，因为你要的从来不是控制，而是确定。你的脑内编剧能力一流，一条消息都能写出三集悬疑剧。把“猜剧情”改成“问剧情”，你会少很多失眠，多很多安心。' },
  'THIN-K': { code: 'SAGE', cn: '心远地自偏。', intro: '先想清楚，再决定。', desc: '你会对关系做结构化思考：现实条件、价值观、长期可行性都要过审。你不是冷，而是怕把感情用在错误方向。你很会复盘和修正，适合长期主义关系。偶尔给感性留个窗口，会让你更可亲也更幸福。你像恋爱里的校准器，偏了就调，乱了就理，崩盘概率被你硬生生拉低。请别总当分析师，也让自己偶尔做一次只想拥抱的人。' },
  SHIT: { code: 'BOOM', cn: '易燃易爆炸', intro: '生气来得快，心软也快。', desc: '你在冲突场景里情绪启动速度快，容易在高压下说重话。可你并不坏，你只是表达方式偏猛。你真正需要的是“先降温再沟通”的流程。掌握节奏后，你会从关系里的风暴，变成关系里的推进器。你不是想赢，你只是太想被认真对待，所以每次都用最大音量求回应。学会把“炸”换成“讲”，你的深情会更容易被看见。' },
  ZZZZ: { code: 'SIMR', cn: '温水煮青蛙', intro: '不吵不闹，但有温度。', desc: '你偏好低刺激相处：安静、熟悉、可持续。你不追求天天轰烈，更看重“舒服地在一起”。你在关系里像慢火，热得慢，但稳定耐久。遇到理解你节奏的人，你会给出很长很稳的陪伴。你可能不是最会制造惊喜的人，却是最不容易失联的人。和你在一起，日子不会很吵，但心会很安。' },
  POOR: { code: 'REAL', cn: '不整虚的', intro: '别空想，先看能不能走远。', desc: '你对关系有现实判断力：三观、经济、家庭协同都要考虑。你不是功利，而是珍惜彼此时间，不愿意无效消耗。你擅长筛选“能长期共建的人”。在你这里，爱不是冲动，而是可兑现的长期合作。你明白“喜欢”不等于“适合”，所以会把热情和理智一起带上路。有人觉得你太清醒，但你只是把真心花在值得的人身上。' },
  MONK: { code: 'BDRY', cn: '我爱你但别管我', intro: '亲密要有，空间也要有。', desc: '你对个人空间和边界有刚需，不爱高频黏连，也不喜欢被过度盘问。你更相信“日常稳定”胜过“高频证明”。你的关系观成熟且清醒。只要对方尊重边界，你会给出非常稳的信任。你不是冷淡，是把“我爱你”和“我还是我”同时保留。你理想中的亲密，是两棵靠近的树，不是一根互相缠绕到窒息的藤。' },
  IMSB: { code: 'SWAY', cn: '跷跷板', intro: '想要确定，又怕被伤。', desc: '你在爱里容易两头拉扯：想靠近，又怕失控；想相信，又怕落空。你不是矫情，是安全感阈值更高。你适合节奏稳定、沟通透明的关系。被好好回应时，你会非常忠诚且投入。你会反复确认“我是不是被爱着”，不是因为贪心，而是因为太怕突然失去。遇到愿意耐心回应你的人，你会从摇摆变坚定。' },
  SOLO: { code: 'HEDGE', cn: '心墙', intro: '我在意，所以我防御。', desc: '你最怕的是“慢慢冷掉”或“误会累积”，因此会提前防御。你对冷暴力、敷衍、失联容忍度很低。你不是难搞，你只是很怕真心被轻拿轻放。遇到愿意持续沟通的人，你会慢慢松刺，变得很软。你像一只背着刺猬盔甲的小动物，靠近前先确认地面是否安全。被认真爱过之后，你会把最温柔的一面全部交出来。' },
  FUCK: { code: 'FREE', cn: '不打卡恋人', intro: '我爱自由，也爱真诚。', desc: '你不喜欢关系被写成死板流程，更偏爱真实、松弛、有生命力的相处方式。你会给彼此空间，也尊重个体成长。你的底线是别欺骗、别消耗。你适合信任度高、控制欲低的关系生态。你不怕距离，不怕沉默，怕的是被管理成“打卡式恋爱”。当对方懂你不是逃避而是尊重边界，你会给出特别干净也特别长久的爱。' },
  DEAD: { code: 'GRAC', cn: '拿得起放得下', intro: '能爱得热烈，也能退得体面。', desc: '你对结局看得通透：能走到最后就珍惜，走不到也不撕扯。你重视过程真诚，反感拉扯消耗。你不是冷血，是成熟。你的爱像一条稳线，不喧哗，但很有分量。你明白不是所有故事都要“永远”，但每一段都值得“认真”。所以你不轻易开始，也不随便烂尾，体面是你给爱最后的尊重。' },
  IMFW: { code: 'FINO', cn: '于细微处见精神', intro: '我很容易被细节打动。', desc: '你对细节很敏感，小小的在意就能让你开心很久，小小的忽略也会让你失落。你是高感知型恋人，真诚且柔软。你最需要的是明确偏爱和稳定回应。被好好对待时，你会回馈超额温柔。你会记得一句随口承诺，也会因为一次敷衍沉默很久。你的软不是弱，而是你把心交出来时，从来都是真的。' },
  HHHH: { code: 'CHAO', cn: '自由变量体', intro: '你的恋爱脑回路，不走寻常路。', desc: '当你的选择同时命中多种相反倾向时，系统会把你归到这个类型。你不是“有问题”，你只是复杂、流动、很难被单一标签概括。你的优势是弹性与创造力，建议在关键议题上建立稳定表达，关系会更顺。你可能上午想要独处，下午想被抱紧，晚上又开始思考宇宙和爱情的因果律。别急着把自己修成单线程，你的多面性本来就是魅力。' },
  DRUNK: { code: 'OFFL', cn: '停用占位类型', intro: '此类型已停用。', desc: '隐藏题已移除，本类型仅作历史兼容占位，不再参与常规结果判定。' }
};
exports.TYPE_LIBRARY = TYPE_LIBRARY;

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
        L: '遇到关系波动时容易先怪自己，情绪像坐过山车，自我评价受外界影响较大。',
        M: '自我评价总体稳定，但在重要关系节点仍会短暂摇摆，需要一点外部确认。',
        H: '自我感受和边界较清晰，不容易被一句话带跑，能在亲密关系里保持自我稳定。'
  },
  S2: {
        L: '容易随关系状态切换自己，今天一个想法明天一个版本，内在一致性偏弱。',
        M: '大部分时候知道自己要什么，遇到冲突场景会临时调整但不至于失控。',
        H: '对自己的需求、底线、偏好识别明确，遇到关系拉扯也不容易迷失方向。'
  },
  S3: {
        L: '恋爱价值排序更偏即时感受，重当下舒适，长期共建意识相对较弱。',
        M: '既看重感受也看重现实，短期体验和长期规划之间会努力寻找平衡点。',
        H: '对关系目标和人生方向有较强意识，偏好“能落地、能走远”的恋爱结构。'
  },
  E1: {
        L: '安全感偏低，容易被冷淡、延迟回应触发预警，脑内推演频率较高。',
        M: '对关系有一定信任，但遇到模糊信号会观望和试探，内心会拉扯。',
        H: '对关系稳定度有较高信任，不会因小波动立刻失衡，更愿意先沟通再判断。'
  },
  E2: {
        L: '投入方式偏克制，更多保留自我防护，情感表达不易一次性给满。',
        M: '愿意投入但会控制节奏，通常边确认边加码，避免情绪全盘透支。',
        H: '一旦确认关系，投入感和行动力都很足，能持续给到高质量情绪价值。'
  },
  E3: {
        L: '亲密需求更高，倾向高频互动与粘连感，分离时更容易产生不安。',
        M: '亲密与独立都需要，通常会根据关系阶段动态调节彼此距离。',
        H: '边界意识更强，重视个人空间，偏好“亲密但不侵入”的关系状态。'
  },
  A1: {
        L: '对爱情叙事偏现实防御，先评估风险再投入，天然谨慎不易盲信。',
        M: '既相信缘分也重视经营，愿意给关系机会但不会完全交给天意。',
        H: '更相信心动与善意，愿意先打开自己，再通过相处验证关系质量。'
  },
  A2: {
        L: '面对关系变动更易情绪化，计划被打乱时恢复成本较高，需要时间回稳。',
        M: '能接受变化但希望有协商过程，既会吐槽也能一起修正方案。',
        H: '对变化弹性较高，能快速切换策略，遇突发状况仍能保持关系效率。'
  },
  A3: {
        L: '对长期关系意义感偏主观，容易被当下感受牵引，目标感阶段性起伏。',
        M: '既考虑情绪价值也考虑关系可持续，整体处于现实与理想混合框架。',
        H: '对“长期走下去”有明确认知，能把价值观、忠诚与共同成长系统化处理。'
  },
  Ac1: {
        L: '冲突处理偏回避或延后，先止损情绪，推进问题的节奏相对保守。',
        M: '会在情绪和解决之间平衡，通常愿意沟通但需要合适时机推进。',
        H: '面对矛盾更偏主动解决，倾向尽快形成共识，不让问题长期悬而未决。'
  },
  Ac2: {
        L: '关系决策偏谨慎慢热，重大判断前会反复确认，拍板速度较慢。',
        M: '会先分析再决定，既考虑情绪也考虑事实，决策质量较平衡。',
        H: '拍板倾向更果断，能在复杂关系信息中快速抓主线并给出明确方向。'
  },
  Ac3: {
        L: '承诺执行波动较大，容易出现“想做但延后”，稳定输出能力偏弱。',
        M: '多数承诺可兑现，偶发延迟或摆动，整体执行力处于可用区间。',
        H: '承诺执行一致性高，说到做到，关系中的可靠感和可预期性更强。'
  },
  So1: {
        L: '在多人场景中更易社交耗能，偏好低刺激互动，恋爱活动以小范围为主。',
        M: '可在社交与独处间切换，既能融入场面也能保持自我节奏。',
        H: '社交驱动更强，人群适应度高，能在复杂场景中保持关系主动性。'
  },
  So2: {
        L: '对公开、报备、互动透明度需求较高，关系确认感依赖外部信号支持。',
        M: '在边界与亲密之间灵活调节，既接受公开也重视彼此协商空间。',
        H: '边界感明确且内稳，外部展示需求较低，更看重关系内核而非形式证明。'
  },
  So3: {
        L: '表达偏直接，情绪和需求常会即时释放，沟通透明但可能冲击感较强。',
        M: '表达会看场景与语气，能在真实与体面之间维持平衡沟通。',
        H: '表达更克制分层，擅长用行动或结构化沟通传递在意，稳定性更高。'
  }
};

var dimensionOrder = ['S1', 'S2', 'S3', 'E1', 'E2', 'E3', 'A1', 'A2', 'A3', 'Ac1', 'Ac2', 'Ac3', 'So1', 'So2', 'So3'];
exports.dimensionOrder = dimensionOrder;

function letterToNumber(letter) {
  return { L: 1, M: 2, H: 3 }[letter];
}

exports.DRUNK_TRIGGER_QUESTION_ID = null;
