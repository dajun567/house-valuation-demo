/* ============================================
   AI 房产估价助手 — 交互逻辑
   ============================================ */

// ========== Data ==========
const SAMPLE_PROPERTY = {
  city: '成都',
  community: '锦城南府',
  building: '6栋',
  unit: '1203',
  area: 108
};

const PROPERTY_DETAIL = {
  address: '成都市高新区天府三街888号',
  layout: '三室两厅一厨两卫',
  floor: 12,
  totalFloor: 30,
  orientation: '东南',
  decoration: '精装',
  year: '约 2015 年',
  rights: '70年住宅'
};

const COMMUNITIES = {
  '仁恒滨河湾': { loc: '锦江区 · 攀成钢', price: '32,800', trend: '+2.3%', trendDir: 'up' },
  '麓湖生态城': { loc: '天府新区 · 麓湖', price: '28,500', trend: '+1.8%', trendDir: 'up' },
  '攀成钢区域': { loc: '锦江区 · 东二环', price: '25,600', trend: '-0.5%', trendDir: 'down' },
  '中海城南一号': { loc: '高新区 · 金融城', price: '35,200', trend: '+3.1%', trendDir: 'up' }
};

const AREA_DATA = {
  wuhou: { price: '-3.0%', listing: '+5.2%', cycle: '53 天', margin: '4.2%', pBar: 62, lBar: 78, cBar: 55, mBar: 45 },
  gaoxin: { price: '+1.2%', listing: '+3.8%', cycle: '38 天', margin: '3.5%', pBar: 55, lBar: 65, cBar: 40, mBar: 38 },
  jinjiang: { price: '-1.5%', listing: '+6.1%', cycle: '48 天', margin: '4.8%', pBar: 58, lBar: 82, cBar: 50, mBar: 48 },
  qingyang: { price: '-0.8%', listing: '+4.5%', cycle: '45 天', margin: '3.9%', pBar: 50, lBar: 70, cBar: 46, mBar: 42 }
};

// ========== Competition Data ==========
const COMPETITORS = [
  { id: 1, community: '仁恒滨河湾', area: '锦江区 · 攀成钢', sqm: 105, layout: '三室两厅', floor: '15F', totalFloor: 28, decoration: '精装', year: 2016, price: 335, similarity: 92, tags: ['面积 -3㎡', '楼层相近', '装修相近'], tagTypes: ['', '', 'advantage'], lat: 30.6415, lng: 104.1025, count: 3 },
  { id: 2, community: '麓湖生态城', area: '天府新区 · 麓湖', sqm: 112, layout: '三室两厅', floor: '22F', totalFloor: 32, decoration: '精装', year: 2018, price: 345, similarity: 88, tags: ['面积 +4㎡', '楼层 +10F', '房龄更新'], tagTypes: ['disadvantage', 'disadvantage', 'disadvantage'], lat: 30.468, lng: 104.076, count: 5 },
  { id: 3, community: '中海城南一号', area: '高新区 · 金融城', sqm: 98, layout: '三室两厅', floor: '8F', totalFloor: 26, decoration: '简装', year: 2014, price: 318, similarity: 85, tags: ['面积 -10㎡', '楼层 -4F', '装修偏差'], tagTypes: ['', '', 'advantage'], lat: 30.575, lng: 104.058, count: 2 },
  { id: 4, community: '天府世家', area: '高新区 · 大源', sqm: 108, layout: '三室两厅', floor: '18F', totalFloor: 30, decoration: '精装', year: 2017, price: 338, similarity: 90, tags: ['面积相同', '楼层 +6F', '房龄相近'], tagTypes: ['advantage', 'disadvantage', ''], lat: 30.537, lng: 104.045, count: 4 },
  { id: 5, community: '南苑小区', area: '高新区 · 金融城', sqm: 115, layout: '三室两厅', floor: '6F', totalFloor: 18, decoration: '豪装', year: 2013, price: 355, similarity: 78, tags: ['面积 +7㎡', '楼层 -6F', '装修更好'], tagTypes: ['disadvantage', '', 'disadvantage'], lat: 30.573, lng: 104.065, count: 6 },
  { id: 6, community: '凤凰城', area: '锦江区 · 东大街', sqm: 102, layout: '三室两厅', floor: '12F', totalFloor: 32, decoration: '精装', year: 2016, price: 320, similarity: 86, tags: ['面积 -6㎡', '楼层相近', '房龄相近'], tagTypes: ['', '', ''], lat: 30.647, lng: 104.092, count: 3 },
  { id: 7, community: '誉峰', area: '高新区 · 金融城', sqm: 106, layout: '三室两厅', floor: '25F', totalFloor: 38, decoration: '精装', year: 2017, price: 348, similarity: 82, tags: ['面积 -2㎡', '楼层 +13F', '景观更好'], tagTypes: ['', 'disadvantage', 'disadvantage'], lat: 30.581, lng: 104.059, count: 2 },
  { id: 8, community: '复地金融岛', area: '高新区 · 锦江畔', sqm: 110, layout: '三室两厅', floor: '10F', totalFloor: 24, decoration: '精装', year: 2019, price: 362, similarity: 74, tags: ['面积 +2㎡', '楼层 -2F', '房龄更新'], tagTypes: ['disadvantage', '', 'disadvantage'], lat: 30.570, lng: 104.078, count: 1 }
];

// ========== State ==========
const state = {
  currentTab: 'home',
  valuationStep: null, // 'input' | 'confirm' | 'calculating' | 'report'
  propertySubPage: 'list', // 'list' | 'detail'
  inValuationFlow: false,
  valuationData: null,
  adjustmentApplied: null
};

// ========== DOM refs ==========
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const dom = {
  navTitle: $('navTitle'),
  navBack: $('navBack'),
  tabBar: $('tabBar'),
  appBody: $('appBody'),
  tabHome: $('tab-home'),
  tabValuation: $('tab-valuation'),
  tabProperties: $('tab-properties'),
  tabMarket: $('tab-market'),
  pageInput: $('page-input'),
  pageConfirm: $('page-confirm'),
  pageCalculating: $('page-calculating'),
  pageReport: $('page-report'),
  pagePropList: $('page-property-list'),
  pagePropDetail: $('page-property-detail'),
  reportPrice: $('reportPrice'),
  reportRangeLow: $('reportRangeLow'),
  reportRangeHigh: $('reportRangeHigh'),
  reportSamples: $('reportSamples'),
  acBase: $('acBase'),
  acTotal: $('acTotal'),
  propCurrentPrice: $('propCurrentPrice')
};

// ========== Tab Switching ==========
function switchTab(tab) {
  state.currentTab = tab;

  // Hide all tab pages
  document.querySelectorAll('.tab-page').forEach(el => el.classList.remove('active'));
  // Show target
  const target = $(`tab-${tab}`);
  if (target) target.classList.add('active');

  // Update tab items
  document.querySelectorAll('.tab-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });

  // Update nav title
  const titles = { home: 'AI房产价值评估', valuation: '房产估价', competition: '竞争地图', properties: '我的房产', market: '市场行情' };
  dom.navTitle.textContent = titles[tab] || 'AI房产价值评估';

  // Reset nav state
  dom.navBack.hidden = true;

  // Reset valuation sub-views when not in flow
  if (tab !== 'valuation') {
    state.valuationStep = null;
    state.inValuationFlow = false;
    dom.tabBar.classList.remove('hidden');
  }

  // Render competition data when tab shown
  if (tab === 'competition') {
    renderCompetition();
    initCompetitionMap();
  }
}

// ========== Valuation Flow ==========
function enterValuationFlow() {
  state.inValuationFlow = true;
  dom.tabBar.classList.add('hidden');
  dom.navBack.hidden = false;

  // Switch to valuation tab if not already
  if (state.currentTab !== 'valuation') {
    switchTab('valuation');
  }

  showValuationStep('input');
}

function showValuationStep(step) {
  state.valuationStep = step;

  // Hide all sub pages in valuation tab
  dom.tabValuation.querySelectorAll('.sub-page').forEach(el => el.classList.remove('active'));

  const pageMap = {
    input: 'page-input',
    confirm: 'page-confirm',
    calculating: 'page-calculating',
    report: 'page-report'
  };

  const target = $(pageMap[step]);
  if (target) target.classList.add('active');

  const titles = {
    input: '输入房屋信息',
    confirm: '确认信息',
    calculating: 'AI 估价计算',
    report: '估价报告'
  };
  dom.navTitle.textContent = titles[step] || '房产估价';
}

function exitValuationFlow() {
  state.inValuationFlow = false;
  state.valuationStep = null;
  dom.tabBar.classList.remove('hidden');
  dom.navBack.hidden = true;
  switchTab('home');
}

// ========== Property Sub-Pages ==========
function showPropertySubPage(page) {
  state.propertySubPage = page;
  dom.tabProperties.querySelectorAll('.sub-page').forEach(el => el.classList.remove('active'));

  if (page === 'detail') {
    $('page-property-detail').classList.add('active');
    dom.navTitle.textContent = '房产详情';
    dom.navBack.hidden = false;
  } else {
    $('page-property-list').classList.add('active');
    dom.navTitle.textContent = '我的房产';
    dom.navBack.hidden = true;
  }
}

// ========== Calculating Animation ==========
let calcTimer = null;

function startCalculating() {
  showValuationStep('calculating');

  const steps = document.querySelectorAll('.calc-step');
  let current = 0;
  const delays = [1200, 1000, 1400, 1200];

  // Reset all
  steps.forEach(el => { el.classList.remove('active', 'done'); });

  function advance() {
    if (current > 0) {
      steps[current - 1].classList.remove('active');
      steps[current - 1].classList.add('done');
    }
    if (current < steps.length) {
      steps[current].classList.add('active');
      const delay = delays[current] || 1200;
      current++;
      calcTimer = setTimeout(advance, delay);
    } else {
      // All done, wait then show report
      calcTimer = setTimeout(() => {
        populateReport();
        showValuationStep('report');
        dom.navTitle.textContent = '估价报告';
      }, 800);
    }
  }

  advance();
}

// ========== Valuation Calculation ==========
function calculateValuation(property) {
  const area = Number(property.area) || 108;
  const decoration = property.decoration || '精装';
  // Simulated AI calculation based on property data
  const basePerSquareMeter = 29200; // 小区基础单价
  const baseValue = Math.round(basePerSquareMeter * area / 10000);

  let adjustments = [];
  let totalAdjust = 0;

  // Decoration adjustment based on selected type
  const decMap = { '清水': 0, '简装': 6, '精装': 12, '豪装': 18 };
  const decVal = decMap[decoration] || 12;
  const decLabel = decoration === '清水' ? '+ 清水/毛坯（无调整）' : `+ ${decoration}装修·品质好`;
  if (decVal > 0) {
    adjustments.push({ value: decVal, label: decLabel });
    totalAdjust += decVal;
  }

  const floorAdj = { value: 8, label: '+ 中高楼层·视野好' };
  adjustments.push(floorAdj);
  totalAdjust += 8;

  const orientAdj = { value: -4, label: '- 朝向一般' };
  adjustments.push(orientAdj);
  totalAdjust -= 4;

  const viewAdj = { value: -3, label: '- 非景观位置' };
  adjustments.push(viewAdj);
  totalAdjust -= 3;

  const total = baseValue + totalAdjust;

  return {
    price: total,
    rangeLow: total - 8,
    rangeHigh: total + 7,
    confidence: 4,
    samples: 38,
    baseValue: baseValue,
    adjustments: adjustments,
    totalAdjust: totalAdjust,
    total: total,
    units: [
      { area: '105㎡', floor: '15楼', decoration: '精装', price: '318万', diff: '面积 -3㎡ · 楼层接近', diffLabel: '与您的差异' },
      { area: '112㎡', floor: '22楼', decoration: '精装', price: '340万', diff: '装修更新 · 税费更低', diffLabel: '您的优势' }
    ],
    models: [
      { label: '成交匹配模型', value: '325 万', width: 99 },
      { label: '房屋特征模型', value: '330 万', width: 94 },
      { label: '市场趋势模型', value: '328 万', width: 82 }
    ]
  };
}

// ========== Populate Report ==========
function populateReport() {
  const property = getFormProperty();
  const data = calculateValuation(property);
  state.valuationData = data;

  dom.reportPrice.textContent = data.price;
  dom.reportRangeLow.textContent = data.rangeLow;
  dom.reportRangeHigh.textContent = data.rangeHigh;
  dom.reportSamples.textContent = data.samples;

  // Stars
  const stars = document.querySelectorAll('#reportStars .star');
  stars.forEach((el, i) => {
    el.classList.toggle('active', i < data.confidence);
  });

  // Analysis card - dynamically build
  const analysisCard = $('analysisCard');
  if (analysisCard) {
    const plusRows = data.adjustments.filter(a => a.value > 0).map(a => `
      <div class="ac-row plus">
        <span class="ac-label">${a.label}</span>
        <span class="ac-val up">+${a.value} 万</span>
      </div>
    `).join('');
    const minusRows = data.adjustments.filter(a => a.value < 0).map(a => `
      <div class="ac-row minus">
        <span class="ac-label">${a.label}</span>
        <span class="ac-val down">${a.value} 万</span>
      </div>
    `).join('');

    analysisCard.innerHTML = `
      <div class="ac-row base">
        <span class="ac-label">小区基础价值</span>
        <span class="ac-val" id="acBase">${data.baseValue} 万</span>
      </div>
      <div class="ac-divider"></div>
      ${plusRows}
      ${minusRows}
      <div class="ac-divider"></div>
      <div class="ac-row total">
        <span class="ac-label">综合价值</span>
        <span class="ac-val" id="acTotal">${data.total} 万</span>
      </div>
    `;
  }

  // Reference cards
  const refContainer = $('refCards');
  if (refContainer) {
    refContainer.innerHTML = data.units.map(u => `
      <div class="ref-card">
        <div class="rc-badge">同小区</div>
        <div class="rc-detail-grid">
          <div><span>面积</span><strong>${u.area}</strong></div>
          <div><span>楼层</span><strong>${u.floor}</strong></div>
          <div><span>装修</span><strong>${u.decoration}</strong></div>
          <div><span>成交</span><strong class="price">${u.price}</strong></div>
        </div>
        <div class="rc-diff">
          <div class="rc-diff-label">${u.diffLabel}</div>
          <div class="rc-diff-text">${u.diff}</div>
        </div>
      </div>
    `).join('');
  }

  // Models
  const modelContainer = $('modelList');
  if (modelContainer) {
    modelContainer.innerHTML = data.models.map((m, i) => `
      <div class="model-item ${i === data.models.length - 1 ? 'final' : ''}">
        <span class="mi-label">${m.label}</span>
        <div class="mi-bar"><span style="width:${m.width}%"></span></div>
        <span class="mi-val ${i === data.models.length - 1 ? 'strong' : ''}">${m.value}</span>
      </div>
    `).join('');
  }

  dom.propCurrentPrice.textContent = data.total + ' 万';
}

// ========== Recalculate with Feedback ==========
function applyFeedback(adjustLabel, adjustValue) {
  state.adjustmentApplied = adjustLabel;

  // Show recalculating
  $('feedbackResult').hidden = false;

  setTimeout(() => {
    const data = state.valuationData;
    if (!data) return;

    const newPrice = data.total + (adjustValue || 0);
    const newLow = newPrice - 8;
    const newHigh = newPrice + 7;

    // Update display with animation
    dom.reportPrice.textContent = newPrice;
    dom.reportRangeLow.textContent = newLow;
    dom.reportRangeHigh.textContent = newHigh;

    // Update analysis card
    dom.acTotal.textContent = newPrice + ' 万';

    // Update my property
    dom.propCurrentPrice.textContent = newPrice + ' 万';

    $('feedbackResult').hidden = true;
    state.valuationData.total = newPrice;
    state.valuationData.rangeLow = newLow;
    state.valuationData.rangeHigh = newHigh;
  }, 1200);
}

// ========== Form Helpers ==========
function getFormProperty() {
  return {
    city: ($('vCity') && $('vCity').value) || SAMPLE_PROPERTY.city,
    community: ($('vCommunity') && $('vCommunity').value) || SAMPLE_PROPERTY.community,
    building: ($('vBuilding') && $('vBuilding').value) || SAMPLE_PROPERTY.building,
    unit: ($('vUnit') && $('vUnit').value) || SAMPLE_PROPERTY.unit,
    area: ($('vArea') && $('vArea').value) || SAMPLE_PROPERTY.area,
    decoration: ($('vDecoration') && $('vDecoration').value) || '精装',
    remark: ($('vRemark') && $('vRemark').value) || ''
  };
}

function populateConfirmPage() {
  const prop = getFormProperty();
  $('confirmCommunity').innerHTML = `${prop.community} <span id="confirmUnit">${prop.building}${prop.unit}</span>`;
  $('confirmArea').textContent = prop.area + '㎡';
  $('confirmDecoration').textContent = prop.decoration;
  // Show remark if filled
  const remarkEl = $('confirmRemark');
  if (prop.remark && remarkEl) {
    remarkEl.textContent = prop.remark;
    remarkEl.style.display = 'block';
  } else if (remarkEl) {
    remarkEl.style.display = 'none';
  }
}

// ========== Area Tab Switching ==========
function switchArea(area) {
  document.querySelectorAll('.at-item').forEach(el => el.classList.remove('active'));
  const activeTab = document.querySelector(`.at-item[data-area="${area}"]`);
  if (activeTab) activeTab.classList.add('active');

  const data = AREA_DATA[area];
  if (!data) return;

  const container = $('areaData');
  if (!container) return;

  container.innerHTML = `
    <div class="ad-row">
      <span class="ad-label">近半年成交均价</span>
      <div class="ad-bar"><span style="width:${data.pBar}%"></span></div>
      <span class="ad-val ${data.price.startsWith('-') ? 'down' : 'up'}">${data.price}</span>
    </div>
    <div class="ad-row">
      <span class="ad-label">近半年挂牌量</span>
      <div class="ad-bar"><span style="width:${data.lBar}%"></span></div>
      <span class="ad-val ${data.listing.startsWith('+') ? 'up' : 'down'}">${data.listing}</span>
    </div>
    <div class="ad-row">
      <span class="ad-label">平均成交周期</span>
      <div class="ad-bar"><span style="width:${data.cBar}%"></span></div>
      <span class="ad-val warn">${data.cycle}</span>
    </div>
    <div class="ad-row">
      <span class="ad-label">议价空间</span>
      <div class="ad-bar"><span style="width:${data.mBar}%"></span></div>
      <span class="ad-val">${data.margin}</span>
    </div>
  `;
}

// ========== Community Chip Switching ==========
function switchCommunity(name) {
  document.querySelectorAll('.community-chip').forEach(el => el.classList.remove('active'));
  const chip = [...document.querySelectorAll('.community-chip')].find(el => el.textContent.trim() === name);
  if (chip) chip.classList.add('active');

  const data = COMMUNITIES[name];
  if (!data) return;

  const card = $('hotCommunityCard');
  if (!card) return;

  card.innerHTML = `
    <div class="cc-info">
      <span class="cc-name">${name}</span>
      <span class="cc-loc">${data.loc}</span>
      <span class="cc-price">参考均价 <strong>${data.price}</strong> 元/㎡</span>
    </div>
    <div class="cc-trend ${data.trendDir}">${data.trend}</div>
  `;
}

// ========== Competition ==========
let compFilter = 'all';
let compMapInstance = null;

function initCompetitionMap() {
  const container = document.getElementById('compMap');
  if (!container || compMapInstance) {
    if (compMapInstance) compMapInstance.invalidateSize();
    return;
  }

  compMapInstance = L.map('compMap', {
    center: [30.574, 104.072],
    zoom: 13,
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: false
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(compMapInstance);

  // User's own property — 锦城南府
  L.marker([30.558, 104.058], {
    icon: L.divIcon({
      className: 'comp-marker',
      html: '<div class="cmlabel user"><span class="cml-name">锦城南府</span><span class="cml-count">1套 · 您的</span></div>',
      iconSize: [90, 44],
      iconAnchor: [45, 44]
    })
  }).addTo(compMapInstance)
    .bindPopup('<b>🏠 锦城南府</b><br/>6栋1203 · 108㎡<br/>估价 <b>328万</b>');

  // Competitor markers with name + count labels
  const markerGroup = [];
  COMPETITORS.forEach((c, i) => {
    const simClass = c.similarity >= 88 ? 'high' : c.similarity >= 80 ? 'medium' : 'low';
    const marker = L.marker([c.lat, c.lng], {
      icon: L.divIcon({
        className: 'comp-marker',
        html: `<div class="cmlabel ${simClass}"><span class="cml-name">${c.community}</span><span class="cml-count">${c.count}套</span></div>`,
        iconSize: [90, 44],
        iconAnchor: [45, 44]
      })
    }).addTo(compMapInstance);

    marker.bindPopup(
      `<b>${c.community}</b><br/>${c.area}<br/><b>${c.price}万</b> · ${c.sqm}㎡ · 相似度 ${c.similarity}% · ${c.count}套在售`
    );
    markerGroup.push(marker);
  });

  // Fit bounds to show everything
  const group = L.featureGroup(markerGroup);
  compMapInstance.fitBounds(group.getBounds().pad(0.2));

  setTimeout(() => compMapInstance.invalidateSize(), 300);
}

function renderCompetition() {
  const userPrice = state.valuationData ? state.valuationData.total : 328;
  const userArea = Number(getFormProperty().area) || 108;

  const filtered = compFilter === 'all' ? COMPETITORS : COMPETITORS.filter(c => {
    if (compFilter === 'area') return Math.abs(c.sqm - userArea) <= 10;
    if (compFilter === 'price') return Math.abs(c.price - userPrice) <= 20;
    if (compFilter === 'age') return Math.abs((c.year || 2016) - 2015) <= 3;
    return true;
  });

  const summaryEl = document.querySelector('#compSummary');
  if (summaryEl) summaryEl.innerHTML = `找到 <strong>${filtered.length}</strong> 套与您的房产相似的竞争房源`;

  const avgPrice = filtered.length ? Math.round(filtered.reduce((s, c) => s + c.price, 0) / filtered.length) : 0;
  const avgSqm = filtered.length ? Math.round(filtered.reduce((s, c) => s + c.sqm, 0) / filtered.length) : 0;
  $('csYourPrice').textContent = userPrice + ' 万';
  $('csYourMeta').textContent = userArea + '㎡ · 精装';
  $('csAvgPrice').textContent = avgPrice + ' 万';
  $('csAvgMeta').textContent = avgSqm + '㎡ · 精装';

  const list = $('compList');
  if (!list) return;
  if (!filtered.length) {
    list.innerHTML = '<div style="text-align:center;padding:40px 20px;color:var(--muted);font-size:14px;">没有找到匹配的竞争房源</div>';
    return;
  }

  list.innerHTML = filtered.map(c => {
    const simClass = c.similarity >= 88 ? 'high' : c.similarity >= 80 ? 'medium' : 'low';
    const badgeText = c.similarity >= 88 ? '高度相似' : c.similarity >= 80 ? '中度相似' : '部分相似';
    const tagsHtml = c.tags.map((t, i) => {
      const type = c.tagTypes && c.tagTypes[i] ? c.tagTypes[i] : '';
      return `<span class="cctag ${type}">${t}</span>`;
    }).join('');
    return `<div class="comp-card">
      <div class="cc-header"><span class="cc-title">${c.community}</span><span class="cc-badge ${simClass}">${badgeText}</span></div>
      <div class="cc-location">${c.area} · ${c.year || 2016}年建成</div>
      <div class="cc-metrics">
        <div class="cm-item"><span class="cm-label">面积</span><span class="cm-value">${c.sqm}㎡</span></div>
        <div class="cm-item"><span class="cm-label">挂牌</span><span class="cm-value highlight">${c.price}万</span></div>
        <div class="cm-item"><span class="cm-label">楼层</span><span class="cm-value">${c.floor}</span></div>
        <div class="cm-item"><span class="cm-label">装修</span><span class="cm-value">${c.decoration}</span></div>
      </div>
      <div class="cc-similarity">
        <span style="font-size:12px;color:var(--muted);flex-shrink:0;">相似度</span>
        <div class="cs-bar-track"><div class="cs-bar-fill" style="width:${c.similarity}%"></div></div>
        <span class="cs-pct">${c.similarity}%</span>
      </div>
      <div class="cc-tags">${tagsHtml}</div>
    </div>`;
  }).join('');
}

// ========== Navigation Back ==========
function handleBack() {
  if (state.currentTab === 'valuation' && state.inValuationFlow) {
    const currentStep = state.valuationStep;

    if (currentStep === 'report') {
      showValuationStep('confirm');
    } else if (currentStep === 'calculating') {
      // Can't go back during calculation, go to confirm
      if (calcTimer) { clearTimeout(calcTimer); calcTimer = null; }
      showValuationStep('confirm');
    } else if (currentStep === 'confirm') {
      showValuationStep('input');
    } else if (currentStep === 'input') {
      // Exit flow
      exitValuationFlow();
    }
  } else if (state.currentTab === 'properties' && state.propertySubPage === 'detail') {
    showPropertySubPage('list');
  } else {
    exitValuationFlow();
  }
}

// ========== Init ==========
function init() {
  // Community chips
  document.querySelectorAll('.community-chip').forEach(el => {
    el.addEventListener('click', () => switchCommunity(el.textContent.trim()));
  });

  // Start valuation button
  $('btnStartValuation').addEventListener('click', () => {
    enterValuationFlow();
  });

  // Analyze button (input → confirm)
  $('btnAnalyze').addEventListener('click', () => {
    populateConfirmPage();
    showValuationStep('confirm');
    dom.navTitle.textContent = '确认信息';
  });

  // Confirm correct (confirm → calculating)
  $('btnConfirmCorrect').addEventListener('click', () => {
    startCalculating();
  });

  // Modify info (confirm → input)
  $('btnConfirmModify').addEventListener('click', () => {
    showValuationStep('input');
    dom.navTitle.textContent = '输入房屋信息';
  });

  // Back button
  dom.navBack.addEventListener('click', handleBack);

  // Tab bar clicks
  document.querySelectorAll('.tab-item').forEach(el => {
    el.addEventListener('click', () => {
      const tab = el.dataset.tab;
      // Exit valuation flow when switching tabs
      if (state.inValuationFlow) {
        state.inValuationFlow = false;
        state.valuationStep = null;
        dom.tabBar.classList.remove('hidden');
        dom.navBack.hidden = true;
      }
      if (tab === 'valuation') {
        switchTab('valuation');
        showValuationStep('input');
      } else {
        switchTab(tab);
      }
    });
  });

  // My property card click → detail
  $('myPropertyCard').addEventListener('click', () => {
    showPropertySubPage('detail');
  });

  // Area tabs
  document.querySelectorAll('.at-item').forEach(el => {
    el.addEventListener('click', () => switchArea(el.dataset.area));
  });

  // Feedback buttons
  document.querySelectorAll('.feedback-btn[data-adjust]').forEach(el => {
    el.addEventListener('click', () => {
      const adjust = parseInt(el.dataset.adjust, 10);
      const label = el.textContent.trim();
      applyFeedback(label, adjust);

      // Highlight clicked
      document.querySelectorAll('.feedback-btn').forEach(b => b.style.borderColor = '');
      el.style.borderColor = 'var(--primary)';
    });
  });

  // Custom feedback
  $('btnCustomFeedback').addEventListener('click', () => {
    const val = prompt('请描述您的房屋有何不同？（如：全新装修、楼层视野好等）');
    if (val) {
      applyFeedback(val, 5);
    }
  });

  // Competition filter chips
  document.querySelectorAll('.cf-chip').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.cf-chip').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      compFilter = el.dataset.filter || 'all';
      renderCompetition();
    });
  });

  // Populate initial community
  switchCommunity('仁恒滨河湾');
}

// ========== Start ==========
document.addEventListener('DOMContentLoaded', init);
