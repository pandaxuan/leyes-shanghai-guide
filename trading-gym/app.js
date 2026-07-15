const ASSETS = [
  { symbol: "BTC/USDT", type: "crypto", basePrice: 62000, seed: 11 },
  { symbol: "ETH/USDT", type: "crypto", basePrice: 3400, seed: 23 },
  { symbol: "NVIDIA", type: "stock", basePrice: 920, seed: 37 },
  { symbol: "Tesla", type: "stock", basePrice: 240, seed: 53 },
];

const PERIODS = [
  { key: "1m", label: "1分钟", style: "短线交易训练", stepMs: 60 * 1000, volatility: 0.0028 },
  { key: "5m", label: "5分钟", style: "短线交易训练", stepMs: 5 * 60 * 1000, volatility: 0.0042 },
  { key: "1h", label: "1小时", style: "波段交易训练", stepMs: 60 * 60 * 1000, volatility: 0.012 },
  { key: "4h", label: "4小时", style: "波段交易训练", stepMs: 4 * 60 * 60 * 1000, volatility: 0.018 },
  { key: "1d", label: "日线", style: "趋势交易训练", stepMs: 24 * 60 * 60 * 1000, volatility: 0.028 },
  { key: "1w", label: "周线", style: "长期趋势判断训练", stepMs: 7 * 24 * 60 * 60 * 1000, volatility: 0.055 },
  { key: "1M", label: "月线", style: "长期趋势判断训练", stepMs: 30 * 24 * 60 * 60 * 1000, volatility: 0.095 },
];

const STORAGE_KEY = "kline-training-records-v1";
const WINDOW_SIZE = 100;
const FUTURE_SIZE = 30;

const LEARNING_LESSONS = [
  {
    category: "01 · K线基础",
    title: "什么是 K线？",
    type: "基础概念",
    chart: "singleBullish",
    explanation: "一根 K线记录某一段时间内的开盘价、收盘价、最高价和最低价。它把价格的起点、终点和波动范围压缩在一张小图里。",
    reasonsTitle: "先看懂这些",
    reasons: ["实体表示开盘价到收盘价", "影线表示盘中到过但没有收住的位置", "K线要放在趋势和位置里理解"],
    risk: "不要只看单根 K线下结论，同样的形态出现在不同位置，含义可能完全不同。",
  },
  {
    category: "01 · K线基础",
    title: "开盘价",
    type: "基础概念",
    chart: "openClose",
    explanation: "开盘价是这一根 K线开始时的价格，是观察当根 K线起点的位置。",
    reasonsTitle: "为什么重要",
    reasons: ["能判断这一段行情从哪里开始", "和收盘价对比后，可以看出买卖双方谁更强", "和前一根收盘价对比，可以观察跳空或情绪变化"],
    risk: "开盘价只是起点，不代表最终态度；收盘价通常更关键。",
  },
  {
    category: "01 · K线基础",
    title: "收盘价",
    type: "基础概念",
    chart: "openClose",
    explanation: "收盘价是这一根 K线结束时的价格，通常比开盘价更能代表市场在这段时间结束时的态度。",
    reasonsTitle: "为什么重要",
    reasons: ["收盘价强，说明价格最后守住了较高位置", "收盘价弱，说明卖压在尾段占优", "突破是否站稳，常常要看收盘位置"],
    risk: "盘中突破但收盘又跌回去，可能是假突破。",
  },
  {
    category: "01 · K线基础",
    title: "最高价",
    type: "基础概念",
    chart: "upperWick",
    explanation: "最高价是这一段时间里价格到过的最高位置，常用来观察上方压力。",
    reasonsTitle: "为什么重要",
    reasons: ["最高价附近可能有卖盘", "连续无法突破前高，说明上方压力较强", "突破前高后能否站稳，是趋势判断的重要线索"],
    risk: "只刺破前高但没有收上去，不一定是真突破。",
  },
  {
    category: "01 · K线基础",
    title: "最低价",
    type: "基础概念",
    chart: "lowerWick",
    explanation: "最低价是这一段时间里价格到过的最低位置，常用来观察下方支撑。",
    reasonsTitle: "为什么重要",
    reasons: ["最低价附近可能有买盘承接", "多次不破前低，说明支撑仍在", "跌破前低后能否收回，是判断破位真假的关键"],
    risk: "只看最低价不够，还要看后续是否反弹、成交量是否配合。",
  },
  {
    category: "01 · K线基础",
    title: "阳线",
    type: "基础概念",
    chart: "bullishCandle",
    explanation: "阳线通常表示收盘价高于开盘价，说明这段时间内买方相对更强。",
    reasonsTitle: "可能代表",
    reasons: ["买方把价格推高并守到收盘", "如果出现在支撑位附近，可能是反弹信号", "如果伴随放量，可信度通常更高"],
    risk: "压力位附近的阳线不一定安全，可能是诱多或冲高回落前的最后一段上涨。",
  },
  {
    category: "01 · K线基础",
    title: "阴线",
    type: "基础概念",
    chart: "bearishCandle",
    explanation: "阴线通常表示收盘价低于开盘价，说明这段时间内卖方相对更强。",
    reasonsTitle: "可能代表",
    reasons: ["卖方把价格压低并压到收盘", "如果出现在压力位附近，可能是回落信号", "如果伴随放量，需要警惕卖压增强"],
    risk: "支撑位附近的阴线不一定立刻看跌，可能是下探后的洗盘或恐慌释放。",
  },
  {
    category: "01 · K线基础",
    title: "上影线",
    type: "基础概念",
    chart: "upperWick",
    explanation: "上影线表示价格曾向上冲高，但最后没能收在高位，说明上方出现卖压或获利了结。",
    reasonsTitle: "怎么看",
    reasons: ["上影线越长，冲高回落越明显", "压力位附近的长上影更值得警惕", "连续上影线说明上方抛压反复出现"],
    risk: "强趋势中，上影线不一定马上反转，可能只是短线换手。",
  },
  {
    category: "01 · K线基础",
    title: "下影线",
    type: "基础概念",
    chart: "lowerWick",
    explanation: "下影线表示价格曾向下探底，但最后被拉回，说明下方出现买盘承接。",
    reasonsTitle: "怎么看",
    reasons: ["下影线越长，低位承接越明显", "支撑位附近的长下影更有参考价值", "连续下影线说明下方买盘反复出现"],
    risk: "弱趋势中，下影线也可能只是短暂反弹，后续仍可能继续破位。",
  },
  {
    category: "02 · 判断框架",
    title: "Step 1：看趋势",
    type: "判断步骤",
    chart: "trendUp",
    explanation: "先判断当前是上升趋势、下降趋势，还是横盘震荡。趋势决定你应该顺势、逆势，还是减少动作。",
    reasonsTitle: "判断标准",
    reasons: ["高点是否不断抬高", "低点是否不断抬高", "均线方向是否一致"],
    risk: "不要在横盘区间里强行套用趋势思维，震荡行情容易来回打脸。",
  },
  {
    category: "02 · 判断框架",
    title: "Step 2：看位置",
    type: "判断步骤",
    chart: "supportBounce",
    explanation: "看当前价格是在支撑附近、压力附近，还是区间中间。同样一根阳线，出现在不同位置，意义不同。",
    reasonsTitle: "判断标准",
    reasons: ["支撑附近看反弹是否有效", "压力附近看突破是否站稳", "区间中间通常风险收益比不清晰"],
    risk: "只看方向不看位置，很容易在上涨末端追高，或在下跌末端杀跌。",
  },
  {
    category: "02 · 判断框架",
    title: "Step 3：看成交量",
    type: "判断步骤",
    chart: "volumeBreakout",
    explanation: "价格变化如果有成交量配合，通常更可信；如果价格动了但量没跟上，就要更谨慎。",
    reasonsTitle: "判断标准",
    reasons: ["放量上涨通常更可信", "缩量上涨需要谨慎", "放量下跌需要警惕"],
    risk: "成交量不是单独信号，要结合趋势、位置和后续是否站稳。",
  },
  {
    category: "02 · 判断框架",
    title: "Step 4：看风险收益比",
    type: "判断步骤",
    chart: "riskReward",
    explanation: "即使方向判断正确，也要看现在是否值得交易。训练时不要只问会涨还是会跌，也要问错了亏多少、对了赚多少。",
    reasonsTitle: "判断标准",
    reasons: ["离支撑太远，看涨的止损空间可能很大", "离压力太近，看涨的上方空间可能不足", "好判断不等于好位置"],
    risk: "方向对但位置差，结果也可能是一次坏交易。",
  },
  {
    category: "02 · 判断框架",
    title: "Step 5：决定行动",
    type: "判断步骤",
    chart: "decision",
    explanation: "最终只做三种选择：看涨、看跌、观望。观望是有效选择，不是失败。",
    reasonsTitle: "行动选择",
    reasons: ["看涨：趋势、位置、量能支持上行", "看跌：趋势、位置、量能支持下行", "观望：信号不清晰或风险收益比不好"],
    risk: "为了做选择而做选择，会让训练变成猜涨跌；真正要练的是判断质量。",
  },
  {
    category: "03 · 看涨因素",
    title: "放量突破",
    type: "看涨信号",
    chart: "volumeBreakout",
    explanation: "价格突破前高或压力位，同时成交量明显放大，说明买盘增强。",
    reasonsTitle: "为什么看涨",
    reasons: ["买方力量增强", "空头可能止损", "新资金入场"],
    risk: "如果突破后无法站稳，可能是假突破。",
  },
  {
    category: "03 · 看涨因素",
    title: "回踩支撑有效",
    type: "看涨信号",
    chart: "supportBounce",
    explanation: "价格回调到支撑位附近后止跌反弹，说明支撑区域有买盘承接。",
    reasonsTitle: "为什么看涨",
    reasons: ["支撑区域有买盘", "市场没有继续破位", "风险收益比可能较好"],
    risk: "如果跌破支撑，需要重新判断。",
  },
  {
    category: "03 · 看涨因素",
    title: "均线向上 / 多头排列",
    type: "看涨信号",
    chart: "maBullish",
    explanation: "短期均线在长期均线上方，且整体向上，说明市场平均成本在抬高。",
    reasonsTitle: "为什么看涨",
    reasons: ["趋势向上", "市场平均成本抬高", "回调可能有支撑"],
    risk: "如果价格远离均线，可能短期过热。",
  },
  {
    category: "03 · 看涨因素",
    title: "高点和低点不断抬高",
    type: "看涨信号",
    chart: "higherHighLow",
    explanation: "价格形成 higher high 和 higher low，说明趋势结构相对健康。",
    reasonsTitle: "为什么看涨",
    reasons: ["趋势结构健康", "买方持续控制市场", "回调低点没有破坏结构"],
    risk: "如果跌破前低，上升结构可能被破坏。",
  },
  {
    category: "04 · 看跌因素",
    title: "跌破支撑",
    type: "看跌信号",
    chart: "supportBreak",
    explanation: "价格跌破重要支撑位，说明原本买盘区域可能失效。",
    reasonsTitle: "为什么看跌",
    reasons: ["原本买盘区域失效", "止损盘可能出现", "市场情绪转弱"],
    risk: "如果快速收回支撑位，可能是假跌破。",
  },
  {
    category: "04 · 看跌因素",
    title: "放量下跌",
    type: "看跌信号",
    chart: "volumeDrop",
    explanation: "价格下跌时成交量明显放大，说明卖盘压力增强。",
    reasonsTitle: "为什么看跌",
    reasons: ["卖盘压力增强", "市场恐慌增加", "机构或大资金可能在出货"],
    risk: "如果出现在长期下跌末端，可能是恐慌见底。",
  },
  {
    category: "04 · 看跌因素",
    title: "上涨缩量",
    type: "看跌信号",
    chart: "weakBounce",
    explanation: "价格上涨，但成交量没有跟上，说明上涨动力可能不足。",
    reasonsTitle: "为什么看跌",
    reasons: ["上涨动力不足", "可能只是反弹", "追高风险增加"],
    risk: "强趋势行情中，缩量上涨不一定立刻看跌。",
  },
  {
    category: "04 · 看跌因素",
    title: "高点和低点不断降低",
    type: "看跌信号",
    chart: "lowerHighLow",
    explanation: "价格形成 lower high 和 lower low，说明下降趋势可能已经形成。",
    reasonsTitle: "为什么看跌",
    reasons: ["下降趋势形成", "反弹力度变弱", "卖方占主导"],
    risk: "如果突破前高，下降趋势可能被破坏。",
  },
  {
    category: "05 · 什么时候观望",
    title: "横盘震荡",
    type: "观望场景",
    chart: "range",
    explanation: "价格在区间内来回波动，没有明确方向。此时追涨追跌都容易买在边界附近。",
    reasonsTitle: "为什么观望",
    reasons: ["方向不明确", "区间上沿容易回落", "区间下沿容易反弹"],
    risk: "横盘末端可能突然突破，需要等突破后是否站稳再判断。",
  },
  {
    category: "05 · 什么时候观望",
    title: "方向冲突",
    type: "观望场景",
    chart: "mixedTrend",
    explanation: "例如日线看涨，但小时线看跌，多周期信号互相冲突。",
    reasonsTitle: "为什么观望",
    reasons: ["大周期和小周期没有统一", "入场后容易遇到反向波动", "等待信号统一更稳妥"],
    risk: "不同周期冲突时，仓促判断容易把短线波动误当成趋势改变。",
  },
  {
    category: "05 · 什么时候观望",
    title: "刚刚大涨或大跌后",
    type: "观望场景",
    chart: "afterSpike",
    explanation: "短期波动很大，情绪容易过热或过冷，追高和杀跌都容易变形。",
    reasonsTitle: "为什么观望",
    reasons: ["价格短期远离均衡", "波动放大，止损更难放", "等待回调或确认更清晰"],
    risk: "强趋势可能继续延伸，但没有计划地追进去，训练价值很低。",
  },
  {
    category: "05 · 什么时候观望",
    title: "风险收益比不好",
    type: "观望场景",
    chart: "riskReward",
    explanation: "即使方向可能对，但入场位置太差，错了亏得多、对了赚得少。",
    reasonsTitle: "为什么观望",
    reasons: ["离止损位太远", "离目标位太近", "不值得为了小空间承担大风险"],
    risk: "交易训练不是猜对方向，而是练习在好位置做判断。",
  },
  {
    category: "05 · 什么时候观望",
    title: "没有明显信号",
    type: "观望场景",
    chart: "noSignal",
    explanation: "没有趋势、没有成交量确认、没有明确支撑压力时，保持观察是合理选择。",
    reasonsTitle: "为什么观望",
    reasons: ["趋势不清楚", "量能没有确认", "支撑压力位置不明确"],
    risk: "硬做判断会把训练变成猜测，降低复盘价值。",
  },
];

const els = {
  assetSelect: document.querySelector("#assetSelect"),
  periodSelect: document.querySelector("#periodSelect"),
  currentPrice: document.querySelector("#currentPrice"),
  trainingTime: document.querySelector("#trainingTime"),
  periodStyle: document.querySelector("#periodStyle"),
  chartTitle: document.querySelector("#chartTitle"),
  chartSubtitle: document.querySelector("#chartSubtitle"),
  canvas: document.querySelector("#klineCanvas"),
  choiceGroup: document.querySelector("#choiceGroup"),
  submitDecision: document.querySelector("#submitDecision"),
  resultBox: document.querySelector("#resultBox"),
  resultTitle: document.querySelector("#resultTitle"),
  yourChoice: document.querySelector("#yourChoice"),
  futureMove: document.querySelector("#futureMove"),
  correctness: document.querySelector("#correctness"),
  supportList: document.querySelector("#supportList"),
  riskList: document.querySelector("#riskList"),
  nextQuestion: document.querySelector("#nextQuestion"),
  newQuestionTop: document.querySelector("#newQuestionTop"),
  resetStats: document.querySelector("#resetStats"),
  totalCount: document.querySelector("#totalCount"),
  accuracy: document.querySelector("#accuracy"),
  bullishRate: document.querySelector("#bullishRate"),
  bearishRate: document.querySelector("#bearishRate"),
  observeCount: document.querySelector("#observeCount"),
  zoomIn: document.querySelector("#zoomIn"),
  zoomOut: document.querySelector("#zoomOut"),
  resetView: document.querySelector("#resetView"),
  tabButtons: document.querySelectorAll(".tab-button"),
  trainingView: document.querySelector("#trainingView"),
  learningView: document.querySelector("#learningView"),
  openFramework: document.querySelector("#openFramework"),
  startTrainingFromLearning: document.querySelector("#startTrainingFromLearning"),
  frameworkSection: document.querySelector("#frameworkSection"),
  lessonCategory: document.querySelector("#lessonCategory"),
  lessonTitle: document.querySelector("#lessonTitle"),
  lessonCounter: document.querySelector("#lessonCounter"),
  lessonProgressBar: document.querySelector("#lessonProgressBar"),
  lessonChart: document.querySelector("#lessonChart"),
  lessonChartCaption: document.querySelector("#lessonChartCaption"),
  lessonCardTitle: document.querySelector("#lessonCardTitle"),
  lessonType: document.querySelector("#lessonType"),
  lessonExplanation: document.querySelector("#lessonExplanation"),
  lessonReasonTitle: document.querySelector("#lessonReasonTitle"),
  lessonReasons: document.querySelector("#lessonReasons"),
  lessonRisk: document.querySelector("#lessonRisk"),
  prevLesson: document.querySelector("#prevLesson"),
  nextLesson: document.querySelector("#nextLesson"),
  lessonDots: document.querySelector("#lessonDots"),
};

const ctx = els.canvas.getContext("2d");
const lessonCtx = els.lessonChart.getContext("2d");
let state = {
  asset: ASSETS[0],
  period: PERIODS[2],
  candles: [],
  splitIndex: 0,
  selectedChoice: "bullish",
  revealed: false,
  visibleCount: 100,
  panOffset: 0,
  dragStartX: 0,
  dragStartPan: 0,
  dragging: false,
  currentLesson: 0,
};

function seededRandom(seed) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function generateCandles(asset, period) {
  const rand = seededRandom(asset.seed * 1000 + period.key.charCodeAt(0) * 31 + period.key.length);
  const candles = [];
  const start = Date.UTC(2021, 0, 1);
  let close = asset.basePrice * (0.7 + rand() * 0.4);
  let trend = 0;

  for (let i = 0; i < 900; i += 1) {
    if (i % 80 === 0) trend = (rand() - 0.48) * period.volatility * 0.8;
    const pulse = Math.sin(i / 24) * period.volatility * 0.28;
    const shock = (rand() - 0.5) * period.volatility * 2.4;
    const open = close;
    close = Math.max(0.1, open * (1 + trend + pulse + shock));
    const wick = Math.abs((rand() - 0.2) * period.volatility * open * 1.9);
    const high = Math.max(open, close) + wick;
    const low = Math.max(0.1, Math.min(open, close) - wick * (0.65 + rand()));
    const volumeBase = asset.type === "crypto" ? 9000 : 2200000;
    const volume = Math.round(volumeBase * (0.55 + rand() * 1.6) * (1 + Math.abs(shock) * 32));

    candles.push({
      time: start + i * period.stepMs,
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return candles;
}

function formatPrice(value) {
  if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatDate(ms, period) {
  const date = new Date(ms);
  if (period.key === "1m" || period.key === "5m" || period.key === "1h" || period.key === "4h") {
    return date.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function generateQuestion(keepSelection = false) {
  state.asset = ASSETS.find((item) => item.symbol === els.assetSelect.value) || state.asset;
  state.period = PERIODS.find((item) => item.key === els.periodSelect.value) || state.period;
  state.candles = generateCandles(state.asset, state.period);
  const min = WINDOW_SIZE + 20;
  const max = state.candles.length - FUTURE_SIZE - 1;
  state.splitIndex = Math.floor(min + Math.random() * (max - min));
  state.revealed = false;
  state.visibleCount = WINDOW_SIZE;
  state.panOffset = 0;
  if (!keepSelection) selectChoice("bullish");
  renderAll();
}

function currentCandle() {
  return state.candles[state.splitIndex];
}

function visibleCandles() {
  const revealEnd = state.revealed ? state.splitIndex + FUTURE_SIZE : state.splitIndex;
  const maxEnd = Math.min(revealEnd, state.candles.length - 1);
  const end = Math.max(WINDOW_SIZE, maxEnd - state.panOffset);
  const start = Math.max(0, end - state.visibleCount + 1);
  return state.candles.slice(start, end + 1).map((candle, index) => ({ ...candle, absoluteIndex: start + index }));
}

function renderAll() {
  const candle = currentCandle();
  els.currentPrice.textContent = formatPrice(candle.close);
  els.trainingTime.textContent = formatDate(candle.time, state.period);
  els.periodStyle.textContent = state.period.style;
  els.chartTitle.textContent = `${state.asset.symbol} · ${state.period.label}`;
  els.chartSubtitle.textContent = state.revealed
    ? "已揭晓未来 30 根K线，绿色/红色走势用于复盘训练"
    : "展示过去 100 根K线，未来 30 根K线已隐藏";
  els.submitDecision.disabled = state.revealed;
  renderChart();
  renderStats();
}

function renderChart() {
  const dpr = window.devicePixelRatio || 1;
  const rect = els.canvas.getBoundingClientRect();
  els.canvas.width = Math.floor(rect.width * dpr);
  els.canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const width = rect.width;
  const height = rect.height;
  const pad = { left: 58, right: 64, top: 20, bottom: 34 };
  const volumeHeight = Math.max(82, height * 0.2);
  const chartBottom = height - pad.bottom - volumeHeight - 18;
  const plotWidth = width - pad.left - pad.right;
  const candles = visibleCandles();
  const priceMax = Math.max(...candles.map((c) => c.high));
  const priceMin = Math.min(...candles.map((c) => c.low));
  const volumeMax = Math.max(...candles.map((c) => c.volume));
  const priceRange = priceMax - priceMin || 1;
  const candleStep = plotWidth / Math.max(candles.length, 1);
  const candleWidth = Math.max(2, Math.min(13, candleStep * 0.62));

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#080b10";
  ctx.fillRect(0, 0, width, height);

  drawGrid(width, height, pad, chartBottom, priceMin, priceMax);

  const yPrice = (price) => pad.top + ((priceMax - price) / priceRange) * (chartBottom - pad.top);
  const yVolume = (volume) => height - pad.bottom - (volume / volumeMax) * volumeHeight;
  const splitX = pad.left + (candles.findIndex((c) => c.absoluteIndex === state.splitIndex) + 0.5) * candleStep;

  candles.forEach((candle, index) => {
    const x = pad.left + index * candleStep + candleStep / 2;
    const up = candle.close >= candle.open;
    const color = up ? "#19c37d" : "#ff5b6e";
    const bodyTop = yPrice(Math.max(candle.open, candle.close));
    const bodyBottom = yPrice(Math.min(candle.open, candle.close));
    const bodyHeight = Math.max(1, bodyBottom - bodyTop);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, yPrice(candle.high));
    ctx.lineTo(x, yPrice(candle.low));
    ctx.stroke();
    ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

    ctx.globalAlpha = 0.38;
    ctx.fillRect(x - candleWidth / 2, yVolume(candle.volume), candleWidth, height - pad.bottom - yVolume(candle.volume));
    ctx.globalAlpha = 1;
  });

  if (state.revealed && splitX > pad.left && splitX < width - pad.right) {
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = "#f1b84b";
    ctx.beginPath();
    ctx.moveTo(splitX, pad.top);
    ctx.lineTo(splitX, height - pad.bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#f1b84b";
    ctx.fillText("揭晓点", splitX + 8, pad.top + 14);
  }
}

function drawGrid(width, height, pad, chartBottom, priceMin, priceMax) {
  ctx.strokeStyle = "#182131";
  ctx.fillStyle = "#8994a7";
  ctx.font = "12px system-ui";
  ctx.lineWidth = 1;

  for (let i = 0; i <= 5; i += 1) {
    const y = pad.top + ((chartBottom - pad.top) / 5) * i;
    const price = priceMax - ((priceMax - priceMin) / 5) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.fillText(formatPrice(price), width - pad.right + 8, y + 4);
  }

  const volumeTop = chartBottom + 18;
  ctx.beginPath();
  ctx.moveTo(pad.left, volumeTop);
  ctx.lineTo(width - pad.right, volumeTop);
  ctx.stroke();
  ctx.fillText("Volume", pad.left, volumeTop + 14);
}

function selectChoice(choice) {
  state.selectedChoice = choice;
  [...els.choiceGroup.querySelectorAll(".choice")].forEach((button) => {
    button.classList.toggle("active", button.dataset.choice === choice);
  });
}

function futureResult() {
  const entry = state.candles[state.splitIndex].close;
  const future = state.candles[state.splitIndex + FUTURE_SIZE].close;
  const move = (future - entry) / entry;
  const threshold = thresholdForPeriod(state.period.key);
  const direction = move > threshold ? "up" : move < -threshold ? "down" : "flat";
  const correct =
    (state.selectedChoice === "bullish" && direction === "up") ||
    (state.selectedChoice === "bearish" && direction === "down") ||
    (state.selectedChoice === "observe" && direction === "flat");

  return { entry, future, move, direction, correct };
}

function thresholdForPeriod(key) {
  if (key === "1m" || key === "5m") return 0.006;
  if (key === "1h" || key === "4h") return 0.018;
  if (key === "1d") return 0.035;
  return 0.06;
}

function submitDecision() {
  const result = futureResult();
  const analysis = analyzeSetup(result);
  state.revealed = true;
  state.visibleCount = WINDOW_SIZE + FUTURE_SIZE;
  state.panOffset = 0;
  saveRecord(result);
  showResult(result, analysis);
  renderAll();
}

function analyzeSetup(result) {
  const past = state.candles.slice(state.splitIndex - WINDOW_SIZE + 1, state.splitIndex + 1);
  const last = past[past.length - 1];
  const closes = past.map((c) => c.close);
  const volumes = past.map((c) => c.volume);
  const sma20 = average(closes.slice(-20));
  const sma50 = average(closes.slice(-50));
  const high20 = Math.max(...past.slice(-20).map((c) => c.high));
  const low20 = Math.min(...past.slice(-20).map((c) => c.low));
  const avgVolume = average(volumes.slice(-30));
  const rsi = calculateRsi(closes.slice(-15));
  const support = [];
  const risk = [];

  if (last.close > sma20 && sma20 > sma50) support.push("✓ 均线多头排列，趋势结构偏强");
  if (last.close < sma20 && sma20 < sma50) support.push("✓ 均线空头排列，趋势结构偏弱");
  if (last.close >= high20 * 0.995) support.push("✓ 价格接近或突破近期压力位");
  if (last.close <= low20 * 1.005) support.push("✓ 价格接近近期支撑区域");
  if (last.volume > avgVolume * 1.25) support.push("✓ 成交量明显放大，市场参与度提升");
  if (Math.abs(result.move) < thresholdForPeriod(state.period.key)) support.push("✓ 未来波动有限，保持观察有一定合理性");

  if (rsi > 70) risk.push("× RSI偏热，追涨判断容易承受回撤");
  if (rsi < 30) risk.push("× RSI偏冷，追空判断容易遇到反弹");
  if (last.close < sma20 && state.selectedChoice === "bullish") risk.push("× 价格仍在短期均线下方，看涨需要更多确认");
  if (last.close > sma20 && state.selectedChoice === "bearish") risk.push("× 价格仍在短期均线上方，看跌需要更多确认");
  if (last.volume < avgVolume * 0.75) risk.push("× 成交量不足，突破或跌破的可信度较弱");
  if (!risk.length) risk.push("× 主要风险不突出，但仍需要控制假突破和突发行情");
  if (!support.length) support.push("✓ 当前信号并不充分，谨慎观察是合理训练选择");

  return { support: support.slice(0, 4), risk: risk.slice(0, 4) };
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

function calculateRsi(closes) {
  let gains = 0;
  let losses = 0;
  for (let i = 1; i < closes.length; i += 1) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

function showResult(result, analysis) {
  const label = choiceLabel(state.selectedChoice);
  const percent = `${result.move >= 0 ? "+" : ""}${(result.move * 100).toFixed(2)}%`;
  els.resultBox.hidden = false;
  els.resultBox.classList.toggle("success", result.correct);
  els.resultBox.classList.toggle("fail", !result.correct);
  els.resultTitle.textContent = result.correct ? "判断正确 ✅" : "判断错误 ❌";
  els.yourChoice.textContent = label;
  els.futureMove.textContent = percent;
  els.futureMove.className = result.move > 0 ? "positive" : result.move < 0 ? "negative" : "neutral";
  els.correctness.textContent = result.correct ? "正确" : "错误";
  els.correctness.className = result.correct ? "positive" : "negative";
  renderList(els.supportList, analysis.support);
  renderList(els.riskList, analysis.risk);
}

function renderList(el, items) {
  el.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    el.appendChild(li);
  });
}

function choiceLabel(choice) {
  return { bullish: "看涨", bearish: "看跌", observe: "保持观察" }[choice];
}

function saveRecord(result) {
  const records = loadRecords();
  records.push({
    user: "local-user",
    asset: state.asset.symbol,
    period: state.period.key,
    trainingTime: state.candles[state.splitIndex].time,
    choice: state.selectedChoice,
    futureMove: result.move,
    correct: result.correct,
    createdAt: Date.now(),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function renderStats() {
  const records = loadRecords();
  const correct = records.filter((record) => record.correct).length;
  const bullish = records.filter((record) => record.choice === "bullish");
  const bearish = records.filter((record) => record.choice === "bearish");
  const observe = records.filter((record) => record.choice === "observe");
  els.totalCount.textContent = records.length;
  els.accuracy.textContent = rate(correct, records.length);
  els.bullishRate.textContent = rate(bullish.filter((record) => record.correct).length, bullish.length);
  els.bearishRate.textContent = rate(bearish.filter((record) => record.correct).length, bearish.length);
  els.observeCount.textContent = observe.length;
}

function rate(part, total) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function switchView(view, focusFramework = false) {
  const showLearning = view === "learning";
  els.trainingView.hidden = showLearning;
  els.learningView.hidden = !showLearning;
  els.trainingView.classList.toggle("active", !showLearning);
  els.learningView.classList.toggle("active", showLearning);
  els.tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  els.newQuestionTop.hidden = showLearning;
  els.resetStats.hidden = showLearning;

  if (showLearning && focusFramework) {
    els.frameworkSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (showLearning) {
    requestAnimationFrame(renderLessonChart);
  }

  if (!showLearning) {
    requestAnimationFrame(renderChart);
  }
}

function renderLearningCenter() {
  renderLesson();
}

function renderLesson() {
  const lesson = LEARNING_LESSONS[state.currentLesson];
  const progress = ((state.currentLesson + 1) / LEARNING_LESSONS.length) * 100;
  els.lessonCategory.textContent = lesson.category;
  els.lessonTitle.textContent = lesson.title;
  els.lessonCounter.textContent = `${state.currentLesson + 1} / ${LEARNING_LESSONS.length}`;
  els.lessonProgressBar.style.width = `${progress}%`;
  els.lessonCardTitle.textContent = lesson.title;
  els.lessonType.textContent = lesson.type;
  els.lessonExplanation.textContent = lesson.explanation;
  els.lessonReasonTitle.textContent = lesson.reasonsTitle;
  els.lessonRisk.textContent = lesson.risk;
  els.lessonChartCaption.textContent = `${lesson.title} · 示例图用于理解形态，不代表真实行情。`;
  renderList(els.lessonReasons, lesson.reasons);
  els.prevLesson.disabled = state.currentLesson === 0;
  els.nextLesson.textContent = state.currentLesson === LEARNING_LESSONS.length - 1 ? "回到第一页" : "下一页";
  els.lessonType.className = lesson.type.includes("看涨")
    ? "positive-pill"
    : lesson.type.includes("看跌")
      ? "negative-pill"
      : lesson.type.includes("观望")
        ? "neutral-pill"
        : "";
  renderLessonDots();
  renderLessonChart();
}

function renderLessonDots() {
  els.lessonDots.innerHTML = "";
  LEARNING_LESSONS.forEach((lesson, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.title = lesson.title;
    button.className = index === state.currentLesson ? "active" : "";
    button.addEventListener("click", () => {
      state.currentLesson = index;
      renderLesson();
    });
    els.lessonDots.appendChild(button);
  });
}

function moveLesson(delta) {
  const next = state.currentLesson + delta;
  if (next >= LEARNING_LESSONS.length) state.currentLesson = 0;
  else if (next < 0) state.currentLesson = 0;
  else state.currentLesson = next;
  renderLesson();
}

function renderLessonChart() {
  const lesson = LEARNING_LESSONS[state.currentLesson];
  if (!lesson) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = els.lessonChart.getBoundingClientRect();
  const width = rect.width || 900;
  const height = rect.height || 520;
  els.lessonChart.width = Math.floor(width * dpr);
  els.lessonChart.height = Math.floor(height * dpr);
  lessonCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  lessonCtx.clearRect(0, 0, width, height);
  lessonCtx.fillStyle = "#080b10";
  lessonCtx.fillRect(0, 0, width, height);

  const pad = { left: 48, right: 24, top: 26, bottom: 76 };
  const plotHeight = height - pad.top - pad.bottom;
  const plotWidth = width - pad.left - pad.right;
  const candles = lessonCandles(lesson.chart);
  const max = Math.max(...candles.map((c) => c.high));
  const min = Math.min(...candles.map((c) => c.low));
  const range = max - min || 1;
  const step = plotWidth / candles.length;
  const bodyWidth = Math.max(6, Math.min(18, step * 0.54));
  const y = (price) => pad.top + ((max - price) / range) * plotHeight;

  drawLessonGrid(width, height, pad, plotHeight);
  drawLessonLevels(lesson.chart, y, pad, width);

  candles.forEach((candle, index) => {
    const x = pad.left + index * step + step / 2;
    const up = candle.close >= candle.open;
    const color = up ? "#19c37d" : "#ff5b6e";
    const top = y(Math.max(candle.open, candle.close));
    const bottom = y(Math.min(candle.open, candle.close));
    lessonCtx.strokeStyle = color;
    lessonCtx.fillStyle = color;
    lessonCtx.lineWidth = 1.5;
    lessonCtx.beginPath();
    lessonCtx.moveTo(x, y(candle.high));
    lessonCtx.lineTo(x, y(candle.low));
    lessonCtx.stroke();
    lessonCtx.fillRect(x - bodyWidth / 2, top, bodyWidth, Math.max(2, bottom - top));

    const volumeHeight = Math.max(8, candle.volume * 38);
    lessonCtx.globalAlpha = 0.28;
    lessonCtx.fillRect(x - bodyWidth / 2, height - 28 - volumeHeight, bodyWidth, volumeHeight);
    lessonCtx.globalAlpha = 1;
  });

  drawLessonAnnotations(lesson.chart, y, pad, width, height);
}

function drawLessonGrid(width, height, pad, plotHeight) {
  lessonCtx.strokeStyle = "#182131";
  lessonCtx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = pad.top + (plotHeight / 4) * i;
    lessonCtx.beginPath();
    lessonCtx.moveTo(pad.left, y);
    lessonCtx.lineTo(width - pad.right, y);
    lessonCtx.stroke();
  }
  lessonCtx.fillStyle = "#8994a7";
  lessonCtx.font = "12px system-ui";
  lessonCtx.fillText("Volume", pad.left, height - 42);
}

function drawLessonLevels(chart, y, pad, width) {
  const levels = {
    volumeBreakout: [{ price: 112, label: "压力位 / 前高", color: "#f1b84b" }],
    supportBounce: [{ price: 96, label: "支撑位", color: "#63a4ff" }],
    supportBreak: [{ price: 98, label: "支撑跌破", color: "#ff5b6e" }],
    range: [{ price: 108, label: "区间上沿", color: "#f1b84b" }, { price: 96, label: "区间下沿", color: "#63a4ff" }],
    riskReward: [{ price: 116, label: "压力近", color: "#ff5b6e" }, { price: 96, label: "支撑远", color: "#63a4ff" }],
  }[chart] || [];

  levels.forEach((level) => {
    const ly = y(level.price);
    lessonCtx.setLineDash([6, 5]);
    lessonCtx.strokeStyle = level.color;
    lessonCtx.beginPath();
    lessonCtx.moveTo(pad.left, ly);
    lessonCtx.lineTo(width - pad.right, ly);
    lessonCtx.stroke();
    lessonCtx.setLineDash([]);
    lessonCtx.fillStyle = level.color;
    lessonCtx.fillText(level.label, pad.left + 8, ly - 7);
  });
}

function drawLessonAnnotations(chart, y, pad, width, height) {
  const annotations = {
    singleBullish: [{ x: 0.54, yy: y(116), text: "实体 + 影线 = 一段时间的价格行为" }],
    openClose: [{ x: 0.55, yy: y(107), text: "收盘价高于开盘价，形成阳线" }],
    upperWick: [{ x: 0.68, yy: y(119), text: "冲高回落，上方有卖压" }],
    lowerWick: [{ x: 0.62, yy: y(94), text: "下探回升，下方有承接" }],
    bullishCandle: [{ x: 0.66, yy: y(113), text: "收盘守在高位，买方较强" }],
    bearishCandle: [{ x: 0.62, yy: y(99), text: "收盘压在低位，卖方较强" }],
    trendUp: [{ x: 0.72, yy: y(117), text: "高点和低点逐步抬高" }],
    volumeBreakout: [{ x: 0.73, yy: y(118), text: "突破 + 放量" }],
    supportBounce: [{ x: 0.66, yy: y(102), text: "回踩支撑后反弹" }],
    maBullish: [{ x: 0.68, yy: y(114), text: "短期均线在长期均线上方" }],
    higherHighLow: [{ x: 0.7, yy: y(118), text: "HH / HL 结构" }],
    supportBreak: [{ x: 0.66, yy: y(94), text: "跌破支撑后继续走弱" }],
    volumeDrop: [{ x: 0.66, yy: y(94), text: "下跌时成交量放大" }],
    weakBounce: [{ x: 0.68, yy: y(110), text: "反弹缩量，动力不足" }],
    lowerHighLow: [{ x: 0.68, yy: y(98), text: "LH / LL 结构" }],
    range: [{ x: 0.58, yy: y(102), text: "区间内来回波动" }],
    mixedTrend: [{ x: 0.58, yy: y(107), text: "短线下跌，但大结构未破" }],
    afterSpike: [{ x: 0.7, yy: y(120), text: "大涨后波动放大" }],
    riskReward: [{ x: 0.65, yy: y(113), text: "离压力近，空间不划算" }],
    decision: [{ x: 0.57, yy: y(107), text: "看涨 / 看跌 / 观望" }],
    noSignal: [{ x: 0.58, yy: y(103), text: "没有趋势和量能确认" }],
  }[chart] || [];

  annotations.forEach((item) => {
    const x = pad.left + (width - pad.left - 24) * item.x;
    lessonCtx.fillStyle = "rgba(16, 20, 28, 0.92)";
    lessonCtx.strokeStyle = "#273040";
    roundRect(lessonCtx, x - 86, item.yy - 22, 172, 30, 6);
    lessonCtx.fill();
    lessonCtx.stroke();
    lessonCtx.fillStyle = "#ecf2ff";
    lessonCtx.font = "12px system-ui";
    lessonCtx.textAlign = "center";
    lessonCtx.fillText(item.text, x, item.yy - 2);
    lessonCtx.textAlign = "left";
  });

  if (chart === "maBullish") drawMovingAverages(y, pad, width);
  if (chart === "riskReward") drawRiskRewardZones(y, pad, width);
  lessonCtx.fillStyle = "#8994a7";
  lessonCtx.font = "12px system-ui";
  lessonCtx.fillText("示例K线", pad.left, height - 12);
}

function drawMovingAverages(y, pad, width) {
  drawLinePath([
    [pad.left + 40, y(98)],
    [pad.left + 170, y(102)],
    [pad.left + 300, y(107)],
    [width - 70, y(113)],
  ], "#63a4ff");
  drawLinePath([
    [pad.left + 40, y(94)],
    [pad.left + 170, y(97)],
    [pad.left + 300, y(101)],
    [width - 70, y(106)],
  ], "#f1b84b");
}

function drawRiskRewardZones(y, pad, width) {
  lessonCtx.fillStyle = "rgba(255, 91, 110, 0.09)";
  lessonCtx.fillRect(pad.left, y(116), width - pad.left - 24, y(112) - y(116));
  lessonCtx.fillStyle = "rgba(99, 164, 255, 0.08)";
  lessonCtx.fillRect(pad.left, y(104), width - pad.left - 24, y(96) - y(104));
}

function drawLinePath(points, color) {
  lessonCtx.strokeStyle = color;
  lessonCtx.lineWidth = 2;
  lessonCtx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) lessonCtx.moveTo(x, y);
    else lessonCtx.lineTo(x, y);
  });
  lessonCtx.stroke();
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
}

function lessonCandles(chart) {
  const templates = {
    singleBullish: [[100, 116, 96, 110, 0.7]],
    openClose: [[100, 112, 97, 110, 0.7]],
    upperWick: [[105, 121, 101, 108, 0.75], [108, 119, 104, 106, 0.6]],
    lowerWick: [[104, 108, 92, 103, 0.75], [103, 110, 94, 108, 0.7]],
    bullishCandle: [[96, 114, 94, 112, 0.9]],
    bearishCandle: [[112, 114, 96, 98, 0.9]],
    trendUp: [[95, 101, 93, 99, 0.4], [99, 104, 97, 103, 0.45], [102, 108, 101, 107, 0.5], [106, 112, 104, 111, 0.48], [110, 118, 108, 116, 0.56]],
    volumeBreakout: [[98, 103, 96, 101, 0.35], [101, 107, 99, 105, 0.42], [104, 110, 102, 108, 0.45], [108, 114, 106, 113, 1.0], [113, 121, 112, 119, 1.15]],
    supportBounce: [[108, 110, 103, 105, 0.5], [105, 106, 98, 100, 0.55], [100, 103, 96, 101, 0.7], [101, 110, 100, 108, 0.8], [108, 114, 106, 112, 0.65]],
    maBullish: [[96, 102, 94, 101, 0.45], [101, 105, 99, 104, 0.5], [104, 109, 102, 108, 0.55], [108, 114, 107, 113, 0.55], [113, 118, 111, 116, 0.6]],
    higherHighLow: [[96, 103, 94, 101, 0.4], [101, 106, 98, 104, 0.4], [104, 111, 102, 109, 0.5], [109, 113, 106, 108, 0.45], [108, 118, 107, 116, 0.58]],
    supportBreak: [[108, 111, 104, 106, 0.45], [106, 108, 100, 102, 0.5], [102, 104, 98, 99, 0.6], [99, 101, 92, 94, 0.95], [94, 96, 88, 90, 0.8]],
    volumeDrop: [[112, 114, 107, 109, 0.45], [109, 110, 102, 103, 0.55], [103, 105, 96, 98, 0.9], [98, 100, 90, 92, 1.15]],
    weakBounce: [[112, 114, 105, 106, 0.8], [106, 108, 98, 100, 0.9], [100, 106, 99, 105, 0.35], [105, 111, 104, 109, 0.3]],
    lowerHighLow: [[116, 118, 109, 111, 0.5], [111, 113, 104, 106, 0.55], [106, 109, 99, 101, 0.6], [101, 104, 94, 96, 0.72]],
    range: [[101, 108, 98, 106, 0.45], [106, 109, 100, 102, 0.5], [102, 107, 96, 105, 0.42], [105, 108, 97, 99, 0.48], [99, 106, 96, 103, 0.46]],
    mixedTrend: [[96, 105, 95, 104, 0.5], [104, 111, 102, 109, 0.55], [109, 112, 104, 105, 0.5], [105, 108, 99, 100, 0.65]],
    afterSpike: [[96, 102, 94, 101, 0.45], [101, 113, 100, 112, 1.1], [112, 122, 108, 118, 1.2], [118, 121, 109, 111, 1.0]],
    riskReward: [[102, 108, 100, 106, 0.45], [106, 111, 104, 110, 0.5], [110, 115, 108, 113, 0.55]],
    decision: [[102, 108, 99, 106, 0.5], [106, 110, 101, 103, 0.5], [103, 109, 100, 107, 0.5]],
    noSignal: [[102, 106, 99, 101, 0.35], [101, 105, 98, 103, 0.32], [103, 106, 100, 102, 0.33], [102, 105, 99, 104, 0.34]],
  };

  return (templates[chart] || templates.noSignal).map(([open, high, low, close, volume]) => ({ open, high, low, close, volume }));
}

function listMarkup(items) {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

function zoom(delta) {
  const min = 35;
  const max = state.revealed ? WINDOW_SIZE + FUTURE_SIZE : WINDOW_SIZE;
  state.visibleCount = Math.max(min, Math.min(max, state.visibleCount + delta));
  renderChart();
}

function bindEvents() {
  ASSETS.forEach((asset) => els.assetSelect.add(new Option(asset.symbol, asset.symbol)));
  PERIODS.forEach((period) => els.periodSelect.add(new Option(period.label, period.key)));
  els.periodSelect.value = state.period.key;

  els.tabButtons.forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });
  els.openFramework.addEventListener("click", () => switchView("learning", true));
  els.startTrainingFromLearning.addEventListener("click", () => switchView("training"));
  els.prevLesson.addEventListener("click", () => moveLesson(-1));
  els.nextLesson.addEventListener("click", () => moveLesson(1));
  els.assetSelect.addEventListener("change", () => generateQuestion(true));
  els.periodSelect.addEventListener("change", () => generateQuestion(true));
  els.choiceGroup.addEventListener("click", (event) => {
    const button = event.target.closest(".choice");
    if (button && !state.revealed) selectChoice(button.dataset.choice);
  });
  els.submitDecision.addEventListener("click", submitDecision);
  els.nextQuestion.addEventListener("click", () => {
    els.resultBox.hidden = true;
    generateQuestion();
  });
  els.newQuestionTop.addEventListener("click", () => {
    els.resultBox.hidden = true;
    generateQuestion();
  });
  els.resetStats.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    renderStats();
  });
  els.zoomIn.addEventListener("click", () => zoom(-12));
  els.zoomOut.addEventListener("click", () => zoom(12));
  els.resetView.addEventListener("click", () => {
    state.visibleCount = state.revealed ? WINDOW_SIZE + FUTURE_SIZE : WINDOW_SIZE;
    state.panOffset = 0;
    renderChart();
  });

  els.canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    zoom(event.deltaY > 0 ? 8 : -8);
  }, { passive: false });
  els.canvas.addEventListener("pointerdown", (event) => {
    state.dragging = true;
    state.dragStartX = event.clientX;
    state.dragStartPan = state.panOffset;
    els.canvas.setPointerCapture(event.pointerId);
  });
  els.canvas.addEventListener("pointermove", (event) => {
    if (!state.dragging) return;
    const rect = els.canvas.getBoundingClientRect();
    const candlePx = rect.width / state.visibleCount;
    const delta = Math.round((event.clientX - state.dragStartX) / candlePx);
    const maxPan = Math.max(0, state.splitIndex - state.visibleCount + 1);
    state.panOffset = Math.max(0, Math.min(maxPan, state.dragStartPan + delta));
    renderChart();
  });
  els.canvas.addEventListener("pointerup", () => {
    state.dragging = false;
  });
  window.addEventListener("resize", () => {
    renderChart();
    renderLessonChart();
  });
}

renderLearningCenter();
bindEvents();
generateQuestion();
